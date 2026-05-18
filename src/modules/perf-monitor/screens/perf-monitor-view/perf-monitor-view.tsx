import { WorkspaceContent } from "../../../workspace/components/workspace-content";
import { useWorkspaceDevice } from "../../../workspace/store/use-workspace-store";
import { useLatestPerformanceSnapshot } from "../../store/use-perf-monitor-store";
import { PerformanceMetricsCard } from "../../components/performance-metrics-card";
import { Icon } from "../../../../shared/ui/icon";

export function PerfMonitorView() {
  const workspaceDevice = useWorkspaceDevice();
  const latestSnapshot = useLatestPerformanceSnapshot(
    workspaceDevice?.deviceId ?? null
  );

  return (
    <div className="flex flex-1 flex-col w-full h-full pt-4 relative">
      <div className="flex mb-3 gap-2 items-center justify-start w-full px-4 py-2 pb-4 border-b border-b-olive-700">
        <Icon name="speed" size={30} className="text-olive-300" />
        <h2 className="text-olive-200 text-lg font-semibold">
          Performance Monitor
        </h2>
      </div>

      <div className="flex flex-1 shrink-0 flex-col min-h-0">
        <WorkspaceContent>
          <div className="flex flex-col gap-4 p-4">
            {workspaceDevice
              ?
              <PerformanceMetricsCard snapshot={latestSnapshot} />
              :
              <div className="flex items-center justify-center h-full text-olive-400">
                Select a device to view performance metrics
              </div>
            }
          </div>
        </WorkspaceContent>
      </div>
    </div>
  );
}
