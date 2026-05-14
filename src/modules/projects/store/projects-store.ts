import { create } from "zustand";
import type { Project } from "@mako/types";

interface ProjectsState {
  projects: Project[];
  addProject: (project: Project) => void;
  removeProject: (projectId: string) => void;
  getProjectById: (projectId: string) => Project | undefined;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],

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
