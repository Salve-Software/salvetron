/**
 * Device Info Event
 * Sent when device connects to Mako
 */

export type Platform = 'ios' | 'android';

export interface DeviceInfoEvent {
  type: 'device_info';
  deviceId: string;
  deviceName: string;
  platform: Platform;
  appName?: string;
  bundleId: string;
  projectId: string;
}
