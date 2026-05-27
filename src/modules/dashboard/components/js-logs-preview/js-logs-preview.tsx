import {
  useGetJSLogsByDevice,
  useSelectedJSLog,
  useSetSelectedJSLog,
} from "../../../js-logs/store/use-js-logs-store";
import { useWorkspaceDevice } from "../../../workspace/store/use-workspace-store";
import { JSLogsList } from "../../../js-logs/components/js-logs-list/js-logs-list";
import { JSLogsDetailView } from "../../../js-logs/components/js-logs-detail-view";
import { FloatingModal } from "../../../../shared/ui/floating-modal";

export function JSLogsPreview() {
  const device = useWorkspaceDevice();
  const logs = useGetJSLogsByDevice(device?.deviceId ?? null);
  const lastFive = logs.slice(-5);
  const selectedLog = useSelectedJSLog();
  const setSelectedLog = useSetSelectedJSLog();

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

      <FloatingModal
        isOpen={selectedLog !== null}
        onClose={() => setSelectedLog(null)}
        title="Log Details"
      >
        {selectedLog
          ?
          <JSLogsDetailView log={selectedLog} />
          : null
        }
      </FloatingModal>
    </div>
  );
}
