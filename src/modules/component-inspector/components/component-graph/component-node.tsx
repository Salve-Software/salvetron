import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { ComponentNodeData } from "./types";
import { getHeatColor } from "../component-tree/utils/get-heat-color";
import { Icon } from "../../../../shared/ui/icon";

interface ComponentNodeProps {
  data: ComponentNodeData;
  selected?: boolean;
}

export const ComponentNode = memo(({ data, selected }: ComponentNodeProps) => {
  const { component, onExpand, isExpanded } = data;
  const hasChildren = component.children.length > 0;
  const heatColor = getHeatColor(component.metrics.heatLevel);
  const bgHeatColor = heatColor.replace("text-", "bg-");

  return (
    <div
      className={`
        relative rounded-xl shadow-lg transition-all duration-200 cursor-pointer
        ${selected ? "ring-2 ring-olive-400 shadow-olive-400/20" : "shadow-black/30"}
        hover:shadow-xl hover:shadow-black/40
      `}
    >
      {/* Heat indicator bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${bgHeatColor}`}
      />

      <Handle
        type="target"
        position={Position.Left}
        className="w-3! h-3! bg-olive-600! border-2! border-olive-400!"
      />

      <div className="bg-olive-800 rounded-xl px-4 py-3 min-w-[180px] max-w-[240px]">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Icon
            name={hasChildren ? "component" : "box"}
            size={14}
            className={`flex-shrink-0 ${isExpanded ? "text-blue-300" : "text-olive-300"}`}
          />
          <span className="text-olive-100 font-medium text-sm truncate flex-1">
            {component.name}
          </span>
          {component.metrics.isMemoized ? (
            <span className="text-xs px-1.5 py-0.5 rounded bg-olive-800 text-olive-400">
              memo
            </span>
          ) : null}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-olive-400">
          <span>{component.metrics.renderCount} renders</span>
          {component.metrics.averageRenderTime > 0 ? (
            <span>{component.metrics.averageRenderTime.toFixed(1)}ms</span>
          ) : null}
        </div>
      </div>

      {hasChildren && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-olive-600 !border-2 !border-olive-400"
        />
      )}
    </div>
  );
});

ComponentNode.displayName = "ComponentNode";
