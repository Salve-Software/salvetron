pub mod types;

use futures_util::{SinkExt, StreamExt};
use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::Arc;
use tauri::{AppHandle, Emitter};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::{mpsc, Mutex, RwLock};
use tokio_tungstenite::tungstenite::Message;

use types::{DeviceInfo, LogEvent, NetworkRequestEvent, NetworkResponseEvent, ProjectInfo, ServerStatus};

type WsSink =
    futures_util::stream::SplitSink<tokio_tungstenite::WebSocketStream<TcpStream>, Message>;

/// Connection info stored per client
struct ConnectionInfo {
    sink: WsSink,
    device_id: Option<String>,
    project_id: Option<String>,
}

/// WebSocket server state
pub struct WsServer {
    connections: Arc<RwLock<HashMap<u64, ConnectionInfo>>>,
    next_id: Arc<Mutex<u64>>,
    is_running: Arc<RwLock<bool>>,
    shutdown_tx: Arc<Mutex<Option<mpsc::Sender<()>>>>,
    port: Arc<RwLock<u16>>,
    host: Arc<RwLock<String>>,
}

impl WsServer {
    pub fn new() -> Self {
        Self {
            connections: Arc::new(RwLock::new(HashMap::new())),
            next_id: Arc::new(Mutex::new(0)),
            is_running: Arc::new(RwLock::new(false)),
            shutdown_tx: Arc::new(Mutex::new(None)),
            port: Arc::new(RwLock::new(8765)),
            host: Arc::new(RwLock::new("0.0.0.0".to_string())),
        }
    }

    pub async fn start(
        &self,
        app_handle: AppHandle,
        port: u16,
        host: String,
    ) -> Result<(), String> {
        // Check if already running
        {
            let running = self.is_running.read().await;
            if *running {
                return Err("Server already running".to_string());
            }
        }

        // Update config
        {
            *self.port.write().await = port;
            *self.host.write().await = host.clone();
        }

        let addr = format!("{}:{}", host, port);
        let listener = TcpListener::bind(&addr)
            .await
            .map_err(|e| format!("Failed to bind: {}", e))?;

        println!("[Mako] WebSocket server listening on ws://{}", addr);

        // Set running
        *self.is_running.write().await = true;

        // Create shutdown channel
        let (shutdown_tx, mut shutdown_rx) = mpsc::channel::<()>(1);
        *self.shutdown_tx.lock().await = Some(shutdown_tx);

        // Clone refs for spawn
        let connections = self.connections.clone();
        let next_id = self.next_id.clone();
        let is_running = self.is_running.clone();

        // Spawn accept loop
        tokio::spawn(async move {
            loop {
                tokio::select! {
                    result = listener.accept() => {
                        match result {
                            Ok((stream, addr)) => {
                                let app = app_handle.clone();
                                let conns = connections.clone();
                                let id_counter = next_id.clone();

                                tokio::spawn(async move {
                                    if let Err(e) = handle_connection(stream, addr, app, conns, id_counter).await {
                                        eprintln!("[Mako] Connection error: {}", e);
                                    }
                                });
                            }
                            Err(e) => {
                                eprintln!("[Mako] Accept error: {}", e);
                            }
                        }
                    }
                    _ = shutdown_rx.recv() => {
                        println!("[Mako] Server shutdown signal received");
                        break;
                    }
                }
            }

            // Cleanup
            *is_running.write().await = false;
            connections.write().await.clear();
            println!("[Mako] WebSocket server stopped");
        });

        Ok(())
    }

    pub async fn stop(&self) -> Result<(), String> {
        let tx = self.shutdown_tx.lock().await.take();
        if let Some(tx) = tx {
            tx.send(()).await.map_err(|_| "Failed to send shutdown")?;
        }

        // Close all connections
        let mut conns = self.connections.write().await;
        for (_, mut info) in conns.drain() {
            let _ = info.sink.close().await;
        }

        *self.is_running.write().await = false;
        Ok(())
    }

    pub async fn get_status(&self) -> ServerStatus {
        let is_running = *self.is_running.read().await;
        let connected_clients = self.connections.read().await.len();
        let port = *self.port.read().await;
        let host = self.host.read().await.clone();

        ServerStatus {
            is_running,
            connected_clients,
            port,
            host,
        }
    }

    pub async fn broadcast(&self, message: &str) -> Result<usize, String> {
        let mut conns = self.connections.write().await;
        let mut sent = 0;

        for (_, info) in conns.iter_mut() {
            if info
                .sink
                .send(Message::Text(message.to_string()))
                .await
                .is_ok()
            {
                sent += 1;
            }
        }

        Ok(sent)
    }
}

impl Default for WsServer {
    fn default() -> Self {
        Self::new()
    }
}

