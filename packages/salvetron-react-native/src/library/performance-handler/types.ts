/**
 * Performance handler types
 */

import type { NitroSalvetron as NitroSalvetronSpec } from '../../specs/salvetron.nitro'

export interface PerformanceHandlerConfig {
  nitroSalvetron: NitroSalvetronSpec
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
