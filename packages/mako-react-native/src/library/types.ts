/**
 * Mako SDK Types
 */

// Re-export shared event types from @mako/types
export type {
  LogLevel,
  LogSource,
  NativeLogSource,
  LogEvent,
  NativeLogEvent,
  NetworkStage,
  NetworkRequestEvent,
  NetworkResponseEvent,
  NetworkEvent,
  DeviceInfoEvent,
  ProjectInfoEvent,
  EventType,
  MakoEvent,
} from '@mako/types';

// ============================================
// SDK Configuration (SDK-specific)
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
// Internal Types (SDK-specific)
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
