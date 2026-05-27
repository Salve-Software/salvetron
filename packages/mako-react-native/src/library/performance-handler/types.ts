/**
 * Performance handler types
 */

import type { NitroMako as NitroMakoSpec } from '../../specs/mako.nitro'

export interface PerformanceHandlerConfig {
  nitroMako: NitroMakoSpec
  onEvent: (event: PerformanceMetricsEvent) => void
  intervalMs?: number
}

export interface PerformanceMetricsEvent {
  type: 'performance_metrics'
  timestamp: number
  deviceId?: string
  projectId?: string
  uiFps: number
  jsFps: number
  memoryUsage: number
  cpuUsage: number
}
