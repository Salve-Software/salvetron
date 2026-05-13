import { create } from "zustand";
import type { Project } from "@mako/types";

interface ProjectsState {
  projects: Project[];
  addProject: (project: Project) => void;
  removeProject: (projectId: string) => void;
  getProjectById: (projectId: string) => Project | undefined;
}

const mockProjects: Project[] = [
  { appName: "Mako", bundleId: "123", projectId: "123" },
  { appName: "Mako2", bundleId: "1234", projectId: "1234" },
];
export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: mockProjects,

  addProject: (project) => {
    const existingProjects = get().projects;
    if (
      existingProjects.find(({ projectId }) => projectId === project.projectId)
    ) {
      return;
    }

    set((state) => ({
      projects: [...state.projects, project],
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
}));
