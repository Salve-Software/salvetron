import type { JSLog, LogLevel } from "@mako/types";
import { Table, TableColumn } from "../../../../shared/ui/table";
import { Icon } from "../../../../shared/ui/icon";
import { IconName } from "../../../../shared/ui/icon/types";
import {
  useSelectedJSLog,
  useSetSelectedJSLog,
} from "../../store/use-js-logs-store";

export interface JSLogsListProps {
  logs: JSLog[];
  emptyState?: React.ReactNode;
}

const levelConfig: Record<
  LogLevel,
  { icon: IconName; color: string; label: string }
> = {
  debug: { icon: "debug", color: "text-gray-400", label: "Debug" },
  info: { icon: "info", color: "text-blue-400", label: "Info" },
  warn: { icon: "warning", color: "text-amber-500", label: "Warning" },
  error: { icon: "error", color: "text-red-400", label: "Error" },
};

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const columns: TableColumn<JSLog>[] = [
  {
    key: "level",
    header: "Log Level",
    width: "140px",
    render: (log) => {
      const config = levelConfig[log.level] ?? levelConfig.info;
      return (
        <div className="flex items-center gap-2">
          <Icon name={config.icon} size={16} className={config.color} />
          <span className={`text-sm font-medium ${config.color}`}>
            {config.label}
          </span>
        </div>
      );
    },
  },
  {
    key: "timestamp",
    header: "Timestamp",
    width: "180px",
    render: (log) => (
      <span className="text-sm text-olive-400">
        {formatTimestamp(log.timestamp)}
      </span>
    ),
  },
  {
    key: "message",
    header: "Log Message",
    width: "1fr",
    render: (log) => <p className="text-sm truncate text-olive-400">{log.message}</p>,
  },
];

export function JSLogsList({ logs, emptyState }: JSLogsListProps) {
  const selectedLog = useSelectedJSLog();
  const setSelectedLog = useSetSelectedJSLog();

  return (
    <Table
      columns={columns}
      data={logs}
      keyExtractor={(log, index) => `${log.timestamp}-${index}`}
      onRowClick={setSelectedLog}
      isSelected={(log) => selectedLog?.timestamp === log.timestamp}
      emptyState={emptyState}
    />
  );
}
