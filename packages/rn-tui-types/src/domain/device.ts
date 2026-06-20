/**
 * Device Domain Type
 * Represents a connected device in Mako
 */

import type { Platform } from '../events/device';

export interface Device {
  type: string;
  deviceId: string;
  deviceName: string;
  platform: Platform;
  appName?: string;
  bundleId?: string;
  projectId?: string;
}
