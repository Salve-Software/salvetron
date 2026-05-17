import { create } from "zustand";
import type {
  ComponentRenderEvent,
  ComponentTreeEvent,
  ComponentMetrics,
  ComponentNode,
  RenderHeatLevel,
} from "@mako/types";
import { calculateHeatLevel } from "@mako/types";

// Helper to generate unique key for metrics (device-scoped)
const getMetricKey = (deviceId: string, componentId: string): string =>
  `${deviceId}:${componentId}`;

export interface ComponentInspectorFilters {
  searchQuery: string;
  heatFilter: RenderHeatLevel | null;
  onlyMemoized: boolean;
  onlyUnmemoized: boolean;
}

export interface ComponentStoreState {
  metrics: Map<string, ComponentMetrics>;
  tree: ComponentNode[];
  selectedComponent: ComponentNode | null;
  filters: ComponentInspectorFilters;

  // Actions
  handleComponentRender: (event: ComponentRenderEvent) => void;
  handleComponentTree: (event: ComponentTreeEvent) => void;
  setSelectedComponent: (component: ComponentNode | null) => void;
  setSearchQuery: (query: string) => void;
  setHeatFilter: (heat: RenderHeatLevel | null) => void;
  setOnlyMemoized: (value: boolean) => void;
  setOnlyUnmemoized: (value: boolean) => void;
  clearMetrics: () => void;
}

export const useComponentStore = create<ComponentStoreState>((set) => ({
  metrics: new Map(),
  tree: [],
  selectedComponent: null,
  filters: {
    searchQuery: "",
    heatFilter: null,
    onlyMemoized: false,
    onlyUnmemoized: false,
  },

  handleComponentRender: (event: ComponentRenderEvent) =>
    set((state) => {
      const newMetrics = new Map(state.metrics);
      const deviceId = event.deviceId ?? '';
      const key = getMetricKey(deviceId, event.componentId);
      const existing = newMetrics.get(key);

      if (existing) {
        // Update existing metrics
        const updatedMetrics: ComponentMetrics = {
          ...existing,
          renderCount: event.renderCount,
          totalRenderTime: existing.totalRenderTime + event.renderDuration,
          averageRenderTime:
            (existing.totalRenderTime + event.renderDuration) / event.renderCount,
          lastRenderTime: event.renderDuration,
          lastRenderTimestamp: event.timestamp,
          propsChangeCount: event.propsChanged
            ? existing.propsChangeCount + 1
            : existing.propsChangeCount,
          stateChangeCount: event.stateChanged
            ? existing.stateChangeCount + 1
            : existing.stateChangeCount,
          contextChangeCount: event.contextChanged
            ? existing.contextChangeCount + 1
            : existing.contextChangeCount,
          heatLevel: calculateHeatLevel(
            event.renderCount,
            (existing.totalRenderTime + event.renderDuration) / event.renderCount
          ),
        };
        newMetrics.set(key, updatedMetrics);
      } else {
        // Create new metrics entry
        const avgDuration = event.renderDuration;
        const newEntry: ComponentMetrics = {
          componentId: event.componentId,
          componentName: event.componentName,
          renderCount: event.renderCount,
          totalRenderTime: event.renderDuration,
          averageRenderTime: avgDuration,
          lastRenderTime: event.renderDuration,
          lastRenderTimestamp: event.timestamp,
          propsChangeCount: event.propsChanged ? 1 : 0,
          stateChangeCount: event.stateChanged ? 1 : 0,
          contextChangeCount: event.contextChanged ? 1 : 0,
          isMemoized: event.isMemoized,
          memoType: event.memoType,
          heatLevel: calculateHeatLevel(event.renderCount, avgDuration),
        };
        newMetrics.set(key, newEntry);
      }

      return { metrics: newMetrics };
    }),

  handleComponentTree: (event: ComponentTreeEvent) =>
    set((state) => {
      const deviceId = event.deviceId ?? '';
      const projectId = event.projectId;

      // Merge tree with metrics, adding device context
      const tree: ComponentNode[] = event.tree.map((node) => {
        const key = getMetricKey(deviceId, node.id);
        const metrics = state.metrics.get(key);
        return {
          ...node,
          deviceId,
          projectId,
          metrics: metrics ?? {
            componentId: node.id,
            componentName: node.name,
            renderCount: 0,
            totalRenderTime: 0,
            averageRenderTime: 0,
            lastRenderTime: 0,
            lastRenderTimestamp: 0,
            propsChangeCount: 0,
            stateChangeCount: 0,
            contextChangeCount: 0,
            isMemoized: false,
            memoType: "none",
            heatLevel: "cold" as RenderHeatLevel,
          },
        };
      });

      return { tree };
    }),

  setSelectedComponent: (component: ComponentNode | null) =>
    set({ selectedComponent: component }),

  setSearchQuery: (query: string) =>
    set((state) => ({ filters: { ...state.filters, searchQuery: query } })),

  setHeatFilter: (heat: RenderHeatLevel | null) =>
    set((state) => ({ filters: { ...state.filters, heatFilter: heat } })),

  setOnlyMemoized: (value: boolean) =>
    set((state) => ({
      filters: {
        ...state.filters,
        onlyMemoized: value,
        onlyUnmemoized: value ? false : state.filters.onlyUnmemoized,
      },
    })),

  setOnlyUnmemoized: (value: boolean) =>
    set((state) => ({
      filters: {
        ...state.filters,
        onlyUnmemoized: value,
        onlyMemoized: value ? false : state.filters.onlyMemoized,
      },
    })),

  clearMetrics: () => set({ metrics: new Map(), tree: [], selectedComponent: null }),
}));

/**
 * Helper to get metrics array from Map (sorted by render count descending)
 */
export function getMetricsArray(
  metrics: Map<string, ComponentMetrics>
): ComponentMetrics[] {
  return Array.from(metrics.values()).sort(
    (a, b) => b.renderCount - a.renderCount
  );
}

/**
 * Filter components by device and current filters
 */
export function filterComponents(
  components: ComponentNode[],
  deviceId: string | null,
  filters: ComponentInspectorFilters
): ComponentNode[] {
  if (!deviceId) return [];

  return components.filter((component) => {
    // Device filter (primary)
    if (component.deviceId !== deviceId) return false;

    // Heat filter
    if (filters.heatFilter && component.metrics.heatLevel !== filters.heatFilter) {
      return false;
    }

    // Memoization filters
    if (filters.onlyMemoized && !component.metrics.isMemoized) {
      return false;
    }

    if (filters.onlyUnmemoized && component.metrics.isMemoized) {
      return false;
    }

    // Search filter (component name)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesName = component.name.toLowerCase().includes(query);
      if (!matchesName) return false;
    }

    return true;
  });
}

/**
 * Get top N components by render count
 */
export function getTopComponentsByRenderCount(
  metrics: ComponentMetrics[],
  limit: number = 10
): ComponentMetrics[] {
  return [...metrics]
    .sort((a, b) => b.renderCount - a.renderCount)
    .slice(0, limit);
}

/**
 * Get components by heat level
 */
export function getComponentsByHeatLevel(
  metrics: ComponentMetrics[],
  heatLevel: RenderHeatLevel
): ComponentMetrics[] {
  return metrics.filter((m) => m.heatLevel === heatLevel);
}

/**
 * Detect unnecessary renders (unmemoized components with high render count)
 */
export function detectUnnecessaryRenders(
  metrics: ComponentMetrics[],
  threshold: number = 20
): ComponentMetrics[] {
  return metrics.filter(
    (m) => !m.isMemoized && m.renderCount >= threshold
  );
}
