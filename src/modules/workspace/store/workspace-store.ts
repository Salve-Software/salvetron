import { create } from "zustand";
import { Device } from "../../devices/domain/types";
import { WorkspaceProject } from "../domain/types";

export interface WorkspaceStoreState {
  workspaceDevice: Device | null;
  workspaceProjects: WorkspaceProject[] | null;
  currentProject: WorkspaceProject | null;
  setCurrentProject: (project: WorkspaceProject | null) => void;
  addProject: (project: WorkspaceProject) => void;
  setWorkspaceDevice: (device: Device | null) => void;
}

const mockProjects: WorkspaceProject[] = [
  { appName: "Mako", bundleId: "123", projectId: "123" },
  { appName: "Mako2", bundleId: "1234", projectId: "1234" },
];

export const useWorkspaceStore = create<WorkspaceStoreState>((set, get) => ({
  workspaceDevice: null,
  workspaceProjects: mockProjects,
  currentProject: mockProjects[0],
  addProject: (project: WorkspaceProject) => {
    const projects = get().workspaceProjects;
    const projectExists = projects
      ? projects.find((project) => project.appName === project?.appName)
      : null;
    if (!projectExists) {
      set({ workspaceProjects: [...(projects || []), project] });
    }
  },
  setCurrentProject: (project: WorkspaceProject | null) => {
    set({ currentProject: project });
  },
  setWorkspaceDevice: (device: Device | null) => {
    set({ workspaceDevice: device });
  },
}));
