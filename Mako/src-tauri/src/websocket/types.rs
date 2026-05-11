use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Device info sent when RN app connects
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceInfo {
    #[serde(rename = "type")]
    pub event_type: String,
    #[serde(rename = "deviceId")]
    pub device_id: String,
    #[serde(rename = "deviceName")]
    pub device_name: String,
    pub platform: String,
    #[serde(rename = "appName")]
    pub app_name: Option<String>,
    #[serde(rename = "bundleId")]
    pub bundle_id: Option<String>,
}

/// Log event from JS or native
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEvent {
    #[serde(rename = "type")]
    pub event_type: String,
    pub source: String,
    pub level: String,
    pub message: String,
    pub timestamp: u64,
    pub metadata: Option<HashMap<String, serde_json::Value>>,
    #[serde(rename = "deviceId")]
    pub device_id: Option<String>,
}

/// Network request event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkRequestEvent {
    #[serde(rename = "type")]
    pub event_type: String,
    pub stage: String,
    #[serde(rename = "requestId")]
    pub request_id: String,
    pub method: String,
    pub url: String,
    pub timestamp: u64,
    pub headers: Option<HashMap<String, String>>,
    pub body: Option<String>,
    #[serde(rename = "deviceId")]
    pub device_id: Option<String>,
}

/// Network response event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkResponseEvent {
    #[serde(rename = "type")]
    pub event_type: String,
    pub stage: String,
    #[serde(rename = "requestId")]
    pub request_id: String,
    pub method: String,
    pub url: String,
    #[serde(rename = "statusCode")]
    pub status_code: u16,
    pub duration: u64,
    pub timestamp: u64,
    pub headers: Option<HashMap<String, String>>,
    pub body: Option<String>,
    #[serde(rename = "deviceId")]
    pub device_id: Option<String>,
}



/// Server status response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerStatus {
    pub is_running: bool,
    pub connected_clients: usize,
    pub port: u16,
    pub host: String,
}
