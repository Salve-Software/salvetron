import { create } from "zustand";
import type {
  NetworkLog,
  HttpMethod,
  HttpStatusCategory,
  NetworkEvent,
} from "@mako/types";
import { normalizeHttpMethod, getStatusCategory } from "@mako/types";

export interface NetworkLogsFilters {
  searchQuery: string;
  methodFilter: HttpMethod | null;
  statusFilter: HttpStatusCategory | null;
}

export interface NetworkStoreState {
  logs: Map<string, NetworkLog>;
  selectedLog: NetworkLog | null;
  filters: NetworkLogsFilters;

  // Actions
  addOrUpdateLog: (event: NetworkEvent) => void;
  setSelectedLog: (log: NetworkLog | null) => void;
  setSearchQuery: (query: string) => void;
  setMethodFilter: (method: HttpMethod | null) => void;
  setStatusFilter: (status: HttpStatusCategory | null) => void;
  clearLogs: () => void;
}

export const useNetworkStore = create<NetworkStoreState>((set) => ({
  logs: new Map(),
  selectedLog: null,
  filters: {
    searchQuery: "",
    methodFilter: null,
    statusFilter: null,
  },

  addOrUpdateLog: (event: NetworkEvent) =>
    set((state) => {
      const newLogs = new Map(state.logs);
      const existing = newLogs.get(event.requestId);

      if (event.stage === "request") {
        // Create new entry for request
        const newLog: NetworkLog = {
          requestId: event.requestId,
          deviceId: event.deviceId ?? "unknown",
          projectId: event.projectId,
          method: normalizeHttpMethod(event.method),
          url: event.url,
          requestHeaders: event.headers ?? {},
          requestBody: event.body ?? null,
          requestTimestamp: event.timestamp,
          statusCode: null,
          responseHeaders: null,
          responseBody: null,
          responseTimestamp: null,
          duration: null,
          state: "pending",
        };
        newLogs.set(event.requestId, newLog);
      } else if (event.stage === "response" && existing) {
        // Merge response data into existing request
        const updatedLog: NetworkLog = {
          ...existing,
          statusCode: event.statusCode,
          responseHeaders: event.headers ?? {},
          responseBody: event.body ?? null,
          responseTimestamp: event.timestamp,
          duration: event.duration,
          state: "completed",
        };
        newLogs.set(event.requestId, updatedLog);

        // Update selectedLog if it's the same request
        if (state.selectedLog?.requestId === event.requestId) {
          return { logs: newLogs, selectedLog: updatedLog };
        }
      } else if (event.stage === "response" && !existing) {
        // Response without request (edge case) - create complete entry
        const newLog: NetworkLog = {
          requestId: event.requestId,
          deviceId: event.deviceId ?? "unknown",
          projectId: event.projectId,
          method: normalizeHttpMethod(event.method),
          url: event.url,
          requestHeaders: {},
          requestBody: null,
          requestTimestamp: event.timestamp - (event.duration ?? 0),
          statusCode: event.statusCode,
          responseHeaders: event.headers ?? {},
          responseBody: event.body ?? null,
          responseTimestamp: event.timestamp,
          duration: event.duration,
          state: "completed",
        };
        newLogs.set(event.requestId, newLog);
      }

      return { logs: newLogs };
    }),

  setSelectedLog: (log: NetworkLog | null) => set({ selectedLog: log }),

  setSearchQuery: (query: string) =>
    set((state) => ({ filters: { ...state.filters, searchQuery: query } })),

  setMethodFilter: (method: HttpMethod | null) =>
    set((state) => ({ filters: { ...state.filters, methodFilter: method } })),

  setStatusFilter: (status: HttpStatusCategory | null) =>
    set((state) => ({ filters: { ...state.filters, statusFilter: status } })),

  clearLogs: () => set({ logs: new Map(), selectedLog: null }),
}));

/**
 * Helper to get logs array from Map (sorted by timestamp descending)
 */
export function getLogsArray(logs: Map<string, NetworkLog>): NetworkLog[] {
  return Array.from(logs.values()).sort(
    (a, b) => b.requestTimestamp - a.requestTimestamp,
  );
}

/**
 * Filter logs by device and current filters
 */
export function filterLogs(
  logs: NetworkLog[],
  deviceId: string | null,
  filters: NetworkLogsFilters,
): NetworkLog[] {
  if (!deviceId) return [];

  return logs.filter((log) => {
    // Device filter
    if (log.deviceId !== deviceId) return false;

    // Method filter
    if (filters.methodFilter && log.method !== filters.methodFilter) {
      return false;
    }

    // Status filter
    if (filters.statusFilter) {
      const category = getStatusCategory(log.statusCode);
      if (category !== filters.statusFilter) return false;
    }

    // Search filter (URL)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesUrl = log.url.toLowerCase().includes(query);
      const matchesMethod = log.method.toLowerCase().includes(query);
      if (!matchesUrl && !matchesMethod) return false;
    }

    return true;
  });
}
