import { useNativeStore } from "./native-store";

export function useNativeLogs() {
  return useNativeStore((state) => state.logs);
}

export function useAddNativeLog() {
  return useNativeStore((state) => state.addLog);
}

export function useSelectedNativeLog() {
  return useNativeStore((state) => state.selectedLog);
}

export function useSetSelectedNativeLog() {
  return useNativeStore((state) => state.setSelectedLog);
}

export function useNativeLogsFilters() {
  return useNativeStore((state) => state.filters);
}

export function useSetNativeSearchQuery() {
  return useNativeStore((state) => state.setSearchQuery);
}

export function useSetNativeLevelFilter() {
  return useNativeStore((state) => state.setLevelFilter);
}

export function useClearNativeLogs() {
  return useNativeStore((state) => state.clearLogs);
}

export function useGetNativeLogsByDevice(deviceId: string | null) {
  const logs = useNativeStore((state) => state.logs);
  const filters = useNativeStore((state) => state.filters);

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
