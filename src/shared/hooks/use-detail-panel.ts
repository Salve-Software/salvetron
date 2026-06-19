import { useInput } from 'ink'
import { useState, useCallback, useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { copyToClipboard } from '../utils/clipboard.js'

export interface CopyFeedback {
  kind: 'body' | 'extra'
  success: boolean
}

interface UseDetailPanelParams {
  linesRef: RefObject<string[]>
  visibleRows: number
  scrollStep?: number
  isActive?: boolean
  onCopyBody?: () => string
  onCopyExtra?: () => string
}

const FEEDBACK_TIMEOUT_MS = 1500

export function useDetailPanel({
  linesRef,
  visibleRows,
  scrollStep = 1,
  isActive = true,
  onCopyBody,
  onCopyExtra,
}: UseDetailPanelParams) {
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailScrollOffset, setDetailScrollOffset] = useState(0)
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback | null>(null)

  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetDetailScroll = useCallback(() => setDetailScrollOffset(0), [])

  const showFeedback = useCallback((kind: CopyFeedback['kind'], success: boolean) => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current)
    setCopyFeedback({ kind, success })
    feedbackTimeoutRef.current = setTimeout(() => {
      setCopyFeedback(null)
      feedbackTimeoutRef.current = null
    }, FEEDBACK_TIMEOUT_MS)
  }, [])

  useEffect(() => {
    if (!detailOpen && copyFeedback) {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current)
      feedbackTimeoutRef.current = null
      setCopyFeedback(null)
    }
  }, [detailOpen, copyFeedback])

  useEffect(() => () => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current)
  }, [])

  useInput((input, key) => {
    if (key.return) { setDetailOpen(o => !o); setDetailScrollOffset(0) }
    if (key.escape) { setDetailOpen(false) }
    if (input === '[') { setDetailScrollOffset(o => Math.max(0, o - scrollStep)) }
    if (input === ']') {
      const maxOffset = Math.max(0, linesRef.current.length - visibleRows)
      setDetailScrollOffset(o => Math.min(maxOffset, o + scrollStep))
    }
    if (input === 'c' && detailOpen && onCopyBody) {
      const text = onCopyBody()
      if (text.length > 0) showFeedback('body', copyToClipboard(text))
    }
    if (input === 'u' && detailOpen && onCopyExtra) {
      const text = onCopyExtra()
      if (text.length > 0) showFeedback('extra', copyToClipboard(text))
    }
  }, { isActive })

  return { detailOpen, detailScrollOffset, resetDetailScroll, copyFeedback }
}
