/**
 * WebSocket client for communicating with Mako macOS app
 */

import { Platform } from 'react-native'
import { NitroModules } from 'react-native-nitro-modules'
import type {
  MakoConfig,
  MakoEvent,
  DeviceInfoEvent,
  LogEvent,
  NativeLogEvent,
  LogLevel,
  NativeLogSource,
  ProjectInfoEvent,
} from '../types'
import type { NitroMako as NitroMakoSpec } from '../../specs/mako.nitro'

import {
  DEFAULT_IGNORED_URLS,
  RECONNECT_CONFIG,
  DEFAULT_CONFIG,
} from './constants'
import { NetworkHandler } from '../network-handler'
import { ComponentHandler } from '../component-handler'
import { PerformanceHandler } from '../performance-handler'
import { deviceHandler } from '../device'
import { projectHandler } from '../project'
import { xhrInterceptor, reactDevToolsInterceptor, jsConsoleInterceptor } from '../interceptors'

/**
 * Mako WebSocket Client
 */
export class MakoClient {
  private ws: WebSocket | null = null
  private config: Required<MakoConfig>
  private messageQueue: MakoEvent[] = []
  private reconnectAttempts = 0
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  private isConnecting = false
  private manualDisconnect = false

  // Native log capture
  private nitroMako: NitroMakoSpec | null = null
  private nativeLogCaptureEnabled = false

  // Network handler
  private networkHandler: NetworkHandler | null = null

  // Component handler
  private componentHandler: ComponentHandler | null = null
  private componentInspectorEnabled = false

  // Performance handler
  private performanceHandler: PerformanceHandler | null = null
  private performanceMonitoringEnabled = false

  constructor() {
    this.config = {
      host: DEFAULT_CONFIG.host,
      port: DEFAULT_CONFIG.port,
      enableNetworkCapture: DEFAULT_CONFIG.enableNetworkCapture,
      enableComponentInspector: DEFAULT_CONFIG.enableComponentInspector,
      enablePerformanceMonitoring: DEFAULT_CONFIG.enablePerformanceMonitoring,
      ignoredUrls: [],
      onConnect: () => {},
      onDisconnect: () => {},
      onError: () => {},
    }
  }

  /**
   * Connect to Mako macOS app
   */
  connect(userConfig: MakoConfig = {}): void {
    if (typeof __DEV__ !== 'undefined' && !__DEV__) {
      console.warn('[Mako] SDK only works in development mode')
      return
    }

    this.config = {
      host: userConfig.host ?? DEFAULT_CONFIG.host,
      port: userConfig.port ?? DEFAULT_CONFIG.port,
      enableNetworkCapture:
        userConfig.enableNetworkCapture ?? DEFAULT_CONFIG.enableNetworkCapture,
      enableComponentInspector:
        userConfig.enableComponentInspector ?? DEFAULT_CONFIG.enableComponentInspector,
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
   * Disconnect from Mako
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
   * Send a log event to Mako
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
      console.warn('[Mako] Native log capture already enabled')
      return false
    }

    try {
      const nitro = this.getNitroMako()
      const success = nitro.startLogCapture((log) => {
        this.handleNativeLog(log)
      })

      if (success) {
        this.nativeLogCaptureEnabled = true
        console.log('[Mako] Native log capture enabled')
      }
      return success
    } catch (error) {
      console.error('[Mako] Failed to start native log capture:', error)
      return false
    }
  }

  /**
   * Stop capturing native platform logs
   */
  stopNativeLogCapture(): void {
    if (!this.nativeLogCaptureEnabled) return

    try {
      const nitro = this.getNitroMako()
      nitro.stopLogCapture()
      this.nativeLogCaptureEnabled = false
      console.log('[Mako] Native log capture disabled')
    } catch (error) {
      console.error('[Mako] Failed to stop native log capture:', error)
    }
  }

  /**
   * Check if native log capture is active
   */
  isNativeLogCaptureEnabled(): boolean {
    return this.nativeLogCaptureEnabled
  }

  /**
   * Start component inspector
   */
  startComponentInspector(): boolean {
    if (this.componentInspectorEnabled) {
      console.warn('[Mako] Component inspector already enabled')
      return false
    }

    this.componentHandler = new ComponentHandler({
      onEvent: (event) => this.send(event),
    })

    const success = reactDevToolsInterceptor.enable(this.componentHandler.getCallbacks())
    if (success) {
      this.componentInspectorEnabled = true
      this.componentHandler.startTreeSnapshots()
      console.log('[Mako] Component inspector enabled')
    }
    return success
  }

