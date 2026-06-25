/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { Box, Text, useInput } from "ink";
import { useState } from "react";
import { useTerminalSize } from "../../../../../shared/hooks/use-terminal-size.js";
import { PerformancePanel, usePerformancePanel } from "../../components/performance-panel/index.js";
import { LogsPanelSection, useLogsPanelSection } from "../../components/logs-panel-section/index.js";
import { LogDetail } from "../../../../js-logs/ui/components/log-detail/index.js";
import { NetworkPanelSection, useNetworkPanelSection } from "../../components/network-panel-section/index.js";
import { NetworkDetail } from "../../../../network/ui/components/network-detail/index.js";
import { NativePanelSection, useNativePanelSection } from "../../components/native-panel-section/index.js";
import { NativeLogDetail } from "../../../../native-logs/ui/components/native-log-detail/index.js";
import { useIsDeviceSelectorOpen } from "../../../../../shared/store/device-selector.store.js";
import {
  APP_OVERHEAD_ROWS,
  FOOTER_ROWS,
  PERF_PANEL_ROWS,
  PANEL_CHROME_ROWS,
  PANEL_CHROME_COLS,
  NETWORK_HEADER_ROWS,
  DETAIL_FIXED_ROWS,
  APP_HORIZONTAL_PADDING,
  DETAIL_CHROME_COLS,
} from "../../../library/constants.js";

type FocusPanel = "logs" | "network" | "native";
const PANELS: FocusPanel[] = ["logs", "network", "native"];

export function DashboardContainer() {
  const [cols, rows] = useTerminalSize();
  const [focused, setFocused] = useState<FocusPanel>("logs");

  const isDeviceSelectorOpen = useIsDeviceSelectorOpen();
  const isActive = !isDeviceSelectorOpen;

  const rowWidth = Math.max(0, cols - APP_HORIZONTAL_PADDING);
  const listColWidth = Math.floor(rowWidth / 3);
  const detailColWidth = rowWidth - listColWidth;
  const detailContentWidth = Math.max(1, detailColWidth - DETAIL_CHROME_COLS);

  const panelInner = Math.max(10, listColWidth - PANEL_CHROME_COLS);
  const urlMaxWidth = Math.max(6, panelInner - 28);
  const logsMsgWidth = Math.max(8, panelInner - 14);
  const nativeMsgWidth = Math.max(8, panelInner - 26);

  const availableRows = rows - APP_OVERHEAD_ROWS - FOOTER_ROWS;
  const logsPanelRows = Math.max(
    1,
    Math.floor((availableRows - PERF_PANEL_ROWS) / 3) - PANEL_CHROME_ROWS,
  );
  const nativePanelRows = logsPanelRows;
  const networkPanelRows = Math.max(1, logsPanelRows - NETWORK_HEADER_ROWS);

  const detailRows = availableRows;
  const detailBodyVisibleRows = Math.max(1, detailRows - DETAIL_FIXED_ROWS);

  const perf = usePerformancePanel({ listColWidth });

  const logs = useLogsPanelSection({
    focused: focused === "logs",
    isActive,
    listVisibleRows: logsPanelRows,
    detailVisibleRows: detailBodyVisibleRows,
  });
  const network = useNetworkPanelSection({
    focused: focused === "network",
    isActive,
    listVisibleRows: networkPanelRows,
    detailVisibleRows: detailBodyVisibleRows,
  });
  const native = useNativePanelSection({
    focused: focused === "native",
    isActive,
    listVisibleRows: nativePanelRows,
    detailVisibleRows: detailBodyVisibleRows,
  });

  const focusedDetailOpen =
    (focused === "logs" && logs.detailOpen) ||
    (focused === "network" && network.detailOpen) ||
    (focused === "native" && native.detailOpen);

  useInput((_input, key) => {
    if (key.leftArrow) {
      const i = PANELS.indexOf(focused);
      setFocused(PANELS[(i - 1 + PANELS.length) % PANELS.length]);
    }
    if (key.rightArrow) {
      const i = PANELS.indexOf(focused);
      setFocused(PANELS[(i + 1) % PANELS.length]);
    }
  }, { isActive });

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box flexDirection="row" flexGrow={1}>
        <Box flexDirection="column" width={listColWidth} flexShrink={0} overflow="hidden">
          <PerformancePanel
            latest={perf.latest}
            snapshots={perf.snapshots}
            sparkWidth={perf.sparkWidth}
            height={PERF_PANEL_ROWS}
          />

          <LogsPanelSection
            logs={logs.logs}
            selectedIndex={logs.selectedIndex}
            scrollOffset={logs.scrollOffset}
            visibleRows={logsPanelRows}
            maxMessageWidth={logsMsgWidth}
            focused={focused === "logs"}
          />

          <NetworkPanelSection
            logs={network.logs}
            selectedIndex={network.selectedIndex}
            scrollOffset={network.scrollOffset}
            visibleRows={networkPanelRows}
            urlMaxWidth={urlMaxWidth}
            focused={focused === "network"}
          />

          <NativePanelSection
            logs={native.logs}
            selectedIndex={native.selectedIndex}
            scrollOffset={native.scrollOffset}
            visibleRows={nativePanelRows}
            maxMessageWidth={nativeMsgWidth}
            focused={focused === "native"}
          />
        </Box>
        <Box
          flexDirection="column"
          height={focusedDetailOpen ? undefined : 0}
          maxHeight={focusedDetailOpen ? detailRows : 0}
          width={detailColWidth}
          flexShrink={0}
          overflow="hidden"
          borderStyle="single"
          borderColor="gray"
          paddingX={2}
        >
          {focused === "logs" && logs.detailOpen && logs.selectedLog ? (
            <LogDetail
              log={logs.selectedLog}
              width={detailContentWidth}
              metaLines={logs.metaLines}
              metaScrollOffset={logs.detailScrollOffset}
              metaVisibleRows={detailBodyVisibleRows}
              copyFeedback={logs.copyFeedback}
            />
          ) : null}
          {focused === "network" && network.detailOpen && network.selectedLog ? (
            <NetworkDetail
              log={network.selectedLog}
              width={detailContentWidth}
              bodyLines={network.bodyLines}
              bodyScrollOffset={network.detailScrollOffset}
              bodyVisibleRows={detailBodyVisibleRows}
              copyFeedback={network.copyFeedback}
            />
          ) : null}
          {focused === "native" && native.detailOpen && native.selectedLog ? (
            <NativeLogDetail
              log={native.selectedLog}
              width={detailContentWidth}
              metaLines={native.metaLines}
              metaScrollOffset={native.detailScrollOffset}
              metaVisibleRows={detailBodyVisibleRows}
              copyFeedback={native.copyFeedback}
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
