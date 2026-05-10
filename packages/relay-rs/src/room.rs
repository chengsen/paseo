//! Relay room state management.
//!
//! Each `serverId` maps to one `RelayRoom`.  Rooms live in a `DashMap`
//! and are created lazily on first connection.

use axum::extract::ws::Message;
use dashmap::DashMap;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::{Arc, Mutex};
use tracing::{debug, warn};

pub type ConnectionId = String;
pub type ServerId = String;

// ---------------------------------------------------------------------------
// WsHandle — thread-safe sender half of a WebSocket
// ---------------------------------------------------------------------------

static WS_ID_COUNTER: AtomicUsize = AtomicUsize::new(1);

#[derive(Clone)]
pub struct WsHandle {
    pub id: usize,
    pub tx: tokio::sync::mpsc::UnboundedSender<Message>,
}

impl WsHandle {
    pub fn new(tx: tokio::sync::mpsc::UnboundedSender<Message>) -> Self {
        Self {
            id: WS_ID_COUNTER.fetch_add(1, Ordering::SeqCst),
            tx,
        }
    }

    /// Send a message into the WebSocket task.
    pub fn send(&self, msg: Message) -> Result<(), tokio::sync::mpsc::error::SendError<Message>> {
        self.tx.send(msg)
    }
}

// ---------------------------------------------------------------------------
// RelayRoom — state for a single serverId
// ---------------------------------------------------------------------------

const MAX_PENDING_FRAMES: usize = 200;

pub struct RelayRoom {
    /// v2: the single daemon control socket (if any).
    server_control: Mutex<Option<WsHandle>>,

    /// v2: per-connection daemon data sockets.
    /// Key: connectionId
    pub server_data: DashMap<ConnectionId, WsHandle>,

    /// v2: per-connection client sockets.
    /// A single connectionId may have multiple active devices.
    pub clients: DashMap<ConnectionId, Vec<WsHandle>>,

    /// Buffered frames waiting for a `server-data:{connectionId}` socket.
    pub pending_frames: DashMap<ConnectionId, Vec<String>>,
}

impl RelayRoom {
    pub fn new() -> Self {
        Self {
            server_control: Mutex::new(None),
            server_data: DashMap::new(),
            clients: DashMap::new(),
            pending_frames: DashMap::new(),
        }
    }

    // ------------------------------------------------------------------
    // Server control
    // ------------------------------------------------------------------

    pub fn set_server_control(&self, handle: WsHandle) -> Option<WsHandle> {
        let mut guard = self.server_control.lock().unwrap();
        let old = guard.take();
        *guard = Some(handle);
        debug!("server_control set");
        old
    }

    pub fn remove_server_control(&self) -> Option<WsHandle> {
        let mut guard = self.server_control.lock().unwrap();
        let old = guard.take();
        if old.is_some() {
            debug!("server_control removed");
        }
        old
    }

    pub fn with_control<F, R>(&self, f: F) -> Option<R>
    where
        F: FnOnce(&WsHandle) -> R,
    {
        let guard = self.server_control.lock().unwrap();
        guard.as_ref().map(f)
    }

    pub fn notify_control(&self, text: String) {
        let _ = self.with_control(|ctl| {
            if let Err(e) = ctl.send(Message::Text(text.clone().into())) {
                warn!("failed to notify control socket: {:?}", e);
            }
        });
    }

    // ------------------------------------------------------------------
    // Server data
    // ------------------------------------------------------------------

    pub fn add_server_data(
        &self,
        connection_id: &str,
        handle: WsHandle,
    ) -> Option<WsHandle> {
        self.server_data.insert(connection_id.to_string(), handle)
    }

    pub fn remove_server_data(&self, connection_id: &str) -> Option<WsHandle> {
        self.server_data.remove(connection_id).map(|(_, v)| v)
    }

