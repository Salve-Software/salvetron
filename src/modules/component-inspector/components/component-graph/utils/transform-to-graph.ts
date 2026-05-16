import { ComponentNode } from '@mako/types/domain/component';
import { ComponentGraphNode, ComponentGraphEdge, ComponentNodeData } from '../types';

const NODE_WIDTH = 250;
const NODE_HEIGHT = 80;

interface TransformOptions {
  expandedNodes: Set<string>;
  onExpand: (nodeId: string) => void;
}

/**
 * Transform ComponentNode array to react-flow nodes and edges
 * Hierarchical layout: x = depth * 250, y = index * 80
 * Only shows children of expanded nodes
 * O(n) complexity - simple and efficient
 */
export function transformToGraph(
  components: ComponentNode[],
  options: TransformOptions
): { nodes: ComponentGraphNode[]; edges: ComponentGraphEdge[] } {
  const { expandedNodes, onExpand } = options;
  const nodes: ComponentGraphNode[] = [];
  const edges: ComponentGraphEdge[] = [];
  const componentMap = new Map(components.map(c => [c.id, c]));

  // Track which nodes should be visible
  const visibleNodes = new Set<string>();

  // Find root nodes (nodes with no parent)
  const rootNodes = components.filter(c => !c.parentId);
  rootNodes.forEach(node => visibleNodes.add(node.id));

  // Add children of expanded nodes to visible set
  components.forEach(node => {
    if (expandedNodes.has(node.id)) {
      node.children.forEach(childId => visibleNodes.add(childId));
    }
  });

  // Count visible nodes at each depth for positioning
  const depthCounts = new Map<number, number>();

  // Create nodes for visible components
  visibleNodes.forEach(nodeId => {
    const component = componentMap.get(nodeId);
    if (!component) return;

    const depth = component.depth;
    const indexAtDepth = depthCounts.get(depth) || 0;
    depthCounts.set(depth, indexAtDepth + 1);

    const nodeData: ComponentNodeData = {
      component,
      onExpand,
      isExpanded: expandedNodes.has(nodeId),
    };

    nodes.push({
      id: nodeId,
      type: 'component',
      position: {
        x: depth * NODE_WIDTH,
        y: indexAtDepth * NODE_HEIGHT,
      },
      data: nodeData,
    });
  });

  // Create edges between visible nodes
  visibleNodes.forEach(nodeId => {
    const component = componentMap.get(nodeId);
    if (!component || !component.parentId) return;

    // Only create edge if parent is also visible
    if (visibleNodes.has(component.parentId)) {
      edges.push({
        id: `${component.parentId}-${nodeId}`,
        source: component.parentId,
        target: nodeId,
        type: 'smoothstep',
      });
    }
  });

  return { nodes, edges };
}
