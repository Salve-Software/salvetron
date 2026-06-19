import { useInput } from 'ink'
import { useState, useEffect, useRef } from 'react'

interface UseListNavigationParams {
  count: number
  visibleRows: number
  isActive?: boolean
}

export function useListNavigation({ count, visibleRows, isActive = true }: UseListNavigationParams) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollOffset, setScrollOffset] = useState(0)
  const pinnedToLatestRef = useRef(true)

  // Follow the newest item as it arrives, unless the user scrolled away
  // from the bottom — then stay put until they navigate back down to it.
  useEffect(() => {
    if (count === 0) return
    if (pinnedToLatestRef.current) {
      const last = count - 1
      setSelectedIndex(last)
      setScrollOffset(Math.max(0, last - visibleRows + 1))
    } else if (selectedIndex > count - 1) {
      setSelectedIndex(Math.max(0, count - 1))
    }
  }, [count, visibleRows])

  useInput((_input, key) => {
    if (key.upArrow) {
      const next = Math.max(0, selectedIndex - 1)
      pinnedToLatestRef.current = false
      setSelectedIndex(next)
      if (next < scrollOffset) setScrollOffset(next)
    }
    if (key.downArrow) {
      const next = Math.min(count - 1, selectedIndex + 1)
      pinnedToLatestRef.current = next >= count - 1
      setSelectedIndex(next)
      if (next >= scrollOffset + visibleRows) setScrollOffset(next - visibleRows + 1)
    }
  }, { isActive })

  return { selectedIndex, scrollOffset }
}
