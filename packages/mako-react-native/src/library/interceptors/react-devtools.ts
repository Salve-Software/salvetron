/**
 * React DevTools Hook Interceptor
 * Captures component render events by hooking into React's DevTools global hook
 */

// Fiber tags for composite components (those that execute render functions)
const COMPONENT_TAGS = new Set([
  0,  // FunctionComponent
  1,  // ClassComponent
  9,  // ContextConsumer
  11, // ForwardRef
  14, // MemoComponent
  15, // SimpleMemoComponent
]);

const MEMO_TAGS = new Set([14, 15]); // MemoComponent, SimpleMemoComponent

interface Fiber {
  tag: number;
  type: any;
  elementType: any;
  stateNode: any;
  return: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;
  alternate: Fiber | null;
  memoizedProps: any;
  memoizedState: any;
  updateQueue: any;
  dependencies: any;
  actualDuration?: number;
  actualStartTime?: number;
  ref?: any;
}

interface DevToolsHook {
  supportsFiber: boolean;
  inject: (renderer: any) => number;
  onCommitFiberRoot?: (rendererID: number, root: any, priorityLevel?: any) => void;
  onCommitFiberUnmount?: (rendererID: number, fiber: Fiber) => void;
}

export interface ComponentRenderInfo {
  componentId: string;
  componentName: string;
  renderDuration: number;
  parentId: string | null;
  propsChanged: boolean;
  stateChanged: boolean;
  contextChanged: boolean;
  isMemoized: boolean;
  memoType: 'none' | 'React.memo' | 'useMemo' | 'useCallback' | 'PureComponent';
}

export interface ComponentRenderCallbacks {
  onComponentRender: (info: ComponentRenderInfo) => void;
}

export class ReactDevToolsInterceptor {
  private static instance: ReactDevToolsInterceptor | null = null;

  private enabled = false;
  private callbacks: ComponentRenderCallbacks | null = null;
  private hook: DevToolsHook | null = null;
  private originalOnCommitFiberRoot: DevToolsHook['onCommitFiberRoot'] | null = null;

  // Fiber tracking
  private fiberIdCounter = 0;
  private fiberIdMap = new WeakMap<Fiber, string>();
  private seenFiberIds = new Set<string>();
  private currentCommitFibers = new WeakSet<Fiber>();

