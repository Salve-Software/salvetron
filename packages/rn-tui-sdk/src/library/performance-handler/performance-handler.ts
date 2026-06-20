/**
 * Performance monitoring handler
 * Tracks JS thread responsiveness and forwards native performance metrics
 */

import type { NitroRnTuiSdk as NitroRnTuiSdkSpec } from '../../specs/rn-tui-sdk.nitro'
import type { PerformanceHandlerConfig, PerformanceMetricsEvent } from './types'

export class PerformanceHandler {
  private nitroRnTuiSdk: NitroRnTuiSdkSpec
  private onEvent: (event: PerformanceMetricsEvent) => void
  private intervalMs: number
  private isMonitoring = false
  private jsFrameInterval: ReturnType<typeof setInterval> | null = null

  constructor(config: PerformanceHandlerConfig) {
    this.nitroRnTuiSdk = config.nitroRnTuiSdk
    this.onEvent = config.onEvent
    this.intervalMs = config.intervalMs ?? 1000
  }

  /**
   * Start monitoring performance metrics
   */
  start(): boolean {
    if (this.isMonitoring) {
      console.warn('[RnTuiSdk] Performance monitoring already enabled')
      return false
    }

    try {
      // Start native performance monitoring
      const success = this.nitroRnTuiSdk.startPerformanceMonitoring((metrics) => {
        this.handleMetrics(metrics)
      }, this.intervalMs)

      if (success) {
        this.isMonitoring = true

        // Start JS frame tracking - call recordJsFrame every 16ms (~60fps)
        this.jsFrameInterval = setInterval(() => {
          try {
            this.nitroRnTuiSdk.recordJsFrame()
          } catch (error) {
            console.error('[RnTuiSdk] Failed to record JS frame:', error)
          }
        }, 16)

        console.log('[RnTuiSdk] Performance monitoring enabled')
      }
      return success
    } catch (error) {
      console.error('[RnTuiSdk] Failed to start performance monitoring:', error)
      return false
    }
  }

  /**
   * Stop monitoring performance metrics
   */
  stop(): void {
    if (!this.isMonitoring) return

    try {
      // Stop JS frame tracking
      if (this.jsFrameInterval) {
        clearInterval(this.jsFrameInterval)
        this.jsFrameInterval = null
      }

      // Stop native monitoring
      this.nitroRnTuiSdk.stopPerformanceMonitoring()
      this.isMonitoring = false
      console.log('[RnTuiSdk] Performance monitoring disabled')
    } catch (error) {
      console.error('[RnTuiSdk] Failed to stop performance monitoring:', error)
    }
  }

  /**
   * Check if performance monitoring is active
   */
  isActive(): boolean {
    return this.isMonitoring
  }

  private handleMetrics(metrics: {
    uiFps: number
    jsFps: number
    memoryUsageMB: number
    cpuUsagePercent: number
  }): void {
    const event: PerformanceMetricsEvent = {
      type: 'performance_metrics',
      timestamp: Date.now(),
      uiFps: metrics.uiFps,
      jsFps: metrics.jsFps,
      memoryUsage: metrics.memoryUsageMB,
      cpuUsage: metrics.cpuUsagePercent,
    }

    this.onEvent(event)
  }
}
