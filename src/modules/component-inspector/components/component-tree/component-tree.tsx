import type { ComponentNode } from "@mako/types";
import { Table, TableColumn } from "../../../../shared/ui/table";
import {
  useSelectedComponent,
  useSetSelectedComponent,
} from "../../store/use-component-store";
import { getHeatColor, formatRenderCount, formatDuration } from "./utils";

export interface ComponentTreeProps {
  components: ComponentNode[];
  emptyState?: React.ReactNode;
}

const columns: TableColumn<ComponentNode>[] = [
  {
    key: "name",
    header: "Component",
    width: "1fr",
    render: (component) => {
      const indent = component.depth * 16;
      return (
        <div style={{ paddingLeft: `${indent}px` }} className="flex items-center gap-2">
          <span className="text-sm text-olive-200" title={component.name}>
            {component.name}
          </span>
        </div>
      );
    },
  },
  {
    key: "renderCount",
    header: "Renders",
    width: "100px",
    render: (component) => {
      const color = getHeatColor(component.metrics.heatLevel);
      return (
        <span className={`text-sm font-medium ${color}`}>
          {formatRenderCount(component.metrics.renderCount)}
        </span>
      );
    },
  },
  {
    key: "avgDuration",
    header: "Avg Time",
    width: "100px",
    render: (component) => (
      <span className="text-sm text-olive-400">
        {formatDuration(component.metrics.averageRenderTime)}
      </span>
    ),
  },
  {
    key: "lastDuration",
    header: "Last Time",
    width: "100px",
    render: (component) => (
      <span className="text-sm text-olive-400">
        {formatDuration(component.metrics.lastRenderTime)}
      </span>
    ),
  },
  {
    key: "memoType",
    header: "Memo",
    width: "120px",
    render: (component) =>
      component.metrics.isMemoized
        ?
        <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">
          {component.metrics.memoType}
        </span>
        : <span className="text-xs text-olive-600">none</span>,
  },
];

export function ComponentTree({ components, emptyState }: ComponentTreeProps) {
  const selectedComponent = useSelectedComponent();
  const setSelectedComponent = useSetSelectedComponent();

  return (
    <Table
      columns={columns}
      data={components}
      keyExtractor={(component) => component.id}
      onRowClick={setSelectedComponent}
      isSelected={(component) => selectedComponent?.id === component.id}
      emptyState={emptyState}
    />
  );
}
