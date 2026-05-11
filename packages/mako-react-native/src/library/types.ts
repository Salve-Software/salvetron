/**
 * Mako SDK Types
 */

// ============================================
// Configuration
// ============================================

export interface MakoConfig {
  /** Host IP/hostname of the Mako macOS app (default: 'localhost') */
  host?: string;
  /** WebSocket port (default: 8765) */
  port?: number;
  /** Enable network request/response capture (default: true) */
  enableNetworkCapture?: boolean;
  /** URL patterns to ignore (default includes Metro bundler URLs) */
  ignoredUrls?: RegExp[];
  /** Callback when connected to Mako */
  onConnect?: () => void;
  /** Callback when disconnected from Mako */
  onDisconnect?: () => void;
  /** Callback on connection error */
  onError?: (error: Error) => void;
}

// ============================================
// Events sent to Mako macOS
// ============================================

export type EventType = 'log' | 'network' | 'native';
export type NetworkStage = 'request' | 'response';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogSource = 'js' | 'ios' | 'android';
export type NativeLogSource = 'ios' | 'android';

export interface BaseEvent {
  type: EventType;
  timestamp: number; // Unix timestamp in milliseconds
}

export interface NetworkRequestEvent extends BaseEvent {
  type: 'network';
  stage: 'request';
  requestId: string;
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface NetworkResponseEvent extends BaseEvent {
  type: 'network';
  stage: 'response';
  requestId: string;
  method: string;
  url: string;
  statusCode: number;
  duration: number; // milliseconds
  headers?: Record<string, string>;
  body?: string;
}

export type NetworkEvent = NetworkRequestEvent | NetworkResponseEvent;

export interface LogEvent extends BaseEvent {
  type: 'log';
  source: LogSource;
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
}

/**
 * Native log event from iOS/Android
 * Sent with type: 'native' to differentiate from JS logs
 */
export interface NativeLogEvent extends BaseEvent {
  type: 'native';
  source: NativeLogSource;
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface DeviceInfoEvent {
  type: 'device_info';
  deviceId: string;
  deviceName: string;
  platform: 'ios' | 'android';
  appName?: string;
  bundleId: string;
}

export type MakoEvent = NetworkEvent | LogEvent | NativeLogEvent | DeviceInfoEvent;

// ============================================
// Internal Types
// ============================================

export interface PendingRequest {
  id: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  startTime: number;
  responseHeaders?: Record<string, string>;
}

export interface NetworkCallbacks {
  onOpen: (method: string, url: string, xhr: XMLHttpRequest) => void;
  onSend: (data: unknown, xhr: XMLHttpRequest) => void;
  onRequestHeader: (header: string, value: string, xhr: XMLHttpRequest) => void;
  onHeaderReceived: (
    responseContentType: string | undefined,
    responseSize: number | undefined,
    responseHeaders: string,
    xhr: XMLHttpRequest
  ) => void;
  onResponse: (
    status: number,
    timeout: boolean,
    response: unknown,
    responseURL: string,
    responseType: string,
    xhr: XMLHttpRequest
  ) => void;
}
