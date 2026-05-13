import { ReactDevToolsInterceptor } from '../react-devtools'
import type {
  ComponentRenderCallbacks,
  ComponentRenderInfo,
} from '../react-devtools'
describe('ReactDevToolsInterceptor', () => {
  let interceptor: ReactDevToolsInterceptor

  const originalGlobal = { ...global }

  const createMockFiber = (overrides: Partial<any> = {}): any => ({
    tag: 0, // Function component
    type: function TestComponent() {},
    elementType: null,
    stateNode: null,
    return: null,
    child: null,
    sibling: null,
    alternate: null,
    memoizedProps: {},
    memoizedState: null,
    updateQueue: null,
    dependencies: null,
    actualDuration: 5.5,
    actualStartTime: 1000,
    ...overrides,
  })

  const createMockHook = (overrides: Partial<any> = {}): any => ({
    supportsFiber: true,
    inject: jest.fn().mockReturnValue(1),
    onCommitFiberRoot: jest.fn(),
    onCommitFiberUnmount: jest.fn(),
    ...overrides,
  })

  const createMockCallbacks = (): ComponentRenderCallbacks => ({
    onComponentRender: jest.fn(),
  })

  beforeEach(() => {
    jest.clearAllMocks()

    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})

    // Reset singleton for each test
    ;(ReactDevToolsInterceptor as any).instance = null

    interceptor = ReactDevToolsInterceptor.getInstance()
  })

  afterEach(() => {
    interceptor.disable()

    jest.restoreAllMocks()

    delete (global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__
  })

  afterAll(() => {
    Object.assign(global, originalGlobal)
  })

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = ReactDevToolsInterceptor.getInstance()
      const instance2 = ReactDevToolsInterceptor.getInstance()

      expect(instance1).toBe(instance2)
    })
  })

  describe('enable', () => {
    it('should enable interceptor when hook exists', () => {
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = createMockHook()

      const result = interceptor.enable(createMockCallbacks())

      expect(result).toBe(true)
      expect(interceptor.isEnabled()).toBe(true)
      expect(console.log).toHaveBeenCalledWith(
        '[Mako] Component inspector enabled (React DevTools hook)'
      )
    })

    it('should prevent double enable', () => {
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = createMockHook()

      interceptor.enable(createMockCallbacks())
      const result = interceptor.enable(createMockCallbacks())

      expect(result).toBe(false)
      expect(console.warn).toHaveBeenCalledWith(
        '[Mako] Component inspector already enabled'
      )
    })

    it('should fail when hook not present', () => {
      const result = interceptor.enable(createMockCallbacks())

      expect(result).toBe(false)
      expect(interceptor.isEnabled()).toBe(false)
      expect(console.warn).toHaveBeenCalledWith(
        '[Mako] React DevTools hook not found or does not support Fiber'
      )
    })

    it('should fail when hook does not support fiber', () => {
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = createMockHook({
        supportsFiber: false,
      })

      const result = interceptor.enable(createMockCallbacks())

      expect(result).toBe(false)
      expect(interceptor.isEnabled()).toBe(false)
    })
  })

  describe('disable', () => {
    it('should disable interceptor', () => {
      const mockHook = createMockHook()
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockHook

      interceptor.enable(createMockCallbacks())
      interceptor.disable()

      expect(interceptor.isEnabled()).toBe(false)
      expect(console.log).toHaveBeenCalledWith(
        '[Mako] Component inspector disabled'
      )
    })

    it('should restore original onCommitFiberRoot', () => {
      const originalHandler = jest.fn()
      const mockHook = createMockHook({
        onCommitFiberRoot: originalHandler,
      })
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockHook

      interceptor.enable(createMockCallbacks())

      expect(mockHook.onCommitFiberRoot).not.toBe(originalHandler)

      interceptor.disable()

      expect(mockHook.onCommitFiberRoot).toBe(originalHandler)
    })

    it('should do nothing when not enabled', () => {
      interceptor.disable()

      expect(console.log).not.toHaveBeenCalledWith(
        '[Mako] Component inspector disabled'
      )
    })
  })

  describe('isEnabled', () => {
    it('should return false initially', () => {
      expect(interceptor.isEnabled()).toBe(false)
    })

    it('should return true after enable', () => {
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = createMockHook()

      interceptor.enable(createMockCallbacks())

      expect(interceptor.isEnabled()).toBe(true)
    })

    it('should return false after disable', () => {
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = createMockHook()

      interceptor.enable(createMockCallbacks())
      interceptor.disable()

      expect(interceptor.isEnabled()).toBe(false)
    })
  })

  describe('onCommitFiberRoot interception', () => {
    it('should call original handler first', () => {
      const originalHandler = jest.fn()
      const mockHook = createMockHook({
        onCommitFiberRoot: originalHandler,
      })
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockHook

      interceptor.enable(createMockCallbacks())

      const mockRoot = {
        current: createMockFiber({
          type: { displayName: 'TestComponent' },
        }),
      }

      mockHook.onCommitFiberRoot(1, mockRoot, undefined)

      expect(originalHandler).toHaveBeenCalledWith(1, mockRoot, undefined)
    })

    it('should trigger callback for component fiber', () => {
      const mockHook = createMockHook()
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockHook

      const callbacks = createMockCallbacks()
      interceptor.enable(callbacks)

      const fiber = createMockFiber({
        type: function MyComponent() {},
      })

      const mockRoot = { current: fiber }

      mockHook.onCommitFiberRoot(1, mockRoot, undefined)

      expect(callbacks.onComponentRender).toHaveBeenCalled()

      const callArg = (callbacks.onComponentRender as jest.Mock).mock
        .calls[0][0] as ComponentRenderInfo

      expect(callArg.componentName).toBe('MyComponent')
      expect(callArg.renderDuration).toBe(5.5)
    })

    it('should not trigger callback when disabled', () => {
      const mockHook = createMockHook()
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockHook

      const callbacks = createMockCallbacks()
      interceptor.enable(callbacks)
      interceptor.disable()

      const mockRoot = {
        current: createMockFiber({
          type: function TestComponent() {},
        }),
      }

      // Call directly since we restored original
      mockHook.onCommitFiberRoot(1, mockRoot, undefined)

      expect(callbacks.onComponentRender).not.toHaveBeenCalled()
    })
  })

  describe('fiber traversal', () => {
    it('should traverse child fibers', () => {
      const mockHook = createMockHook()
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockHook

      const callbacks = createMockCallbacks()
      interceptor.enable(callbacks)

      const childFiber = createMockFiber({
        type: function ChildComponent() {},
      })

      const parentFiber = createMockFiber({
        type: function ParentComponent() {},
        child: childFiber,
      })

      childFiber.return = parentFiber

      const mockRoot = { current: parentFiber }
      mockHook.onCommitFiberRoot(1, mockRoot, undefined)

      expect(callbacks.onComponentRender).toHaveBeenCalledTimes(2)
    })

    it('should traverse sibling fibers', () => {
      const mockHook = createMockHook()
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockHook

      const callbacks = createMockCallbacks()
      interceptor.enable(callbacks)

      const siblingFiber = createMockFiber({
        type: function SiblingComponent() {},
      })

      const firstFiber = createMockFiber({
        type: function FirstComponent() {},
        sibling: siblingFiber,
      })

      const mockRoot = { current: firstFiber }
      mockHook.onCommitFiberRoot(1, mockRoot, undefined)

      expect(callbacks.onComponentRender).toHaveBeenCalledTimes(2)
    })
  })

  describe('isComponentFiber', () => {
    it('should identify function component (tag 0)', () => {
      const mockHook = createMockHook()
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockHook

      const callbacks = createMockCallbacks()
      interceptor.enable(callbacks)

      const fiber = createMockFiber({
        tag: 0,
        type: function FunctionComponent() {},
      })

      const mockRoot = { current: fiber }
      mockHook.onCommitFiberRoot(1, mockRoot, undefined)

      expect(callbacks.onComponentRender).toHaveBeenCalled()
    })

    it('should identify class component (tag 1)', () => {
      const mockHook = createMockHook()
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockHook

      const callbacks = createMockCallbacks()
      interceptor.enable(callbacks)

      const fiber = createMockFiber({
        tag: 1,
        type: class ClassComponent {},
      })

      const mockRoot = { current: fiber }
      mockHook.onCommitFiberRoot(1, mockRoot, undefined)

      expect(callbacks.onComponentRender).toHaveBeenCalled()
    })

    it('should identify memo component (tag 11)', () => {
      const mockHook = createMockHook()
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockHook

      const callbacks = createMockCallbacks()
      interceptor.enable(callbacks)

      const fiber = createMockFiber({
        tag: 11,
        type: function MemoComponent() {},
      })

      const mockRoot = { current: fiber }
      mockHook.onCommitFiberRoot(1, mockRoot, undefined)

      expect(callbacks.onComponentRender).toHaveBeenCalled()
    })

    it('should skip non-component fibers', () => {
      const mockHook = createMockHook()
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockHook

      const callbacks = createMockCallbacks()
      interceptor.enable(callbacks)

      // HostComponent tag = 5
      const fiber = createMockFiber({
        tag: 5,
        type: 'div',
      })

      const mockRoot = { current: fiber }
      mockHook.onCommitFiberRoot(1, mockRoot, undefined)

      expect(callbacks.onComponentRender).not.toHaveBeenCalled()
    })
  })

  describe('getComponentName', () => {
    it('should get name from displayName', () => {
      const mockHook = createMockHook()
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockHook

      const callbacks = createMockCallbacks()
      interceptor.enable(callbacks)

      const Component = function () {}
      Component.displayName = 'CustomDisplayName'

      const fiber = createMockFiber({ type: Component })
      const mockRoot = { current: fiber }
      mockHook.onCommitFiberRoot(1, mockRoot, undefined)

      const callArg = (callbacks.onComponentRender as jest.Mock).mock
        .calls[0][0] as ComponentRenderInfo

      expect(callArg.componentName).toBe('CustomDisplayName')
    })

    it('should get name from function name', () => {
      const mockHook = createMockHook()
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockHook

      const callbacks = createMockCallbacks()
      interceptor.enable(callbacks)

      const fiber = createMockFiber({
        type: function NamedComponent() {},
      })

      const mockRoot = { current: fiber }
      mockHook.onCommitFiberRoot(1, mockRoot, undefined)

      const callArg = (callbacks.onComponentRender as jest.Mock).mock
        .calls[0][0] as ComponentRenderInfo

      expect(callArg.componentName).toBe('NamedComponent')
    })

    it('should skip Anonymous components', () => {
      const mockHook = createMockHook()
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockHook

      const callbacks = createMockCallbacks()
      interceptor.enable(callbacks)

      // Create truly anonymous function (not inferred from object property)
      const anonFn = (() => function () {})()

      const fiber = createMockFiber({
        type: anonFn,
      })

      const mockRoot = { current: fiber }
      mockHook.onCommitFiberRoot(1, mockRoot, undefined)

      expect(callbacks.onComponentRender).not.toHaveBeenCalled()
    })

    it('should handle React.memo wrapped components', () => {
      const mockHook = createMockHook()
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockHook

      const callbacks = createMockCallbacks()
      interceptor.enable(callbacks)

      const MemoizedComponent = function OriginalComponent() {}

      const fiber = createMockFiber({
        tag: 11,
        type: {
          $$typeof: Symbol.for('react.memo'),
          type: MemoizedComponent,
        },
      })

      const mockRoot = { current: fiber }
      mockHook.onCommitFiberRoot(1, mockRoot, undefined)

      const callArg = (callbacks.onComponentRender as jest.Mock).mock
        .calls[0][0] as ComponentRenderInfo

      expect(callArg.componentName).toBe('OriginalComponent')
    })
  })

  describe('change detection', () => {
    it('should detect props change', () => {
      const mockHook = createMockHook()
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockHook

      const callbacks = createMockCallbacks()
      interceptor.enable(callbacks)

      const oldProps = { value: 1 }
      const newProps = { value: 2 }

      const alternateFiber = createMockFiber({
        memoizedProps: oldProps,
      })

      const fiber = createMockFiber({
        type: function TestComponent() {},
        memoizedProps: newProps,
        alternate: alternateFiber,
      })

      const mockRoot = { current: fiber }
      mockHook.onCommitFiberRoot(1, mockRoot, undefined)

      const callArg = (callbacks.onComponentRender as jest.Mock).mock
        .calls[0][0] as ComponentRenderInfo

      expect(callArg.propsChanged).toBe(true)
    })

    it('should detect state change', () => {
      const mockHook = createMockHook()
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockHook

      const callbacks = createMockCallbacks()
      interceptor.enable(callbacks)

      const oldState = { count: 0 }
      const newState = { count: 1 }

      const alternateFiber = createMockFiber({
        memoizedState: oldState,
      })

      const fiber = createMockFiber({
        type: function TestComponent() {},
        memoizedState: newState,
        alternate: alternateFiber,
      })

      const mockRoot = { current: fiber }
      mockHook.onCommitFiberRoot(1, mockRoot, undefined)

      const callArg = (callbacks.onComponentRender as jest.Mock).mock
        .calls[0][0] as ComponentRenderInfo

      expect(callArg.stateChanged).toBe(true)
    })

    it('should detect no changes on same reference', () => {
      const mockHook = createMockHook()
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockHook

      const callbacks = createMockCallbacks()
      interceptor.enable(callbacks)

      const sameProps = { value: 1 }
      const sameState = { count: 0 }

      const alternateFiber = createMockFiber({
        memoizedProps: sameProps,
        memoizedState: sameState,
      })

      const fiber = createMockFiber({
        type: function TestComponent() {},
        memoizedProps: sameProps,
        memoizedState: sameState,
        alternate: alternateFiber,
      })

      const mockRoot = { current: fiber }
      mockHook.onCommitFiberRoot(1, mockRoot, undefined)

      const callArg = (callbacks.onComponentRender as jest.Mock).mock
        .calls[0][0] as ComponentRenderInfo

      expect(callArg.propsChanged).toBe(false)
      expect(callArg.stateChanged).toBe(false)
    })

    it('should mark changes as true for initial render (no alternate)', () => {
      const mockHook = createMockHook()
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockHook

      const callbacks = createMockCallbacks()
      interceptor.enable(callbacks)

      const fiber = createMockFiber({
        type: function TestComponent() {},
        alternate: null,
      })

      const mockRoot = { current: fiber }
      mockHook.onCommitFiberRoot(1, mockRoot, undefined)

      const callArg = (callbacks.onComponentRender as jest.Mock).mock
        .calls[0][0] as ComponentRenderInfo

      expect(callArg.propsChanged).toBe(true)
      expect(callArg.stateChanged).toBe(true)
    })
  })

  describe('memoization detection', () => {
    it('should detect React.memo component', () => {
      const mockHook = createMockHook()
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockHook

      const callbacks = createMockCallbacks()
      interceptor.enable(callbacks)

      const fiber = createMockFiber({
        tag: 11, // Memo
        type: function MemoComponent() {},
      })

      const mockRoot = { current: fiber }
      mockHook.onCommitFiberRoot(1, mockRoot, undefined)

      const callArg = (callbacks.onComponentRender as jest.Mock).mock
        .calls[0][0] as ComponentRenderInfo

      expect(callArg.isMemoized).toBe(true)
      expect(callArg.memoType).toBe('React.memo')
    })

    it('should detect PureComponent', () => {
      const mockHook = createMockHook()
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockHook

      const callbacks = createMockCallbacks()
      interceptor.enable(callbacks)

      class PureComp {}
      ;(PureComp as any).prototype.isPureReactComponent = true

      const fiber = createMockFiber({
        tag: 1, // Class component
        type: PureComp,
      })

      const mockRoot = { current: fiber }
      mockHook.onCommitFiberRoot(1, mockRoot, undefined)

      const callArg = (callbacks.onComponentRender as jest.Mock).mock
        .calls[0][0] as ComponentRenderInfo

      expect(callArg.isMemoized).toBe(true)
      expect(callArg.memoType).toBe('PureComponent')
    })

    it('should return none for regular component', () => {
      const mockHook = createMockHook()
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockHook

      const callbacks = createMockCallbacks()
      interceptor.enable(callbacks)

      const fiber = createMockFiber({
        tag: 0, // Function component
        type: function RegularComponent() {},
      })

      const mockRoot = { current: fiber }
      mockHook.onCommitFiberRoot(1, mockRoot, undefined)

      const callArg = (callbacks.onComponentRender as jest.Mock).mock
        .calls[0][0] as ComponentRenderInfo

      expect(callArg.isMemoized).toBe(false)
      expect(callArg.memoType).toBe('none')
    })
  })

  describe('parent ID tracking', () => {
    it('should track parent component ID', () => {
      const mockHook = createMockHook()
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockHook

      const callbacks = createMockCallbacks()
      interceptor.enable(callbacks)

      const childFiber = createMockFiber({
        type: function ChildComponent() {},
      })

      const parentFiber = createMockFiber({
        tag: 0,
        type: function ParentComponent() {},
        child: childFiber,
      })

      childFiber.return = parentFiber

      const mockRoot = { current: parentFiber }
      mockHook.onCommitFiberRoot(1, mockRoot, undefined)

      const calls = (callbacks.onComponentRender as jest.Mock).mock.calls
      const parentCall = calls.find(
        (c: any) => c[0].componentName === 'ParentComponent'
      )
      const childCall = calls.find(
        (c: any) => c[0].componentName === 'ChildComponent'
      )

      expect(parentCall[0].parentId).toBeNull()
      expect(childCall[0].parentId).toBe(parentCall[0].componentId)
    })

    it('should skip non-component fibers when finding parent', () => {
      const mockHook = createMockHook()
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockHook

      const callbacks = createMockCallbacks()
      interceptor.enable(callbacks)

      const childFiber = createMockFiber({
        type: function ChildComponent() {},
      })

      // HostComponent (div) in between
      const hostFiber = createMockFiber({
        tag: 5, // HostComponent
        type: 'div',
        child: childFiber,
      })

      const parentFiber = createMockFiber({
        tag: 0,
        type: function ParentComponent() {},
        child: hostFiber,
      })

      childFiber.return = hostFiber
      hostFiber.return = parentFiber

      const mockRoot = { current: parentFiber }
      mockHook.onCommitFiberRoot(1, mockRoot, undefined)

      const calls = (callbacks.onComponentRender as jest.Mock).mock.calls
      const parentCall = calls.find(
        (c: any) => c[0].componentName === 'ParentComponent'
      )
      const childCall = calls.find(
        (c: any) => c[0].componentName === 'ChildComponent'
      )

      // Child should have parent ID pointing to ParentComponent, not div
      expect(childCall[0].parentId).toBe(parentCall[0].componentId)
    })
  })

  describe('fiber ID generation', () => {
    it('should generate unique IDs for different fibers', () => {
      const mockHook = createMockHook()
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockHook

      const callbacks = createMockCallbacks()
      interceptor.enable(callbacks)

      const fiber1 = createMockFiber({
        type: function Component1() {},
      })

      const fiber2 = createMockFiber({
        type: function Component2() {},
        sibling: null,
      })

      fiber1.sibling = fiber2

      const mockRoot = { current: fiber1 }
      mockHook.onCommitFiberRoot(1, mockRoot, undefined)

      const calls = (callbacks.onComponentRender as jest.Mock).mock.calls
      const id1 = calls[0][0].componentId
      const id2 = calls[1][0].componentId

      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^fiber-\d+$/)
      expect(id2).toMatch(/^fiber-\d+$/)
    })

    it('should reuse ID for same fiber instance', () => {
      const mockHook = createMockHook()
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockHook

      const callbacks = createMockCallbacks()
      interceptor.enable(callbacks)

      const fiber = createMockFiber({
        type: function TestComponent() {},
      })

      const mockRoot = { current: fiber }

      // Simulate multiple commits with same fiber
      mockHook.onCommitFiberRoot(1, mockRoot, undefined)
      mockHook.onCommitFiberRoot(1, mockRoot, undefined)

      const calls = (callbacks.onComponentRender as jest.Mock).mock.calls

      expect(calls[0][0].componentId).toBe(calls[1][0].componentId)
    })
  })

  describe('render duration', () => {
    it('should capture actualDuration from fiber', () => {
      const mockHook = createMockHook()
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockHook

      const callbacks = createMockCallbacks()
      interceptor.enable(callbacks)

      const fiber = createMockFiber({
        type: function TestComponent() {},
        actualDuration: 12.34,
      })

      const mockRoot = { current: fiber }
      mockHook.onCommitFiberRoot(1, mockRoot, undefined)

      const callArg = (callbacks.onComponentRender as jest.Mock).mock
        .calls[0][0] as ComponentRenderInfo

      expect(callArg.renderDuration).toBe(12.34)
    })

    it('should default to 0 when actualDuration is undefined', () => {
      const mockHook = createMockHook()
      ;(global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = mockHook

      const callbacks = createMockCallbacks()
      interceptor.enable(callbacks)

      const fiber = createMockFiber({
        type: function TestComponent() {},
        actualDuration: undefined,
      })

      const mockRoot = { current: fiber }
      mockHook.onCommitFiberRoot(1, mockRoot, undefined)

      const callArg = (callbacks.onComponentRender as jest.Mock).mock
        .calls[0][0] as ComponentRenderInfo

      expect(callArg.renderDuration).toBe(0)
    })
  })
})
