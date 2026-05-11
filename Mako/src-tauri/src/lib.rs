mod websocket;

use std::sync::Arc;
use tauri::State;
use websocket::{types::ServerStatus, WsServer};

/// Shared WebSocket server state
struct WsServerState(Arc<WsServer>);

#[tauri::command]
async fn start_server(
    app: tauri::AppHandle,
    state: State<'_, WsServerState>,
    port: Option<u16>,
    host: Option<String>,
) -> Result<(), String> {
    let port = port.unwrap_or(8765);
    let host = host.unwrap_or_else(|| "0.0.0.0".to_string());
    state.0.start(app, port, host).await
}

#[tauri::command]
async fn stop_server(state: State<'_, WsServerState>) -> Result<(), String> {
    state.0.stop().await
}

#[tauri::command]
async fn get_server_status(state: State<'_, WsServerState>) -> Result<ServerStatus, String> {
    Ok(state.0.get_status().await)
}

#[tauri::command]
async fn broadcast_message(
    state: State<'_, WsServerState>,
    message: String,
) -> Result<usize, String> {
    state.0.broadcast(&message).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let ws_server = Arc::new(WsServer::new());

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(WsServerState(ws_server))
        .invoke_handler(tauri::generate_handler![
            start_server,
            stop_server,
            get_server_status,
            broadcast_message,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
