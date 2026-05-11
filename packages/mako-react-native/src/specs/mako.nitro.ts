import type { HybridObject } from 'react-native-nitro-modules'

/**
 * Log level for native logs
 * Note: Using 'verbose' instead of 'debug' to avoid conflict with iOS DEBUG preprocessor macro
 */
export type NativeLogLevel = 'verbose' | 'info' | 'warn' | 'error'

/**
 * Native log entry received from iOS/Android
 */
export interface NativeLogEntry {
  level: NativeLogLevel
  message: string
  tag: string
  timestamp: number
}

/**
 * Callback type for receiving native logs
 */
export type NativeLogCallback = (log: NativeLogEntry) => void

/**
 * Device information result from native APIs
 */
export interface DeviceInfoResult {
  deviceId: string
  deviceName: string
  appName: string
  bundleId: string
}

export interface NitroMako extends HybridObject<{ ios: 'swift', android: 'kotlin' }> {
  sum(num1: number, num2: number): number

  /**
   * Start capturing native platform logs (NSLog/print on iOS, Logcat on Android)
   * @param onLog Callback invoked for each captured log entry
   * @returns true if capture started successfully
   */
  startLogCapture(onLog: NativeLogCallback): boolean

  /**
   * Stop capturing native platform logs
   */
  stopLogCapture(): void

  /**
   * Check if log capture is currently active
   */
  isCapturing(): boolean

  /**
   * Get device information using native APIs
   * @returns Device info including deviceId, deviceName, appName, and bundleId
   */
  getDeviceInfo(): DeviceInfoResult

  /**
   * Get stored device ID from native storage (UserDefaults/SharedPreferences)
   * @returns The stored device ID or undefined if not found
   */
  getStoredDeviceId(): string | undefined

  /**
   * Store device ID in native storage (UserDefaults/SharedPreferences)
   * @param deviceId The device ID to store
   */
  storeDeviceId(deviceId: string): void
}