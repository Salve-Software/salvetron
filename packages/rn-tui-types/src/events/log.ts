/**
 * Log Event Types
 * Used by SDK to send logs to Mako desktop app
 */

export type LogLevel = 'debug' | 'info' | 'log' | 'warn' | 'error';
export type LogSource = 'js' | 'ios' | 'android';
export type NativeLogSource = 'ios' | 'android';

export interface BaseLogEvent {
  timestamp: number;
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
  deviceId?: string;
  projectId?: string;
}

export interface LogEvent extends BaseLogEvent {
  type: 'log';
  source: LogSource;
}

export interface NativeLogEvent extends BaseLogEvent {
  type: 'native';
  source: NativeLogSource;
  tag?: string;
}
