import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  NodeTypes,
  OnNodesChange,
  applyNodeChanges,
} from '@xyflow/react';
import { ComponentNode as ComponentNodeType } from '@mako/types/domain/component';
import { ComponentGraphProps, ComponentGraphNode } from './types';
import { useComponentGraph } from './hooks/use-component-graph';
import { ComponentNode } from './component-node';
import { ComponentInfoCard } from './component-info-card';

const nodeTypes: NodeTypes = {
  component: ComponentNode,
};

export function ComponentGraph({ components, searchQuery, onNodeSelect }: ComponentGraphProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<ComponentNodeType | null>(null);

  // Reset expanded nodes when search query changes
  useEffect(() => {
    setExpandedNodes(new Set());
    setSelectedNode(null);
  }, [searchQuery]);

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
    searchQuery,
  });
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: any) => {
      const component = node.data.component as ComponentNodeType;
      setSelectedNode(component);
      onNodeSelect?.(component);
      handleExpand(component.id);
    },
    [onNodeSelect, handleExpand]
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
    setInternalNodes((nds) => applyNodeChanges(changes, nds) as ComponentGraphNode[]);
  }, []);

  // Update internal nodes when graph nodes change
  useEffect(() => {
    setInternalNodes(nodes);
  }, [nodes]);

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
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#78716c" />
      </ReactFlow>

      <ComponentInfoCard component={selectedNode} onClose={handleCloseInfoCard} />
    </div>
  );
}
