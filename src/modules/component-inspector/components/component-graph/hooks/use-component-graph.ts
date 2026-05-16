import { useMemo } from 'react';
import { ComponentNode } from '@mako/types/domain/component';
import { transformToGraph } from '../utils/transform-to-graph';
import { ComponentGraphNode, ComponentGraphEdge } from '../types';

interface UseComponentGraphOptions {
  components: ComponentNode[];
  expandedNodes: Set<string>;
  onExpand: (nodeId: string) => void;
  searchQuery?: string;
}

interface UseComponentGraphResult {
  nodes: ComponentGraphNode[];
  edges: ComponentGraphEdge[];
}

export function useComponentGraph({
  components,
  expandedNodes,
  onExpand,
  searchQuery,
}: UseComponentGraphOptions): UseComponentGraphResult {
  return useMemo(
    () => transformToGraph(components, { expandedNodes, onExpand, searchQuery }),
    [components, expandedNodes, searchQuery]
  );
}
