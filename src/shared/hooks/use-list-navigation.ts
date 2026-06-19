import { useInput } from 'ink'
import { useState, useEffect } from 'react'

interface UseListNavigationParams {
  count: number
  visibleRows: number
  isActive?: boolean
}

export function useListNavigation({ count, visibleRows, isActive = true }: UseListNavigationParams) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollOffset, setScrollOffset] = useState(0)

  useEffect(() => {
    if (selectedIndex > count - 1) setSelectedIndex(Math.max(0, count - 1))
  }, [count, selectedIndex])

  useInput((_input, key) => {
    if (key.upArrow) {
      const next = Math.max(0, selectedIndex - 1)
      setSelectedIndex(next)
      if (next < scrollOffset) setScrollOffset(next)
    }
    if (key.downArrow) {
      const next = Math.min(count - 1, selectedIndex + 1)
      setSelectedIndex(next)
      if (next >= scrollOffset + visibleRows) setScrollOffset(next - visibleRows + 1)
    }
  }, { isActive })

  return { selectedIndex, scrollOffset }
}
