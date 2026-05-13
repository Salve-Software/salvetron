import type {
  Device,
  Project,
  LogEvent,
  NativeLogEvent,
  NetworkEvent,
  DeviceInfoEvent,
  ProjectInfoEvent,
} from "@mako/types";

// Re-export for convenience
export type { LogEvent, NativeLogEvent, NetworkEvent, DeviceInfoEvent, ProjectInfoEvent };

// Incoming log event can be either JS or native log
export type IncomingLogEvent = LogEvent | NativeLogEvent;

// Incoming network event
export type IncomingNetworkEvent = NetworkEvent;

// Incoming project event
export type IncomingProjectEvent = ProjectInfoEvent;

export type IncomingEvent =
  | IncomingLogEvent
  | IncomingNetworkEvent
  | IncomingProjectEvent
  | DeviceInfoEvent;

export interface WebSocketServerOptions {
  port?: number;
  host?: string;
}

export interface WebSocketServerCallbacks {
  onLogReceived?: (event: IncomingLogEvent) => void;
  onNetworkReceived?: (event: IncomingNetworkEvent) => void;
  onDeviceConnected?: (device: Device) => void;
  onDeviceDisconnected?: (deviceId: string) => void;
  onProjectConnected?: (project: Project) => void;
  onError?: (error: Error) => void;
}
