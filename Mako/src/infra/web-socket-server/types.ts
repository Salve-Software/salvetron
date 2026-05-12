import { Device } from "../../modules/devices/domain/types";
import { JSLog } from "../../modules/js-logs/domain/types";
import { NetworkLog } from "../../modules/network/domain/types";
import { Project } from "../../modules/projects/domain/types";

type EventType = "log" | "network" | "native" | "project_info";

interface BaseEvent {
  type: EventType;
}

export interface IncomingLogEvent extends BaseEvent {
  type: "log" | "native";
  message: string;
  deviceId?: string;
  projectId?: string;
  [key: string]: unknown;
}

export interface IncomingNetworkEvent extends BaseEvent {
  type: "network";
  deviceId?: string;
  projectId?: string;
  [key: string]: unknown;
}

export interface IncomingProjectEvent extends BaseEvent {
  type: "project_info";
  projectId: string;
  appName: string;
  bundleId: string;
}

export type IncomingEvent =
  | IncomingLogEvent
  | IncomingNetworkEvent
  | IncomingProjectEvent
  | Device;

export interface WebSocketServerOptions {
  port?: number;
  host?: string;
}

export interface WebSocketServerCallbacks {
  onLogReceived?: (event: JSLog) => void;
  onNetworkReceived?: (event: NetworkLog) => void;
  onDeviceConnected?: (device: Device) => void;
  onDeviceDisconnected?: (deviceId: string) => void;
  onProjectConnected?: (project: Project) => void;
  onError?: (error: Error) => void;
}
