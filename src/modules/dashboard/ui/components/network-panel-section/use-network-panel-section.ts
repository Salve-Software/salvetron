import { useCallback, useEffect, useMemo, useRef } from "react";
import type { NetworkLog } from "@salve-software/salvetron-types";
import { useNetworkLogs } from "../../../../network/store/network.store.js";
import { useListNavigation } from "../../../../../shared/hooks/use-list-navigation.js";
import { useDetailPanel } from "../../../../../shared/hooks/use-detail-panel.js";
import { useDeviceFiltered } from "../../../../../shared/hooks/use-device-filtered.js";
import { formatBody, formatPlainBody } from "../../../../../shared/utils/format-body.js";
import { buildCurlCommand } from "../../../../../shared/utils/build-curl-command.js";
import {
  PANEL_CHROME_COLS,
  MIN_PANEL_INNER_WIDTH,
  MIN_NETWORK_URL_WIDTH,
  NETWORK_URL_WIDTH_OFFSET,
  DETAIL_SCROLL_STEP,
} from "../../../library/constants.js";

function getNetworkLogDeviceId(log: NetworkLog): string | undefined {
  return log.deviceId;
}

interface UseNetworkPanelSectionParams {
  focused: boolean;
  isActive: boolean;
  listColWidth: number;
  listVisibleRows: number;
  detailVisibleRows: number;
}

export function useNetworkPanelSection({
  focused,
  isActive,
  listColWidth,
  listVisibleRows,
  detailVisibleRows,
}: UseNetworkPanelSectionParams) {
  const allLogs = useNetworkLogs();
  const logs = useDeviceFiltered(allLogs, getNetworkLogDeviceId);

  const panelInner = Math.max(MIN_PANEL_INNER_WIDTH, listColWidth - PANEL_CHROME_COLS);
  const urlMaxWidth = Math.max(MIN_NETWORK_URL_WIDTH, panelInner - NETWORK_URL_WIDTH_OFFSET);

  const nav = useListNavigation({
    count: logs.length,
    visibleRows: listVisibleRows,
    isActive: focused && isActive,
  });

  const selectedLog = logs[nav.selectedIndex] ?? null;
  const bodyLines = useMemo(() => formatBody(selectedLog?.responseBody), [selectedLog]);

  const linesRef = useRef<string[]>([]);
  const selectedLogRef = useRef<NetworkLog | null>(null);
  linesRef.current = bodyLines;
  selectedLogRef.current = selectedLog;

  const onCopyBody = useCallback(() => {
    const log = selectedLogRef.current;
    return log ? formatPlainBody(log.responseBody) : "";
  }, []);
  const onCopyExtra = useCallback(() => {
    const log = selectedLogRef.current;
    return log ? buildCurlCommand(log) : "";
  }, []);

  const detail = useDetailPanel({
    linesRef,
    visibleRows: detailVisibleRows,
    scrollStep: DETAIL_SCROLL_STEP,
    isActive: focused && isActive,
    onCopyBody,
    onCopyExtra,
  });

  useEffect(() => {
    detail.resetDetailScroll();
  }, [nav.selectedIndex, detail.resetDetailScroll]);

  return {
    logs,
    selectedIndex: nav.selectedIndex,
    scrollOffset: nav.scrollOffset,
    selectedLog,
    bodyLines,
    urlMaxWidth,
    detailOpen: detail.detailOpen,
    detailScrollOffset: detail.detailScrollOffset,
    copyFeedback: detail.copyFeedback,
  };
}
