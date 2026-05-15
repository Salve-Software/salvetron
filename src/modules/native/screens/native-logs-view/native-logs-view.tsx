import { WorkspaceContent } from "../../../workspace/components/workspace-content";
import { WorkspaceDetailContainer } from "../../../workspace/components/workspace-detail-container";
import { useWorkspaceDevice } from "../../../workspace/store/use-workspace-store";
import { NativeLogsFilters } from "../../components/native-logs-filters";
import { NativeLogsList } from "../../components/native-logs-list";
import { NativeLogsDetailView } from "../../components/native-logs-detail-view";
import { NativeLogsEmptyState } from "../../components/native-logs-empty-state";
import {
  useGetNativeLogsByDevice,
  useSelectedNativeLog,
  useSetSelectedNativeLog,
} from "../../store/use-native-store";
import { Icon } from "../../../../shared/ui/icon";

export function NativeLogsView() {
  const workspaceDevice = useWorkspaceDevice();
  const logs = useGetNativeLogsByDevice(workspaceDevice?.deviceId ?? null);
  const selectedLog = useSelectedNativeLog();
  const setSelectedLog = useSetSelectedNativeLog();

  return (
    <div className="flex flex-1 flex-col w-full h-full pt-4 relative">
      <div className="flex mb-3 gap-2 items-center justify-start w-full px-4 py-2 pb-4 border-b border-b-olive-700">
        <Icon name="terminal" size={25} className="text-olive-300" />
        {/*<p className="font-bold text-lg">Native Logs</p>*/}
      </div>
      <NativeLogsFilters />

      <WorkspaceContent>
        <NativeLogsList logs={logs} emptyState={<NativeLogsEmptyState />} />
      </WorkspaceContent>
      <WorkspaceDetailContainer
        isOpen={selectedLog !== null}
        onClose={() => setSelectedLog(null)}
        title="Log Details"
      >
        {selectedLog ? <NativeLogsDetailView log={selectedLog} /> : null}
      </WorkspaceDetailContainer>
    </div>
  );
}
