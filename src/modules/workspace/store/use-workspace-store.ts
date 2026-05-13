import { useWorkspaceStore } from "./workspace-store";

export function useWorkspaceDevice() {
  return useWorkspaceStore((state) => state.workspaceDevice);
}

export function useCurrentProject() {
  return useWorkspaceStore((state) => state.currentProject);
}

export function useSetCurrentProject() {
  return useWorkspaceStore((state) => state.setCurrentProject);
}

export function useSetWorkspaceDevice() {
  return useWorkspaceStore((state) => state.setWorkspaceDevice);
}
