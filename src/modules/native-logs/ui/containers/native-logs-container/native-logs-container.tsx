import { Box } from 'ink'
import { useCallback, useEffect, useRef } from 'react'
import { useTerminalSize } from '../../../../../shared/hooks/use-terminal-size.js'
import { useListNavigation } from '../../../../../shared/hooks/use-list-navigation.js'
import { useDetailPanel } from '../../../../../shared/hooks/use-detail-panel.js'
import { useNativeLogs } from '../../../store/native-logs.store.js'
import { NativeLogList } from '../../components/native-log-list/index.js'
import { NativeLogDetail } from '../../components/native-log-detail/index.js'
import { formatBody, formatPlainBody } from '../../../../../shared/utils/format-body.js'
import type { NativeLogEvent } from '@salve-software/rn-tui-types'

const OVERHEAD_ROWS = 6
const DETAIL_FIXED_ROWS = 3
const MIN_LIST_ROWS = 4

export function NativeLogsContainer() {
  const [cols, rows] = useTerminalSize()
  const logs = useNativeLogs()

  const availableRows = rows - OVERHEAD_ROWS
  const detailHeight = Math.max(DETAIL_FIXED_ROWS + 2, availableRows - MIN_LIST_ROWS)
  const metaVisibleRows = detailHeight - DETAIL_FIXED_ROWS

  const metaLinesRef = useRef<string[]>([])
  const selectedLogRef = useRef<NativeLogEvent | null>(null)

  const onCopyBody = useCallback(() => {
    const log = selectedLogRef.current
    if (!log) return ''
    const meta = log.metadata ? formatPlainBody(JSON.stringify(log.metadata)) : ''
    return meta ? `${log.message}\n\n${meta}` : log.message
  }, [])

  const { detailOpen, detailScrollOffset, resetDetailScroll, copyFeedback } = useDetailPanel({
    linesRef: metaLinesRef,
    visibleRows: metaVisibleRows,
    scrollStep: 5,
    onCopyBody,
  })

  const listRows = detailOpen
    ? Math.max(MIN_LIST_ROWS, availableRows - detailHeight)
    : availableRows

  const { selectedIndex, scrollOffset } = useListNavigation({ count: logs.length, visibleRows: listRows })

  const selectedLog = logs[selectedIndex] ?? null
  const metaLines = selectedLog?.metadata ? formatBody(JSON.stringify(selectedLog.metadata)) : []
  metaLinesRef.current = metaLines
  selectedLogRef.current = selectedLog

  useEffect(() => {
    resetDetailScroll()
  }, [selectedIndex, resetDetailScroll])

  return (
    <Box flexDirection="column">
      <Box flexGrow={1}>
        <NativeLogList
          logs={logs}
          visibleRows={listRows}
          selectedIndex={selectedIndex}
          scrollOffset={scrollOffset}
        />
      </Box>
      {detailOpen && selectedLog
        ?
        <NativeLogDetail
          log={selectedLog}
          width={cols}
          metaLines={metaLines}
          metaScrollOffset={detailScrollOffset}
          metaVisibleRows={metaVisibleRows}
          copyFeedback={copyFeedback}
        />
        : null
      }
    </Box>
  )
}
