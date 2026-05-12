import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { Device } from '../../modules/devices/domain/types';
import { Project } from '../../modules/projects/domain/types';

import {
  IncomingLogEvent,
  IncomingNetworkEvent,
  IncomingProjectEvent,
  WebSocketServerCallbacks,
  WebSocketServerOptions,
} from './types';

interface ServerStatus {
  is_running: boolean;
  connected_clients: number;
  port: number;
  host: string;
}

export class WebSocketServer {
  private readonly port: number;
  private readonly host: string;
  private unlisteners: UnlistenFn[] = [];

  public isRunning = false;
  public connectedClients = 0;
  public lastError?: string;

  public onLogReceived?: WebSocketServerCallbacks['onLogReceived'];
  public onNetworkReceived?: WebSocketServerCallbacks['onNetworkReceived'];
  public onDeviceConnected?: WebSocketServerCallbacks['onDeviceConnected'];
  public onDeviceDisconnected?: WebSocketServerCallbacks['onDeviceDisconnected'];
  public onProjectConnected?: WebSocketServerCallbacks['onProjectConnected'];
  public onError?: WebSocketServerCallbacks['onError'];

  constructor(options: WebSocketServerOptions = {}) {
    this.port = options.port ?? 8765;
    this.host = options.host ?? '0.0.0.0';
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    try {
      await this.setupListeners();

      await invoke('start_server', {
        port: this.port,
        host: this.host,
      });

      this.isRunning = true;
      this.lastError = undefined;
      console.log(`[Mako] Server ready on ws://${this.host}:${this.port}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  public async stop(): Promise<void> {
    try {
      await invoke('stop_server');

      for (const unlisten of this.unlisteners) {
        unlisten();
      }
      this.unlisteners = [];

      this.isRunning = false;
      this.connectedClients = 0;
      console.log('[Mako] WebSocket server stopped');
    } catch (error) {

      this.handleError(error);
    }
  }

  public async broadcast(message: string): Promise<void> {
    try {
      await invoke('broadcast_message', { message });
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getStatus(): Promise<ServerStatus | null> {
    try {
      return await invoke<ServerStatus>('get_server_status');
    } catch (error) {
      this.handleError(error);
      return null;
    }
  }

  private async setupListeners(): Promise<void> {
    const projectConnected = await listen<Project>(
      'mako:project_connected',
      (event) => {
        this.onProjectConnected?.(event.payload);
        console.log(
          `[Mako] Project connected: ${event.payload.appName} (${event.payload.projectId})`
        );
      }
    );
    this.unlisteners.push(projectConnected);

    const deviceConnected = await listen<Device>(
      'mako:device_connected',
      (event) => {
        this.onDeviceConnected?.(event.payload);
        console.log(
          `[Mako] Device connected: ${event.payload.deviceName} (${event.payload.deviceId})`
        );
      }
    );
    this.unlisteners.push(deviceConnected);

    const deviceDisconnected = await listen<string>(
      'mako:device_disconnected',
      (event) => {
        this.onDeviceDisconnected?.(event.payload);
        console.log(`[Mako] Device disconnected: ${event.payload}`);
      }
    );
    this.unlisteners.push(deviceDisconnected);

    const logReceived = await listen<IncomingLogEvent>('mako:log', (event) => {
      console.log("LOG-RECEIVED",event)
      this.onLogReceived?.(event.payload);
    });
    this.unlisteners.push(logReceived);

    const networkRequest = await listen<IncomingNetworkEvent>(
      'mako:network_request',
      (event) => {
        this.onNetworkReceived?.(event.payload);
      }
    );
    this.unlisteners.push(networkRequest);

    const networkResponse = await listen<IncomingNetworkEvent>(
      'mako:network_response',
      (event) => {
        this.onNetworkReceived?.(event.payload);
      }
    );
    this.unlisteners.push(networkResponse);

    const clientCount = await listen<number>('mako:client_count', (event) => {
      this.connectedClients = event.payload;
    });
    this.unlisteners.push(clientCount);
  }

  private handleError(error: unknown): void {
    const parsedError =
      error instanceof Error ? error : new Error(String(error));

    this.lastError = parsedError.message;
    console.error(`[Mako] WebSocket error: ${parsedError.message}`);
    this.onError?.(parsedError);
  }
}
