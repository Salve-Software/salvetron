import type { PerformanceMetricsEvent } from "@salve-software/salvetron-types";
import { useDashboardSnapshots } from "../../../store/dashboard.store.js";
import { useDeviceFiltered } from "../../../../../shared/hooks/use-device-filtered.js";
import {
  PANEL_CHROME_COLS,
  MIN_PANEL_INNER_WIDTH,
  MIN_SPARK_WIDTH,
  SPARK_WIDTH_OFFSET,
} from "../../../library/constants.js";

function getSnapshotDeviceId(snapshot: PerformanceMetricsEvent): string | undefined {
  return snapshot.deviceId;
}

interface UsePerformancePanelParams {
  listColWidth: number;
}

export function usePerformancePanel({ listColWidth }: UsePerformancePanelParams) {
  const snapshots = useDeviceFiltered(useDashboardSnapshots(), getSnapshotDeviceId);
  const latest = snapshots[snapshots.length - 1] ?? null;

  const panelInner = Math.max(MIN_PANEL_INNER_WIDTH, listColWidth - PANEL_CHROME_COLS);
  const sparkWidth = Math.max(MIN_SPARK_WIDTH, panelInner - SPARK_WIDTH_OFFSET);

  return { latest, snapshots, sparkWidth };
}