    pub fn send_to_server_data(&self, connection_id: &str, msg: Message) {
        if let Some(entry) = self.server_data.get(connection_id) {
            if let Err(e) = entry.value().send(msg) {
                warn!(
                    connection_id = %connection_id,
                    "failed to send to server-data socket: {:?}", e
                );
            }
        }
    }

    pub fn has_server_data_socket(&self, connection_id: &str) -> bool {
        self.server_data.contains_key(connection_id)
    }

    // ------------------------------------------------------------------
    // Clients
    // ------------------------------------------------------------------

    pub fn add_client(&self, connection_id: &str, handle: WsHandle) {
        self.clients
            .entry(connection_id.to_string())
            .or_default()
            .push(handle);
    }

    /// Remove a specific client handle by its unique id.
    /// Returns true if this was the **last** socket for that connectionId.
    pub fn remove_client(&self, connection_id: &str, handle_id: usize) -> bool {
        let mut last_one = false;
        self.clients.alter(connection_id, |_, mut vec| {
            vec.retain(|h| h.id != handle_id);
            last_one = vec.is_empty();
            vec
        });
        if last_one {
            self.clients.remove(connection_id);
        }
        last_one
    }

    pub fn broadcast_to_clients(&self, connection_id: &str, msg: Message) {
        if let Some(entry) = self.clients.get(connection_id) {
            for handle in entry.value().iter() {
                if let Err(e) = handle.send(msg.clone()) {
                    warn!(
                        connection_id = %connection_id,
                        handle_id = handle.id,
                        "failed to broadcast to client: {:?}", e
                    );
                }
            }
        }
    }

    pub fn has_client_socket(&self, connection_id: &str) -> bool {
        self.clients
            .get(connection_id)
            .map(|v| !v.is_empty())
            .unwrap_or(false)
    }

    /// Number of active client sockets for a connectionId.
    pub fn client_socket_count(&self, connection_id: &str) -> usize {
        self.clients
            .get(connection_id)
            .map(|v| v.len())
            .unwrap_or(0)
    }

    // ------------------------------------------------------------------
    // Pending frames (client ahead of server-data)
    // ------------------------------------------------------------------

    pub fn buffer_frame(&self, connection_id: &str, frame: String) {
        self.pending_frames
            .entry(connection_id.to_string())
            .and_modify(|v| {
                if v.len() >= MAX_PENDING_FRAMES {
                    v.remove(0); // drop oldest
                }
                v.push(frame.clone());
            })
            .or_insert_with(|| vec![frame]);
    }

    pub fn flush_frames(&self, connection_id: &str, handle: &WsHandle) {
        if let Some((_, frames)) = self.pending_frames.remove(connection_id) {
            for frame in frames {
                if let Err(e) = handle.send(Message::Text(frame.into())) {
                    warn!(
                        connection_id = %connection_id,
                        "failed to flush pending frame: {:?}", e
                    );
                    break;
                }
            }
        }
    }

    pub fn clear_pending_frames(&self, connection_id: &str) {
        self.pending_frames.remove(connection_id);
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    pub fn list_connected_connection_ids(&self) -> Vec<String> {
        let mut out = Vec::new();
        for entry in self.clients.iter() {
            if !entry.value().is_empty() {
                out.push(entry.key().clone());
            }
        }
        out.sort();
        out.dedup();
        out
    }

    /// Clean up everything related to a connectionId when the last client leaves.
    pub fn cleanup_connection(&self, connection_id: &str) {
        self.pending_frames.remove(connection_id);
        // Force-close matching server-data socket so the daemon knows.
        if let Some((_, handle)) = self.server_data.remove(connection_id) {
            let _ = handle.send(Message::Close(None));
        }
        debug!(connection_id = %connection_id, "cleaned up connection");
    }
}

// ---------------------------------------------------------------------------
// RoomRegistry — global DashMap of rooms
// ---------------------------------------------------------------------------

#[derive(Clone, Default)]
pub struct RoomRegistry {
    rooms: DashMap<ServerId, Arc<RelayRoom>>,
}

impl RoomRegistry {
    pub fn new() -> Self {
        Self {
            rooms: DashMap::new(),
        }
    }

