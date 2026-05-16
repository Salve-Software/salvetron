import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { ComponentNodeData } from './types';
import { getHeatColor } from '../component-tree/utils/get-heat-color';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface ComponentNodeProps {
  data: ComponentNodeData;
  selected?: boolean;
}

export const ComponentNode = memo(({ data, selected }: ComponentNodeProps) => {
  const { component, onExpand, isExpanded } = data;
  const hasChildren = component.children.length > 0;
  const heatColor = getHeatColor(component.metrics.heatLevel);

  return (
    <div
      className={`
        px-3 py-2 rounded-lg border-2 bg-olive-950
        ${selected ? 'border-olive-400' : 'border-olive-800'}
        hover:border-olive-600 transition-colors
        min-w-[200px]
      `}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-olive-500" />

      <div className="flex items-center gap-2">
        {hasChildren
          ?
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpand(component.id);
            }}
            className="flex-shrink-0 text-olive-400 hover:text-olive-300 transition-colors"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          :
          <div className="w-4" />
        }

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-olive-100 font-medium text-sm truncate">
              {component.name}
            </span>
            {component.metrics.isMemoized
              ?
              <span className="text-olive-500 text-xs">
                memo
              </span>
              : null
            }
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <div className={`w-2 h-2 rounded-full ${heatColor.replace('text-', 'bg-')}`} />
            <span className="text-olive-400 text-xs">
              {component.metrics.renderCount} renders
            </span>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-olive-500" />
    </div>
  );
});

ComponentNode.displayName = 'ComponentNode';
