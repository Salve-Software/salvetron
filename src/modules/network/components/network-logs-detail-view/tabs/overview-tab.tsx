import type { NetworkLog, HttpStatusCategory } from "@mako/types";
import { getStatusCategory } from "@mako/types";
import { Icon } from "../../../../../shared/ui/icon";
import type { IconName } from "../../../../../shared/ui/icon/types";

interface OverviewTabProps {
  log: NetworkLog;
}

const methodConfig: Record<string, { color: string; bgColor: string }> = {
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
  { color: string; bgColor: string; icon: IconName; label: string }
> = {
  info: {
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    icon: "info",
    label: "Informational",
  },
  success: {
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    icon: "success",
    label: "Success",
  },
  redirect: {
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    icon: "redirect",
    label: "Redirect",
  },
  "client-error": {
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    icon: "warning",
    label: "Client Error",
  },
  "server-error": {
    color: "text-red-400",
    bgColor: "bg-red-400/10",
    icon: "error",
    label: "Server Error",
  },
};

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

function formatDuration(duration: number | null): string {
  if (duration === null) return "Pending...";
  if (duration < 1000) return `${duration}ms`;
  return `${(duration / 1000).toFixed(2)}s`;
}

export function OverviewTab({ log }: OverviewTabProps) {
  const methodCfg = methodConfig[log.method] ?? methodConfig.GET;
  const statusCategory = getStatusCategory(log.statusCode);
  const statusCfg = statusCategory ? statusConfig[statusCategory] : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Method + Status Header */}
      <div className="flex items-center gap-3">
        <span
          className={`text-sm font-bold px-3 py-1.5 rounded ${methodCfg.color} ${methodCfg.bgColor}`}
        >
          {log.method}
        </span>
        {log.state === "pending" ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-olive-700/50">
            <Icon
              name="pending"
              size={14}
              className="text-olive-400 animate-spin"
            />
            <span className="text-sm text-olive-400">Pending</span>
          </div>
        ) : statusCfg ? (
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded ${statusCfg.bgColor}`}
          >
            <Icon name={statusCfg.icon} size={14} className={statusCfg.color} />
            <span className={`text-sm font-medium ${statusCfg.color}`}>
              {log.statusCode} {statusCfg.label}
            </span>
          </div>
        ) : null}
      </div>

      {/* URL */}
      <div className="flex flex-col gap-1">
        <p className="text-xs text-olive-500 uppercase">URL</p>
        <p className="text-sm break-all text-olive-200">{log.url}</p>
      </div>

      {/* Duration */}
      <div className="flex flex-col gap-1">
        <p className="text-xs text-olive-500 uppercase">Duration</p>
        <div className="flex items-center gap-2">
          <Icon name="clock" size={14} className="text-olive-400" />
          <p className="text-sm text-olive-200">
            {formatDuration(log.duration)}
          </p>
        </div>
      </div>

      {/* Timestamps */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs text-olive-500 uppercase">Request Time</p>
          <p className="text-sm text-olive-300">
            {formatTimestamp(log.requestTimestamp)}
          </p>
        </div>
        {log.responseTimestamp && (
          <div className="flex flex-col gap-1">
            <p className="text-xs text-olive-500 uppercase">Response Time</p>
            <p className="text-sm text-olive-300">
              {formatTimestamp(log.responseTimestamp)}
            </p>
          </div>
        )}
      </div>

      {/* Request ID */}
      <div className="flex flex-col gap-1">
        <p className="text-xs text-olive-500 uppercase">Request ID</p>
        <p className="text-xs text-olive-500 font-mono">{log.requestId}</p>
      </div>
    </div>
  );
}
