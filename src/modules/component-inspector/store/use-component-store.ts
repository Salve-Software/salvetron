import type {
  ComponentRenderEvent,
  ComponentTreeEvent,
  ComponentMetrics,
  ComponentNode,
  RenderHeatLevel,
} from "@mako/types";
import {
  useComponentStore,
  getMetricsArray,
  filterComponents,
  getTopComponentsByRenderCount,
  getComponentsByHeatLevel,
  detectUnnecessaryRenders,
  type ComponentInspectorFilters,
} from "./component-store";

// State selectors
export function useComponentMetrics(): ComponentMetrics[] {
  const metrics = useComponentStore((state) => state.metrics);
  return getMetricsArray(metrics);
}

export function useComponentTree(): ComponentNode[] {
  return useComponentStore((state) => state.tree);
}

export function useSelectedComponent(): ComponentNode | null {
  return useComponentStore((state) => state.selectedComponent);
}

export function useComponentInspectorFilters(): ComponentInspectorFilters {
  return useComponentStore((state) => state.filters);
}

// Action selectors
export function useHandleComponentRender(): (
  event: ComponentRenderEvent
) => void {
  return useComponentStore((state) => state.handleComponentRender);
}

export function useHandleComponentTree(): (event: ComponentTreeEvent) => void {
  return useComponentStore((state) => state.handleComponentTree);
}

export function useSetSelectedComponent(): (
  component: ComponentNode | null
) => void {
  return useComponentStore((state) => state.setSelectedComponent);
}

export function useSetComponentSearchQuery(): (query: string) => void {
  return useComponentStore((state) => state.setSearchQuery);
}

export function useSetComponentHeatFilter(): (
  heat: RenderHeatLevel | null
) => void {
  return useComponentStore((state) => state.setHeatFilter);
}

export function useSetOnlyMemoized(): (value: boolean) => void {
  return useComponentStore((state) => state.setOnlyMemoized);
}

export function useSetOnlyUnmemoized(): (value: boolean) => void {
  return useComponentStore((state) => state.setOnlyUnmemoized);
}

export function useClearComponentMetrics(): () => void {
  return useComponentStore((state) => state.clearMetrics);
}

// Derived selectors
export function useFilteredComponents(
  deviceId: string | null
): ComponentNode[] {
  const tree = useComponentStore((state) => state.tree);
  const filters = useComponentStore((state) => state.filters);

  return filterComponents(tree, deviceId, filters);
}

export function useTopComponentsByRenderCount(
  limit: number = 10
): ComponentMetrics[] {
  const metrics = useComponentStore((state) => state.metrics);
  return getTopComponentsByRenderCount(getMetricsArray(metrics), limit);
}

export function useComponentsByHeatLevel(
  heatLevel: RenderHeatLevel
): ComponentMetrics[] {
  const metrics = useComponentStore((state) => state.metrics);
  return getComponentsByHeatLevel(getMetricsArray(metrics), heatLevel);
}

export function useUnnecessaryRenders(
  threshold: number = 20
): ComponentMetrics[] {
  const metrics = useComponentStore((state) => state.metrics);
  return detectUnnecessaryRenders(getMetricsArray(metrics), threshold);
}

export function useHotComponents(): ComponentMetrics[] {
  const metrics = useComponentStore((state) => state.metrics);
  const metricsArray = getMetricsArray(metrics);
  return metricsArray.filter(
    (m) => m.heatLevel === "hot" || m.heatLevel === "critical"
  );
}

// Re-export types for convenience
export type { ComponentInspectorFilters };
