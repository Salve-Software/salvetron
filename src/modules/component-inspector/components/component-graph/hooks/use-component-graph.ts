import { useMemo } from 'react';
import { ComponentNode } from '@mako/types/domain/component';
import { transformToGraph } from '../utils/transform-to-graph';
import { ComponentGraphNode, ComponentGraphEdge } from '../types';

interface UseComponentGraphOptions {
  components: ComponentNode[];
  expandedNodes: Set<string>;
  onExpand: (nodeId: string) => void;
}

interface UseComponentGraphResult {
  nodes: ComponentGraphNode[];
  edges: ComponentGraphEdge[];
}

/**
 * Hook that transforms components to react-flow nodes/edges
 * Memoized for performance
 */
export function useComponentGraph({
  components,
  expandedNodes,
  onExpand,
}: UseComponentGraphOptions): UseComponentGraphResult {
  return useMemo(
    () => transformToGraph(components, { expandedNodes, onExpand }),
    [components, expandedNodes, onExpand]
  );
}