    pub fn get_or_create(&self, server_id: &str) -> Arc<RelayRoom> {
        self.rooms
            .entry(server_id.to_string())
            .or_insert_with(|| Arc::new(RelayRoom::new()))
            .clone()
    }

    pub fn get(&self, server_id: &str) -> Option<Arc<RelayRoom>> {
        self.rooms.get(server_id).map(|e| e.clone())
    }

    pub fn remove(&self, server_id: &str) -> Option<Arc<RelayRoom>> {
        self.rooms.remove(server_id).map(|(_, v)| v)
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    fn dummy_handle() -> WsHandle {
        let (tx, _rx) = tokio::sync::mpsc::unbounded_channel();
        WsHandle::new(tx)
    }

    #[test]
    fn room_registry_lifecycle() {
        let reg = RoomRegistry::new();
        let _room = reg.get_or_create("srv_abc");
        assert!(reg.get("srv_abc").is_some());
        reg.remove("srv_abc");
        assert!(reg.get("srv_abc").is_none());
    }

    #[test]
    fn client_add_remove() {
        let room = RelayRoom::new();
        let h1 = dummy_handle();
        let h2 = dummy_handle();

        room.add_client("conn_1", h1.clone());
        room.add_client("conn_1", h2.clone());
        assert_eq!(room.client_socket_count("conn_1"), 2);

        let last = room.remove_client("conn_1", h1.id);
        assert!(!last);
        assert_eq!(room.client_socket_count("conn_1"), 1);

        let last = room.remove_client("conn_1", h2.id);
        assert!(last);
        assert_eq!(room.client_socket_count("conn_1"), 0);
    }

    #[test]
    fn pending_frames_buffer_and_flush() {
        let room = RelayRoom::new();
        let handle = dummy_handle();

        room.buffer_frame("c1", "frame-1".into());
        room.buffer_frame("c1", "frame-2".into());
        assert_eq!(room.pending_frames.get("c1").unwrap().len(), 2);

        room.flush_frames("c1", &handle);
        assert!(room.pending_frames.get("c1").is_none());
    }

    #[test]
    fn pending_frames_drop_oldest_at_limit() {
        let room = RelayRoom::new();
        for i in 0..=MAX_PENDING_FRAMES {
            room.buffer_frame("c1", format!("frame-{}", i));
        }
        let frames = room.pending_frames.get("c1").unwrap();
        assert_eq!(frames.len(), MAX_PENDING_FRAMES);
        // oldest (frame-0) should have been dropped
        assert_eq!(frames[0], "frame-1");
    }

    #[test]
    fn cleanup_connection_clears_everything() {
        let room = RelayRoom::new();
        let client = dummy_handle();
        let data = dummy_handle();

        room.add_client("c1", client.clone());
        room.add_server_data("c1", data);
        room.buffer_frame("c1", "msg".into());

        // Simulate client disconnect first, then cleanup (real flow).
        room.remove_client("c1", client.id);
        room.cleanup_connection("c1");

        assert_eq!(room.client_socket_count("c1"), 0);
        assert!(!room.has_server_data_socket("c1"));
        assert!(room.pending_frames.get("c1").is_none());
    }

    #[test]
    fn server_control_replace() {
        let room = RelayRoom::new();
        let h1 = dummy_handle();
        let h2 = dummy_handle();

        let old = room.set_server_control(h1);
        assert!(old.is_none());

        let old = room.set_server_control(h2);
        assert!(old.is_some());
    }

    #[test]
    fn list_connection_ids_deduped_and_sorted() {
        let room = RelayRoom::new();
        room.add_client("b", dummy_handle());
        room.add_client("a", dummy_handle());
        room.add_client("a", dummy_handle());

        let ids = room.list_connected_connection_ids();
        assert_eq!(ids, vec!["a", "b"]);
    }
}
