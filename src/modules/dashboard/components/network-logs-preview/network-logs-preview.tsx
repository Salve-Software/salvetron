import {
  useGetNetworkLogsByDevice,
  useSelectedNetworkLog,
  useSetSelectedNetworkLog,
} from "../../../network/store/use-network-store";
import { useWorkspaceDevice } from "../../../workspace/store/use-workspace-store";
import { NetworkLogsList } from "../../../network/components/network-logs-list/network-logs-list";
import { NetworkLogsDetailView } from "../../../network/components/network-logs-detail-view";
import { FloatingModal } from "../../../../shared/ui/floating-modal";

export function NetworkLogsPreview() {
  const device = useWorkspaceDevice();
  const logs = useGetNetworkLogsByDevice(device?.deviceId ?? null);
  const lastFive = logs.slice(-5);
  const selectedLog = useSelectedNetworkLog();
  const setSelectedLog = useSetSelectedNetworkLog();

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

      <FloatingModal
        isOpen={selectedLog !== null}
        onClose={() => setSelectedLog(null)}
        title="Network Request Details"
      >
        {selectedLog
          ?
          <NetworkLogsDetailView log={selectedLog} />
          : null
        }
      </FloatingModal>
    </div>
  );
}
