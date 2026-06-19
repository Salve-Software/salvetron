import { Box, Text } from 'ink'
import type { NetworkLog } from '@salve-software/mako-types'
import { METHOD_COLOR, getStatusColor } from '../../../library/constants.js'

interface NetworkDetailProps {
  log: NetworkLog
  width: number
  bodyLines: string[]
  bodyScrollOffset: number
  bodyVisibleRows: number
}

export function NetworkDetail({ log, width, bodyLines, bodyScrollOffset, bodyVisibleRows }: NetworkDetailProps) {
  const time = new Date(log.requestTimestamp).toLocaleTimeString('en', { hour12: false })
  const reqHeaders = Object.entries(log.requestHeaders ?? {})
  const resHeaders = Object.entries(log.responseHeaders ?? {})
  const visibleLines = bodyLines.slice(bodyScrollOffset, bodyScrollOffset + bodyVisibleRows)
  const canScroll = bodyLines.length > bodyVisibleRows

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
        <Text color={METHOD_COLOR[log.method] ?? 'white'} bold>{log.method}</Text>
        <Text color={getStatusColor(log.statusCode)} bold>
          {log.statusCode ?? 'pending'}
        </Text>
        {log.duration ? <Text color="gray">{log.duration}ms</Text> : null}
        <Text color="gray" dimColor>{time}</Text>
      </Box>
      <Text color="whiteBright">{log.url.slice(0, width - 2)}</Text>
      {reqHeaders.length > 0
        ?
        <Text color="whiteBright" dimColor>
          req: {reqHeaders.slice(0, 3).map(([k, v]) => `${k}: ${v}`).join('  ')}
        </Text>
        : null
      }
      {resHeaders.length > 0
        ?
        <Text color="whiteBright" dimColor>
          res: {resHeaders.slice(0, 3).map(([k, v]) => `${k}: ${v}`).join('  ')}
        </Text>
        : null
      }
      {bodyLines.length > 0
        ?
        <Box flexDirection="column">
          <Text color="whiteBright" dimColor>
            {'── body'}
            {canScroll ? `  [ = scroll up   ] = scroll down  ·  line ${bodyScrollOffset + 1} of ${bodyLines.length}` : ''}
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