  /**
   * Stop component inspector
   */
  stopComponentInspector(): void {
    if (!this.componentInspectorEnabled) return

    try {
      reactDevToolsInterceptor.disable()
      if (this.componentHandler) {
        this.componentHandler.clear()
        this.componentHandler = null
      }
      this.componentInspectorEnabled = false
      console.log('[Mako] Component inspector disabled')
    } catch (error) {
      console.error('[Mako] Failed to stop component inspector:', error)
    }
  }

  /**
   * Check if component inspector is active
   */
  isComponentInspectorEnabled(): boolean {
    return this.componentInspectorEnabled
  }

  /**
   * Start performance monitoring
   */
  startPerformanceMonitoring(): boolean {
    if (this.performanceMonitoringEnabled) {
      console.warn('[Mako] Performance monitoring already enabled')
      return false
    }

    this.performanceHandler = new PerformanceHandler({
      nitroMako: this.getNitroMako(),
      onEvent: (event) => this.send(event),
    })

    const success = this.performanceHandler.start()
    if (success) {
      this.performanceMonitoringEnabled = true
      console.log('[Mako] Performance monitoring enabled')
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
      console.log('[Mako] Performance monitoring disabled')
    } catch (error) {
      console.error('[Mako] Failed to stop performance monitoring:', error)
    }
  }

  /**
   * Check if performance monitoring is active
   */
  isPerformanceMonitoringEnabled(): boolean {
    return this.performanceMonitoringEnabled
  }

  private getNitroMako(): NitroMakoSpec {
    if (!this.nitroMako) {
      this.nitroMako =
        NitroModules.createHybridObject<NitroMakoSpec>('NitroMako')
    }
    return this.nitroMako
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
        console.log(`[Mako] Connected to ${url}`)
        this.config.onConnect()

        this.sendProjectInfo()
        this.sendDeviceInfo()
        this.flushQueue()

        if (this.config.enableNetworkCapture) {
          this.setupNetworkInterception()
        }

        if (this.config.enableComponentInspector) {
          this.startComponentInspector()
        }

        if (this.config.enablePerformanceMonitoring) {
          this.startPerformanceMonitoring()
        }

        this.startNativeLogCapture()
      }

      this.ws.onclose = () => {
        this.isConnecting = false
        console.log('[Mako] Disconnected')
        this.config.onDisconnect()

        if (!this.manualDisconnect) {
          this.scheduleReconnect()
        }
      }

      this.ws.onerror = (event) => {
        this.isConnecting = false
        const error = new Error('WebSocket error')
        console.error('[Mako] Connection error:', event)
        this.config.onError(error)
      }

      this.ws.onmessage = (event) => {
        console.log('[Mako] Received:', event.data)
      }
    } catch (error) {
      this.isConnecting = false
      console.error('[Mako] Failed to create WebSocket:', error)
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect(): void {
    if (this.manualDisconnect) return
    if (this.reconnectAttempts >= RECONNECT_CONFIG.maxAttempts) {
      console.warn('[Mako] Max reconnection attempts reached')
      return
    }

    const delay = Math.min(
      RECONNECT_CONFIG.baseDelay * Math.pow(2, this.reconnectAttempts),
      RECONNECT_CONFIG.maxDelay
    )
    this.reconnectAttempts++

    console.log(
      `[Mako] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`
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
    this.stopComponentInspector()
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

  private send(event: MakoEvent): void {
    if (this.isConnected() && this.ws) {
      try {
        this.ws.send(JSON.stringify(event))
      } catch (error) {
        console.error('[Mako] Failed to send event:', error)
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
        `[Mako] Project registered: ${projectInfo.appName} (${projectInfo.projectId})`
      )
    } catch (error) {
      console.warn('[Mako] Failed to send project info:', error)
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
        `[Mako] Device registered: ${deviceInfo.deviceName} (${deviceInfo.deviceId})`
      )
    } catch (error) {
      console.warn('[Mako] Failed to send device info:', error)
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
      console.log('[Mako] Network capture enabled')
    }
  }
}
