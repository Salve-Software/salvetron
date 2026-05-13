/**
 * Component Event Types
 * Used by SDK to send component render tracking data to Mako desktop app
 */

export type MemoType = 'none' | 'React.memo' | 'useMemo' | 'useCallback' | 'PureComponent';

export interface ComponentRenderEvent {
  type: 'component_render';
  componentId: string;
  componentName: string;
  renderCount: number;
  renderDuration: number; // ms
  timestamp: number;
  parentId: string | null;
  propsChanged: boolean;
  stateChanged: boolean;
  contextChanged: boolean;
  isMemoized: boolean;
  memoType: MemoType;
  deviceId?: string;
  projectId?: string;
}

export interface ComponentTreeNode {
  id: string;
  name: string;
  parentId: string | null;
  children: string[];
  depth: number;
}

export interface ComponentTreeEvent {
  type: 'component_tree';
  tree: ComponentTreeNode[];
  timestamp: number;
  deviceId?: string;
  projectId?: string;
}
