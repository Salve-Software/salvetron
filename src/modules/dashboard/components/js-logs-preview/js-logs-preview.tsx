import { useGetJSLogsByDevice } from "../../../js-logs/store/use-js-logs-store";
import { useWorkspaceDevice } from "../../../workspace/store/use-workspace-store";
import { JSLogsList } from "../../../js-logs/components/js-logs-list/js-logs-list";

export function JSLogsPreview() {
  const device = useWorkspaceDevice();
  const logs = useGetJSLogsByDevice(device?.id ?? null);
  const lastFive = logs.slice(-5);

  return (
    <div className="h-full overflow-auto">
      {lastFive.length > 0
        ?
        <JSLogsList logs={lastFive} />
        : null
      }
      {lastFive.length === 0
        ?
        <div className="flex items-center justify-center h-full text-olive-500 text-sm">
          No logs yet
        </div>
        : null
      }
    </div>
  );
}
