import { create } from "zustand";
import type { Device, Project } from "@mako/types";
import { useDevicesStore } from "../../devices/store/devices-store";

export interface WorkspaceStoreState {
  workspaceDevice: Device | null;
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  setWorkspaceDevice: (device: Device | null) => void;
}

const mockProjects: Project[] = [
  { appName: "Mako", bundleId: "123", projectId: "123" },
  { appName: "Mako2", bundleId: "1234", projectId: "1234" },
];

export const useWorkspaceStore = create<WorkspaceStoreState>((set) => ({
  workspaceDevice: null,
  currentProject: mockProjects[0],
  setCurrentProject: (project: Project | null) => {
    const devices = useDevicesStore.getState().devices;
    const filteredDevices = devices.filter(
      (d) => d.projectId === project?.projectId,
    );

    set({
      currentProject: project,
      workspaceDevice: filteredDevices[0] || null,
    });
  },
  setWorkspaceDevice: (device: Device | null) => {
    set({ workspaceDevice: device });
  },
}));
