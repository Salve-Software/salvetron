import { Icon } from "../../../../shared/ui/icon";
import { IconName } from "../../../../shared/ui/icon/types";
import type { NativeLog, LogLevel } from "@mako/types";

interface NativeLogsDetailViewProps {
  log: NativeLog;
}

const levelConfig: Record<LogLevel, { icon: IconName; color: string; bgColor: string }> = {
  debug: { icon: "debug", color: "text-gray-400", bgColor: "bg-gray-400/10" },
  info: { icon: "info", color: "text-blue-400", bgColor: "bg-blue-400/10" },
  warn: { icon: "warning", color: "text-amber-400", bgColor: "bg-amber-400/10" },
  error: { icon: "error", color: "text-red-400", bgColor: "bg-red-400/10" },
};

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function NativeLogsDetailView({ log }: NativeLogsDetailViewProps) {
  const config = levelConfig[log.level] ?? levelConfig.info;
  const hasMetadata = Object.keys(log.metadata).length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center p-2 rounded-lg ${config.bgColor}`}>
          <Icon name={config.icon} size={18} className={config.color} />
        </div>
        <div className="flex flex-col">
          <span className={`text-xs font-medium uppercase ${config.color}`}>
            {log.level}
          </span>
          <span className="text-xs text-olive-500">
            {formatTimestamp(log.timestamp)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-xs text-olive-500 uppercase">Message</p>
        <p className="text-sm break-words">{log.message}</p>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-xs text-olive-500 uppercase">Source</p>
        <p className="text-sm break-words">{log.source}</p>
      </div>

      {hasMetadata && (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-olive-500 uppercase">Metadata</p>
          <pre className="text-xs bg-olive-950 rounded-lg p-3 overflow-x-auto">
            {JSON.stringify(log.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
