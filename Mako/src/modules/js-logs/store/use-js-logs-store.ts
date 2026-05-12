import { useJSLogsStore } from "./js-logs.store";

export function useJSLogs() {
  return useJSLogsStore((state) => state.logs);
}

export function useAddJSLog() {
  return useJSLogsStore((state) => state.addLog);
}
