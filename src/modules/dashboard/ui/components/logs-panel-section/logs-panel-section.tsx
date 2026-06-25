/** @jsxRuntime automatic */
/** @jsxImportSource react */
import type { LogEvent } from "@salve-software/salvetron-types";
import { Panel } from "../../../../../shared/components/panel/index.js";
import { LogList } from "../../../../js-logs/ui/components/log-list/index.js";

interface LogsPanelSectionProps {
  logs: LogEvent[];
  selectedIndex: number;
  scrollOffset: number;
  visibleRows: number;
  maxMessageWidth: number;
  focused: boolean;
}

export function LogsPanelSection({
  logs,
  selectedIndex,
  scrollOffset,
  visibleRows,
  maxMessageWidth,
  focused,
}: LogsPanelSectionProps) {
  return (
    <Panel title="Logs" focused={focused} flexGrow={1}>
      <LogList
        logs={logs}
        visibleRows={visibleRows}
        selectedIndex={selectedIndex}
        scrollOffset={scrollOffset}
        showHeader={false}
        maxMessageWidth={maxMessageWidth}
      />
    </Panel>
  );
}
