/**
 * JS Log Domain Type
 * Stored representation of a log in Mako
 */

import type { LogLevel } from '../events/log';

export type { LogLevel };

export interface JSLog {
  deviceId: string;
  level: LogLevel;
  message: string;
  metadata: Record<string, unknown>;
  source: string;
  timestamp: number;
  type: string;
  projectId?: string;
}

export interface NativeLog extends JSLog {

}
