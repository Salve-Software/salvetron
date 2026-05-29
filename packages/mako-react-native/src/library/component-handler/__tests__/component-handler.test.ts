import { ComponentHandler } from '../component-handler'
import type { ComponentRenderInfo } from '../../interceptors/react-devtools'
import type { ComponentRenderEvent, ComponentTreeEvent } from '@salve-software/mako-types'

jest.mock('../../project', () => ({
  projectHandler: { getProjectId: () => 'project-1' },
}))

jest.mock('../../device', () => ({
  deviceHandler: { getDeviceInfo: () => ({ deviceId: 'device-1' }) },
}))

const makeInfo = (overrides: Partial<ComponentRenderInfo> = {}): ComponentRenderInfo => ({
  componentId: 'fiber-0',
  componentName: 'Comp',
  renderDuration: 1,
  parentId: null,
  propsChanged: true,
  stateChanged: false,
  contextChanged: false,
  isMemoized: false,
  memoType: 'none',
  ...overrides,
})

describe('ComponentHandler', () => {
  let events: Array<ComponentRenderEvent | ComponentTreeEvent>
  let handler: ComponentHandler

  const renderEvents = () =>
    events.filter((e): e is ComponentRenderEvent => e.type === 'component_render')
  const treeEvents = () =>
    events.filter((e): e is ComponentTreeEvent => e.type === 'component_tree')

  beforeEach(() => {
    jest.useFakeTimers()
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    events = []
    handler = new ComponentHandler({ onEvent: (e) => events.push(e) })
  })

  afterEach(() => {
    handler.clear()
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  describe('render event coalescing', () => {
    it('collapses rapid renders of the same component into one flushed event', () => {
      const cb = handler.getCallbacks()

      cb.onComponentRender(makeInfo({ componentId: 'fiber-0' }))
      cb.onComponentRender(makeInfo({ componentId: 'fiber-0' }))
      cb.onComponentRender(makeInfo({ componentId: 'fiber-0' }))

      // Nothing emitted synchronously.
      expect(renderEvents()).toHaveLength(0)

      jest.runOnlyPendingTimers()

      const rendered = renderEvents()
      expect(rendered).toHaveLength(1)
      // renderCount stays cumulative across the coalesced renders.
      expect(rendered[0]!.renderCount).toBe(3)
    })

    it('emits one event per distinct component in a flush', () => {
      const cb = handler.getCallbacks()

      cb.onComponentRender(makeInfo({ componentId: 'fiber-0', componentName: 'A' }))
      cb.onComponentRender(makeInfo({ componentId: 'fiber-1', componentName: 'B' }))

      jest.runOnlyPendingTimers()

      expect(renderEvents().map((e) => e.componentName).sort()).toEqual(['A', 'B'])
    })
  })

  describe('tree snapshots', () => {
    it('builds nested tree with correct children and depth (O(n))', () => {
      const cb = handler.getCallbacks()

      cb.onComponentRender(makeInfo({ componentId: 'root', componentName: 'Root', parentId: null }))
      cb.onComponentRender(makeInfo({ componentId: 'child', componentName: 'Child', parentId: 'root' }))
      cb.onComponentRender(makeInfo({ componentId: 'grand', componentName: 'Grand', parentId: 'child' }))

      handler.startTreeSnapshots()

      const tree = treeEvents()[0]!.tree
      const byId = Object.fromEntries(tree.map((n) => [n.id, n]))

      expect(byId.root!.depth).toBe(0)
      expect(byId.root!.children).toEqual(['child'])
      expect(byId.child!.depth).toBe(1)
      expect(byId.child!.children).toEqual(['grand'])
      expect(byId.grand!.depth).toBe(2)
      expect(byId.grand!.children).toEqual([])
    })

    it('skips snapshot when structure is unchanged', () => {
      const cb = handler.getCallbacks()
      cb.onComponentRender(makeInfo({ componentId: 'root' }))

      handler.startTreeSnapshots()
      expect(treeEvents()).toHaveLength(1)

      // A re-render of an existing component does not change structure.
      cb.onComponentRender(makeInfo({ componentId: 'root' }))
      jest.advanceTimersByTime(5000)

      expect(treeEvents()).toHaveLength(1)
    })

    it('re-emits snapshot after a structural change', () => {
      const cb = handler.getCallbacks()
      cb.onComponentRender(makeInfo({ componentId: 'root' }))

      handler.startTreeSnapshots()
      expect(treeEvents()).toHaveLength(1)

      cb.onComponentRender(makeInfo({ componentId: 'new', parentId: 'root' }))
      jest.advanceTimersByTime(5000)

      expect(treeEvents()).toHaveLength(2)
    })
  })

  describe('unmount pruning', () => {
    it('removes the unmounted component from the registry and tree', () => {
      const cb = handler.getCallbacks()
      cb.onComponentRender(makeInfo({ componentId: 'root' }))
      cb.onComponentRender(makeInfo({ componentId: 'child', parentId: 'root' }))

      cb.onComponentUnmount?.('child')

      handler.startTreeSnapshots()

      const ids = treeEvents()[0]!.tree.map((n) => n.id)
      expect(ids).toContain('root')
      expect(ids).not.toContain('child')
    })
  })
})
