import { create } from "zustand";
import type { PerformanceSnapshot } from "@mako/types";

export interface PerfMonitorStoreProps {
  snapshots: PerformanceSnapshot[];
  addSnapshot: (snapshot: PerformanceSnapshot) => void;
  clearSnapshots: () => void;
  getRecentSnapshots: (deviceId: string, count: number) => PerformanceSnapshot[];
}

const MAX_SNAPSHOTS = 1000;

export const usePerfMonitorStore = create<PerfMonitorStoreProps>((set, get) => ({
  snapshots: [],

  addSnapshot: (snapshot: PerformanceSnapshot) =>
    set((state) => {
      const newSnapshots = [...state.snapshots, snapshot];
      if (newSnapshots.length > MAX_SNAPSHOTS) {
        return { snapshots: newSnapshots.slice(-MAX_SNAPSHOTS) };
      }
      return { snapshots: newSnapshots };
    }),

  clearSnapshots: () => set({ snapshots: [] }),

  getRecentSnapshots: (deviceId: string, count: number) => {
    const { snapshots } = get();
    return snapshots
      .filter((s) => s.deviceId === deviceId)
      .slice(-count);
  },
}));
