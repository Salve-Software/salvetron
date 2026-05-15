import { WorkspaceContent } from "../../../workspace/components/workspace-content";
import { WorkspaceDetailContainer } from "../../../workspace/components/workspace-detail-container";
import { useWorkspaceDevice } from "../../../workspace/store/use-workspace-store";
import { JSLogsFilters } from "../../components/js-logs-filters";
import { JSLogsList } from "../../components/js-logs-list";
import { JSLogsDetailView } from "../../components/js-logs-detail-view";
import {
  useGetJSLogsByDevice,
  useSelectedJSLog,
  useSetSelectedJSLog,
} from "../../store/use-js-logs-store";
import { Icon } from "../../../../shared/ui/icon";

export function JSLogsView() {
  const workspaceDevice = useWorkspaceDevice();
  const logs = useGetJSLogsByDevice(workspaceDevice?.deviceId ?? null);
  const selectedLog = useSelectedJSLog();
  const setSelectedLog = useSetSelectedJSLog();

  return (
    <div className="flex flex-1 flex-col w-full h-full pt-4 relative">
      <div className="flex mb-3 gap-2 items-center justify-start w-full px-4 py-2 pb-4 border-b border-b-olive-700">
        <Icon name="list" size={25} className="text-olive-300" />
        {/*<p className="font-bold text-lg">JS Logs</p>*/}
      </div>
      <JSLogsFilters />

      <div className="flex flex-1 flex-col gap-4">
        <WorkspaceContent>
          <JSLogsList logs={logs} />
          <JSLogsList logs={logs} />
          <JSLogsList logs={logs} />
          <JSLogsList logs={logs} />
          <JSLogsList logs={logs} />
        </WorkspaceContent>
        <WorkspaceDetailContainer
          isOpen={selectedLog !== null}
          onClose={() => setSelectedLog(null)}
          title="Log Details"
        >
          {selectedLog ? <JSLogsDetailView log={selectedLog} /> : null}
        </WorkspaceDetailContainer>
      </div>
    </div>
  );
}
