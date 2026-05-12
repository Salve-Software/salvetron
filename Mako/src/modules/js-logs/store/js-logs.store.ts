import { create } from "zustand";
import { JSLog } from "../domain/types";

export interface JSLogsStoreProps {
  logs: JSLog[];
  addLog: (log: JSLog) => void;
}
export const useJSLogsStore = create<JSLogsStoreProps>((set, get) => ({
  logs: [],
  addLog: (log: JSLog) => set((state) => ({ logs: [...state.logs, log] })),
}));
