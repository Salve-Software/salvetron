import { Box, Text, useInput } from "ink";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTerminalSize } from "../../../../../shared/hooks/use-terminal-size.js";
import { useListNavigation } from "../../../../../shared/hooks/use-list-navigation.js";
import { useDetailPanel } from "../../../../../shared/hooks/use-detail-panel.js";
import { Panel } from "../../../../../shared/components/panel/index.js";
import { formatBody, formatPlainBody } from "../../../../../shared/utils/format-body.js";
import { buildCurlCommand } from "../../../../../shared/utils/build-curl-command.js";
import {
  useDashboardSnapshots,
  useLatestSnapshot,
} from "../../../store/dashboard.store.js";
import { PerformancePanel } from "../../components/performance-panel/index.js";
import { useJsLogs } from "../../../../js-logs/store/js-logs.store.js";
import { LogList } from "../../../../js-logs/ui/components/log-list/index.js";
import { LogDetail } from "../../../../js-logs/ui/components/log-detail/index.js";
import { useNetworkLogs } from "../../../../network/store/network.store.js";
import { NetworkTableHeader } from "../../../../network/ui/components/network-table-header/index.js";
import { NetworkRow } from "../../../../network/ui/components/network-row/index.js";
import { NetworkDetail } from "../../../../network/ui/components/network-detail/index.js";
import { useNativeLogs } from "../../../../native-logs/store/native-logs.store.js";
import { NativeLogList } from "../../../../native-logs/ui/components/native-log-list/index.js";
import { NativeLogDetail } from "../../../../native-logs/ui/components/native-log-detail/index.js";
import type { LogEvent, NativeLogEvent, NetworkLog } from "@salve-software/mako-types";

type FocusPanel = "logs" | "network" | "native";
const PANELS: FocusPanel[] = ["logs", "network", "native"];

// Chrome rendered by App around DashboardContainer's content area:
// AsciiLogo (6) + TabBar (marginTop 2 + content 1 + borderBottom 1 = 4) +
// content wrapper paddingTop (1) = 11 above; StatusBar (borderTop 1 +
// content 1 = 2) + content wrapper paddingBottom (1) = 3 below.
const APP_OVERHEAD_ROWS = 14;
const FOOTER_ROWS = 1;
const PERF_PANEL_ROWS = 7;
const PANEL_CHROME_ROWS = 3; // title (1) + border (2) per list Panel
const NETWORK_HEADER_ROWS = 1;
// NetworkDetail's leading content (border + header + url + req headers + res
// headers + body header) can take up to 6 rows, plus the wrapper Box's own
// top/bottom border (2 rows) — use that as the shared budget for all 3 detail
// types so content never exceeds maxHeight (overflow="hidden" + an
// over-budget frame corrupts Ink's redraw).
const DETAIL_FIXED_ROWS = 8;

