import { useInput } from 'ink'
import { useCallback, useEffect, useState } from 'react'
import type { FilterGroup } from '../components/filter-bar/index.js'
import { useSearchBarStore } from '../store/search-bar.store.js'

interface UseSearchFilterParams {
  groups: FilterGroup[]
  isActive?: boolean
}

interface UseSearchFilterResult {
  isOpen: boolean
  query: string
  focusedGroupIndex: number
  focusedChipIndex: number
  close: () => void
}

/**
 * Owns the open/closed state of the search+filter bar, the live query text,
 * and which "zone" is keyboard-focused: -1 = the search line, >=0 = a filter
 * group index. Zone tracking lives here (not in useFilterChips) so the
 * search-text and chip-navigation key handling never both react to the same
 * keypress.
 */
export function useSearchFilter({ groups, isActive = true }: UseSearchFilterParams): UseSearchFilterResult {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [focusedGroupIndex, setFocusedGroupIndex] = useState(-1)
  const [focusedChipIndex, setFocusedChipIndex] = useState(0)

  const close = useCallback(() => setIsOpen(false), [])

  // Mirror local open state into a shared store so the global tab-switch
  // shortcut (1-4 / Tab in app.tsx) can suppress itself while the user is
  // typing a query — otherwise typing a digit into the search box would
  // navigate away and unmount this container, losing the in-progress search.
  useEffect(() => {
    useSearchBarStore.getState().setOpen(isOpen)
    return () => useSearchBarStore.getState().setOpen(false)
  }, [isOpen])

  useInput((input, key) => {
    if (!isOpen) {
      if (input === '/') {
        setIsOpen(true)
        setFocusedGroupIndex(-1)
        setFocusedChipIndex(0)
      }
      return
    }

    if (key.escape) { close(); return }

    if (focusedGroupIndex === -1) {
      if (key.return) { close(); return }
      if (key.downArrow && groups.length > 0) {
        setFocusedGroupIndex(0)
        setFocusedChipIndex(0)
        return
      }
      if (key.backspace || key.delete) {
        setQuery((q) => q.slice(0, -1))
        return
      }
      if (input.length > 0 && !key.ctrl && !key.meta) {
        setQuery((q) => q + input)
      }
      return
    }

    const group = groups[focusedGroupIndex]
    if (!group) return

    if (key.upArrow) {
      if (focusedGroupIndex === 0) { setFocusedGroupIndex(-1); return }
      setFocusedGroupIndex((i) => Math.max(0, i - 1))
      setFocusedChipIndex(0)
      return
    }
    if (key.downArrow) {
      setFocusedGroupIndex((i) => Math.min(groups.length - 1, i + 1))
      setFocusedChipIndex(0)
      return
    }
    if (key.leftArrow) {
      setFocusedChipIndex((i) => Math.max(0, i - 1))
      return
    }
    if (key.rightArrow) {
      setFocusedChipIndex((i) => Math.min(group.chips.length - 1, i + 1))
    }
  }, { isActive })

  return { isOpen, query, focusedGroupIndex, focusedChipIndex, close }
}
