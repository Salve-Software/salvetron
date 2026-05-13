import { create } from "zustand";
import { NetworkLog } from "../domain/types";

export interface NetworkStoreState {
  logs: NetworkLog[];
  addNetworkLog: (log: NetworkLog) => void;
}

export const useNetworkStore = create<NetworkStoreState>((set) => ({
  logs: [],
  addNetworkLog: (log: NetworkLog) =>
    set((state) => ({ logs: [...state.logs, log] })),
}));
