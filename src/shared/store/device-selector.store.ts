import { create } from 'zustand'

interface DeviceSelectorStore {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useDeviceSelectorStore = create<DeviceSelectorStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}))

export const useIsDeviceSelectorOpen = () => useDeviceSelectorStore((s) => s.isOpen)
