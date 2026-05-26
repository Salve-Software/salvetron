import { useGetComponentsByDevice } from "../../../component-inspector/store/use-component-store";
import { ComponentGraph } from "../../../component-inspector/components";
import { useWorkspaceDevice } from "../../../workspace/store/use-workspace-store";

export function ComponentInspectorPreview() {
  const workspaceDevice = useWorkspaceDevice();
  const components = useGetComponentsByDevice(workspaceDevice?.deviceId ?? null);

  return (
    <div className="h-full">
      {components.length > 0
        ?
        <ComponentGraph components={components} searchQuery="" />
        : null
      }
      {components.length === 0
        ?
        <div className="flex items-center justify-center h-full text-olive-500 text-sm">
          No components tracked
        </div>
        : null
      }
    </div>
  );
}
