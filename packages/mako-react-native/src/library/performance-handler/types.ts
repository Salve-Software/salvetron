/**
 * Performance handler types
 */

export interface PerformanceHandlerConfig {
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
