import { usePerfMonitorStore } from "./perf-monitor.store";
import type { PerformanceSnapshot } from "@mako/types";

export function useAddPerformanceSnapshot() {
  return usePerfMonitorStore((state) => state.addSnapshot);
}

export function useClearPerformanceSnapshots() {
  return usePerfMonitorStore((state) => state.clearSnapshots);
}

export function usePerformanceSnapshots() {
  return usePerfMonitorStore((state) => state.snapshots);
}

export function usePerformanceSnapshotsByDevice(deviceId: string | null, limit = 60): PerformanceSnapshot[] {
  const snapshots = usePerfMonitorStore((state) => state.snapshots);

  if (!deviceId) return [];

  return snapshots
    .filter((s) => s.deviceId === deviceId)
    .slice(-limit);
}

export function useLatestPerformanceSnapshot(deviceId: string | null): PerformanceSnapshot | null {
  const snapshots = usePerfMonitorStore((state) => state.snapshots);

  if (!deviceId) return null;

  const deviceSnapshots = snapshots.filter((s) => s.deviceId === deviceId);
  return deviceSnapshots[deviceSnapshots.length - 1] || null;
}
