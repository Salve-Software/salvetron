import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Device, Project } from "@mako/types";
import { useDevicesStore } from "../../devices/store/devices-store";
import { tauriStorage } from "../../../shared/lib/tauri-store";

export interface WorkspaceStoreState {
  workspaceDevice: Device | null;
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  setWorkspaceDevice: (device: Device | null) => void;
}

const mockProjects: Project[] = [
  { appName: "Mako", bundleId: "123", projectId: "123", color: "#3B82F6" },
  { appName: "Mako2", bundleId: "1234", projectId: "1234", color: "#8B5CF6" },
];

export const useWorkspaceStore = create<WorkspaceStoreState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: "workspace-storage",
      storage: createJSONStorage(() => tauriStorage),
      partialize: (state) => ({ currentProject: state.currentProject }),
    },
  ),
);
