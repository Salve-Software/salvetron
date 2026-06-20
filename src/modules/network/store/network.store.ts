import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import type { NetworkEvent, NetworkLog } from '@salve-software/rn-tui-types'
import { normalizeHttpMethod } from '@salve-software/rn-tui-types'

interface NetworkStore {
  logsArray: NetworkLog[]
  addOrUpdateLog: (event: NetworkEvent) => void
  clear: () => void
}

const MAX = 100

export const useNetworkStore = create<NetworkStore>((set) => ({
  logsArray: [],
  addOrUpdateLog: (event) =>
    set((s) => {
      if (event.stage === 'request') {
        const entry: NetworkLog = {
          requestId: event.requestId,
          deviceId: event.deviceId ?? 'unknown',
          projectId: event.projectId,
          method: normalizeHttpMethod(event.method),
          url: event.url,
          requestHeaders: event.headers ?? {},
          requestBody: event.body ?? null,
          requestTimestamp: event.timestamp,
          statusCode: null,
          responseHeaders: null,
          responseBody: null,
          responseTimestamp: null,
          duration: null,
          state: 'pending',
        }
        return { logsArray: [...s.logsArray, entry].slice(-MAX) }
      }

      const idx = s.logsArray.findIndex((l) => l.requestId === event.requestId)
      if (idx === -1) return s

      const updated = [...s.logsArray]
      updated[idx] = {
        ...updated[idx],
        statusCode: event.statusCode,
        responseHeaders: event.headers ?? null,
        responseBody: event.body ?? null,
        responseTimestamp: event.timestamp,
        duration: event.duration,
        state: 'completed',
      }
      return { logsArray: updated }
    }),
  clear: () => set({ logsArray: [] }),
}))

export const useNetworkLogs = () => useNetworkStore(useShallow((s) => s.logsArray))
export const useRecentNetworkLogs = (n: number) =>
  useNetworkStore(useShallow((s) => s.logsArray.slice(-n)))
