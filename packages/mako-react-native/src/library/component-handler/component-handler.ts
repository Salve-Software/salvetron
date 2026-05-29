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

  // Coalesce render events: many commits per frame collapse to one flush.
  private renderBuffer = new Map<string, ComponentRenderEvent>();
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  // Tree structure only changes on mount/unmount/re-parent. Gate snapshots on it.
  private treeDirty = true;

  constructor(config: ComponentHandlerConfig) {
    this.config = config;
  }

  getCallbacks(): ComponentRenderCallbacks {
    return {
      onComponentRender: this.handleComponentRender.bind(this),
      onComponentUnmount: this.handleComponentUnmount.bind(this),
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
      this.treeDirty = true;
    } else if (entry.parentId !== parentId) {
      // Re-parented: structure changed.
      entry.parentId = parentId;
      this.treeDirty = true;
    }

    // Update metrics
    entry.renderCount++;
    entry.lastRenderTime = renderDuration;
    entry.lastRenderTimestamp = Date.now();
    entry.totalRenderTime += renderDuration;

    if (propsChanged) entry.propsChangeCount++;
    if (stateChanged) entry.stateChangeCount++;
    if (contextChanged) entry.contextChangeCount++;

    // Buffer render event (latest cumulative state per component wins).
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

    this.renderBuffer.set(componentId, event);
    this.scheduleFlush();
  }

  private handleComponentUnmount(componentId: string): void {
    if (this.registry.delete(componentId)) {
      this.treeDirty = true;
    }
    this.renderBuffer.delete(componentId);
  }

  private scheduleFlush(): void {
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => this.flushRenders(), 0);
  }

  private flushRenders(): void {
    this.flushTimer = null;
    if (this.renderBuffer.size === 0) return;

    const events = Array.from(this.renderBuffer.values());
    this.renderBuffer.clear();

    for (const event of events) {
      this.config.onEvent(event);
    }
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
    // Skip when structure is unchanged since the last snapshot.
    if (!this.treeDirty) return;

    const tree = this.buildTree();

    const event: ComponentTreeEvent = {
      type: 'component_tree',
      tree,
      timestamp: Date.now(),
      deviceId: deviceHandler.getDeviceInfo().deviceId,
      projectId: projectHandler.getProjectId(),
    };

    this.config.onEvent(event);
    this.treeDirty = false;
  }

  /**
   * Build the component tree in a single O(n) pass.
   *
   * One loop builds a parent -> children adjacency map; depth is then assigned
   * via an iterative BFS from the roots. Replaces the previous O(n^2) approach
   * (per-node child scan + recursive depth).
   */
  private buildTree(): ComponentTreeNode[] {
    const childrenMap = new Map<string, string[]>();
    const roots: string[] = [];

    for (const entry of this.registry.values()) {
      if (entry.parentId && this.registry.has(entry.parentId)) {
        const siblings = childrenMap.get(entry.parentId);
        if (siblings) {
          siblings.push(entry.id);
        } else {
          childrenMap.set(entry.parentId, [entry.id]);
        }
      } else {
        roots.push(entry.id);
      }
    }

    const depthMap = new Map<string, number>();
    const queue: string[] = roots.map((id) => {
      depthMap.set(id, 0);
      return id;
    });

    for (let i = 0; i < queue.length; i++) {
      const id = queue[i];
      if (id === undefined) continue;
      const depth = depthMap.get(id) ?? 0;
      const children = childrenMap.get(id);
      if (!children) continue;
      for (const childId of children) {
        depthMap.set(childId, depth + 1);
        queue.push(childId);
      }
    }

    const tree: ComponentTreeNode[] = [];
    for (const entry of this.registry.values()) {
      tree.push({
        id: entry.id,
        name: entry.name,
        parentId: entry.parentId,
        children: childrenMap.get(entry.id) ?? [],
        depth: depthMap.get(entry.id) ?? 0,
      });
    }

    return tree;
  }

  clear(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    this.renderBuffer.clear();
    this.registry.clear();
    this.treeDirty = true;
    this.stopTreeSnapshots();
  }
}
