import {
  useLatestPerformanceSnapshot,
  usePerformanceSnapshotsByDevice,
} from "../../../perf-monitor/store/use-perf-monitor-store";
import { useWorkspaceDevice } from "../../../workspace/store/use-workspace-store";
import { SparklineGauge } from "../../../../shared/ui/sparkline-gauge";

export function PerfMonitorPreview() {
  const device = useWorkspaceDevice();
  const deviceId = device?.deviceId ?? null;
  const snapshots = usePerformanceSnapshotsByDevice(deviceId, 30);
  const latest = useLatestPerformanceSnapshot(deviceId);

  const uiFpsValues = snapshots.map((s) => s.uiFps);
  const jsFpsValues = snapshots.map((s) => s.jsFps);
  const memoryValues = snapshots.map((s) => s.memoryUsage);
  const cpuValues = snapshots.map((s) => s.cpuUsage);

  return (
    <div className="flex flex-col gap-2">
      {latest
        ?
        <>
          <SparklineGauge
            label="UI FPS"
            values={uiFpsValues}
            maxValue={60}
            currentValue={latest.uiFps}
          />
          <SparklineGauge
            label="JS FPS"
            values={jsFpsValues}
            maxValue={60}
            currentValue={latest.jsFps}
          />
          <SparklineGauge
            label="Memory"
            values={memoryValues}
            maxValue={2048}
            currentValue={latest.memoryUsage}
            unit=" MB"
          />
          <SparklineGauge
            label="CPU"
            values={cpuValues}
            maxValue={100}
            currentValue={latest.cpuUsage}
            unit="%"
          />
        </>
        : null
      }
      {!latest
        ?
        <div className="flex items-center justify-center h-full text-olive-500 text-sm">
          No performance data
        </div>
        : null
      }
    </div>
  );
}