export function DashboardContainer() {
  const [cols, rows] = useTerminalSize();
  const [focused, setFocused] = useState<FocusPanel>("logs");

  const snapshots = useDashboardSnapshots();
  const latest = useLatestSnapshot();
  const jsLogs = useJsLogs();
  const networkLogs = useNetworkLogs();
  const nativeLogs = useNativeLogs();

  const panelInner = Math.max(10, Math.floor(cols / 3) - 4);
  const sparkWidth = Math.max(4, panelInner - 27);
  const urlMaxWidth = Math.max(6, panelInner - 28);
  const logsMsgWidth = Math.max(8, panelInner - 14);
  const nativeMsgWidth = Math.max(8, panelInner - 26);

  // Row budget derived only from the terminal's real row count — never from
  // measured/rendered content, which would feed back into itself and loop.
  const availableRows = rows - APP_OVERHEAD_ROWS - FOOTER_ROWS;
  const logsPanelRows = Math.max(
    1,
    Math.floor((availableRows - PERF_PANEL_ROWS) / 3) - PANEL_CHROME_ROWS,
  );
  const nativePanelRows = logsPanelRows;
  const networkPanelRows = Math.max(1, logsPanelRows - NETWORK_HEADER_ROWS);

  const detailRows = availableRows;
  const detailBodyVisibleRows = Math.max(1, detailRows - DETAIL_FIXED_ROWS);

  const logsLinesRef = useRef<string[]>([]);
  const netLinesRef = useRef<string[]>([]);
  const nativeLinesRef = useRef<string[]>([]);

  const selLogRef = useRef<LogEvent | null>(null);
  const selNetRef = useRef<NetworkLog | null>(null);
  const selNativeRef = useRef<NativeLogEvent | null>(null);

  const onCopyLogBody = useCallback(() => {
    const log = selLogRef.current;
    if (!log) return "";
    const meta = log.metadata ? formatPlainBody(JSON.stringify(log.metadata)) : "";
    return meta ? `${log.message}\n\n${meta}` : log.message;
  }, []);
  const onCopyNativeBody = useCallback(() => {
    const log = selNativeRef.current;
    if (!log) return "";
    const meta = log.metadata ? formatPlainBody(JSON.stringify(log.metadata)) : "";
    return meta ? `${log.message}\n\n${meta}` : log.message;
  }, []);
  const onCopyNetBody = useCallback(() => {
    const log = selNetRef.current;
    return log ? formatPlainBody(log.responseBody) : "";
  }, []);
  const onCopyNetExtra = useCallback(() => {
    const log = selNetRef.current;
    return log ? buildCurlCommand(log) : "";
  }, []);

  const logsDetail = useDetailPanel({
    linesRef: logsLinesRef,
    visibleRows: detailBodyVisibleRows,
    scrollStep: 5,
    isActive: focused === "logs",
    onCopyBody: onCopyLogBody,
  });
  const netDetail = useDetailPanel({
    linesRef: netLinesRef,
    visibleRows: detailBodyVisibleRows,
    scrollStep: 5,
    isActive: focused === "network",
    onCopyBody: onCopyNetBody,
    onCopyExtra: onCopyNetExtra,
  });
  const nativeDetail = useDetailPanel({
    linesRef: nativeLinesRef,
    visibleRows: detailBodyVisibleRows,
    scrollStep: 5,
    isActive: focused === "native",
    onCopyBody: onCopyNativeBody,
  });

  const focusedDetailOpen =
    (focused === "logs" && logsDetail.detailOpen) ||
    (focused === "network" && netDetail.detailOpen) ||
    (focused === "native" && nativeDetail.detailOpen);

  const logsNav = useListNavigation({
    count: jsLogs.length,
    visibleRows: logsPanelRows,
    isActive: focused === "logs",
  });
  const netNav = useListNavigation({
    count: networkLogs.length,
    visibleRows: networkPanelRows,
    isActive: focused === "network",
  });
  const nativeNav = useListNavigation({
    count: nativeLogs.length,
    visibleRows: nativePanelRows,
    isActive: focused === "native",
  });

  const selLog = jsLogs[logsNav.selectedIndex] ?? null;
  const selNet = networkLogs[netNav.selectedIndex] ?? null;
  const selNative = nativeLogs[nativeNav.selectedIndex] ?? null;

  const logMeta = useMemo(
    () => (selLog?.metadata ? formatBody(JSON.stringify(selLog.metadata)) : []),
    [selLog],
  );
  const netBody = useMemo(() => formatBody(selNet?.responseBody), [selNet]);
  const nativeMeta = useMemo(
    () => (selNative?.metadata ? formatBody(JSON.stringify(selNative.metadata)) : []),
    [selNative],
  );
  logsLinesRef.current = logMeta;
  netLinesRef.current = netBody;
  nativeLinesRef.current = nativeMeta;
  selLogRef.current = selLog;
  selNetRef.current = selNet;
  selNativeRef.current = selNative;

  useEffect(() => {
    logsDetail.resetDetailScroll();
  }, [logsNav.selectedIndex, logsDetail.resetDetailScroll]);
  useEffect(() => {
    netDetail.resetDetailScroll();
  }, [netNav.selectedIndex, netDetail.resetDetailScroll]);
  useEffect(() => {
    nativeDetail.resetDetailScroll();
  }, [nativeNav.selectedIndex, nativeDetail.resetDetailScroll]);

  useInput((_input, key) => {
    if (key.leftArrow) {
      const i = PANELS.indexOf(focused);
      setFocused(PANELS[(i - 1 + PANELS.length) % PANELS.length]);
    }
    if (key.rightArrow) {
      const i = PANELS.indexOf(focused);
      setFocused(PANELS[(i + 1) % PANELS.length]);
    }
  });

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box flexDirection="row" flexGrow={1}>
        <Box flexDirection="column">
          <PerformancePanel
            latest={latest}
            snapshots={snapshots}
            sparkWidth={sparkWidth}
            height={PERF_PANEL_ROWS}
          />

          <Panel title="Logs" focused={focused === "logs"} flexGrow={1}>
            <LogList
              logs={jsLogs}
              visibleRows={logsPanelRows}
              selectedIndex={logsNav.selectedIndex}
              scrollOffset={logsNav.scrollOffset}
              showHeader={false}
              maxMessageWidth={logsMsgWidth}
            />
          </Panel>

          <Panel title="Network" focused={focused === "network"} flexGrow={1}>
            <NetworkTableHeader />
            {networkLogs
              .slice(
                netNav.scrollOffset,
                netNav.scrollOffset + networkPanelRows,
              )
              .map((log, i) => {
                const absoluteIndex = netNav.scrollOffset + i;
                return (
                  <NetworkRow
                    key={log.requestId}
                    log={log}
                    urlMaxWidth={urlMaxWidth}
                    isSelected={absoluteIndex === netNav.selectedIndex}
                  />
                );
              })}
          </Panel>

          <Panel title="Native" focused={focused === "native"} flexGrow={1}>
            <NativeLogList
              logs={nativeLogs}
              visibleRows={nativePanelRows}
              selectedIndex={nativeNav.selectedIndex}
              scrollOffset={nativeNav.scrollOffset}
              showHeader={false}
              maxMessageWidth={nativeMsgWidth}
            />
          </Panel>
        </Box>
        <Box
          flexDirection="column"
          height={focusedDetailOpen ? undefined : 0}
          maxHeight={focusedDetailOpen ? detailRows : 0}
          overflow="hidden"
          flexGrow={1}
          borderStyle="single"
          borderColor="gray"
          paddingX={2}
        >
          {focused === "logs" && logsDetail.detailOpen && selLog ? (
            <LogDetail
              log={selLog}
              width={cols}
              metaLines={logMeta}
              metaScrollOffset={logsDetail.detailScrollOffset}
              metaVisibleRows={detailBodyVisibleRows}
              copyFeedback={logsDetail.copyFeedback}
            />
          ) : null}
          {focused === "network" && netDetail.detailOpen && selNet ? (
            <NetworkDetail
              log={selNet}
              width={cols}
              bodyLines={netBody}
              bodyScrollOffset={netDetail.detailScrollOffset}
              bodyVisibleRows={detailBodyVisibleRows}
              copyFeedback={netDetail.copyFeedback}
            />
          ) : null}
          {focused === "native" && nativeDetail.detailOpen && selNative ? (
            <NativeLogDetail
              log={selNative}
              width={cols}
              metaLines={nativeMeta}
              metaScrollOffset={nativeDetail.detailScrollOffset}
              metaVisibleRows={detailBodyVisibleRows}
              copyFeedback={nativeDetail.copyFeedback}
            />
          ) : null}
        </Box>
      </Box>
      <Box>
        <Text color="whiteBright" dimColor>
          ←→ panel · ↑↓ navigate · ↵ open · esc close · [ ] scroll detail · c copy{focused === "network" ? " · u curl" : ""}
        </Text>
      </Box>
    </Box>
  );
}
