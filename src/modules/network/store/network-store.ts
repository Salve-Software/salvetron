import { create } from "zustand";
import type {
  NetworkLog,
  HttpMethod,
  HttpStatusCategory,
  NetworkEvent,
} from "@mako/types";
import { normalizeHttpMethod, getStatusCategory } from "@mako/types";

const mockLogs: NetworkLog[] = [
  {
    requestId: "req-001",
    deviceId: "1",
    projectId: "123",
    method: "GET",
    url: "https://api.example.com/users",
    requestHeaders: { Authorization: "Bearer token123" },
    requestBody: null,
    requestTimestamp: Date.now() - 60000,
    statusCode: 200,
    responseHeaders: { "Content-Type": "application/json" },
    responseBody: '{"users": [{"id": 1, "name": "John"}]}',
    responseTimestamp: Date.now() - 59800,
    duration: 200,
    state: "completed",
  },
  {
    requestId: "req-002",
    deviceId: "1",
    projectId: "123",
    method: "POST",
    url: "https://api.example.com/users",
    requestHeaders: { "Content-Type": "application/json" },
    requestBody: '{"name": "Jane", "email": "jane@example.com"}',
    requestTimestamp: Date.now() - 55000,
    statusCode: 201,
    responseHeaders: { "Content-Type": "application/json" },
    responseBody: '{"id": 2, "name": "Jane", "email": "jane@example.com"}',
    responseTimestamp: Date.now() - 54700,
    duration: 300,
    state: "completed",
  },
  {
    requestId: "req-003",
    deviceId: "1",
    projectId: "123",
    method: "GET",
    url: "https://api.example.com/products?category=electronics",
    requestHeaders: {},
    requestBody: null,
    requestTimestamp: Date.now() - 50000,
    statusCode: 404,
    responseHeaders: { "Content-Type": "application/json" },
    responseBody: '{"error": "Not found"}',
    responseTimestamp: Date.now() - 49850,
    duration: 150,
    state: "completed",
  },
  {
    requestId: "req-004",
    deviceId: "1",
    projectId: "123",
    method: "PUT",
    url: "https://api.example.com/users/1",
    requestHeaders: { "Content-Type": "application/json" },
    requestBody: '{"name": "John Updated"}',
    requestTimestamp: Date.now() - 45000,
    statusCode: 500,
    responseHeaders: { "Content-Type": "application/json" },
    responseBody: '{"error": "Internal server error"}',
    responseTimestamp: Date.now() - 44500,
    duration: 500,
    state: "completed",
  },
  {
    requestId: "req-005",
    deviceId: "1",
    projectId: "123",
    method: "DELETE",
    url: "https://api.example.com/users/2",
    requestHeaders: { Authorization: "Bearer token123" },
    requestBody: null,
    requestTimestamp: Date.now() - 40000,
    statusCode: 204,
    responseHeaders: {},
    responseBody: null,
    responseTimestamp: Date.now() - 39900,
    duration: 100,
    state: "completed",
  },
  {
    requestId: "req-006",
    deviceId: "2",
    projectId: "123",
    method: "GET",
    url: "https://api.example.com/orders",
    requestHeaders: { Authorization: "Bearer token456" },
    requestBody: null,
    requestTimestamp: Date.now() - 35000,
    statusCode: 200,
    responseHeaders: { "Content-Type": "application/json" },
    responseBody: '{"orders": []}',
    responseTimestamp: Date.now() - 34800,
    duration: 200,
    state: "completed",
  },
  {
    requestId: "req-007",
    deviceId: "2",
    projectId: "123",
    method: "POST",
    url: "https://api.example.com/checkout",
    requestHeaders: { "Content-Type": "application/json" },
    requestBody: '{"items": [{"id": 1, "qty": 2}], "total": 99.99}',
    requestTimestamp: Date.now() - 30000,
    statusCode: 400,
    responseHeaders: { "Content-Type": "application/json" },
    responseBody: '{"error": "Invalid payment method"}',
    responseTimestamp: Date.now() - 29700,
    duration: 300,
    state: "completed",
  },
  {
    requestId: "req-008",
    deviceId: "1",
    projectId: "123",
    method: "GET",
    url: "https://api.example.com/slow-endpoint",
    requestHeaders: {},
    requestBody: null,
    requestTimestamp: Date.now() - 25000,
    statusCode: null,
    responseHeaders: null,
    responseBody: null,
    responseTimestamp: null,
    duration: null,
    state: "pending",
  },
  {
    requestId: "req-009",
    deviceId: "1",
    projectId: "123",
    method: "PATCH",
    url: "https://api.example.com/settings",
    requestHeaders: { "Content-Type": "application/json" },
    requestBody: '{"theme": "dark", "notifications": true}',
    requestTimestamp: Date.now() - 20000,
    statusCode: 200,
    responseHeaders: { "Content-Type": "application/json" },
    responseBody: '{"success": true}',
    responseTimestamp: Date.now() - 19850,
    duration: 150,
    state: "completed",
  },
  {
    requestId: "req-010",
    deviceId: "2",
    projectId: "123",
    method: "GET",
    url: "https://cdn.example.com/images/banner.png",
    requestHeaders: {},
    requestBody: null,
    requestTimestamp: Date.now() - 15000,
    statusCode: 301,
    responseHeaders: { Location: "https://cdn2.example.com/images/banner.png" },
    responseBody: null,
    responseTimestamp: Date.now() - 14950,
    duration: 50,
    state: "completed",
  },
];

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

function createInitialLogsMap(): Map<string, NetworkLog> {
  const map = new Map<string, NetworkLog>();
  for (const log of mockLogs) {
    map.set(log.requestId, log);
  }
  return map;
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

  clearLogs: () =>
    set({ logs: new Map(), selectedLog: null }),
}));

/**
 * Helper to get logs array from Map (sorted by timestamp descending)
 */
export function getLogsArray(logs: Map<string, NetworkLog>): NetworkLog[] {
  return Array.from(logs.values()).sort(
    (a, b) => b.requestTimestamp - a.requestTimestamp
  );
}

/**
 * Filter logs by device and current filters
 */
export function filterLogs(
  logs: NetworkLog[],
  deviceId: string | null,
  filters: NetworkLogsFilters
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
