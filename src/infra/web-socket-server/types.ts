import type {
  Device,
  Project,
  LogEvent,
  NativeLogEvent,
  NetworkEvent,
  DeviceInfoEvent,
  ProjectInfoEvent,
  ComponentRenderEvent,
  ComponentTreeEvent,
} from "@mako/types";

// Re-export for convenience
export type { LogEvent, NativeLogEvent, NetworkEvent, DeviceInfoEvent, ProjectInfoEvent, ComponentRenderEvent, ComponentTreeEvent };

// Incoming log event can be either JS or native log
export type IncomingLogEvent = LogEvent | NativeLogEvent;

// Incoming network event
export type IncomingNetworkEvent = NetworkEvent;

// Incoming project event
export type IncomingProjectEvent = ProjectInfoEvent;

// Incoming component events
export type IncomingComponentRenderEvent = ComponentRenderEvent;
export type IncomingComponentTreeEvent = ComponentTreeEvent;

export type IncomingEvent =
  | IncomingLogEvent
  | IncomingNetworkEvent
  | IncomingProjectEvent
  | DeviceInfoEvent
  | IncomingComponentRenderEvent
  | IncomingComponentTreeEvent;

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
  onComponentRenderReceived?: (event: IncomingComponentRenderEvent) => void;
  onComponentTreeReceived?: (event: IncomingComponentTreeEvent) => void;
  onError?: (error: Error) => void;
}
