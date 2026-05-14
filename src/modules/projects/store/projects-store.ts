import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Project } from "@mako/types";
import { tauriStorage } from "../../../shared/lib/tauri-store";
import { getRandomProjectColor } from "../library/project-colors";

interface ProjectsState {
  projects: Project[];
  addProject: (project: Project) => void;
  removeProject: (projectId: string) => void;
  getProjectById: (projectId: string) => Project | undefined;
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set, get) => ({
      projects: [],

      addProject: (project) => {
        const existingProjects = get().projects;
        if (
          existingProjects.find(({ projectId }) => projectId === project.projectId)
        ) {
          return;
        }

        const projectWithColor = {
          ...project,
          color: project.color || getRandomProjectColor(),
        };

        set((state) => ({
          projects: [...state.projects, projectWithColor],
        }));
      },

      removeProject: (projectId: string) => {
        set((state) => ({
          projects: state.projects.filter(
            (project) => project.projectId !== projectId,
          ),
        }));
      },

      getProjectById: (projectId: string) => {
        return get().projects.find((project) => project.projectId === projectId);
      },
    }),
    {
      name: "projects-storage",
      storage: createJSONStorage(() => tauriStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const migratedProjects = state.projects.map((project) => ({
            ...project,
            color: project.color || getRandomProjectColor(),
          }));
          state.projects = migratedProjects;
        }
      },
    },
  ),
);
