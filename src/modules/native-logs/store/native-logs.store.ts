import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import type { NativeLogEvent } from '@salve-software/mako-types'

interface NativeLogsStore {
  logs: NativeLogEvent[]
  addLog: (log: NativeLogEvent) => void
  clear: () => void
}

const MAX = 500

export const useNativeLogsStore = create<NativeLogsStore>((set) => ({
  logs: [],
  addLog: (log) => set((s) => ({ logs: [...s.logs, log].slice(-MAX) })),
  clear: () => set({ logs: [] }),
}))

export const useNativeLogs = () => useNativeLogsStore(useShallow((s) => s.logs))
export const useRecentNativeLogs = (n: number) =>
  useNativeLogsStore(useShallow((s) => s.logs.slice(-n)))
