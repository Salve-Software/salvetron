import { useGetNativeLogsByDevice } from "../../../native/store/use-native-store";
import { useWorkspaceDevice } from "../../../workspace/store/use-workspace-store";
import { NativeLogsList } from "../../../native/components/native-logs-list/native-logs-list";

export function NativeLogsPreview() {
  const device = useWorkspaceDevice();
  const logs = useGetNativeLogsByDevice(device?.id ?? null);
  const lastFive = logs.slice(-5);

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
    </div>
  );
}
