import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import type { Device, DeviceInfoEvent, ProjectInfoEvent } from '@salve-software/salvetron-types'

export interface DeviceEntry {
  device: Device
  project: ProjectInfoEvent | null
  connected: boolean
}

interface DeviceStore {
  devices: Record<string, DeviceEntry>
  selectedDeviceId: string | null
  upsertDevice: (event: DeviceInfoEvent) => void
  setProjectInfo: (deviceId: string, event: ProjectInfoEvent) => void
  setDeviceDisconnected: (deviceId: string) => void
  selectDevice: (deviceId: string) => void
}

function pickNextSelected(devices: Record<string, DeviceEntry>, excludeId: string): string | null {
  const connected = Object.values(devices).find((entry) => entry.connected && entry.device.deviceId !== excludeId)
  return connected?.device.deviceId ?? null
}

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  devices: {},
  selectedDeviceId: null,

  upsertDevice: (event) => {
    const { devices, selectedDeviceId } = get()
    const existing = devices[event.deviceId]
    const device: Device = {
      type: event.type,
      deviceId: event.deviceId,
      deviceName: event.deviceName,
      platform: event.platform,
      appName: event.appName,
      bundleId: event.bundleId,
      projectId: event.projectId,
    }

    set({
      devices: {
        ...devices,
        [event.deviceId]: { device, project: existing?.project ?? null, connected: true },
      },
      selectedDeviceId: selectedDeviceId ?? event.deviceId,
    })
  },

  setProjectInfo: (deviceId, event) => {
    const { devices } = get()
    const existing = devices[deviceId]
    if (!existing) return

    set({
      devices: {
        ...devices,
        [deviceId]: { ...existing, project: event },
      },
    })
  },

  setDeviceDisconnected: (deviceId) => {
    const { devices, selectedDeviceId } = get()
    const existing = devices[deviceId]
    if (!existing) return

    const updatedDevices = {
      ...devices,
      [deviceId]: { ...existing, connected: false },
    }

    set({
      devices: updatedDevices,
      selectedDeviceId:
        selectedDeviceId === deviceId ? pickNextSelected(updatedDevices, deviceId) : selectedDeviceId,
    })
  },

  selectDevice: (deviceId) => set({ selectedDeviceId: deviceId }),
}))

export const useDevices = () =>
  useDeviceStore(useShallow((s) => Object.values(s.devices)))
export const useSelectedDeviceId = () => useDeviceStore((s) => s.selectedDeviceId)
export const useSelectedDevice = () =>
  useDeviceStore((s) => (s.selectedDeviceId ? s.devices[s.selectedDeviceId] ?? null : null))
export const useConnectedDeviceCount = () =>
  useDeviceStore((s) => Object.values(s.devices).filter((d) => d.connected).length)
