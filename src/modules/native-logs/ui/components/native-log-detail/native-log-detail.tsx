import { Box, Text } from 'ink'
import type { NativeLogEvent } from '@salve-software/mako-types'

const LEVEL_COLOR: Record<string, string> = {
  error: 'red', warn: 'yellow', info: 'cyan', debug: 'gray', log: 'white',
}

interface NativeLogDetailProps {
  log: NativeLogEvent
  width: number
  metaLines: string[]
  metaScrollOffset: number
  metaVisibleRows: number
}

export function NativeLogDetail({ log, width, metaLines, metaScrollOffset, metaVisibleRows }: NativeLogDetailProps) {
  const color = LEVEL_COLOR[log.level] ?? 'white'
  const time = new Date(log.timestamp).toLocaleTimeString('en', { hour12: false })
  const visibleLines = metaLines.slice(metaScrollOffset, metaScrollOffset + metaVisibleRows)
  const canScroll = metaLines.length > metaVisibleRows

  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderTop={true}
      borderBottom={false}
      borderLeft={false}
      borderRight={false}
      paddingX={1}
    >
      <Box gap={2}>
        <Text color={color} bold>[{log.level.toUpperCase()}]</Text>
        <Text color="whiteBright">{time}</Text>
        <Text color="whiteBright" dimColor>[{log.source}]</Text>
        {log.tag ? <Text color="whiteBright" dimColor>tag: {log.tag}</Text> : null}
      </Box>
      <Text wrap="wrap">{log.message.slice(0, width * 3)}</Text>
      {metaLines.length > 0
        ?
        <Box flexDirection="column">
          <Text color="whiteBright" dimColor>
            {'── metadata'}
            {canScroll ? `  [ = up   ] = down  ·  line ${metaScrollOffset + 1} of ${metaLines.length}` : ''}
            {' ──'}
          </Text>
          {visibleLines.map((line, i) => (
            <Text key={i}>{line}</Text>
          ))}
        </Box>
        : null
      }
    </Box>
  )
}
