/**
 * Event Types - Messages sent from SDK to Mako desktop app
 */

export * from './log';
export * from './network';
export * from './device';
export * from './project';

export type EventType = 'log' | 'network' | 'native' | 'device_info' | 'project_info';

// Re-export union type
import type { LogEvent, NativeLogEvent } from './log';
import type { NetworkEvent } from './network';
import type { DeviceInfoEvent } from './device';
import type { ProjectInfoEvent } from './project';

export type MakoEvent =
  | LogEvent
  | NativeLogEvent
  | NetworkEvent
  | DeviceInfoEvent
  | ProjectInfoEvent;
