//! Axum WebSocket relay — blind frame forwarding with v1/v2 protocol support.

use axum::{
    extract::{Query, State, WebSocketUpgrade},
    extract::ws::{Message, WebSocket},
    response::IntoResponse,
    routing::get,
    Router,
};
use futures::{SinkExt, StreamExt};
use serde::Deserialize;
use std::sync::Arc;
use std::time::Duration;
use tokio::time::sleep;
use tracing::{info, warn};

use crate::protocol::{parse_control, ControlMessage};
use crate::room::{RoomRegistry, WsHandle};

// ---------------------------------------------------------------------------
// Axum app
// ---------------------------------------------------------------------------

pub fn app(registry: RoomRegistry) -> Router {
    Router::new()
        .route("/health", get(health_handler))
        .route("/ws", get(ws_handler))
        .with_state(registry)
}

async fn health_handler() -> impl IntoResponse {
    axum::Json(serde_json::json!({ "status": "ok" }))
}

// ---------------------------------------------------------------------------
// Query params
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
pub struct WsParams {
    role: String,
    #[serde(rename = "serverId")]
    server_id: String,
    #[serde(rename = "v")]
    v: Option<String>,
    #[serde(rename = "connectionId")]
    connection_id: Option<String>,
}

fn resolve_version(raw: &Option<String>) -> Option<&'static str> {
    match raw.as_deref() {
        None | Some("") => Some("1"),
        Some("1") => Some("1"),
        Some("2") => Some("2"),
        _ => None,
    }
}

// ---------------------------------------------------------------------------
// WebSocket upgrade
// ---------------------------------------------------------------------------

async fn ws_handler(
    ws: WebSocketUpgrade,
    Query(params): Query<WsParams>,
    State(registry): State<RoomRegistry>,
) -> impl IntoResponse {
    let version = match resolve_version(&params.v) {
        Some(v) => v,
        None => {
            return (axum::http::StatusCode::BAD_REQUEST, "Invalid v parameter (expected 1 or 2)").into_response();
        }
    };

    if params.role != "server" && params.role != "client" {
        return (axum::http::StatusCode::BAD_REQUEST, "Missing or invalid role parameter").into_response();
    }

    if params.server_id.is_empty() {
        return (axum::http::StatusCode::BAD_REQUEST, "Missing serverId parameter").into_response();
    }

    ws.on_upgrade(move |socket| handle_socket(socket, params, version, registry))
}

// ---------------------------------------------------------------------------
// Per-socket handler
// ---------------------------------------------------------------------------

async fn handle_socket(
    socket: WebSocket,
    params: WsParams,
    version: &'static str,
    registry: RoomRegistry,
) {
    let (mut ws_tx, ws_rx) = socket.split();
    let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel::<Message>();

    // Spawn a task that pumps messages from the mpsc channel into the WebSocket.
    let pump = tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            if ws_tx.send(msg).await.is_err() {
                break;
            }
        }
    });

    let handle = WsHandle::new(tx);
    let room = registry.get_or_create(&params.server_id);

    info!(
        version = %version,
        role = %params.role,
        server_id = %params.server_id,
        "websocket connected"
    );

    match (version, params.role.as_str()) {
        ("1", "server") => handle_v1_server(ws_rx, room, handle).await,
        ("1", "client") => handle_v1_client(ws_rx, room, handle).await,
        ("2", "server") => {
            let cid = params.connection_id.unwrap_or_default();
            if cid.is_empty() {
                handle_v2_control(ws_rx, room, handle).await;
            } else {
                handle_v2_server_data(ws_rx, room, handle, cid).await;
            }
        }
        ("2", "client") => {
            let cid = params
                .connection_id
                .clone()
                .unwrap_or_else(generate_connection_id);
            handle_v2_client(ws_rx, room, handle, cid).await;
        }
        _ => unreachable!(),
    }

    // Ensure the pump task terminates when the handler returns.
    drop(pump);
}

// ---------------------------------------------------------------------------
// v1 handlers (legacy single socket pair)
// ---------------------------------------------------------------------------

async fn handle_v1_server(
    mut rx: futures::stream::SplitStream<WebSocket>,
    room: Arc<crate::room::RelayRoom>,
    handle: WsHandle,
) {
    let old = room.set_server_control(handle.clone());
    if let Some(old) = old {
        let _ = old.send(Message::Close(None));
    }

    while let Some(result) = rx.next().await {
        match result {
            Ok(msg) => {
                // Forward to all clients (v1 uses empty connectionId).
                room.broadcast_to_clients("", clone_payload(&msg));
            }
            Err(e) => {
                warn!("v1 server socket error: {}", e);
                break;
            }
        }
    }

    room.remove_server_control();
    // Tear down the paired client if any.
    if let Some((_, clients)) = room.clients.remove("") {
        for c in clients {
            let _ = c.send(Message::Close(None));
        }
    }
    room.clear_pending_frames("");
}

async fn handle_v1_client(
    mut rx: futures::stream::SplitStream<WebSocket>,
    room: Arc<crate::room::RelayRoom>,
    handle: WsHandle,
) {
    room.add_client("", handle.clone());

    while let Some(result) = rx.next().await {
        match result {
            Ok(msg) => {
                room.send_to_server_data("", clone_payload(&msg));
            }
            Err(e) => {
                warn!("v1 client socket error: {}", e);
                break;
            }
        }
    }

    let last = room.remove_client("", handle.id);
    if last {
        room.cleanup_connection("");
    }
}

