import { useInput } from 'ink'
import { useCallback, useEffect, useRef, useState } from 'react'

interface UseClearConfirmParams {
  onClear: () => void
  isActive: boolean
}

interface UseClearConfirmResult {
  pending: boolean
}

const CONFIRM_TIMEOUT_MS = 3000

export function useClearConfirm({ onClear, isActive }: UseClearConfirmParams): UseClearConfirmResult {
  const [pending, setPending] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelPending = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = null
    setPending(false)
  }, [])

  useInput((input) => {
    if (input !== 'x') {
      if (pending) cancelPending()
      return
    }

    if (pending) {
      cancelPending()
      onClear()
      return
    }

    setPending(true)
    timeoutRef.current = setTimeout(() => {
      setPending(false)
      timeoutRef.current = null
    }, CONFIRM_TIMEOUT_MS)
  }, { isActive })

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  return { pending }
}
