import { Node, Edge } from '@xyflow/react';
import { ComponentNode } from '@mako/types/domain/component';

export interface ComponentNodeData {
  component: ComponentNode;
  onExpand: (nodeId: string) => void;
  isExpanded: boolean;
}

export type ComponentGraphNode = Node<ComponentNodeData>;
export type ComponentGraphEdge = Edge;

export interface ComponentGraphProps {
  components: ComponentNode[];
  onNodeSelect?: (node: ComponentNode | null) => void;
}
