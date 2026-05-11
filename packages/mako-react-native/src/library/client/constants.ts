/**
 * Default URL patterns to ignore during network interception
 * Includes Metro bundler, hot reload, and debugger URLs
 */
export const DEFAULT_IGNORED_URLS: RegExp[] = [
  /localhost:8081/,
  /127\.0\.0\.1:8081/,
  /10\.0\.2\.2:8081/, // Android emulator
  /symbolicate/,
  /\.hot-update\./,
  /hot$/,
  /\.bundle/,
  /__packager/,
  /debugger-ui/,
  /devtools/,
];

/**
 * WebSocket reconnection settings
 */
export const RECONNECT_CONFIG = {
  maxAttempts: 5,
  maxDelay: 30000,
  baseDelay: 1000,
} as const;

/**
 * Default client configuration
 */
export const DEFAULT_CONFIG = {
  host: 'localhost',
  port: 8765,
  enableNetworkCapture: true,
} as const;
