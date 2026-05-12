import { useCallback, useMemo } from "react";
import { DropdownMenu } from "../../../../shared/ui/dropdown-menu";
import { DropdownOption } from "../../../../shared/ui/dropdown-menu/types";
import {
  useCurrentProject,
  useSetCurrentProject,
  useWorkspaceProjects,
} from "../../store";

export function WorkspaceProjectSelection() {
  const wokspaceProjects = useWorkspaceProjects();
  const currentProject = useCurrentProject();
  const setCurrentProject = useSetCurrentProject();

  const formatedWorkspaceProjects = useMemo((): DropdownOption[] => {
    if (!wokspaceProjects) return [];
    return wokspaceProjects?.map((project) => ({
      label: project.appName,

      value: project.projectId,
    }));
  }, [wokspaceProjects]);

  function handleSet(option: DropdownOption) {
    const project = wokspaceProjects?.find((p) => p.projectId === option.value);
    if (project) {
      setCurrentProject(project);
    }
  }

  const renderItem = useCallback((option: DropdownOption) => {
    return (
      <button
        key={option.value}
        type="button"
        className="flex gap-2 items-center truncate px-3 py-2 text-left transition-colors hover:opacity-85"
        onClick={() => handleSet(option)}
      >
        <div className="w-9 h-9 shadow rounded-lg bg-blue-900 flex items-center justify-center">
          <p className="font-bold text-md">V</p>
        </div>
        <span className="flex-1 truncate ">{option.label}</span>
      </button>
    );
  }, []);

  return (
    <div
      data-tauri-drag-region="true"
      className="flex w-auto gap-1 items-center cursor-pointer rounded-xl transition-all duration-150 hover:opacity-90"
    >
      <DropdownMenu
        containerWidth
        variant="outline"
        renderItem={renderItem}
        leftElement={
          <div className="w-9 h-9 shadow rounded-lg bg-blue-900 flex items-center justify-center">
            <p className="font-bold text-md">V</p>
          </div>
        }
        label={currentProject?.appName || ""}
        options={formatedWorkspaceProjects}
      />
    </div>
  );
}
