/**
 * Event Types - Messages sent from SDK to Mako desktop app
 */

export * from './log.js';
export * from './network.js';
export * from './device.js';
export * from './project.js';
export * from './performance.js';

export type EventType = 'log' | 'network' | 'native' | 'device_info' | 'project_info' | 'performance_metrics';

// Re-export union type
import type { LogEvent, NativeLogEvent } from './log.js';
import type { NetworkEvent } from './network.js';
import type { DeviceInfoEvent } from './device.js';
import type { ProjectInfoEvent } from './project.js';
import type { PerformanceMetricsEvent } from './performance.js';

export type MakoEvent =
  | LogEvent
  | NativeLogEvent
  | NetworkEvent
  | DeviceInfoEvent
  | ProjectInfoEvent
  | PerformanceMetricsEvent;
