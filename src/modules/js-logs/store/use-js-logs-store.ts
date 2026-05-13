import { useJSLogsStore } from "./js-logs.store";

export function useJSLogs() {
  return useJSLogsStore((state) => state.logs);
}

export function useAddJSLog() {
  return useJSLogsStore((state) => state.addLog);
}

export function useSelectedJSLog() {
  return useJSLogsStore((state) => state.selectedLog);
}

export function useSetSelectedJSLog() {
  return useJSLogsStore((state) => state.setSelectedLog);
}

export function useJSLogsFilters() {
  return useJSLogsStore((state) => state.filters);
}

export function useSetSearchQuery() {
  return useJSLogsStore((state) => state.setSearchQuery);
}

export function useSetLevelFilter() {
  return useJSLogsStore((state) => state.setLevelFilter);
}

export function useClearLogs() {
  return useJSLogsStore((state) => state.clearLogs);
}

export function useGetJSLogsByDevice(deviceId: string | null) {
  const logs = useJSLogsStore((state) => state.logs);
  const filters = useJSLogsStore((state) => state.filters);

  if (!deviceId) return [];

  return logs.filter((log) => {
    if (log.deviceId !== deviceId) return false;

    if (filters.levelFilter && log.level !== filters.levelFilter) return false;

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesMessage = log.message.toLowerCase().includes(query);
      const matchesSource = log.source.toLowerCase().includes(query);
      if (!matchesMessage && !matchesSource) return false;
    }

    return true;
  });
}
