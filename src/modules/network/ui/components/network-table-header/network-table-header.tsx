/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { Box, Text } from 'ink'

export function NetworkTableHeader() {
  return (
    <Box gap={1}>
      <Text bold color="gray">{'METHOD'.padEnd(8)}</Text>
      <Text bold color="gray">{'STATUS'.padEnd(7)}</Text>
      <Text bold color="gray">{'DUR'.padEnd(8)}</Text>
      <Text bold color="gray">URL</Text>
    </Box>
  )
}
