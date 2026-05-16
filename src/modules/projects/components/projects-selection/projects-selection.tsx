import { useMemo } from "react";
import { DropdownMenu } from "../../../../shared/ui/dropdown-menu";
import { DropdownOption } from "../../../../shared/ui/dropdown-menu/types";
import {
  useCurrentProject,
  useSetCurrentProject,
} from "../../../workspace/store";
import { useProjects } from "../../store";
import { getFirstProjectLetter } from "../../library/get-first-project-letter";

export function ProjectsSelection() {
  const projects = useProjects();
  const currentProject = useCurrentProject();
  const setCurrentProject = useSetCurrentProject();

  const projectsMap = useMemo(() => {
    const map = new Map();
    projects?.forEach((project) => {
      map.set(project.projectId, project);
    });
    return map;
  }, [projects]);

  const formatedProjects: DropdownOption[] =
    projects?.map((project) => ({
      label: project.appName,
      value: project.projectId,
    })) ?? [];

  function handleSet(option: DropdownOption) {
    const project = projectsMap.get(option.value);
    if (project) {
      setCurrentProject(project);
    }
  }

  function renderItem(option: DropdownOption) {
    const project = projectsMap.get(option.value);

    return (
      <button
        key={option.value}
        type="button"
        className="flex gap-2 items-center truncate px-3 py-2 text-left transition-colors hover:opacity-85"
        onClick={() => handleSet(option)}
      >
        <div
          className="w-9 h-9 shadow rounded-lg flex items-center justify-center"
          style={{ backgroundColor: project?.color }}
        >
          <p className="font-bold text-md">
            {getFirstProjectLetter(option.label)}
          </p>
        </div>
        <span className="flex-1 truncate  text-olive-200">{option.label}</span>
      </button>
    );
  }

  return (
    <div
      data-tauri-drag-region="true"
      className="flex w-auto gap-1 items-center cursor-pointer rounded-xl transition-all duration-150 hover:opacity-90"
    >
      <DropdownMenu
        variant="outline"
        renderItem={renderItem}
        leftElement={
          <div
            className="w-9 h-9 shadow rounded-lg flex items-center justify-center"
            style={{ backgroundColor: currentProject?.color }}
          >
            <p className="font-bold text-md">
              {getFirstProjectLetter(currentProject?.appName ?? "")}
            </p>
          </div>
        }
        label={currentProject?.appName || ""}
        options={formatedProjects}
      />
    </div>
  );
}
