import { useProjectsStore } from "./projects-store";

export function useProjects() {
  return useProjectsStore((state) => state.projects);
}

export function useAddProject() {
  return useProjectsStore((state) => state.addProject);
}

export function useRemoveProject() {
  return useProjectsStore((state) => state.removeProject);
}

export function useGetProjectById() {
  return useProjectsStore((state) => state.getProjectById);
}
