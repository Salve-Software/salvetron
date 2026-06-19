import { Box } from 'ink'
import { useEffect, useRef } from 'react'
import { useTerminalSize } from '../../../../../shared/hooks/use-terminal-size.js'
import { useListNavigation } from '../../../../../shared/hooks/use-list-navigation.js'
import { useDetailPanel } from '../../../../../shared/hooks/use-detail-panel.js'
import { useNetworkLogs } from '../../../store/network.store.js'
import { NetworkTableHeader } from '../../components/network-table-header/index.js'
import { NetworkRow } from '../../components/network-row/index.js'
import { NetworkDetail } from '../../components/network-detail/index.js'
import { formatBody } from '../../../../../shared/utils/format-body.js'

const OVERHEAD_ROWS = 6
const DETAIL_FIXED_ROWS = 5
const MIN_LIST_ROWS = 4

export function NetworkContainer() {
  const [cols, rows] = useTerminalSize()
  const logs = useNetworkLogs()

  const availableRows = rows - OVERHEAD_ROWS
  const detailHeight = Math.max(DETAIL_FIXED_ROWS + 2, availableRows - MIN_LIST_ROWS)
  const bodyVisibleRows = detailHeight - DETAIL_FIXED_ROWS

  const bodyLinesRef = useRef<string[]>([])

  const { detailOpen, detailScrollOffset, resetDetailScroll } = useDetailPanel({
    linesRef: bodyLinesRef,
    visibleRows: bodyVisibleRows,
    scrollStep: 5,
  })

  const listRows = detailOpen
    ? Math.max(MIN_LIST_ROWS, availableRows - detailHeight)
    : availableRows

  const { selectedIndex, scrollOffset } = useListNavigation({ count: logs.length, visibleRows: listRows })

  const selectedLog = logs[selectedIndex] ?? null
  const bodyLines = formatBody(selectedLog?.responseBody)
  bodyLinesRef.current = bodyLines

  useEffect(() => {
    resetDetailScroll()
  }, [selectedIndex, resetDetailScroll])

  const visible = logs.slice(scrollOffset, scrollOffset + listRows)

  return (
    <Box flexDirection="column">
      <Box flexGrow={1} flexDirection="column">
        <NetworkTableHeader />
        {visible.map((log, i) => {
          const absoluteIndex = scrollOffset + i
          return (
            <NetworkRow
              key={log.requestId}
              log={log}
              urlMaxWidth={cols - 30}
              isSelected={absoluteIndex === selectedIndex}
            />
          )
        })}
      </Box>
      {detailOpen && selectedLog
        ?
        <NetworkDetail
          log={selectedLog}
          width={cols}
          bodyLines={bodyLines}
          bodyScrollOffset={detailScrollOffset}
          bodyVisibleRows={bodyVisibleRows}
        />
        : null
      }
    </Box>
  )
}
