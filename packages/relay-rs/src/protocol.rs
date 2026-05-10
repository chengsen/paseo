//! JSON control protocol definitions.
//!
//! These messages flow over the **plaintext** WebSocket control channel
//! (v2 `server-control` and relay internal notifications).
//! Field names are `camelCase` to match the TypeScript front-end.

use serde::{Deserialize, Serialize};

// ---------------------------------------------------------------------------
// Relay → Daemon control notifications
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ControlMessage {
    /// Daemon keepalive ping (daemon → relay)
    Ping,

    /// Daemon keepalive pong (relay → daemon)
    Pong { ts: u64 },

    /// Full snapshot of currently-connected client connectionIds.
    /// Sent to control socket on connect and on nudge.
    Sync {
        #[serde(rename = "connectionIds")]
        connection_ids: Vec<String>,
    },

    /// A new client has connected.
    Connected {
        #[serde(rename = "connectionId")]
        connection_id: String,
    },

    /// A client has fully disconnected (last socket gone).
    Disconnected {
        #[serde(rename = "connectionId")]
        connection_id: String,
    },
}

// ---------------------------------------------------------------------------
// E2EE handshake messages (carried inside the encrypted channel payload)
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct E2eeHelloMessage {
    #[serde(rename = "type")]
    pub msg_type: String,
    pub key: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct E2eeReadyMessage {
    #[serde(rename = "type")]
    pub msg_type: String,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/// Attempt to parse a control message from a text frame.
pub fn parse_control(text: &str) -> Option<ControlMessage> {
    serde_json::from_str(text).ok()
}

/// Returns true if the text looks like an E2EE handshake message.
pub fn is_handshake_traffic(text: &str) -> bool {
    let trimmed = text.trim();
    if !trimmed.starts_with('{') {
        return false;
    }
    let Ok(val) = serde_json::from_str::<serde_json::Value>(trimmed) else {
        return false;
    };
    let Some(ty) = val.get("type").and_then(|v| v.as_str()) else {
        return false;
    };
    matches!(ty, "e2ee_hello" | "e2ee_ready")
}
