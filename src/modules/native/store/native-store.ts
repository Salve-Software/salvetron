import { create } from "zustand";
import type { NativeLog, LogLevel } from "@mako/types";

export interface NativeLogsFilters {
  searchQuery: string;
  levelFilter: LogLevel | null;
}

export interface NativeStoreState {
  logs: NativeLog[];
  selectedLog: NativeLog | null;
  filters: NativeLogsFilters;
  addLog: (log: NativeLog) => void;
  setSelectedLog: (log: NativeLog | null) => void;
  setSearchQuery: (query: string) => void;
  setLevelFilter: (level: LogLevel | null) => void;
  clearLogs: () => void;
}

export const useNativeStore = create<NativeStoreState>((set) => ({
  logs: [],
  selectedLog: null,
  filters: {
    searchQuery: "",
    levelFilter: null,
  },
  addLog: (log: NativeLog) => set((state) => ({ logs: [...state.logs, log] })),
  setSelectedLog: (log: NativeLog | null) => set({ selectedLog: log }),
  setSearchQuery: (query: string) =>
    set((state) => ({ filters: { ...state.filters, searchQuery: query } })),
  setLevelFilter: (level: LogLevel | null) =>
    set((state) => ({ filters: { ...state.filters, levelFilter: level } })),
  clearLogs: () => set({ logs: [], selectedLog: null }),
}));
