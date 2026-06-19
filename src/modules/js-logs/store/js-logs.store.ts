import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import type { LogEvent } from '@salve-software/mako-types'

interface JsLogsStore {
  logs: LogEvent[]
  addLog: (log: LogEvent) => void
  clear: () => void
}

const MAX = 500

export const useJsLogsStore = create<JsLogsStore>((set) => ({
  logs: [],
  addLog: (log) => set((s) => ({ logs: [...s.logs, log].slice(-MAX) })),
  clear: () => set({ logs: [] }),
}))

export const useJsLogs = () => useJsLogsStore(useShallow((s) => s.logs))
export const useRecentJsLogs = (n: number) =>
  useJsLogsStore(useShallow((s) => s.logs.slice(-n)))