// ---------------------------------------------------------------------------
// v2 handlers
// ---------------------------------------------------------------------------

async fn handle_v2_control(
    mut rx: futures::stream::SplitStream<WebSocket>,
    room: Arc<crate::room::RelayRoom>,
    handle: WsHandle,
) {
    let old = room.set_server_control(handle.clone());
    if let Some(old) = old {
        let _ = old.send(Message::Close(None));
    }

    // Send current connection list so daemon can attach existing connections.
    let sync = ControlMessage::Sync {
        connection_ids: room.list_connected_connection_ids(),
    };
    if let Ok(text) = serde_json::to_string(&sync) {
        room.notify_control(text);
    }

    while let Some(result) = rx.next().await {
        match result {
            Ok(Message::Text(text)) => {
                if let Some(ControlMessage::Ping) = parse_control(&text) {
                    let pong = ControlMessage::Pong {
                        ts: now_millis(),
                    };
                    if let Ok(body) = serde_json::to_string(&pong) {
                        let _ = handle.send(Message::Text(body.into()));
                    }
                }
                // All other control traffic is ignored.
            }
            Ok(Message::Close(_)) => break,
            Err(e) => {
                warn!("v2 control socket error: {}", e);
                break;
            }
            _ => {}
        }
    }

    room.remove_server_control();
}

async fn handle_v2_server_data(
    mut rx: futures::stream::SplitStream<WebSocket>,
    room: Arc<crate::room::RelayRoom>,
    handle: WsHandle,
    connection_id: String,
) {
    let old = room.add_server_data(&connection_id, handle.clone());
    if let Some(old) = old {
        let _ = old.send(Message::Close(None));
    }

    // Flush any frames that arrived while the daemon was reconnecting.
    room.flush_frames(&connection_id, &handle);

    while let Some(result) = rx.next().await {
        match result {
            Ok(msg) => {
                room.broadcast_to_clients(&connection_id, clone_payload(&msg));
            }
            Err(e) => {
                warn!("v2 server-data error: {}", e);
                break;
            }
        }
    }

    room.remove_server_data(&connection_id);
    // Force clients to reconnect and re-handshake when daemon side drops.
    if let Some((_, clients)) = room.clients.remove(&connection_id) {
        for c in clients {
            let _ = c.send(Message::Close(None));
        }
    }
    room.clear_pending_frames(&connection_id);
}

async fn handle_v2_client(
    mut rx: futures::stream::SplitStream<WebSocket>,
    room: Arc<crate::room::RelayRoom>,
    handle: WsHandle,
    connection_id: String,
) {
    room.add_client(&connection_id, handle.clone());

    // Notify daemon that a new client arrived.
    let connected = ControlMessage::Connected {
        connection_id: connection_id.clone(),
    };
    if let Ok(body) = serde_json::to_string(&connected) {
        room.notify_control(body);
    }

    // Deadlock detection: if server-data doesn't appear within 10s, nudge control;
    // if still absent after 5 more seconds, force-close control so daemon reconnects.
    let room_weak = Arc::downgrade(&room);
    let cid = connection_id.clone();
    tokio::spawn(async move {
        sleep(Duration::from_secs(10)).await;
        let Some(room) = room_weak.upgrade() else { return };
        if room.has_server_data_socket(&cid) {
            return;
        }
        let sync = ControlMessage::Sync {
            connection_ids: room.list_connected_connection_ids(),
        };
        if let Ok(body) = serde_json::to_string(&sync) {
            room.notify_control(body);
        }

        sleep(Duration::from_secs(5)).await;
        let Some(room) = room_weak.upgrade() else { return };
        if room.has_server_data_socket(&cid) {
            return;
        }
        if let Some(old) = room.remove_server_control() {
            let _ = old.send(Message::Close(None));
        }
    });

    while let Some(result) = rx.next().await {
        match result {
            Ok(msg) => {
                let payload = clone_payload(&msg);
                if room.has_server_data_socket(&connection_id) {
                    room.send_to_server_data(&connection_id, payload);
                } else if let Message::Text(text) = payload {
                    room.buffer_frame(&connection_id, text.to_string());
                }
            }
            Err(e) => {
                warn!("v2 client error: {}", e);
                break;
            }
        }
    }

    let last = room.remove_client(&connection_id, handle.id);
    if last {
        room.cleanup_connection(&connection_id);
        let disconnected = ControlMessage::Disconnected {
            connection_id: connection_id.clone(),
        };
        if let Ok(body) = serde_json::to_string(&disconnected) {
            room.notify_control(body);
        }
    }
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

fn clone_payload(msg: &Message) -> Message {
    match msg {
        Message::Text(t) => Message::Text(t.clone()),
        Message::Binary(b) => Message::Binary(b.clone()),
        Message::Ping(p) => Message::Ping(p.clone()),
        Message::Pong(p) => Message::Pong(p.clone()),
        Message::Close(c) => Message::Close(c.clone()),
    }
}

fn generate_connection_id() -> String {
    format!("conn_{:016x}", rand::random::<u64>())
}

fn now_millis() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64
}
