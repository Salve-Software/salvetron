import { create } from 'zustand'
import type { DeviceInfoEvent, ProjectInfoEvent } from '@salve-software/salvetron-types'

interface DeviceStore {
  device: DeviceInfoEvent | null
  project: ProjectInfoEvent | null
  connected: boolean
  setInfo: (event: DeviceInfoEvent | ProjectInfoEvent) => void
  setDisconnected: () => void
}

export const useDeviceStore = create<DeviceStore>((set) => ({
  device: null,
  project: null,
  connected: false,
  setInfo: (event) => {
    if (event.type === 'device_info') set({ device: event, connected: true })
    if (event.type === 'project_info') set({ project: event })
  },
  setDisconnected: () => set({ connected: false, device: null, project: null }),
}))

export const useDevice = () => useDeviceStore((s) => s.device)
export const useProject = () => useDeviceStore((s) => s.project)
export const useConnectionStatus = () => useDeviceStore((s) => s.connected)
