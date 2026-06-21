/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { Box, Text } from 'ink'

export interface FilterChip {
  id: string
  label: string
  color?: string
}

export interface FilterGroup {
  id: string
  label: string
  chips: FilterChip[]
}

interface FilterBarProps {
  groups: FilterGroup[]
  active: Record<string, Set<string>>
  focusedGroupIndex: number
  focusedChipIndex: number
}

export function FilterBar({ groups, active, focusedGroupIndex, focusedChipIndex }: FilterBarProps) {
  return (
    <Box flexDirection="column">
      {groups.map((group, groupIndex) =>
        <Box key={group.id} gap={1}>
          <Text bold color="gray">{group.label.padEnd(7)}</Text>
          {group.chips.map((chip, chipIndex) => {
            const isOn = active[group.id]?.has(chip.id) ?? false
            const isFocused = groupIndex === focusedGroupIndex && chipIndex === focusedChipIndex
            return (
              <Text
                key={chip.id}
                color={isOn ? chip.color ?? 'cyan' : 'gray'}
                dimColor={!isOn}
                inverse={isFocused}
              >
                {isOn ? '◉' : '○'} {chip.label}
              </Text>
            )
          })}
        </Box>
      )}
    </Box>
  )
}
