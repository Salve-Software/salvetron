import { Platform } from 'react-native'
import { NitroMako } from '../../index'
import { generateUUID } from './utils/generate-uuid'
import type { DeviceInfoData } from './types'

export class DeviceHandler {
  private cachedDeviceId: string | null = null
  private cachedDeviceName: string | null = null

  private getOrCreateDeviceId(): string {
    if (this.cachedDeviceId) {
      return this.cachedDeviceId
    }

    try {
      const nativeInfo = NitroMako.getDeviceInfo()
      if (nativeInfo.deviceId) {
        this.cachedDeviceId = nativeInfo.deviceId
        return nativeInfo.deviceId
      }

      const storedId = NitroMako.getStoredDeviceId()
      if (storedId) {
        this.cachedDeviceId = storedId
        return storedId
      }

      const newId = generateUUID()
      NitroMako.storeDeviceId(newId)
      this.cachedDeviceId = newId
      return newId
    } catch (err) {
      this.cachedDeviceId = generateUUID()
      return this.cachedDeviceId
    }
  }

  getDeviceName(): string {
    if (this.cachedDeviceName) {
      return this.cachedDeviceName
    }

    const nativeInfo = NitroMako.getDeviceInfo()
    if (nativeInfo.deviceName) {
      this.cachedDeviceName = nativeInfo.deviceName
      return nativeInfo.deviceName
    }

    const model = Platform.OS === 'ios' ? 'iOS Device' : 'Android Device'
    this.cachedDeviceName = model
    return model
  }

  getAppName(): string {
    try {
      const nativeInfo = NitroMako.getDeviceInfo()
      return nativeInfo.appName || 'React Native App'
    } catch {
      return 'React Native App'
    }
  }

  getBundleId(): string {
    try {
      const nativeInfo = NitroMako.getDeviceInfo()
      return nativeInfo.bundleId || ''
    } catch {
      return ''
    }
  }

  getDeviceInfo(): DeviceInfoData {
    const deviceId = this.getOrCreateDeviceId()
    const deviceName = this.getDeviceName()
    const appName = this.getAppName()

    return {
      deviceId,
      deviceName,
      platform: Platform.OS as 'ios' | 'android',
      appName,
      bundleId: this.getBundleId(),
    }
  }
}
