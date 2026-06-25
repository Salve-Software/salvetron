import { useCallback, useEffect, useMemo, useRef } from "react";
import type { NativeLogEvent } from "@salve-software/salvetron-types";
import { useNativeLogs } from "../../../../native-logs/store/native-logs.store.js";
import { useListNavigation } from "../../../../../shared/hooks/use-list-navigation.js";
import { useDetailPanel } from "../../../../../shared/hooks/use-detail-panel.js";
import { useDeviceFiltered } from "../../../../../shared/hooks/use-device-filtered.js";
import { formatBody, formatPlainBody } from "../../../../../shared/utils/format-body.js";
import {
  PANEL_CHROME_COLS,
  MIN_PANEL_INNER_WIDTH,
  MIN_NATIVE_MESSAGE_WIDTH,
  NATIVE_MESSAGE_WIDTH_OFFSET,
  DETAIL_SCROLL_STEP,
} from "../../../library/constants.js";

function getNativeLogDeviceId(log: NativeLogEvent): string | undefined {
  return log.deviceId;
}

interface UseNativePanelSectionParams {
  focused: boolean;
  isActive: boolean;
  listColWidth: number;
  listVisibleRows: number;
  detailVisibleRows: number;
}

export function useNativePanelSection({
  focused,
  isActive,
  listColWidth,
  listVisibleRows,
  detailVisibleRows,
}: UseNativePanelSectionParams) {
  const allLogs = useNativeLogs();
  const logs = useDeviceFiltered(allLogs, getNativeLogDeviceId);

  const panelInner = Math.max(MIN_PANEL_INNER_WIDTH, listColWidth - PANEL_CHROME_COLS);
  const maxMessageWidth = Math.max(MIN_NATIVE_MESSAGE_WIDTH, panelInner - NATIVE_MESSAGE_WIDTH_OFFSET);

  const nav = useListNavigation({
    count: logs.length,
    visibleRows: listVisibleRows,
    isActive: focused && isActive,
  });

  const selectedLog = logs[nav.selectedIndex] ?? null;
  const metaLines = useMemo(
    () => (selectedLog?.metadata ? formatBody(JSON.stringify(selectedLog.metadata)) : []),
    [selectedLog],
  );

  const linesRef = useRef<string[]>([]);
  const selectedLogRef = useRef<NativeLogEvent | null>(null);
  linesRef.current = metaLines;
  selectedLogRef.current = selectedLog;

  const onCopyBody = useCallback(() => {
    const log = selectedLogRef.current;
    if (!log) return "";
    const meta = log.metadata ? formatPlainBody(JSON.stringify(log.metadata)) : "";
    return meta ? `${log.message}\n\n${meta}` : log.message;
  }, []);

  const detail = useDetailPanel({
    linesRef,
    visibleRows: detailVisibleRows,
    scrollStep: DETAIL_SCROLL_STEP,
    isActive: focused && isActive,
    onCopyBody,
  });

  useEffect(() => {
    detail.resetDetailScroll();
  }, [nav.selectedIndex, detail.resetDetailScroll]);

  return {
    logs,
    selectedIndex: nav.selectedIndex,
    scrollOffset: nav.scrollOffset,
    selectedLog,
    metaLines,
    maxMessageWidth,
    detailOpen: detail.detailOpen,
    detailScrollOffset: detail.detailScrollOffset,
    copyFeedback: detail.copyFeedback,
  };
}
