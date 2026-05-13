import type { NetworkLog, HttpMethod, HttpStatusCategory } from "@mako/types";
import { getStatusCategory } from "@mako/types";
import { Table, TableColumn } from "../../../../shared/ui/table";
import { Icon } from "../../../../shared/ui/icon";
import type { IconName } from "../../../../shared/ui/icon/types";
import {
  useSelectedNetworkLog,
  useSetSelectedNetworkLog,
} from "../../store/use-network-store";

export interface NetworkLogsListProps {
  logs: NetworkLog[];
  emptyState?: React.ReactNode;
}

const methodConfig: Record<HttpMethod, { color: string; bgColor: string }> = {
  GET: { color: "text-blue-400", bgColor: "bg-blue-400/10" },
  POST: { color: "text-green-400", bgColor: "bg-green-400/10" },
  PUT: { color: "text-amber-400", bgColor: "bg-amber-400/10" },
  PATCH: { color: "text-purple-400", bgColor: "bg-purple-400/10" },
  DELETE: { color: "text-red-400", bgColor: "bg-red-400/10" },
  HEAD: { color: "text-gray-400", bgColor: "bg-gray-400/10" },
  OPTIONS: { color: "text-gray-400", bgColor: "bg-gray-400/10" },
};

const statusConfig: Record<
  HttpStatusCategory,
  { color: string; icon: IconName }
> = {
  info: { color: "text-blue-400", icon: "info" },
  success: { color: "text-green-400", icon: "success" },
  redirect: { color: "text-amber-400", icon: "redirect" },
  "client-error": { color: "text-orange-400", icon: "warning" },
  "server-error": { color: "text-red-400", icon: "error" },
};

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const ms = String(date.getMilliseconds()).padStart(3, "0");
  return `${hours}:${minutes}:${seconds}.${ms}`;
}

function formatDuration(duration: number | null): string {
  if (duration === null) return "-";
  if (duration < 1000) return `${duration}ms`;
  return `${(duration / 1000).toFixed(2)}s`;
}

function getUrlPath(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search;
  } catch {
    return url;
  }
}

const columns: TableColumn<NetworkLog>[] = [
  {
    key: "method",
    header: "Method",
    width: "80px",
    render: (log) => {
      const config = methodConfig[log.method] ?? methodConfig.GET;
      return (
        <span
          className={`text-xs font-bold px-2 py-1 rounded ${config.color} ${config.bgColor}`}
        >
          {log.method}
        </span>
      );
    },
  },
  {
    key: "status",
    header: "Status",
    width: "90px",
    render: (log) => {
      if (log.state === "pending") {
        return (
          <div className="flex items-center gap-1.5">
            <Icon
              name="pending"
              size={14}
              className="text-olive-400 animate-spin"
            />
            <span className="text-sm text-olive-400">...</span>
          </div>
        );
      }

      const category = getStatusCategory(log.statusCode);
      const config = category
        ? statusConfig[category]
        : { color: "text-gray-400", icon: "info" as IconName };

      return (
        <div className="flex items-center gap-1.5">
          <Icon name={config.icon} size={14} className={config.color} />
          <span className={`text-sm font-medium ${config.color}`}>
            {log.statusCode}
          </span>
        </div>
      );
    },
  },
  {
    key: "url",
    header: "URL",
    width: "1fr",
    render: (log) => (
      <p className="text-sm truncate text-olive-200" title={log.url}>
        {getUrlPath(log.url)}
      </p>
    ),
  },
  {
    key: "duration",
    header: "Duration",
    width: "90px",
    render: (log) => (
      <span className="text-sm text-olive-400">
        {formatDuration(log.duration)}
      </span>
    ),
  },
  {
    key: "timestamp",
    header: "Time",
    width: "110px",
    render: (log) => (
      <span className="text-sm text-olive-500">
        {formatTimestamp(log.requestTimestamp)}
      </span>
    ),
  },
];

export function NetworkLogsList({ logs, emptyState }: NetworkLogsListProps) {
  const selectedLog = useSelectedNetworkLog();
  const setSelectedLog = useSetSelectedNetworkLog();

  return (
    <Table
      columns={columns}
      data={logs}
      keyExtractor={(log) => log.requestId}
      onRowClick={setSelectedLog}
      isSelected={(log) => selectedLog?.requestId === log.requestId}
      emptyState={emptyState}
    />
  );
}
