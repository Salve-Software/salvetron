import { Device } from "../../modules/devices/domain/types";

type EventType = "log" | "network" | "native";

interface BaseEvent {
  type: EventType;
}

export interface IncomingLogEvent extends BaseEvent {
  type: "log" | "native";
  message: string;
  deviceId?: string;
  [key: string]: unknown;
}

export interface IncomingNetworkEvent extends BaseEvent {
  type: "network";
  deviceId?: string;
  [key: string]: unknown;
}

export type IncomingEvent =
  | IncomingLogEvent
  | IncomingNetworkEvent
  | Device;

export interface WebSocketServerOptions {
  port?: number;
  host?: string;
}

export interface WebSocketServerCallbacks {
  onLogReceived?: (event: IncomingLogEvent) => void;
  onNetworkReceived?: (event: IncomingNetworkEvent) => void;
  onDeviceConnected?: (device: Device) => void;
  onDeviceDisconnected?: (deviceId: string) => void;
  onError?: (error: Error) => void;
}
