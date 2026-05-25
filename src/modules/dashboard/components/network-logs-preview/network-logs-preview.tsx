import { useGetNetworkLogsByDevice } from "../../../network/store/use-network-store";
import { useWorkspaceDevice } from "../../../workspace/store/use-workspace-store";
import { NetworkLogsList } from "../../../network/components/network-logs-list/network-logs-list";

export function NetworkLogsPreview() {
  const device = useWorkspaceDevice();
  const logs = useGetNetworkLogsByDevice(device?.id ?? null);
  const lastFive = logs.slice(-5);

  return (
    <div className="h-full overflow-auto">
      {lastFive.length > 0
        ?
        <NetworkLogsList logs={lastFive} />
        : null
      }
      {lastFive.length === 0
        ?
        <div className="flex items-center justify-center h-full text-olive-500 text-sm">
          No requests yet
        </div>
        : null
      }
    </div>
  );
}
