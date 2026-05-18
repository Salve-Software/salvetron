use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Project info sent when RN app connects
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectInfo {
    #[serde(rename = "type")]
    pub event_type: String,
    #[serde(rename = "projectId")]
    pub project_id: String,
    #[serde(rename = "appName")]
    pub app_name: String,
    #[serde(rename = "bundleId")]
    pub bundle_id: String,
}

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
    #[serde(rename = "projectId")]
    pub project_id: Option<String>,
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
    #[serde(rename = "projectId")]
    pub project_id: Option<String>,
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
    #[serde(rename = "projectId")]
    pub project_id: Option<String>,
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
    #[serde(rename = "projectId")]
    pub project_id: Option<String>,
}

/// Component tree node
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComponentTreeNode {
    pub id: String,
    pub name: String,
    #[serde(rename = "parentId")]
    pub parent_id: Option<String>,
    pub children: Vec<String>,
    pub depth: u32,
}

/// Component render event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComponentRenderEvent {
    #[serde(rename = "type")]
    pub event_type: String,
    #[serde(rename = "componentId")]
    pub component_id: String,
    #[serde(rename = "componentName")]
    pub component_name: String,
    #[serde(rename = "renderCount")]
    pub render_count: u32,
    #[serde(rename = "renderDuration")]
    pub render_duration: f64,
    pub timestamp: u64,
    #[serde(rename = "parentId")]
    pub parent_id: Option<String>,
    #[serde(rename = "propsChanged")]
    pub props_changed: bool,
    #[serde(rename = "stateChanged")]
    pub state_changed: bool,
    #[serde(rename = "contextChanged")]
    pub context_changed: bool,
    #[serde(rename = "isMemoized")]
    pub is_memoized: bool,
    #[serde(rename = "memoType")]
    pub memo_type: String,
    #[serde(rename = "deviceId")]
    pub device_id: Option<String>,
    #[serde(rename = "projectId")]
    pub project_id: Option<String>,
}

/// Component tree event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComponentTreeEvent {
    #[serde(rename = "type")]
    pub event_type: String,
    pub tree: Vec<ComponentTreeNode>,
    pub timestamp: u64,
    #[serde(rename = "deviceId")]
    pub device_id: Option<String>,
    #[serde(rename = "projectId")]
    pub project_id: Option<String>,
}

/// Performance metrics event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceMetricsEvent {
    #[serde(rename = "type")]
    pub event_type: String,
    pub timestamp: u64,
    #[serde(rename = "uiFps")]
    pub ui_fps: f64,
    #[serde(rename = "jsFps")]
    pub js_fps: f64,
    #[serde(rename = "memoryUsage")]
    pub memory_usage: f64,
    #[serde(rename = "cpuUsage")]
    pub cpu_usage: f64,
    #[serde(rename = "deviceId")]
    pub device_id: Option<String>,
    #[serde(rename = "projectId")]
    pub project_id: Option<String>,
}

/// Server status response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerStatus {
    pub is_running: bool,
    pub connected_clients: usize,
    pub port: u16,
    pub host: String,
}
