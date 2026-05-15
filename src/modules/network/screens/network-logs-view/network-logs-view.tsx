import { WorkspaceContent } from "../../../workspace/components/workspace-content";
import { WorkspaceDetailContainer } from "../../../workspace/components/workspace-detail-container";
import { useWorkspaceDevice } from "../../../workspace/store/use-workspace-store";
import { NetworkLogsFilters } from "../../components/network-logs-filters";
import { NetworkLogsList } from "../../components/network-logs-list";
import { NetworkLogsDetailView } from "../../components/network-logs-detail-view";
import { NetworkLogsEmptyState } from "../../components/network-logs-empty-state";
import {
  useGetNetworkLogsByDevice,
  useSelectedNetworkLog,
  useSetSelectedNetworkLog,
} from "../../store/use-network-store";
import { Icon } from "../../../../shared/ui/icon";

export function NetworkLogsView() {
  const workspaceDevice = useWorkspaceDevice();
  const logs = useGetNetworkLogsByDevice(workspaceDevice?.deviceId ?? null);
  const selectedLog = useSelectedNetworkLog();
  const setSelectedLog = useSetSelectedNetworkLog();

  return (
    <div className="flex flex-1 flex-col w-full h-full pt-4 relative">
      <div className="flex mb-3 gap-2 items-center justify-start w-full px-4 py-2 pb-4 border-b border-b-olive-700">
        <Icon name="earth" size={30} className="text-olive-300" />
      </div>
      <NetworkLogsFilters />

      <div className="flex flex-1 flex-col min-h-0">
        <WorkspaceContent>
          <NetworkLogsList logs={logs} emptyState={<NetworkLogsEmptyState />} />
        </WorkspaceContent>
        <WorkspaceDetailContainer
          isOpen={selectedLog !== null}
          onClose={() => setSelectedLog(null)}
          title="Request Details"
        >
          {selectedLog ? <NetworkLogsDetailView log={selectedLog} /> : null}
        </WorkspaceDetailContainer>
      </div>
    </div>
  );
}
