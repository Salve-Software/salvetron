import { Box, Text } from 'ink'
import type { NetworkLog } from '@salve-software/rn-tui-types'
import { METHOD_COLOR, getStatusColor } from '../../../library/constants.js'

interface NetworkRowProps {
  log: NetworkLog
  urlMaxWidth: number
  isSelected?: boolean
}

export function NetworkRow({ log, urlMaxWidth, isSelected = false }: NetworkRowProps) {
  const dur = log.duration ? `${log.duration}ms` : '...'

  return (
    <Box gap={1}>
      <Text color="cyan">{isSelected ? '▶' : ' '}</Text>
      <Text color={METHOD_COLOR[log.method] ?? 'white'}>{log.method.padEnd(8)}</Text>
      <Text color={getStatusColor(log.statusCode)}>{String(log.statusCode ?? '---').padEnd(7)}</Text>
      <Text color="gray">{dur.padEnd(8)}</Text>
      <Text>{log.url.slice(0, urlMaxWidth)}</Text>
    </Box>
  )
}
