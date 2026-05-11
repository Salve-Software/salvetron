import { useWorkspaceStore } from "./workspace-store";

export function useWorkspaceDevice() {
  return useWorkspaceStore((state) => state.workspaceDevice);
}

export function useSetWorkspaceDevice() {
  return useWorkspaceStore((state) => state.setWorkspaceDevice);
}
