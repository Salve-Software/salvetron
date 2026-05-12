import { useWorkspaceStore } from "./workspace-store";

export function useWorkspaceDevice() {
  return useWorkspaceStore((state) => state.workspaceDevice);
}

export function useWorkspaceProjects() {
  return useWorkspaceStore((state) => state.workspaceProjects);
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

export function useAddProject() {
  return useWorkspaceStore((state) => state.addProject);
}
