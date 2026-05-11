export interface Device {
  type: string;
  deviceId: string;
  deviceName: string;
  platform: string;
  appName?: string;
  bundleId?: string;
}
