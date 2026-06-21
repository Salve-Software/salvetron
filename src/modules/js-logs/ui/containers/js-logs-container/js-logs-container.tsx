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
import { useJsLogs, useJsLogsStore } from '../../../store/js-logs.store.js'
import { JS_LOG_FILTER_GROUPS, matchesJsLog } from '../../../library/filters.js'
import { LogList } from '../../components/log-list/index.js'
import { LogDetail } from '../../components/log-detail/index.js'
import { formatBody, formatPlainBody } from '../../../../../shared/utils/format-body.js'
import type { LogEvent } from '@salve-software/salvetron-types'

const OVERHEAD_ROWS = 6
const DETAIL_FIXED_ROWS = 3
const MIN_LIST_ROWS = 10

export function JsLogsContainer() {
  const [cols, rows] = useTerminalSize()
  const logs = useJsLogs()

  const { isOpen, query, focusedGroupIndex, focusedChipIndex } = useSearchFilter({ groups: JS_LOG_FILTER_GROUPS })
  const { active } = useFilterChips({
    groups: JS_LOG_FILTER_GROUPS,
    focusedGroupIndex,
    focusedChipIndex,
    isActive: isOpen && focusedGroupIndex >= 0,
  })
  const { pending: clearPending } = useClearConfirm({
    onClear: () => useJsLogsStore.getState().clear(),
    isActive: !isOpen,
  })

  const filtered = useMemo(
    () => logs.filter((log) => matchesJsLog(log, query, active)),
    [logs, query, active],
  )

  const barRows = isOpen ? 1 + JS_LOG_FILTER_GROUPS.length + 1 : 0
  const clearRows = clearPending ? 1 : 0
  const availableRows = rows - OVERHEAD_ROWS - barRows - clearRows
  const detailHeight = Math.max(DETAIL_FIXED_ROWS + 2, availableRows - MIN_LIST_ROWS)
  const metaVisibleRows = detailHeight - DETAIL_FIXED_ROWS

  const metaLinesRef = useRef<string[]>([])
  const selectedLogRef = useRef<LogEvent | null>(null)

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
    isActive: !isOpen,
    onCopyBody,
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
  const metaLines = selectedLog?.metadata ? formatBody(JSON.stringify(selectedLog.metadata)) : []
  metaLinesRef.current = metaLines
  selectedLogRef.current = selectedLog

  useEffect(() => {
    resetDetailScroll()
  }, [selectedIndex, resetDetailScroll])

  return (
    <Box flexDirection="column">
      {isOpen
        ?
        <Box flexDirection="column">
          <SearchBar query={query} width={cols} resultCount={filtered.length} totalCount={logs.length} />
          <FilterBar
            groups={JS_LOG_FILTER_GROUPS}
            active={active}
            focusedGroupIndex={focusedGroupIndex}
            focusedChipIndex={focusedChipIndex}
          />
        </Box>
        : null
      }
      <Box flexGrow={1}>
        <LogList
          logs={filtered}
          visibleRows={listRows}
          selectedIndex={selectedIndex}
          scrollOffset={scrollOffset}
        />
      </Box>
      {clearPending ? <Text color="yellow">⚠ press x again to clear · esc to cancel</Text> : null}
      {detailOpen && selectedLog
        ?
        <LogDetail
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
