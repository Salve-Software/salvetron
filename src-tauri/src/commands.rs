use std::sync::Arc;
use tauri::State;

use crate::websocket::{types::ServerStatus, WsServer};

pub struct WsServerState(pub Arc<WsServer>);

#[tauri::command]
pub async fn start_server(
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
pub async fn stop_server(state: State<'_, WsServerState>) -> Result<(), String> {
    state.0.stop().await
}

#[tauri::command]
pub async fn get_server_status(state: State<'_, WsServerState>) -> Result<ServerStatus, String> {
    Ok(state.0.get_status().await)
}

#[tauri::command]
pub async fn broadcast_message(
    state: State<'_, WsServerState>,
    message: String,
) -> Result<usize, String> {
    state.0.broadcast(&message).await
}
