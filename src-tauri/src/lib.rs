mod commands;
mod websocket;

use std::sync::Arc;
use commands::WsServerState;
use websocket::WsServer;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let ws_server = Arc::new(WsServer::new());

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .manage(WsServerState(ws_server))
        .invoke_handler(tauri::generate_handler![
            commands::show_main_window,
            commands::start_server,
            commands::stop_server,
            commands::get_server_status,
            commands::broadcast_message,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
