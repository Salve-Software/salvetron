import { create } from "zustand";
import type { NetworkLog } from "@mako/types";

export interface NetworkStoreState {
  logs: NetworkLog[];
  addNetworkLog: (log: NetworkLog) => void;
}

export const useNetworkStore = create<NetworkStoreState>((set) => ({
  logs: [],
  addNetworkLog: (log: NetworkLog) =>
    set((state) => ({ logs: [...state.logs, log] })),
}));
