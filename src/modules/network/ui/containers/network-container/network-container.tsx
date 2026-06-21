/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { Box, Text } from 'ink'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useTerminalSize } from '../../../../../shared/hooks/use-terminal-size.js'
import { useListNavigation } from '../../../../../shared/hooks/use-list-navigation.js'
import { useDetailPanel } from '../../../../../shared/hooks/use-detail-panel.js'
import { useSearchFilter } from '../../../../../shared/hooks/use-search-filter.js'
import { useFilterChips } from '../../../../../shared/hooks/use-filter-chips.js'
import { useClearConfirm } from '../../../../../shared/hooks/use-clear-confirm.js'
import { SearchBar } from '../../../../../shared/components/search-bar/index.js'
import { FilterBar } from '../../../../../shared/components/filter-bar/index.js'
import { useNetworkLogs, useNetworkStore } from '../../../store/network.store.js'
import { NETWORK_FILTER_GROUPS, matchesNetworkLog } from '../../../library/filters.js'
import { NetworkTableHeader } from '../../components/network-table-header/index.js'
import { NetworkRow } from '../../components/network-row/index.js'
import { NetworkDetail } from '../../components/network-detail/index.js'
import { formatBody, formatPlainBody } from '../../../../../shared/utils/format-body.js'
import { buildCurlCommand } from '../../../../../shared/utils/build-curl-command.js'
import type { NetworkLog } from '@salve-software/salvetron-types'

const OVERHEAD_ROWS = 6
const DETAIL_FIXED_ROWS = 5
const MIN_LIST_ROWS = 4

export function NetworkContainer() {
  const [cols, rows] = useTerminalSize()
  const logs = useNetworkLogs()

  const { isOpen, query, focusedGroupIndex, focusedChipIndex } = useSearchFilter({ groups: NETWORK_FILTER_GROUPS })
  const { active } = useFilterChips({
    groups: NETWORK_FILTER_GROUPS,
    focusedGroupIndex,
    focusedChipIndex,
    isActive: isOpen && focusedGroupIndex >= 0,
  })
  const { pending: clearPending } = useClearConfirm({
    onClear: () => useNetworkStore.getState().clear(),
    isActive: !isOpen,
  })

  const filtered = useMemo(
    () => logs.filter((log) => matchesNetworkLog(log, query, active)),
    [logs, query, active],
  )

  const barRows = isOpen ? 1 + NETWORK_FILTER_GROUPS.length + 1 : 0
  const clearRows = clearPending ? 1 : 0
  const availableRows = rows - OVERHEAD_ROWS - barRows - clearRows
  const detailHeight = Math.max(DETAIL_FIXED_ROWS + 2, availableRows - MIN_LIST_ROWS)
  const bodyVisibleRows = detailHeight - DETAIL_FIXED_ROWS

  const bodyLinesRef = useRef<string[]>([])
  const selectedLogRef = useRef<NetworkLog | null>(null)

  const onCopyBody = useCallback(() => {
    const log = selectedLogRef.current
    return log ? formatPlainBody(log.responseBody) : ''
  }, [])
  const onCopyExtra = useCallback(() => {
    const log = selectedLogRef.current
    return log ? buildCurlCommand(log) : ''
  }, [])

  const { detailOpen, detailScrollOffset, resetDetailScroll, copyFeedback } = useDetailPanel({
    linesRef: bodyLinesRef,
    visibleRows: bodyVisibleRows,
    scrollStep: 5,
    isActive: !isOpen,
    onCopyBody,
    onCopyExtra,
  })

  const listRows = detailOpen
    ? Math.max(MIN_LIST_ROWS, availableRows - detailHeight)
    : availableRows

  const { selectedIndex, scrollOffset } = useListNavigation({
    count: filtered.length,
    visibleRows: listRows,
    isActive: !isOpen,
  })

  const selectedLog = filtered[selectedIndex] ?? null
  const bodyLines = formatBody(selectedLog?.responseBody)
  bodyLinesRef.current = bodyLines
  selectedLogRef.current = selectedLog

  useEffect(() => {
    resetDetailScroll()
  }, [selectedIndex, resetDetailScroll])

  const visible = filtered.slice(scrollOffset, scrollOffset + listRows)

  return (
    <Box flexDirection="column">
      {isOpen
        ?
        <Box flexDirection="column">
          <SearchBar query={query} width={cols} resultCount={filtered.length} totalCount={logs.length} />
          <FilterBar
            groups={NETWORK_FILTER_GROUPS}
            active={active}
            focusedGroupIndex={focusedGroupIndex}
            focusedChipIndex={focusedChipIndex}
          />
        </Box>
        : null
      }
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
      {clearPending ? <Text color="yellow">⚠ press x again to clear · esc to cancel</Text> : null}
      {detailOpen && selectedLog
        ?
        <NetworkDetail
          log={selectedLog}
          width={cols}
          bodyLines={bodyLines}
          bodyScrollOffset={detailScrollOffset}
          bodyVisibleRows={bodyVisibleRows}
          copyFeedback={copyFeedback}
        />
        : null
      }
    </Box>
  )
}
