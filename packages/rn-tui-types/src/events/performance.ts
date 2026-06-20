/**
 * Performance Event Types
 * Used by SDK to send performance metrics to RN TUI CLI
 */

export interface PerformanceMetricsEvent {
  type: 'performance_metrics';
  timestamp: number;
  deviceId?: string;
  projectId?: string;
  uiFps: number;
  jsFps: number;
  memoryUsage: number; // MB
  cpuUsage: number;    // 0-100
}
