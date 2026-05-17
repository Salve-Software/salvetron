import { ComponentNode } from "@mako/types/domain/component";
import {
  ComponentGraphNode,
  ComponentGraphEdge,
  ComponentNodeData,
} from "../types";

const NODE_WIDTH = 280;
const NODE_HEIGHT = 100;
const HORIZONTAL_GAP = 80;
const VERTICAL_GAP = 20;

interface TransformOptions {
  expandedNodes: Set<string>;
  onExpand: (nodeId: string) => void;
  searchQuery?: string;
}

/**
 * Transform ComponentNode array to react-flow nodes and edges
 *
 * Tree layout algorithm:
 * - Roots and orphans (nodes with missing parents) appear on the left
 * - When searchQuery is active, matching components become "virtual roots"
 * - Children positioned to the right of their parent
 * - Siblings stacked vertically
 * - Only children of expanded nodes are visible
 *
 * O(n) complexity
 */
export function transformToGraph(
  components: ComponentNode[],
  options: TransformOptions,
): { nodes: ComponentGraphNode[]; edges: ComponentGraphEdge[] } {
  const { expandedNodes, onExpand, searchQuery } = options;
  const nodes: ComponentGraphNode[] = [];
  const edges: ComponentGraphEdge[] = [];

  if (components.length === 0) {
    return { nodes, edges };
  }

  const componentMap = new Map(components.map((c) => [c.id, c]));

  // Track visited nodes to prevent infinite recursion on cycles
  const visited = new Set<string>();

  // Cache for memoizing subtree heights - prevents O(n²) recalculation
  const heightCache = new Map<string, number>();

  // Build children lookup from parentId relationships (more reliable than children array
  // which may be stale if tree updates arrive out of order)
  const childrenMap = new Map<string, string[]>();
  components.forEach((c) => {
    if (c.parentId && componentMap.has(c.parentId)) {
      const siblings = childrenMap.get(c.parentId) || [];
      siblings.push(c.id);
      childrenMap.set(c.parentId, siblings);
    }
  });

  // Find root nodes based on search query or natural roots
  let rootNodes: ComponentNode[];

  if (searchQuery && searchQuery.trim()) {
    // When searching, matching components become virtual roots
    const query = searchQuery.toLowerCase().trim();
    rootNodes = components.filter((c) => c.name.toLowerCase().includes(query));
  } else {
    // No search: natural roots (no parent or orphans)
    rootNodes = components.filter(
      (c) => !c.parentId || !componentMap.has(c.parentId),
    );
  }

  // Calculate subtree height recursively (memoized)
  function getSubtreeHeight(nodeId: string, depth: number): number {
    const cacheKey = `${nodeId}-${depth}`;
    const cached = heightCache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    const component = componentMap.get(nodeId);
    if (!component) {
      heightCache.set(cacheKey, NODE_HEIGHT);
      return NODE_HEIGHT;
    }

    const isExpanded = expandedNodes.has(nodeId);
    const children = childrenMap.get(nodeId) || [];

    if (!isExpanded || children.length === 0) {
      heightCache.set(cacheKey, NODE_HEIGHT);
      return NODE_HEIGHT;
    }

    let totalHeight = 0;
    children.forEach((childId, index) => {
      totalHeight += getSubtreeHeight(childId, depth + 1);
      if (index < children.length - 1) {
        totalHeight += VERTICAL_GAP;
      }
    });

    const result = Math.max(NODE_HEIGHT, totalHeight);
    heightCache.set(cacheKey, result);
    return result;
  }

  // Position nodes recursively
  function positionNode(
    nodeId: string,
    x: number,
    y: number,
    depth: number,
  ): void {
    // Prevent infinite recursion on cycles or duplicates
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const component = componentMap.get(nodeId);
    if (!component) return;

    const isExpanded = expandedNodes.has(nodeId);
    const children = childrenMap.get(nodeId) || [];
    const hasChildren = children.length > 0;

    // Create node
    const nodeData: ComponentNodeData = {
      component,
      onExpand,
      isExpanded,
    };

    nodes.push({
      id: nodeId,
      type: "component",
      position: { x, y },
      data: nodeData,
    });

    // Position children if expanded
    if (isExpanded && hasChildren) {
      const childX = x + NODE_WIDTH + HORIZONTAL_GAP;
      let childY = y;

      children.forEach((childId) => {
        // Create edge
        edges.push({
          id: `${nodeId}-${childId}`,
          source: nodeId,
          target: childId,
          type: "smoothstep",
          animated: false,
        });

        // Position child
        positionNode(childId, childX, childY, depth + 1);

        // Move Y for next sibling
        const childHeight = getSubtreeHeight(childId, depth + 1);
        childY += childHeight + VERTICAL_GAP;
      });
    }
  }

  // Position all root nodes
  let currentY = 0;
  rootNodes.forEach((root) => {
    positionNode(root.id, 0, currentY, 0);
    const rootHeight = getSubtreeHeight(root.id, 0);
    currentY += rootHeight + VERTICAL_GAP * 2;
  });

  return { nodes, edges };
}
