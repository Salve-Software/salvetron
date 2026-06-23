/**
 * Performance monitoring handler
 * Tracks JS thread responsiveness and forwards native performance metrics
 */

import type { NitroSalvetron as NitroSalvetronSpec } from '../../specs/salvetron.nitro'
import type { PerformanceHandlerConfig, PerformanceMetricsEvent } from './types'
import { deviceHandler } from '../device'

export class PerformanceHandler {
  private nitroSalvetron: NitroSalvetronSpec
  private onEvent: (event: PerformanceMetricsEvent) => void
  private intervalMs: number
  private isMonitoring = false
  private jsFrameInterval: ReturnType<typeof setInterval> | null = null

  constructor(config: PerformanceHandlerConfig) {
    this.nitroSalvetron = config.nitroSalvetron
    this.onEvent = config.onEvent
    this.intervalMs = config.intervalMs ?? 1000
  }

  /**
   * Start monitoring performance metrics
   */
  start(): boolean {
    if (this.isMonitoring) {
      console.warn('[Salvetron] Performance monitoring already enabled')
      return false
    }

    try {
      // Start native performance monitoring
      const success = this.nitroSalvetron.startPerformanceMonitoring((metrics) => {
        this.handleMetrics(metrics)
      }, this.intervalMs)

      if (success) {
        this.isMonitoring = true

        // Start JS frame tracking - call recordJsFrame every 16ms (~60fps)
        this.jsFrameInterval = setInterval(() => {
          try {
            this.nitroSalvetron.recordJsFrame()
          } catch (error) {
            console.error('[Salvetron] Failed to record JS frame:', error)
          }
        }, 16)

        console.log('[Salvetron] Performance monitoring enabled')
      }
      return success
    } catch (error) {
      console.error('[Salvetron] Failed to start performance monitoring:', error)
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
      this.nitroSalvetron.stopPerformanceMonitoring()
      this.isMonitoring = false
      console.log('[Salvetron] Performance monitoring disabled')
    } catch (error) {
      console.error('[Salvetron] Failed to stop performance monitoring:', error)
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
      deviceId: deviceHandler.getDeviceId(),
    }

    this.onEvent(event)
  }
}
