import { DropdownMenu } from "../../../../shared/ui/dropdown-menu";
import { DropdownOption } from "../../../../shared/ui/dropdown-menu/types";
import { Icon } from "../../../../shared/ui/icon";
import { Input } from "../../../../shared/ui/input";
import type { LogLevel } from "@mako/types";
import {
  useJSLogsFilters,
  useSetSearchQuery,
  useSetLevelFilter,
  useClearLogs,
} from "../../store/use-js-logs-store";

const levelOptions: DropdownOption[] = [
  { label: "All Levels", value: "all", iconName: "list" },
  { label: "Debug", value: "debug", iconName: "debug" },
  { label: "Info", value: "info", iconName: "info" },
  { label: "Warning", value: "warn", iconName: "warning" },
  { label: "Error", value: "error", iconName: "error" },
];

export function JSLogsFilters() {
  const filters = useJSLogsFilters();
  const setSearchQuery = useSetSearchQuery();
  const setLevelFilter = useSetLevelFilter();
  const clearLogs = useClearLogs();

  const currentLevelLabel =
    levelOptions.find((opt) => opt.value === filters.levelFilter)?.label ??
    "All Levels";

  return (
    <div className="flex px-3 flex-row gap-3 w-full items-center pr-4">
      <div className="flex gap-2 h-full">
        <DropdownMenu
          label={currentLevelLabel}
          options={levelOptions.map((opt) => ({
            ...opt,
            onClick: () =>
              setLevelFilter(opt.value === "all" ? null : (opt.value as LogLevel)),
          }))}
        />
      </div>
      <div className="flex flex-1">
        <Input
          leftIcon={{ name: "search" }}
          placeholder="Search logs..."
          value={filters.searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <button
        className="duration-150 transition-opacity hover:opacity-90"
        onClick={clearLogs}
      >
        <Icon name="trash" size={20} className="text-olive-400" />
      </button>
    </div>
  );
}
