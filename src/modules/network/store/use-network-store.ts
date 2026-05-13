import type {
  NetworkLog,
  HttpMethod,
  HttpStatusCategory,
  NetworkEvent,
} from "@mako/types";
import {
  useNetworkStore,
  getLogsArray,
  filterLogs,
  type NetworkLogsFilters,
} from "./network-store";

// State selectors
export function useNetworkLogs(): NetworkLog[] {
  const logs = useNetworkStore((state) => state.logs);
  return getLogsArray(logs);
}

export function useSelectedNetworkLog(): NetworkLog | null {
  return useNetworkStore((state) => state.selectedLog);
}

export function useNetworkLogsFilters(): NetworkLogsFilters {
  return useNetworkStore((state) => state.filters);
}

// Action selectors
export function useAddOrUpdateNetworkLog(): (event: NetworkEvent) => void {
  return useNetworkStore((state) => state.addOrUpdateLog);
}

export function useSetSelectedNetworkLog(): (log: NetworkLog | null) => void {
  return useNetworkStore((state) => state.setSelectedLog);
}

export function useSetNetworkSearchQuery(): (query: string) => void {
  return useNetworkStore((state) => state.setSearchQuery);
}

export function useSetNetworkMethodFilter(): (
  method: HttpMethod | null
) => void {
  return useNetworkStore((state) => state.setMethodFilter);
}

export function useSetNetworkStatusFilter(): (
  status: HttpStatusCategory | null
) => void {
  return useNetworkStore((state) => state.setStatusFilter);
}

export function useClearNetworkLogs(): () => void {
  return useNetworkStore((state) => state.clearLogs);
}

// Derived selector with filtering
export function useGetNetworkLogsByDevice(
  deviceId: string | null
): NetworkLog[] {
  const logs = useNetworkStore((state) => state.logs);
  const filters = useNetworkStore((state) => state.filters);

  const logsArray = getLogsArray(logs);
  return filterLogs(logsArray, deviceId, filters);
}

// Re-export types for convenience
export type { NetworkLogsFilters };
