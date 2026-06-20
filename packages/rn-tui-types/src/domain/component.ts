/**
 * Component Domain Types
 * Data models used in RN TUI CLI for component inspection
 */

export type RenderHeatLevel = 'cold' | 'warm' | 'hot' | 'critical';

export interface ComponentMetrics {
  componentId: string;
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  lastRenderTimestamp: number;
  propsChangeCount: number;
  stateChangeCount: number;
  contextChangeCount: number;
  isMemoized: boolean;
  memoType: string;
  heatLevel: RenderHeatLevel;
}

export interface ComponentNode {
  id: string;
  name: string;
  parentId: string | null;
  children: string[];
  depth: number;
  metrics: ComponentMetrics;
  deviceId: string;
  projectId?: string;
}

/**
 * Calculate heat level based on render count and average duration
 */
export function calculateHeatLevel(
  renderCount: number,
  avgDuration: number
): RenderHeatLevel {
  // Weighted score: render count contributes more to heat than duration
  const score = renderCount * 2 + avgDuration * 0.1;

  if (score > 100) return 'critical';
  if (score > 50) return 'hot';
  if (score > 20) return 'warm';
  return 'cold';
}
