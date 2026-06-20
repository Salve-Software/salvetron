jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

import { Platform } from 'react-native';

import { DeviceHandler } from '../device-handler';

import { NitroMako } from '../../../index';

import { generateUUID } from '../utils/generate-uuid';

jest.mock('../../../index', () => ({
  NitroMako: {
    getDeviceInfo: jest.fn(),
    getStoredDeviceId: jest.fn(),
    storeDeviceId: jest.fn(),
  },
}));

jest.mock('../utils/generate-uuid', () => ({
  generateUUID: jest.fn(),
}));

describe('DeviceHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (
      generateUUID as jest.Mock
    ).mockReturnValue('generated-uuid');
  });

  it('should fallback to iOS device name', () => {
    Platform.OS = 'ios';

    (
      NitroMako.getDeviceInfo as jest.Mock
    ).mockReturnValue({});

    const handler = new DeviceHandler();

    expect(
      handler.getDeviceName(),
    ).toBe('iOS Device');
  });

  it('should fallback to Android device name', () => {
    Platform.OS = 'android';

    (
      NitroMako.getDeviceInfo as jest.Mock
    ).mockReturnValue({});

    const handler = new DeviceHandler();

    expect(
      handler.getDeviceName(),
    ).toBe('Android Device');
  });

  it('should return platform in device info', () => {
    Platform.OS = 'android';

    (
      NitroMako.getDeviceInfo as jest.Mock
    ).mockReturnValue({
      deviceId: 'id',
      deviceName: 'Pixel',
      appName: 'App',
      bundleId: 'com.test',
    });

    const handler = new DeviceHandler();

    expect(handler.getDeviceInfo()).toEqual({
      deviceId: 'id',
      deviceName: 'Pixel',
      platform: 'android',
      appName: 'App',
      bundleId: 'com.test',
    });
  });
});
