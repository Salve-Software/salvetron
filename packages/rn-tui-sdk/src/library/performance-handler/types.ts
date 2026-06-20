/**
 * Performance handler types
 */

import type { NitroRnTuiSdk as NitroRnTuiSdkSpec } from '../../specs/rn-tui-sdk.nitro'

export interface PerformanceHandlerConfig {
  nitroRnTuiSdk: NitroRnTuiSdkSpec
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
