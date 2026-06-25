/** @jsxRuntime automatic */
/** @jsxImportSource react */
import type { NetworkLog } from "@salve-software/salvetron-types";
import { Panel } from "../../../../../shared/components/panel/index.js";
import { NetworkTableHeader } from "../../../../network/ui/components/network-table-header/index.js";
import { NetworkRow } from "../../../../network/ui/components/network-row/index.js";

interface NetworkPanelSectionProps {
  logs: NetworkLog[];
  selectedIndex: number;
  scrollOffset: number;
  visibleRows: number;
  urlMaxWidth: number;
  focused: boolean;
}

export function NetworkPanelSection({
  logs,
  selectedIndex,
  scrollOffset,
  visibleRows,
  urlMaxWidth,
  focused,
}: NetworkPanelSectionProps) {
  return (
    <Panel title="Network" focused={focused} flexGrow={1}>
      <NetworkTableHeader />
      {logs
        .slice(scrollOffset, scrollOffset + visibleRows)
        .map((log, i) => {
          const absoluteIndex = scrollOffset + i;
          return (
            <NetworkRow
              key={log.requestId}
              log={log}
              urlMaxWidth={urlMaxWidth}
              isSelected={absoluteIndex === selectedIndex}
            />
          );
        })}
    </Panel>
  );
}
