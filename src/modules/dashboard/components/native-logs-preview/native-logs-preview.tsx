import {
  useGetNativeLogsByDevice,
  useSelectedNativeLog,
  useSetSelectedNativeLog,
} from "../../../native/store/use-native-store";
import { useWorkspaceDevice } from "../../../workspace/store/use-workspace-store";
import { NativeLogsList } from "../../../native/components/native-logs-list/native-logs-list";
import { NativeLogsDetailView } from "../../../native/components/native-logs-detail-view";
import { FloatingModal } from "../../../../shared/ui/floating-modal";

export function NativeLogsPreview() {
  const device = useWorkspaceDevice();
  const logs = useGetNativeLogsByDevice(device?.deviceId ?? null);
  const lastFive = logs.slice(-5);
  const selectedLog = useSelectedNativeLog();
  const setSelectedLog = useSetSelectedNativeLog();

  return (
    <div className="h-full overflow-auto">
      {lastFive.length > 0
        ?
        <NativeLogsList logs={lastFive} />
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
        title="Native Log Details"
      >
        {selectedLog
          ?
          <NativeLogsDetailView log={selectedLog} />
          : null
        }
      </FloatingModal>
    </div>
  );
}
