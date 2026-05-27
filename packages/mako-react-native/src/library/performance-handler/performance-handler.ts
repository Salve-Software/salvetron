/**
 * Performance monitoring handler
 * Tracks JS thread responsiveness and forwards native performance metrics
 */

import type { NitroMako as NitroMakoSpec } from '../../specs/mako.nitro'
import type { PerformanceHandlerConfig, PerformanceMetricsEvent } from './types'

export class PerformanceHandler {
  private nitroMako: NitroMakoSpec
  private onEvent: (event: PerformanceMetricsEvent) => void
  private intervalMs: number
  private isMonitoring = false
  private jsFrameInterval: ReturnType<typeof setInterval> | null = null

  constructor(config: PerformanceHandlerConfig) {
    this.nitroMako = config.nitroMako
    this.onEvent = config.onEvent
    this.intervalMs = config.intervalMs ?? 1000
  }

  /**
   * Start monitoring performance metrics
   */
  start(): boolean {
    if (this.isMonitoring) {
      console.warn('[Mako] Performance monitoring already enabled')
      return false
    }

    try {
      // Start native performance monitoring
      const success = this.nitroMako.startPerformanceMonitoring((metrics) => {
        console.log("METRICS",metrics)
        this.handleMetrics(metrics)
      }, this.intervalMs)

      if (success) {
        this.isMonitoring = true

        // Start JS frame tracking - call recordJsFrame every 16ms (~60fps)
        this.jsFrameInterval = setInterval(() => {
          try {
            this.nitroMako.recordJsFrame()
          } catch (error) {
            console.error('[Mako] Failed to record JS frame:', error)
          }
        }, 16)

        console.log('[Mako] Performance monitoring enabled')
      }
      return success
    } catch (error) {
      console.error('[Mako] Failed to start performance monitoring:', error)
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
      this.nitroMako.stopPerformanceMonitoring()
      this.isMonitoring = false
      console.log('[Mako] Performance monitoring disabled')
    } catch (error) {
      console.error('[Mako] Failed to stop performance monitoring:', error)
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
