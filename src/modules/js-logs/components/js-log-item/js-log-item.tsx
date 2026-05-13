import { Icon } from "../../../../shared/ui/icon";
import { IconName } from "../../../../shared/ui/icon/types";
import type { JSLog, LogLevel } from "@mako/types";

interface JSLogItemProps {
  log: JSLog;
  onClick?: () => void;
  isSelected?: boolean;
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

export function JSLogItem({ log, onClick, isSelected }: JSLogItemProps) {
  const config = levelConfig[log.level] ?? levelConfig.info;

  return (
    <div
      onClick={onClick}
      className={`grid grid-cols-[140px_180px_1fr] items-center py-3 px-4 cursor-pointer transition-all duration-150 border-b border-olive-800 ${
        isSelected ? "bg-olive-700/50" : "hover:bg-olive-800/30"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon name={config.icon} size={16} className={config.color} />
        <span className={`text-sm font-medium ${config.color}`}>
          {config.label}
        </span>
      </div>
      <span className="text-sm text-olive-400">
        {formatTimestamp(log.timestamp)}
      </span>
      <p className="text-sm truncate">{log.message}</p>
    </div>
  );
}
