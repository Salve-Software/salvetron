import { useLatestPerformanceSnapshot } from "../../../perf-monitor/store/use-perf-monitor-store";
import { useWorkspaceDevice } from "../../../workspace/store/use-workspace-store";
import { GaugeBar } from "../../../../shared/ui/gauge-bar";
import type { GaugeBarThreshold } from "../../../../shared/ui/gauge-bar";

const fpsThresholds: GaugeBarThreshold[] = [
  { value: 50, color: "bg-green-500" },
  { value: 30, color: "bg-yellow-500" },
  { value: 20, color: "bg-orange-500" },
  { value: 0, color: "bg-red-500" },
];

const cpuThresholds: GaugeBarThreshold[] = [
  { value: 40, color: "bg-green-500" },
  { value: 60, color: "bg-yellow-500" },
  { value: 80, color: "bg-orange-500" },
  { value: 100, color: "bg-red-500" },
];

const memoryThresholds: GaugeBarThreshold[] = [
  { value: 512, color: "bg-green-500" },
  { value: 1024, color: "bg-yellow-500" },
  { value: 1536, color: "bg-orange-500" },
  { value: 2048, color: "bg-red-500" },
];

export function PerfMonitorPreview() {
  const device = useWorkspaceDevice();
  const snapshot = useLatestPerformanceSnapshot(device?.id ?? null);

  return (
    <div className="flex items-center gap-6">
      {snapshot
        ?
        <>
          <div className="flex-1 min-w-0">
            <GaugeBar
              label="UI FPS"
              value={snapshot.uiFps}
              maxValue={60}
              thresholds={fpsThresholds}
              invertThresholds={true}
            />
          </div>
          <div className="flex-1 min-w-0">
            <GaugeBar
              label="JS FPS"
              value={snapshot.jsFps}
              maxValue={60}
              thresholds={fpsThresholds}
              invertThresholds={true}
            />
          </div>
          <div className="flex-1 min-w-0">
            <GaugeBar
              label="Memory"
              value={snapshot.memoryUsage}
              maxValue={2048}
              unit=" MB"
              thresholds={memoryThresholds}
            />
          </div>
          <div className="flex-1 min-w-0">
            <GaugeBar
              label="CPU"
              value={snapshot.cpuUsage}
              maxValue={100}
              unit="%"
              thresholds={cpuThresholds}
            />
          </div>
        </>
        : null
      }
      {!snapshot
        ?
        <div className="flex items-center justify-center flex-1 text-olive-500 text-sm">
          No performance data
        </div>
        : null
      }
    </div>
  );
}
