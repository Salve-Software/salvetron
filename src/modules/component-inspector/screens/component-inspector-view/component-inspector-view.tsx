import { WorkspaceContent } from "../../../workspace/components/workspace-content";
import { WorkspaceDetailContainer } from "../../../workspace/components/workspace-detail-container";
import { useWorkspaceDevice } from "../../../workspace/store/use-workspace-store";
import { Icon } from "../../../../shared/ui/icon";
import {
  ComponentTree,
  ComponentInspectorFilters,
  ComponentInspectorEmptyState,
  ComponentMetricsPanel,
  SmartDetections,
} from "../../components";
import {
  useFilteredComponents,
  useSelectedComponent,
  useSetSelectedComponent,
  useUnnecessaryRenders,
  useHotComponents,
} from "../../store/use-component-store";

export function ComponentInspectorView() {
  const workspaceDevice = useWorkspaceDevice();
  const components = useFilteredComponents(workspaceDevice?.deviceId ?? null);
  const selectedComponent = useSelectedComponent();
  const setSelectedComponent = useSetSelectedComponent();
  const unnecessaryRenders = useUnnecessaryRenders();
  const hotComponents = useHotComponents();

  return (
    <div className="flex flex-1 flex-col w-full h-full pt-4 relative">
      <div className="flex mb-3 gap-2 items-center justify-start w-full px-4 py-2 pb-4 border-b border-b-olive-700">
        <Icon name="code" size={30} className="text-olive-300" />
        <div className="flex flex-col">
          <h2 className="text-base font-semibold text-olive-100">Component Inspector</h2>
          <p className="text-xs text-olive-500">React rendering analysis</p>
        </div>
      </div>

      <ComponentInspectorFilters />

      <WorkspaceContent>
        <div className="flex flex-1 gap-4 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <ComponentTree
              components={components}
              emptyState={<ComponentInspectorEmptyState />}
            />
          </div>
          <div className="w-80 border-l border-olive-800 overflow-auto">
            <SmartDetections
              unnecessaryRenders={unnecessaryRenders}
              hotComponents={hotComponents}
            />
          </div>
        </div>
      </WorkspaceContent>

      <WorkspaceDetailContainer
        isOpen={selectedComponent !== null}
        onClose={() => setSelectedComponent(null)}
        title="Component Metrics"
      >
        <ComponentMetricsPanel component={selectedComponent} />
      </WorkspaceDetailContainer>
    </div>
  );
}
