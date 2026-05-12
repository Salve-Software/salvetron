import { useNetworkStore } from "./network.store";

export function useNetworkLogs() {
  return useNetworkStore((state) => state.logs);
}

export function useAddNetworkLog() {
  return useNetworkStore((state) => state.addNetworkLog);
}
