import { useInput } from 'ink'
import { useState } from 'react'
import type { FilterGroup } from '../components/filter-bar/index.js'

interface UseFilterChipsParams {
  groups: FilterGroup[]
  focusedGroupIndex: number
  focusedChipIndex: number
  isActive: boolean
}

interface UseFilterChipsResult {
  active: Record<string, Set<string>>
}

/**
 * Owns which chips are toggled on per filter group. Focus position comes
 * from useSearchFilter (single source of truth for zone/position) — this
 * hook only reacts to Enter/Space to flip the chip under that focus.
 */
export function useFilterChips({ groups, focusedGroupIndex, focusedChipIndex, isActive }: UseFilterChipsParams): UseFilterChipsResult {
  const [active, setActive] = useState<Record<string, Set<string>>>({})

  useInput((input, key) => {
    if (!key.return && input !== ' ') return

    const group = groups[focusedGroupIndex]
    const chip = group?.chips[focusedChipIndex]
    if (!group || !chip) return

    setActive((prev) => {
      const next = { ...prev }
      const set = new Set(next[group.id] ?? [])
      if (set.has(chip.id)) set.delete(chip.id)
      else set.add(chip.id)
      next[group.id] = set
      return next
    })
  }, { isActive })

  return { active }
}
