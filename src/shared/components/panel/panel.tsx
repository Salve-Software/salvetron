import { Box, Text } from 'ink'
import type { ReactNode } from 'react'

interface PanelProps {
  title: string
  focused?: boolean
  flexGrow?: number
  height?: number | string
  children: ReactNode
}

export function Panel({ title, focused = false, flexGrow, height, children }: PanelProps) {
  const color = focused ? 'cyan' : 'gray'

  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor={color}
      paddingX={1}
      flexGrow={flexGrow}
      height={height}
    >
      <Text bold color={color}>{title}</Text>
      {children}
    </Box>
  )
}
