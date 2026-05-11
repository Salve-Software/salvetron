/**
 * Mako SDK for React Native
 *
 * Captures network requests and sends them to the Mako macOS app
 * for debugging and inspection.
 *
 * @example
 * ```typescript
 * import { Mako } from 'mako-react-native';
 *
 * if (__DEV__) {
 *   Mako.connect({
 *     host: 'localhost',
 *     port: 8765,
 *   });
 * }
 * ```
 */

import { client } from './client'
import type { MakoConfig } from './types'

/**
 * Mako SDK main interface
 */
export default {
  /**
   * Connect to Mako macOS app
   *
   * @param config - Configuration options
   * @example
   * ```typescript
   * Mako.connect({
   *   host: '192.168.1.100', // Mac IP address
   *   port: 8765,
   *   enableNetworkCapture: true,
   *   ignoredUrls: [/my-internal-api/],
   *   onConnect: () => console.log('Connected to Mako'),
   *   onDisconnect: () => console.log('Disconnected from Mako'),
   * });
   * ```
   */
  connect(config?: MakoConfig): void {
    client.connect(config)
  },

  /**
   * Disconnect from Mako macOS app
   */
  disconnect(): void {
    client.disconnect()
  },

  /**
   * Check if currently connected to Mako
   */
  isConnected(): boolean {
    return client.isConnected()
  },

  /**
   * Send a log message (info level)
   * @param message - The log message
   * @param metadata - Optional metadata object
   */
  log(message: string, metadata?: Record<string, unknown>): void {
    client.sendLog('info', message, metadata)
  },

  /**
   * Send a debug log message
   * @param message - The log message
   * @param metadata - Optional metadata object
   */
  debug(message: string, metadata?: Record<string, unknown>): void {
    client.sendLog('debug', message, metadata)
  },

  /**
   * Send an info log message
   * @param message - The log message
   * @param metadata - Optional metadata object
   */
  info(message: string, metadata?: Record<string, unknown>): void {
    client.sendLog('info', message, metadata)
  },

  /**
   * Send a warning log message
   * @param message - The log message
   * @param metadata - Optional metadata object
   */
  warn(message: string, metadata?: Record<string, unknown>): void {
    client.sendLog('warn', message, metadata)
  },

  /**
   * Send an error log message
   * @param message - The log message
   * @param metadata - Optional metadata object
   */
  error(message: string, metadata?: Record<string, unknown>): void {
    client.sendLog('error', message, metadata)
  },

  /**
   * Stop capturing native platform logs (NSLog/print on iOS, Logcat on Android)
   * Native log capture starts automatically on connect()
   */
  stopNativeLogCapture(): void {
    client.stopNativeLogCapture()
  },

  /**
   * Check if native log capture is currently active
   * @returns true if native log capture is enabled
   */
  isNativeLogCaptureEnabled(): boolean {
    return client.isNativeLogCaptureEnabled()
  },
}

// Export types for consumers
export type {
  MakoConfig,
  NetworkRequestEvent,
  NetworkResponseEvent,
  NetworkEvent,
  LogEvent,
  NativeLogEvent,
  LogLevel,
  LogSource,
  NativeLogSource,
} from './types'
