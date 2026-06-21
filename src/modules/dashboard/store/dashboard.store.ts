import { create } from 'zustand'
import type { PerformanceMetricsEvent } from '@salve-software/salvetron-types'

interface DashboardStore {
  snapshots: PerformanceMetricsEvent[]
  addSnapshot: (snapshot: PerformanceMetricsEvent) => void
}

const MAX = 60

export const useDashboardStore = create<DashboardStore>((set) => ({
  snapshots: [],
  addSnapshot: (snapshot) =>
    set((s) => ({ snapshots: [...s.snapshots, snapshot].slice(-MAX) })),
}))

export const useDashboardSnapshots = () => useDashboardStore((s) => s.snapshots)
export const useLatestSnapshot = () =>
  useDashboardStore((s) => s.snapshots[s.snapshots.length - 1] ?? null)
