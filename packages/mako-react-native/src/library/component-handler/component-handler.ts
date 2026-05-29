/**
 * Component Handler
 * Manages component render tracking and event creation
 */

import type { ComponentRenderEvent, ComponentTreeEvent, ComponentTreeNode, MemoType } from '@salve-software/mako-types';
import type { ComponentHandlerConfig, ComponentRegistryEntry } from './types';
import type { ComponentRenderInfo, ComponentRenderCallbacks } from '../interceptors/react-devtools';
import { projectHandler } from '../project';
import { deviceHandler } from '../device';

export class ComponentHandler {
  private registry = new Map<string, ComponentRegistryEntry>();
  private config: ComponentHandlerConfig;
  private treeSnapshotInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: ComponentHandlerConfig) {
    this.config = config;
  }

  getCallbacks(): ComponentRenderCallbacks {
    return {
      onComponentRender: this.handleComponentRender.bind(this),
    };
  }

  private handleComponentRender(info: ComponentRenderInfo): void {
    const { componentId, componentName, renderDuration, parentId, propsChanged, stateChanged, contextChanged, isMemoized, memoType } = info;

    // Get or create registry entry
    let entry = this.registry.get(componentId);
    if (!entry) {
      entry = {
        id: componentId,
        name: componentName,
        renderCount: 0,
        lastRenderTime: 0,
        lastRenderTimestamp: 0,
        totalRenderTime: 0,
        parentId,
        propsChangeCount: 0,
        stateChangeCount: 0,
        contextChangeCount: 0,
        isMemoized,
        memoType,
      };
      this.registry.set(componentId, entry);
    }

    // Update metrics
    entry.renderCount++;
    entry.lastRenderTime = renderDuration;
    entry.lastRenderTimestamp = Date.now();
    entry.totalRenderTime += renderDuration;

    if (propsChanged) entry.propsChangeCount++;
    if (stateChanged) entry.stateChangeCount++;
    if (contextChanged) entry.contextChangeCount++;

    // Send render event
    const event: ComponentRenderEvent = {
      type: 'component_render',
      componentId,
      componentName,
      renderCount: entry.renderCount,
      renderDuration,
      timestamp: entry.lastRenderTimestamp,
      parentId,
      propsChanged,
      stateChanged,
      contextChanged,
      isMemoized,
      memoType: memoType as MemoType,
      deviceId: deviceHandler.getDeviceInfo().deviceId,
      projectId: projectHandler.getProjectId(),
    };

    this.config.onEvent(event);
  }

  startTreeSnapshots(intervalMs: number = 5000): void {
    if (this.treeSnapshotInterval) {
      console.warn('[Mako] Component tree snapshots already running');
      return;
    }

    this.treeSnapshotInterval = setInterval(() => {
      this.sendTreeSnapshot();
    }, intervalMs);

    // Send initial snapshot
    this.sendTreeSnapshot();
  }

  stopTreeSnapshots(): void {
    if (this.treeSnapshotInterval) {
      clearInterval(this.treeSnapshotInterval);
      this.treeSnapshotInterval = null;
    }
  }

  private sendTreeSnapshot(): void {
    const tree: ComponentTreeNode[] = [];
    const depthMap = new Map<string, number>();

    // Calculate depth for each component
    for (const entry of this.registry.values()) {
      const depth = this.calculateDepth(entry.id, depthMap);
      depthMap.set(entry.id, depth);
    }

    // Build tree nodes
    for (const entry of this.registry.values()) {
      const children = this.getChildrenIds(entry.id);
      const depth = depthMap.get(entry.id) ?? 0;

      tree.push({
        id: entry.id,
        name: entry.name,
        parentId: entry.parentId,
        children,
        depth,
      });
    }

    const event: ComponentTreeEvent = {
      type: 'component_tree',
      tree,
      timestamp: Date.now(),
      deviceId: deviceHandler.getDeviceInfo().deviceId,
      projectId: projectHandler.getProjectId(),
    };

    this.config.onEvent(event);
  }

  private calculateDepth(componentId: string, depthMap: Map<string, number>): number {
    const cached = depthMap.get(componentId);
    if (cached !== undefined) return cached;

    const entry = this.registry.get(componentId);
    if (!entry || !entry.parentId) return 0;

    const parentDepth = this.calculateDepth(entry.parentId, depthMap);
    return parentDepth + 1;
  }

  private getChildrenIds(parentId: string): string[] {
    const children: string[] = [];
    for (const entry of this.registry.values()) {
      if (entry.parentId === parentId) {
        children.push(entry.id);
      }
    }
    return children;
  }

  clear(): void {
    this.registry.clear();
    this.stopTreeSnapshots();
  }
}
