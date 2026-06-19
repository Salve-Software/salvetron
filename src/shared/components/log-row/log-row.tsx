import { Text } from 'ink'
import type { AnyLog } from '../../types.js'

const LEVEL_COLOR: Record<string, string> = {
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  debug: 'gray',
  log: 'white',
}

interface LogRowProps {
  log: AnyLog
  maxMessageWidth?: number
}

export function LogRow({ log, maxMessageWidth = 120 }: LogRowProps) {
  const color = LEVEL_COLOR[log.level] ?? 'white'
  const time = new Date(log.timestamp).toLocaleTimeString('en', { hour12: false })

  return (
    <Text>
      <Text color="gray">{time} </Text>
      <Text color={color}>[{log.level.toUpperCase().padEnd(5)}] </Text>
      <Text>{log.message.slice(0, maxMessageWidth)}</Text>
    </Text>
  )
}
