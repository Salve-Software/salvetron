import { WorkspaceContent } from "../../../workspace/components/workspace-content";
import { Icon } from "../../../../shared/ui/icon";
import {
  ComponentGraph,
  ComponentInspectorFilters,
  ComponentInspectorEmptyState,
} from "../../components";
import {
  useComponentTree,
  useComponentInspectorFilters,
} from "../../store/use-component-store";

export function ComponentInspectorView() {
  const components = useComponentTree();
  const filters = useComponentInspectorFilters();

  return (
    <div className="flex flex-1 flex-col w-full h-full pt-4 relative">
      <div className="flex mb-3 gap-2 items-center justify-start w-full px-4 py-2 pb-4 border-b border-b-olive-700">
        <Icon name="code" size={30} className="text-olive-300" />
        <div className="flex flex-col">
          <h2 className="text-base font-semibold text-olive-100">Component Inspector</h2>

        </div>
      </div>

      <ComponentInspectorFilters />

      <div className="flex flex-1 shrink-0 flex-col min-h-0 max-h-[85vh]">
        <WorkspaceContent>
          {components.length > 0
            ?
            <div className="flex-1 h-full">
              <ComponentGraph
                components={components}
                searchQuery={filters.searchQuery}
              />
            </div>
            :
            <ComponentInspectorEmptyState />
          }
        </WorkspaceContent>
      </div>
    </div>
  );
}
