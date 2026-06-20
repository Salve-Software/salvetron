/**
 * Performance Domain Types
 * Stored representation of performance metrics in Mako desktop app
 */

export type PerformanceHealthLevel = 'good' | 'moderate' | 'poor' | 'critical';

export interface PerformanceSnapshot {
  timestamp: number;
  deviceId: string;
  uiFps: number;
  jsFps: number;
  memoryUsage: number;
  cpuUsage: number;
  healthLevel: PerformanceHealthLevel;
}

export interface PerformanceStats {
  avgUiFps: number;
  avgJsFps: number;
  avgMemoryUsage: number;
  avgCpuUsage: number;
  healthLevel: PerformanceHealthLevel;
  sampleCount: number;
}

/**
 * Calculate overall health level from performance metrics
 */
export function calculateHealthLevel(
  uiFps: number,
  jsFps: number,
  _memoryUsage: number,
  cpuUsage: number
): PerformanceHealthLevel {
  // Critical: Any critical metric
  if (uiFps < 20 || jsFps < 20 || cpuUsage > 90) {
    return 'critical';
  }

  // Poor: Multiple poor metrics or one very poor
  if (
    (uiFps < 30 && jsFps < 30) ||
    uiFps < 25 ||
    jsFps < 25 ||
    cpuUsage > 80
  ) {
    return 'poor';
  }

  // Moderate: Some metrics below ideal
  if (uiFps < 50 || jsFps < 50 || cpuUsage > 60) {
    return 'moderate';
  }

  // Good: All metrics healthy
  return 'good';
}
