import { useState, useCallback } from 'react';
import ReactFlow, {
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  NodeTypes,
  OnNodesChange,
  applyNodeChanges,
} from '@xyflow/react';
import { ComponentNode as ComponentNodeType } from '@mako/types/domain/component';
import { ComponentGraphProps } from './types';
import { useComponentGraph } from './hooks/use-component-graph';
import { ComponentNode } from './component-node';
import { ComponentInfoCard } from './component-info-card';

const nodeTypes: NodeTypes = {
  component: ComponentNode,
};

export function ComponentGraph({ components, onNodeSelect }: ComponentGraphProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<ComponentNodeType | null>(null);

  const handleExpand = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const { nodes, edges } = useComponentGraph({
    components,
    expandedNodes,
    onExpand: handleExpand,
  });

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: any) => {
      const component = node.data.component as ComponentNodeType;
      setSelectedNode(component);
      onNodeSelect?.(component);
    },
    [onNodeSelect]
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
    onNodeSelect?.(null);
  }, [onNodeSelect]);

  const handleCloseInfoCard = useCallback(() => {
    setSelectedNode(null);
    onNodeSelect?.(null);
  }, [onNodeSelect]);

  const [internalNodes, setInternalNodes] = useState(nodes);

  const onNodesChange: OnNodesChange = useCallback((changes) => {
    setInternalNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  // Update internal nodes when graph nodes change
  useState(() => {
    setInternalNodes(nodes);
  });

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={internalNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onNodesChange={onNodesChange}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
      >
        <Controls className="bg-olive-900 border-olive-700" />
        <MiniMap
          className="bg-olive-900 border-olive-700"
          nodeColor={(node) => {
            const component = (node.data as any).component as ComponentNodeType;
            switch (component.metrics.heatLevel) {
              case 'critical':
                return '#f87171';
              case 'hot':
                return '#fb923c';
              case 'warm':
                return '#fbbf24';
              case 'cold':
              default:
                return '#a3e635';
            }
          }}
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#44403c" />
      </ReactFlow>

      <ComponentInfoCard component={selectedNode} onClose={handleCloseInfoCard} />
    </div>
  );
}
