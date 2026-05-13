/**
 * Network Event Types
 * Used by SDK to send network logs to Mako desktop app
 */

export type NetworkStage = 'request' | 'response';

interface BaseNetworkEvent {
  type: 'network';
  timestamp: number;
  requestId: string;
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: string;
  deviceId?: string;
  projectId?: string;
}

export interface NetworkRequestEvent extends BaseNetworkEvent {
  stage: 'request';
}

export interface NetworkResponseEvent extends BaseNetworkEvent {
  stage: 'response';
  statusCode: number;
  duration: number;
}

export type NetworkEvent = NetworkRequestEvent | NetworkResponseEvent;
