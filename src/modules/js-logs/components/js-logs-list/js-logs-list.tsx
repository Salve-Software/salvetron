import type { JSLog } from "@mako/types";
import { JSLogItem } from "../js-log-item";
import {
  useSelectedJSLog,
  useSetSelectedJSLog,
} from "../../store/use-js-logs-store";

export interface JSLogsListProps {
  logs: JSLog[];
}

export function JSLogsList({ logs }: JSLogsListProps) {
  const selectedLog = useSelectedJSLog();
  const setSelectedLog = useSetSelectedJSLog();

  return (
    <div className="flex flex-col w-full">
      <div className="grid grid-cols-[140px_180px_1fr] items-center py-2 px-4 border-b border-olive-700 shrink-0">
        <span className="text-xs text-olive-500 uppercase font-medium">
          Log Level
        </span>
        <span className="text-xs text-olive-500 uppercase font-medium">
          Timestamp
        </span>
        <span className="text-xs text-olive-500 uppercase font-medium">
          Log Message
        </span>
      </div>
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
        {logs.map((log, index) => (
          <JSLogItem
            key={`${log.timestamp}-${index}`}
            log={log}
            isSelected={selectedLog?.timestamp === log.timestamp}
            onClick={() => setSelectedLog(log)}
          />
        ))}
      </div>
    </div>
  );
}
