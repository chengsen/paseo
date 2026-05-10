use std::net::SocketAddr;
use tracing::info;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    let port = std::env::var("PORT")
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or(8080);
    let addr = SocketAddr::from(([0, 0, 0, 0], port));

    let registry = paseo_relay::room::RoomRegistry::new();
    let app = paseo_relay::relay::app(registry);

    let listener = tokio::net::TcpListener::bind(addr).await.expect("bind failed");
    info!("Paseo Relay listening on {}", addr);

    axum::serve(listener, app).await.expect("server failed");
}
