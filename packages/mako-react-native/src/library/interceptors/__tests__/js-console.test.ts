import { JSConsoleInterceptor } from '../js-console'
import type { JSConsoleCallbacks } from '../js-console'

describe('JSConsoleInterceptor', () => {
  let interceptor: JSConsoleInterceptor

  // Capture real originals before any patching
  const realLog = console.log
  const realWarn = console.warn
  const realError = console.error

  const createCallbacks = (): { callbacks: JSConsoleCallbacks; onLog: jest.Mock } => {
    const onLog = jest.fn()
    return { callbacks: { onLog }, onLog }
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Reset singleton so each test gets a fresh instance
    ;(JSConsoleInterceptor as any).instance = null
    interceptor = JSConsoleInterceptor.getInstance()

    // Ensure stopped before each test
    interceptor.stop()
  })

  afterEach(() => {
    // Always restore console methods after each test
    interceptor.stop()
    jest.restoreAllMocks()
  })

  afterAll(() => {
    // Guarantee originals are back after the suite
    console.log = realLog
    console.warn = realWarn
    console.error = realError
  })

  // ── start / stop basics ──────────────────────────────────────────────────

  it('should return true on first start', () => {
    const { callbacks } = createCallbacks()
    expect(interceptor.start(callbacks)).toBe(true)
    expect(interceptor.isEnabled()).toBe(true)
  })

  it('should no-op (return false) on double start', () => {
    const { callbacks } = createCallbacks()
    interceptor.start(callbacks)
    expect(interceptor.start(callbacks)).toBe(false)
  })

  it('should no-op stop when not enabled', () => {
    expect(() => interceptor.stop()).not.toThrow()
    expect(interceptor.isEnabled()).toBe(false)
  })

  // ── console.log forwarding ───────────────────────────────────────────────

  it('console.log("hello") → onLog("log", "hello", undefined)', () => {
    const { callbacks, onLog } = createCallbacks()
    interceptor.start(callbacks)

    console.log('hello')

    expect(onLog).toHaveBeenCalledTimes(1)
    expect(onLog).toHaveBeenCalledWith('log', 'hello', undefined)
  })

  it('console.warn("bad", { x: 1 }) → onLog("warn", "bad", { args: [{ x: 1 }] })', () => {
    const { callbacks, onLog } = createCallbacks()
    interceptor.start(callbacks)

    console.warn('bad', { x: 1 })

    expect(onLog).toHaveBeenCalledTimes(1)
    expect(onLog).toHaveBeenCalledWith('warn', 'bad', { args: [{ x: 1 }] })
  })

  it('console.error("boom") → onLog("error", "boom", undefined)', () => {
    const { callbacks, onLog } = createCallbacks()
    interceptor.start(callbacks)

    console.error('boom')

    expect(onLog).toHaveBeenCalledTimes(1)
    expect(onLog).toHaveBeenCalledWith('error', 'boom', undefined)
  })

  // ── multi-arg metadata ────────────────────────────────────────────────────

  it('multi-arg: console.log("a", "b", "c") → metadata: { args: ["b", "c"] }', () => {
    const { callbacks, onLog } = createCallbacks()
    interceptor.start(callbacks)

    console.log('a', 'b', 'c')

    expect(onLog).toHaveBeenCalledWith('log', 'a', { args: ['b', 'c'] })
  })

  // ── [Mako] guard ─────────────────────────────────────────────────────────

  it('console.log("[Mako] internal") is not forwarded; original still called', () => {
    const { callbacks, onLog } = createCallbacks()

    // Replace the stored original BEFORE start() so the patched closure captures our spy
    const originalSpy = jest.fn()
    ;(interceptor as any).originalLog = originalSpy

    interceptor.start(callbacks)

    console.log('[Mako] internal')

    // Restore properly: stop() will restore console.log to originalSpy,
    // then we put realLog back so subsequent tests are unaffected.
    interceptor.stop()
    console.log = realLog

    expect(onLog).not.toHaveBeenCalled()
    expect(originalSpy).toHaveBeenCalledWith('[Mako] internal')
  })

  it('non-string first arg with [Mako] prefix check does not throw', () => {
    const { callbacks, onLog } = createCallbacks()
    interceptor.start(callbacks)

    // Non-string first arg: should not match [Mako] guard, should forward
    expect(() => console.log({ y: 2 })).not.toThrow()
    expect(onLog).toHaveBeenCalledWith('log', '[object Object]', undefined)
  })

  // ── console.debug / console.info not intercepted ─────────────────────────

  it('console.debug and console.info are not patched after start', () => {
    const originalDebug = console.debug
    const originalInfo = console.info
    const { callbacks } = createCallbacks()

    interceptor.start(callbacks)

    expect(console.debug).toBe(originalDebug)
    expect(console.info).toBe(originalInfo)
  })

  // ── restore after stop ────────────────────────────────────────────────────

  it('console.log/warn/error are restored after stop()', () => {
    const { callbacks } = createCallbacks()
    interceptor.start(callbacks)

    // Methods should be patched
    expect(console.log).not.toBe(realLog)
    expect(console.warn).not.toBe(realWarn)
    expect(console.error).not.toBe(realError)

    interceptor.stop()

    expect(console.log).toBe(realLog)
    expect(console.warn).toBe(realWarn)
    expect(console.error).toBe(realError)
    expect(interceptor.isEnabled()).toBe(false)
  })

  // ── error swallow ─────────────────────────────────────────────────────────

  it('if onLog throws, original is still called and error is swallowed', () => {
    const throwingCallbacks: JSConsoleCallbacks = {
      onLog: () => { throw new Error('forwarding failed') },
    }
    const originalSpy = jest.fn()
    interceptor.start(throwingCallbacks)

    // Replace stored original to spy on it
    ;(interceptor as any).originalLog = originalSpy

    expect(() => console.log('test')).not.toThrow()
    expect(originalSpy).toHaveBeenCalledWith('test')
  })
})
