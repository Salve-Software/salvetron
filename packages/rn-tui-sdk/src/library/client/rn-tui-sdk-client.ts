/**
 * WebSocket client for communicating with RN TUI CLI
 */

import { Platform } from 'react-native'
import { NitroModules } from 'react-native-nitro-modules'
import type {
  RnTuiSdkConfig,
  RnTuiEvent,
  DeviceInfoEvent,
  LogEvent,
  NativeLogEvent,
  LogLevel,
  NativeLogSource,
  ProjectInfoEvent,
} from '../types'
import type { NitroRnTuiSdk as NitroRnTuiSdkSpec } from '../../specs/rn-tui-sdk.nitro'

import {
  DEFAULT_IGNORED_URLS,
  RECONNECT_CONFIG,
  DEFAULT_CONFIG,
} from './constants'
import { NetworkHandler } from '../network-handler'
import { PerformanceHandler } from '../performance-handler'
import { deviceHandler } from '../device'
import { projectHandler } from '../project'
import { xhrInterceptor, jsConsoleInterceptor } from '../interceptors'

/**
 * RN TUI WebSocket Client
 */
export class RnTuiSdkClient {
  private ws: WebSocket | null = null
  private config: Required<RnTuiSdkConfig>
  private messageQueue: RnTuiEvent[] = []
  private reconnectAttempts = 0
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  private isConnecting = false
  private manualDisconnect = false

  // Native log capture
  private nitroRnTuiSdk: NitroRnTuiSdkSpec | null = null
  private nativeLogCaptureEnabled = false

  // Network handler
  private networkHandler: NetworkHandler | null = null

  // Performance handler
  private performanceHandler: PerformanceHandler | null = null
  private performanceMonitoringEnabled = false

  constructor() {
    this.config = {
      host: DEFAULT_CONFIG.host,
      port: DEFAULT_CONFIG.port,
      enableNetworkCapture: DEFAULT_CONFIG.enableNetworkCapture,
      enablePerformanceMonitoring: DEFAULT_CONFIG.enablePerformanceMonitoring,
      ignoredUrls: [],
      onConnect: () => {},
      onDisconnect: () => {},
      onError: () => {},
    }
  }

  /**
   * Connect to RN TUI CLI
   */
  connect(userConfig: RnTuiSdkConfig = {}): void {
    if (typeof __DEV__ !== 'undefined' && !__DEV__) {
      console.warn('[RnTuiSdk] SDK only works in development mode')
      return
    }

    this.config = {
      host: userConfig.host ?? DEFAULT_CONFIG.host,
      port: userConfig.port ?? DEFAULT_CONFIG.port,
      enableNetworkCapture:
        userConfig.enableNetworkCapture ?? DEFAULT_CONFIG.enableNetworkCapture,
      enablePerformanceMonitoring:
        userConfig.enablePerformanceMonitoring ?? DEFAULT_CONFIG.enablePerformanceMonitoring,
      ignoredUrls: [...DEFAULT_IGNORED_URLS, ...(userConfig.ignoredUrls ?? [])],
      onConnect: userConfig.onConnect ?? (() => {}),
      onDisconnect: userConfig.onDisconnect ?? (() => {}),
      onError: userConfig.onError ?? (() => {}),
    }

    this.manualDisconnect = false
    this.connectWebSocket()
  }

