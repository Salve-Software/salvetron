/**
 * React DevTools Hook Interceptor
 * Captures component render events by hooking into React's DevTools global hook
 */

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
  private originalOnCommitFiberRoot: DevToolsHook['onCommitFiberRoot'] | null = null;
  private hook: DevToolsHook | null = null;
  private fiberIdCounter = 0;
  private fiberIdMap = new WeakMap<Fiber, string>();

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

    // Access React DevTools global hook
    const hook = (global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ as DevToolsHook | undefined;

    if (!hook || !hook.supportsFiber) {
      console.warn('[Mako] React DevTools hook not found or does not support Fiber');
      return false;
    }

    this.hook = hook;
    this.callbacks = callbacks;

    // Intercept onCommitFiberRoot
    this.originalOnCommitFiberRoot = hook.onCommitFiberRoot;
    hook.onCommitFiberRoot = (rendererID, root, priorityLevel) => {
      // Call original handler first
      if (this.originalOnCommitFiberRoot) {
        this.originalOnCommitFiberRoot(rendererID, root, priorityLevel);
      }

      // Process the fiber tree
      if (this.enabled && root && root.current) {
        this.traverseFiber(root.current);
      }
    };

    this.enabled = true;
    console.log('[Mako] Component inspector enabled (React DevTools hook)');
    return true;
  }

  public disable(): void {
    if (!this.enabled || !this.hook) {
      return;
    }

    // Restore original handler
    if (this.originalOnCommitFiberRoot) {
      this.hook.onCommitFiberRoot = this.originalOnCommitFiberRoot;
    }

    this.callbacks = null;
    this.enabled = false;
    this.fiberIdMap = new WeakMap();
    console.log('[Mako] Component inspector disabled');
  }

  private traverseFiber(fiber: Fiber | null): void {
    if (!fiber || !this.callbacks) return;

    // Process current fiber if it's a component
    if (this.isComponentFiber(fiber)) {
      const info = this.extractComponentInfo(fiber);
      if (info) {
        this.callbacks.onComponentRender(info);
      }
    }

    // Traverse children
    this.traverseFiber(fiber.child);

    // Traverse siblings
    this.traverseFiber(fiber.sibling);
  }

  private isComponentFiber(fiber: Fiber): boolean {
    // Function component (0), Class component (1), or Memo component (11)
    return fiber.tag === 0 || fiber.tag === 1 || fiber.tag === 11;
  }

  private extractComponentInfo(fiber: Fiber): ComponentRenderInfo | null {
    const componentName = this.getComponentName(fiber);
    if (!componentName || componentName === 'Anonymous') {
      return null;
    }

    const componentId = this.getFiberId(fiber);
    const parentId = this.getParentFiberId(fiber);
    const renderDuration = fiber.actualDuration ?? 0;

    // Detect changes
    const alternate = fiber.alternate;
    const propsChanged = alternate ? fiber.memoizedProps !== alternate.memoizedProps : true;
    const stateChanged = alternate ? fiber.memoizedState !== alternate.memoizedState : true;
    const contextChanged = alternate ? fiber.dependencies !== alternate.dependencies : false;

    // Detect memoization
    const { isMemoized, memoType } = this.detectMemoization(fiber);

    return {
      componentId,
      componentName,
      renderDuration,
      parentId,
      propsChanged,
      stateChanged,
      contextChanged,
      isMemoized,
      memoType,
    };
  }

  private getComponentName(fiber: Fiber): string | null {
    const type = fiber.type || fiber.elementType;

    if (typeof type === 'string') {
      return type;
    }

    if (typeof type === 'function') {
      return type.displayName || type.name || 'Anonymous';
    }

    if (type && typeof type === 'object') {
      // Handle React.memo
      if (type.$$typeof && type.type) {
        return this.getComponentName({ ...fiber, type: type.type });
      }
    }

    return null;
  }

  private getFiberId(fiber: Fiber): string {
    let id = this.fiberIdMap.get(fiber);
    if (!id) {
      id = `fiber-${this.fiberIdCounter++}`;
      this.fiberIdMap.set(fiber, id);
    }
    return id;
  }

  private getParentFiberId(fiber: Fiber): string | null {
    let parent = fiber.return;
    while (parent) {
      if (this.isComponentFiber(parent)) {
        return this.getFiberId(parent);
      }
      parent = parent.return;
    }
    return null;
  }

  private detectMemoization(fiber: Fiber): {
    isMemoized: boolean;
    memoType: 'none' | 'React.memo' | 'useMemo' | 'useCallback' | 'PureComponent';
  } {
    // Check for React.memo (tag 11)
    if (fiber.tag === 11) {
      return { isMemoized: true, memoType: 'React.memo' };
    }

    // Check for PureComponent (class component with shouldComponentUpdate)
    if (fiber.tag === 1 && fiber.type && fiber.type.prototype && fiber.type.prototype.isPureReactComponent) {
      return { isMemoized: true, memoType: 'PureComponent' };
    }

    // For function components, check if they use useMemo/useCallback
    // This is harder to detect reliably from the fiber alone
    // We'd need to inspect the hooks, which is complex
    // For now, we'll mark them as 'none' unless they're wrapped in React.memo

    return { isMemoized: false, memoType: 'none' };
  }
}

export const reactDevToolsInterceptor = ReactDevToolsInterceptor.getInstance();
