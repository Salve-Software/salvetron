import { create } from "zustand";
import type { JSLog, LogLevel } from "@mako/types";

export interface JSLogsFilters {
  searchQuery: string;
  levelFilter: LogLevel | null;
}

export interface JSLogsStoreProps {
  logs: JSLog[];
  selectedLog: JSLog | null;
  filters: JSLogsFilters;
  addLog: (log: JSLog) => void;
  setSelectedLog: (log: JSLog | null) => void;
  setSearchQuery: (query: string) => void;
  setLevelFilter: (level: LogLevel | null) => void;
  clearLogs: () => void;
}

export const useJSLogsStore = create<JSLogsStoreProps>((set) => ({
  logs: [],
  selectedLog: null,
  filters: {
    searchQuery: "",
    levelFilter: null,
  },
  addLog: (log: JSLog) => set((state) => ({ logs: [...state.logs, log] })),
  setSelectedLog: (log: JSLog | null) => set({ selectedLog: log }),
  setSearchQuery: (query: string) =>
    set((state) => ({ filters: { ...state.filters, searchQuery: query } })),
  setLevelFilter: (level: LogLevel | null) =>
    set((state) => ({ filters: { ...state.filters, levelFilter: level } })),
  clearLogs: () => set({ logs: [], selectedLog: null }),
}));
