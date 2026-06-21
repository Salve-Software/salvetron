import type { LogLevel } from '../types'

export interface JSConsoleCallbacks {
  onLog: (level: LogLevel, message: string, metadata?: Record<string, unknown>) => void
}

export class JSConsoleInterceptor {
  private static instance: JSConsoleInterceptor | null = null

  private enabled = false
  private callbacks: JSConsoleCallbacks | null = null

  private readonly originalLog = console.log
  private readonly originalWarn = console.warn
  private readonly originalError = console.error

  public static getInstance(): JSConsoleInterceptor {
    if (!JSConsoleInterceptor.instance) {
      JSConsoleInterceptor.instance = new JSConsoleInterceptor()
    }
    return JSConsoleInterceptor.instance
  }

  public isEnabled(): boolean {
    return this.enabled
  }

  public start(callbacks: JSConsoleCallbacks): boolean {
    if (this.enabled) {
      return false
    }

    this.callbacks = callbacks

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this

    console.log = function (...args: unknown[]) {
      self.originalLog.apply(console, args)
      try {
        const first = args[0]
        if (typeof first === 'string' && first.startsWith('[Salvetron]')) return
        const message = String(args[0])
        const metadata = args.length > 1 ? { args: args.slice(1) } : undefined
        self.callbacks?.onLog('log', message, metadata)
      } catch {
        // swallow forwarding errors
      }
    }

    console.warn = function (...args: unknown[]) {
      self.originalWarn.apply(console, args)
      try {
        const first = args[0]
        if (typeof first === 'string' && first.startsWith('[Salvetron]')) return
        const message = String(args[0])
        const metadata = args.length > 1 ? { args: args.slice(1) } : undefined
        self.callbacks?.onLog('warn', message, metadata)
      } catch {
        // swallow forwarding errors
      }
    }

    console.error = function (...args: unknown[]) {
      self.originalError.apply(console, args)
      try {
        const first = args[0]
        if (typeof first === 'string' && first.startsWith('[Salvetron]')) return
        const message = String(args[0])
        const metadata = args.length > 1 ? { args: args.slice(1) } : undefined
        self.callbacks?.onLog('error', message, metadata)
      } catch {
        // swallow forwarding errors
      }
    }

    this.enabled = true
    return true
  }

  public stop(): void {
    if (!this.enabled) {
      return
    }

    console.log = this.originalLog
    console.warn = this.originalWarn
    console.error = this.originalError

    this.callbacks = null
    this.enabled = false
  }
}