  /**
   * Disconnect from RN TUI
   */
  disconnect(): void {
    this.manualDisconnect = true
    this.cleanup()
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  /**
   * Send a log event to RN TUI
   */
  sendLog(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    const event: LogEvent = {
      type: 'log',
      source: 'js',
      level,
      message,
      timestamp: Date.now(),
      metadata,
      projectId: projectHandler.getProjectId(),
    }
    this.send(event)
  }

  /**
   * Start capturing native platform logs
   */
  startNativeLogCapture(): boolean {
    if (this.nativeLogCaptureEnabled) {
      console.warn('[RnTuiSdk] Native log capture already enabled')
      return false
    }

    try {
      const nitro = this.getNitroRnTuiSdk()
      const success = nitro.startLogCapture((log) => {
        this.handleNativeLog(log)
      })

      if (success) {
        this.nativeLogCaptureEnabled = true
        console.log('[RnTuiSdk] Native log capture enabled')
      }
      return success
    } catch (error) {
      console.error('[RnTuiSdk] Failed to start native log capture:', error)
      return false
    }
  }

  /**
   * Stop capturing native platform logs
   */
  stopNativeLogCapture(): void {
    if (!this.nativeLogCaptureEnabled) return

    try {
      const nitro = this.getNitroRnTuiSdk()
      nitro.stopLogCapture()
      this.nativeLogCaptureEnabled = false
      console.log('[RnTuiSdk] Native log capture disabled')
    } catch (error) {
      console.error('[RnTuiSdk] Failed to stop native log capture:', error)
    }
  }

  /**
   * Check if native log capture is active
   */
  isNativeLogCaptureEnabled(): boolean {
    return this.nativeLogCaptureEnabled
  }

  /**
   * Start performance monitoring
   */
  startPerformanceMonitoring(): boolean {
    if (this.performanceMonitoringEnabled) {
      console.warn('[RnTuiSdk] Performance monitoring already enabled')
      return false
    }

    this.performanceHandler = new PerformanceHandler({
      nitroRnTuiSdk: this.getNitroRnTuiSdk(),
      onEvent: (event) => this.send(event),
    })

    const success = this.performanceHandler.start()
    if (success) {
      this.performanceMonitoringEnabled = true
      console.log('[RnTuiSdk] Performance monitoring enabled')
    }
    return success
  }

  /**
   * Stop performance monitoring
   */
  stopPerformanceMonitoring(): void {
    if (!this.performanceMonitoringEnabled) return

    try {
      if (this.performanceHandler) {
        this.performanceHandler.stop()
        this.performanceHandler = null
      }
      this.performanceMonitoringEnabled = false
      console.log('[RnTuiSdk] Performance monitoring disabled')
    } catch (error) {
      console.error('[RnTuiSdk] Failed to stop performance monitoring:', error)
    }
  }

  /**
   * Check if performance monitoring is active
   */
  isPerformanceMonitoringEnabled(): boolean {
    return this.performanceMonitoringEnabled
  }

  private getNitroRnTuiSdk(): NitroRnTuiSdkSpec {
    if (!this.nitroRnTuiSdk) {
      this.nitroRnTuiSdk =
        NitroModules.createHybridObject<NitroRnTuiSdkSpec>('NitroRnTuiSdk')
    }
    return this.nitroRnTuiSdk
  }

  private handleNativeLog(log: {
    level: string
    message: string
    tag: string
    timestamp: number
  }): void {
    const platform = Platform.OS as NativeLogSource
    const level = log.level === 'verbose' ? 'debug' : log.level

    const event: NativeLogEvent = {
      type: 'native',
      source: platform,
      level: level as LogLevel,
      message: log.message,
      timestamp: log.timestamp,
      metadata: log.tag ? { tag: log.tag } : undefined,
      projectId: projectHandler.getProjectId(),
    }

    this.send(event)
  }

  private connectWebSocket(): void {
    jsConsoleInterceptor.start({
      onLog: (level, message, metadata) => this.sendLog(level, message, metadata),
    })

    if (this.isConnecting || this.isConnected()) return

    this.isConnecting = true
    const url = `ws://${this.config.host}:${this.config.port}`

    try {
      this.ws = new WebSocket(url)

      this.ws.onopen = () => {
        this.isConnecting = false
        this.reconnectAttempts = 0
        console.log(`[RnTuiSdk] Connected to ${url}`)
        this.config.onConnect()

        this.sendProjectInfo()
        this.sendDeviceInfo()
        this.flushQueue()

        if (this.config.enableNetworkCapture) {
          this.setupNetworkInterception()
        }

        if (this.config.enablePerformanceMonitoring) {
          this.startPerformanceMonitoring()
        }

        this.startNativeLogCapture()
      }

      this.ws.onclose = () => {
        this.isConnecting = false
        console.log('[RnTuiSdk] Disconnected')
        this.config.onDisconnect()

        if (!this.manualDisconnect) {
          this.scheduleReconnect()
        }
      }

      this.ws.onerror = (event) => {
        this.isConnecting = false
        const error = new Error('WebSocket error')
        console.error('[RnTuiSdk] Connection error:', event)
        this.config.onError(error)
      }

      this.ws.onmessage = (event) => {
        console.log('[RnTuiSdk] Received:', event.data)
      }
    } catch (error) {
      this.isConnecting = false
      console.error('[RnTuiSdk] Failed to create WebSocket:', error)
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect(): void {
    if (this.manualDisconnect) return
    if (this.reconnectAttempts >= RECONNECT_CONFIG.maxAttempts) {
      console.warn('[RnTuiSdk] Max reconnection attempts reached')
      return
    }

    const delay = Math.min(
      RECONNECT_CONFIG.baseDelay * Math.pow(2, this.reconnectAttempts),
      RECONNECT_CONFIG.maxDelay
    )
    this.reconnectAttempts++

    console.log(
      `[RnTuiSdk] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`
    )

    this.reconnectTimeout = setTimeout(() => {
      this.connectWebSocket()
    }, delay)
  }

  private cleanup(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    this.stopNativeLogCapture()
    this.stopPerformanceMonitoring()
    xhrInterceptor.disable()
    jsConsoleInterceptor.stop()

    if (this.networkHandler) {
      this.networkHandler.clear()
      this.networkHandler = null
    }

    if (this.ws) {
      this.ws.onopen = null
      this.ws.onclose = null
      this.ws.onerror = null
      this.ws.onmessage = null
      this.ws.close()
      this.ws = null
    }

    this.messageQueue = []
    this.reconnectAttempts = 0
    this.isConnecting = false
  }

  private send(event: RnTuiEvent): void {
    if (this.isConnected() && this.ws) {
      try {
        this.ws.send(JSON.stringify(event))
      } catch (error) {
        console.error('[RnTuiSdk] Failed to send event:', error)
        this.messageQueue.push(event)
      }
    } else {
      this.messageQueue.push(event)
    }
  }

  private sendProjectInfo(): void {
    try {
      const projectInfo = projectHandler.getProjectInfo()
      const event: ProjectInfoEvent = {
        type: 'project_info',
        ...projectInfo,
      }
      this.send(event)
      console.log(
        `[RnTuiSdk] Project registered: ${projectInfo.appName} (${projectInfo.projectId})`
      )
    } catch (error) {
      console.warn('[RnTuiSdk] Failed to send project info:', error)
    }
  }

  private async sendDeviceInfo(): Promise<void> {
    try {
      const deviceInfo = deviceHandler.getDeviceInfo()
      const projectId = projectHandler.getProjectId()
      const event: DeviceInfoEvent = {
        type: 'device_info',
        ...deviceInfo,
        projectId,
      }
      this.send(event)
      console.log(
        `[RnTuiSdk] Device registered: ${deviceInfo.deviceName} (${deviceInfo.deviceId})`
      )
    } catch (error) {
      console.warn('[RnTuiSdk] Failed to send device info:', error)
    }
  }

  private flushQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const event = this.messageQueue.shift()
      if (event) {
        this.send(event)
      }
    }
  }

  private setupNetworkInterception(): void {
    this.networkHandler = new NetworkHandler({
      ignoredUrls: this.config.ignoredUrls,
      onEvent: (event) => this.send(event),
    })

    const success = xhrInterceptor.enable(this.networkHandler.getCallbacks())
    if (success) {
      console.log('[RnTuiSdk] Network capture enabled')
    }
  }
}