  public static getInstance(): ReactDevToolsInterceptor {
    if (!ReactDevToolsInterceptor.instance) {
      ReactDevToolsInterceptor.instance = new ReactDevToolsInterceptor();
    }
    return ReactDevToolsInterceptor.instance;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public enable(callbacks: ComponentRenderCallbacks): boolean {
    if (this.enabled) {
      console.warn('[Mako] Component inspector already enabled');
      return false;
    }

    const hook = (global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ as DevToolsHook | undefined;
    if (!hook?.supportsFiber) {
      console.warn('[Mako] React DevTools hook not found or does not support Fiber');
      return false;
    }

    this.hook = hook;
    this.callbacks = callbacks;
    this.originalOnCommitFiberRoot = hook.onCommitFiberRoot;

    hook.onCommitFiberRoot = (rendererID, root, priorityLevel) => {
      this.originalOnCommitFiberRoot?.(rendererID, root, priorityLevel);

      if (this.enabled && root?.current) {
        this.currentCommitFibers = new WeakSet();
        this.traverseFiber(root.current);
      }
    };

    this.enabled = true;
    console.log('[Mako] Component inspector enabled (React DevTools hook)');
    return true;
  }

  public disable(): void {
    if (!this.enabled || !this.hook) return;

    if (this.originalOnCommitFiberRoot) {
      this.hook.onCommitFiberRoot = this.originalOnCommitFiberRoot;
    }

    this.callbacks = null;
    this.enabled = false;
    this.fiberIdMap = new WeakMap();
    this.seenFiberIds = new Set();
    console.log('[Mako] Component inspector disabled');
  }

  // --- Fiber Traversal ---

  private traverseFiber(fiber: Fiber | null): void {
    if (!fiber || !this.callbacks) return;

    if (this.isComponentFiber(fiber) && this.didFiberRender(fiber)) {
      const info = this.extractComponentInfo(fiber);
      if (info) {
        this.callbacks.onComponentRender(info);
      }
    }

    this.traverseFiber(fiber.child);
    this.traverseFiber(fiber.sibling);
  }

  private isComponentFiber(fiber: Fiber): boolean {
    return COMPONENT_TAGS.has(fiber.tag);
  }

  // --- Render Detection ---

  /**
   * Checks if a fiber actually performed work during this render.
   *
   * Key insight: When React bails out on a component, it reuses the SAME
   * memoizedProps reference. When a component re-renders, the parent creates
   * NEW JSX which means a NEW props object.
   *
   * Additional fix: React sometimes reuses fiber objects across commits without
   * proper alternate linking. We track seen fiber IDs to avoid counting these
   * as false "first renders".
   */
  private didFiberRender(fiber: Fiber): boolean {
    if (this.currentCommitFibers.has(fiber)) return false;
    this.currentCommitFibers.add(fiber);

    const fiberId = this.getFiberId(fiber);
    const wasSeenBefore = this.seenFiberIds.has(fiberId);

    // No alternate = potential first mount OR React quirk
    if (!fiber.alternate) {
      if (wasSeenBefore) return false; // Already seen = not real mount
      this.seenFiberIds.add(fiberId);
      return true;
    }

    // Re-render: check if props reference changed (composite components only check props)
    const didRender = fiber.memoizedProps !== fiber.alternate.memoizedProps;
    if (didRender) this.seenFiberIds.add(fiberId);
    return didRender;
  }

  // --- Component Info Extraction ---

  private extractComponentInfo(fiber: Fiber): ComponentRenderInfo | null {
    const componentName = this.getComponentName(fiber);
    if (!componentName || componentName === 'Anonymous') return null;

    const alternate = fiber.alternate;

    return {
      componentId: this.getFiberId(fiber),
      componentName,
      renderDuration: fiber.actualDuration ?? 0,
      parentId: this.getParentFiberId(fiber),
      propsChanged: alternate ? fiber.memoizedProps !== alternate.memoizedProps : true,
      stateChanged: alternate ? fiber.memoizedState !== alternate.memoizedState : true,
      contextChanged: alternate ? fiber.dependencies !== alternate.dependencies : false,
      ...this.detectMemoization(fiber),
    };
  }

  private detectMemoization(fiber: Fiber): {
    isMemoized: boolean;
    memoType: 'none' | 'React.memo' | 'useMemo' | 'useCallback' | 'PureComponent';
  } {
    if (MEMO_TAGS.has(fiber.tag)) {
      return { isMemoized: true, memoType: 'React.memo' };
    }
    if (fiber.tag === 1 && fiber.type?.prototype?.isPureReactComponent) {
      return { isMemoized: true, memoType: 'PureComponent' };
    }
    return { isMemoized: false, memoType: 'none' };
  }

  // --- Fiber Identity ---

  private getFiberId(fiber: Fiber): string {
    let id = this.fiberIdMap.get(fiber);
    if (id) return id;

    // Reuse ID from alternate (same component across renders)
    if (fiber.alternate) {
      id = this.fiberIdMap.get(fiber.alternate);
      if (id) {
        this.fiberIdMap.set(fiber, id);
        return id;
      }
    }

    id = `fiber-${this.fiberIdCounter++}`;
    this.fiberIdMap.set(fiber, id);
    return id;
  }

  private getParentFiberId(fiber: Fiber): string | null {
    let parent = fiber.return;

    while (parent) {
      if (this.isComponentFiber(parent)) {
        const parentName = this.getComponentName(parent);
        if (parentName && parentName !== 'Anonymous') {
          return this.getFiberId(parent);
        }
      }
      parent = parent.return;
    }

    return null;
  }

  private getComponentName(fiber: Fiber): string | null {
    const type = fiber.type || fiber.elementType;

    if (typeof type === 'string') return type;

    if (typeof type === 'function') {
      return type.displayName || type.name || 'Anonymous';
    }

    // Handle React.memo wrapped components
    if (type?.$$typeof && type.type) {
      return this.getComponentName({ ...fiber, type: type.type });
    }

    return null;
  }
}

export const reactDevToolsInterceptor = ReactDevToolsInterceptor.getInstance();
