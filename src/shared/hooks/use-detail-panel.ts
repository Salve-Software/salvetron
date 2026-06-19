import { useInput } from 'ink'
import { useState, useCallback } from 'react'
import type { RefObject } from 'react'

interface UseDetailPanelParams {
  linesRef: RefObject<string[]>
  visibleRows: number
  scrollStep?: number
  isActive?: boolean
}

export function useDetailPanel({ linesRef, visibleRows, scrollStep = 1, isActive = true }: UseDetailPanelParams) {
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailScrollOffset, setDetailScrollOffset] = useState(0)

  const resetDetailScroll = useCallback(() => setDetailScrollOffset(0), [])

  useInput((input, key) => {
    if (key.return) { setDetailOpen(o => !o); setDetailScrollOffset(0) }
    if (key.escape) { setDetailOpen(false) }
    if (input === '[') { setDetailScrollOffset(o => Math.max(0, o - scrollStep)) }
    if (input === ']') {
      const maxOffset = Math.max(0, linesRef.current.length - visibleRows)
      setDetailScrollOffset(o => Math.min(maxOffset, o + scrollStep))
    }
  }, { isActive })

  return { detailOpen, detailScrollOffset, resetDetailScroll }
}
