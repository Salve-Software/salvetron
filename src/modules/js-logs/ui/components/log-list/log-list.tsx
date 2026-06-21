import { Box, Text } from 'ink'
import type { LogEvent } from '@salve-software/salvetron-types'
import { LogRow } from '../../../../../shared/components/log-row/index.js'

interface LogListProps {
  logs: LogEvent[]
  visibleRows: number
  selectedIndex: number
  scrollOffset: number
  showHeader?: boolean
  maxMessageWidth?: number
}

export function LogList({ logs, visibleRows, selectedIndex, scrollOffset, showHeader = true, maxMessageWidth }: LogListProps) {
  const visible = logs.slice(scrollOffset, scrollOffset + visibleRows)

  return (
    <Box flexDirection="column">
      {showHeader ? <Text color="gray" dimColor>{logs.length} logs · ↑↓ navigate</Text> : null}
      {visible.map((log, i) => {
        const absoluteIndex = scrollOffset + i
        const isSelected = absoluteIndex === selectedIndex
        return (
          <Box key={i} gap={1}>
            <Text color="cyan">{isSelected ? '▶' : ' '}</Text>
            <LogRow log={log} maxMessageWidth={maxMessageWidth} />
          </Box>
        )
      })}
    </Box>
  )
}
