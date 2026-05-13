import { DropdownMenu } from "../../../../shared/ui/dropdown-menu";
import type { DropdownOption } from "../../../../shared/ui/dropdown-menu/types";
import { Icon } from "../../../../shared/ui/icon";
import { Input } from "../../../../shared/ui/input";
import type { HttpMethod, HttpStatusCategory } from "@mako/types";
import {
  useNetworkLogsFilters,
  useSetNetworkSearchQuery,
  useSetNetworkMethodFilter,
  useSetNetworkStatusFilter,
  useClearNetworkLogs,
} from "../../store/use-network-store";

const methodOptions: DropdownOption[] = [
  { label: "All Methods", value: "all" },
  { label: "GET", value: "GET" },
  { label: "POST", value: "POST" },
  { label: "PUT", value: "PUT" },
  { label: "PATCH", value: "PATCH" },
  { label: "DELETE", value: "DELETE" },
];

const statusOptions: DropdownOption[] = [
  { label: "All Status", value: "all" },
  { label: "Success (2xx)", value: "success", iconName: "success" },
  { label: "Redirect (3xx)", value: "redirect", iconName: "redirect" },
  { label: "Client Error (4xx)", value: "client-error", iconName: "warning" },
  { label: "Server Error (5xx)", value: "server-error", iconName: "error" },
];

export function NetworkLogsFilters() {
  const filters = useNetworkLogsFilters();
  const setSearchQuery = useSetNetworkSearchQuery();
  const setMethodFilter = useSetNetworkMethodFilter();
  const setStatusFilter = useSetNetworkStatusFilter();
  const clearLogs = useClearNetworkLogs();

  const currentMethodLabel =
    methodOptions.find((opt) => opt.value === filters.methodFilter)?.label ??
    "All Methods";

  const currentStatusLabel =
    statusOptions.find((opt) => opt.value === filters.statusFilter)?.label ??
    "All Status";

  return (
    <div className="flex px-3 flex-row gap-3 w-full items-center pr-4">
      <div className="flex gap-2 h-full">
        <DropdownMenu
          label={currentMethodLabel}
          options={methodOptions.map((opt) => ({
            ...opt,
            onClick: () =>
              setMethodFilter(
                opt.value === "all" ? null : (opt.value as HttpMethod)
              ),
          }))}
        />
        <DropdownMenu
          label={currentStatusLabel}
          options={statusOptions.map((opt) => ({
            ...opt,
            onClick: () =>
              setStatusFilter(
                opt.value === "all" ? null : (opt.value as HttpStatusCategory)
              ),
          }))}
        />
      </div>
      <div className="flex flex-1">
        <Input
          leftIcon={{ name: "search" }}
          placeholder="Search URL..."
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
