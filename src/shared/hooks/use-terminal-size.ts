import { useStdout } from 'ink'
import { useState, useEffect } from 'react'

// Clears the visible viewport and homes the cursor without touching scrollback.
// Ink's own log-update tracks previous output height by counting '\n' in the
// rendered string, not actual wrapped terminal rows, so its line-erase math
// drifts after a width change and leaves stale frame remnants on screen
// (https://github.com/vadimdemedes/ink/issues/907). A hard clear right before
// committing the new size sidesteps that miscount entirely.
const CLEAR_VIEWPORT = '\x1b[2J\x1b[H'

export function useTerminalSize(): [number, number] {
  const { stdout } = useStdout()
  const [size, setSize] = useState<[number, number]>([
    stdout?.columns ?? 80,
    stdout?.rows ?? 24,
  ])

  useEffect(() => {
    if (!stdout) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const handler = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        const cols = stdout.columns
        const rows = stdout.rows
        setSize((prev) => {
          if (prev[0] === cols && prev[1] === rows) return prev
          stdout.write(CLEAR_VIEWPORT)
          return [cols, rows]
        })
      }, 80)
    }
    stdout.on('resize', handler)
    return () => {
      clearTimeout(timer)
      stdout.off('resize', handler)
    }
  }, [stdout])

  return size
}
