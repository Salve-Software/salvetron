import { create } from "zustand";
import { Device } from "../../devices/domain/types";
import { WorkspaceProject } from "../domain/types";

export interface WorkspaceStoreState {
  workspaceDevice: Device | null;
  workspaceProjects: WorkspaceProject[] | null;
  setWorkspaceDevice: (device: Device | null) => void;
}

export const useWorkspaceStore = create<WorkspaceStoreState>((set, get) => ({
  workspaceDevice: null,
  workspaceProjects: [{ appName: "Mako", bundleId: "123", id: "123" }],
  setWorkspaceDevice: (device: Device | null) => {
    set({ workspaceDevice: device });
    const projects = get().workspaceProjects;

    const projectExists = projects
      ? projects.find((project) => project.appName === device?.appName)
      : null;

    if (!projectExists) {
      set({
        workspaceProjects: projects
          ? [
              ...projects,
              {
                appName: device?.appName || "",
                id: device?.deviceId || "",
                bundleId: device?.bundleId || "",
              },
            ]
          : null,
      });
    }
  },
}));
