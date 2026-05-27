/**
 * Event Types - Messages sent from SDK to Mako desktop app
 */

export * from './log';
export * from './network';
export * from './device';
export * from './project';
export * from './component';
export * from './performance';

export type EventType = 'log' | 'network' | 'native' | 'device_info' | 'project_info' | 'component_render' | 'component_tree' | 'performance_metrics';

// Re-export union type
import type { LogEvent, NativeLogEvent } from './log';
import type { NetworkEvent } from './network';
import type { DeviceInfoEvent } from './device';
import type { ProjectInfoEvent } from './project';
import type { ComponentRenderEvent, ComponentTreeEvent } from './component';
import type { PerformanceMetricsEvent } from './performance';

export type MakoEvent =
  | LogEvent
  | NativeLogEvent
  | NetworkEvent
  | DeviceInfoEvent
  | ProjectInfoEvent
  | ComponentRenderEvent
  | ComponentTreeEvent
  | PerformanceMetricsEvent;