async fn handle_connection(
    stream: TcpStream,
    addr: SocketAddr,
    app: AppHandle,
    connections: Arc<RwLock<HashMap<u64, ConnectionInfo>>>,
    next_id: Arc<Mutex<u64>>,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let ws_stream = tokio_tungstenite::accept_async(stream).await?;
    let (sink, mut stream) = ws_stream.split();

    // Assign connection ID
    let conn_id = {
        let mut id = next_id.lock().await;
        *id += 1;
        *id
    };

    println!("[Mako] Client connected: {} (id: {})", addr, conn_id);

    // Store connection
    {
        let mut conns = connections.write().await;
        conns.insert(conn_id, ConnectionInfo {
            sink,
            device_id: None,
            project_id: None,
        });
    }

    // Update client count
    emit_client_count(&app, &connections).await;

    // Process messages
    while let Some(msg) = stream.next().await {
        match msg {
            Ok(Message::Text(text)) => {
                if let Err(e) = process_message(&text, conn_id, &app, &connections).await {
                    eprintln!("[Mako] Message process error: {}", e);
                }
            }
            Ok(Message::Close(_)) => break,
            Err(e) => {
                eprintln!("[Mako] WebSocket error: {}", e);
                break;
            }
            _ => {}
        }
    }

    // Remove connection and emit disconnect
    let device_id = {
        let mut conns = connections.write().await;
        let info = conns.remove(&conn_id);
        info.and_then(|i| i.device_id)
    };

    if let Some(device_id) = device_id {
        let _ = app.emit("mako:device_disconnected", device_id);
    }

    emit_client_count(&app, &connections).await;
    println!("[Mako] Client disconnected: {} (id: {})", addr, conn_id);

    Ok(())
}

async fn process_message(
    text: &str,
    conn_id: u64,
    app: &AppHandle,
    connections: &Arc<RwLock<HashMap<u64, ConnectionInfo>>>,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    // Parse JSON to determine event type
    let value: serde_json::Value = serde_json::from_str(text)?;
    let event_type = value.get("type").and_then(|v| v.as_str()).unwrap_or("");

    match event_type {
        "project_info" => {
            let project: ProjectInfo = serde_json::from_value(value)?;
            println!("[Mako] Project registered: {} ({})", project.app_name, project.project_id);

            // Store project_id in connection
            {
                let mut conns = connections.write().await;
                if let Some(info) = conns.get_mut(&conn_id) {
                    info.project_id = Some(project.project_id.clone());
                }
            }

            app.emit("mako:project_connected", &project)?;
        }
        "device_info" => {
            let mut device: DeviceInfo = serde_json::from_value(value)?;
            println!("[Mako] Device registered: {} ({})", device.device_name, device.device_id);

            // Get project_id from connection if not in event
            if device.project_id.is_none() {
                let conns = connections.read().await;
                if let Some(info) = conns.get(&conn_id) {
                    device.project_id = info.project_id.clone();
                }
            }

            // Store device_id in connection
            {
                let mut conns = connections.write().await;
                if let Some(info) = conns.get_mut(&conn_id) {
                    info.device_id = Some(device.device_id.clone());
                }
            }

            app.emit("mako:device_connected", &device)?;
        }
        "log" | "native" => {
            let mut log: LogEvent = serde_json::from_value(value)?;

            // Attach device_id and project_id if not present
            {
                let conns = connections.read().await;
                if let Some(info) = conns.get(&conn_id) {
                    if log.device_id.is_none() {
                        log.device_id = info.device_id.clone();
                    }
                    if log.project_id.is_none() {
                        log.project_id = info.project_id.clone();
                    }
                }
            }

            app.emit("mako:log", &log)?;
        }
        "network" => {
            let stage = value.get("stage").and_then(|v| v.as_str()).unwrap_or("");

            // Get device_id and project_id from connection
            let (device_id, project_id) = {
                let conns = connections.read().await;
                conns.get(&conn_id)
                    .map(|i| (i.device_id.clone(), i.project_id.clone()))
                    .unwrap_or((None, None))
            };

            if stage == "request" {
                let mut event: NetworkRequestEvent = serde_json::from_value(value)?;
                if event.device_id.is_none() {
                    event.device_id = device_id;
                }
                if event.project_id.is_none() {
                    event.project_id = project_id;
                }
                app.emit("mako:network_request", &event)?;
            } else {
                let mut event: NetworkResponseEvent = serde_json::from_value(value)?;
                if event.device_id.is_none() {
                    event.device_id = device_id;
                }
                if event.project_id.is_none() {
                    event.project_id = project_id;
                }
                app.emit("mako:network_response", &event)?;
            }
        }
        _ => {
            println!("[Mako] Unknown event type: {}", event_type);
        }
    }

    Ok(())
}

async fn emit_client_count(
    app: &AppHandle,
    connections: &Arc<RwLock<HashMap<u64, ConnectionInfo>>>,
) {
    let count = connections.read().await.len();
    let _ = app.emit("mako:client_count", count);
}
