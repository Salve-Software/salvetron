/**
 * Component Handler Types
 */

import type { ComponentRenderEvent, ComponentTreeEvent } from '@mako/types';

export interface ComponentHandlerConfig {
  onEvent: (event: ComponentRenderEvent | ComponentTreeEvent) => void;
}

export interface ComponentRegistryEntry {
  id: string;
  name: string;
  renderCount: number;
  lastRenderTime: number;
  lastRenderTimestamp: number;
  totalRenderTime: number;
  parentId: string | null;
  propsChangeCount: number;
  stateChangeCount: number;
  contextChangeCount: number;
  isMemoized: boolean;
  memoType: string;
}
