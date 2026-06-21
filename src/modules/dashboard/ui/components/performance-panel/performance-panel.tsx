import { Text } from "ink";
import type { PerformanceMetricsEvent } from "@salve-software/salvetron-types";
import { Panel } from "../../../../../shared/components/panel/index.js";
import { MetricRow } from "../metric-row/index.js";

interface PerformancePanelProps {
  latest: PerformanceMetricsEvent | null;
  snapshots: PerformanceMetricsEvent[];
  sparkWidth: number;
  height: number;
}

export function PerformancePanel({
  latest,
  snapshots,
  sparkWidth,
  height,
}: PerformancePanelProps) {
  return (
    <Panel title="Performance" height={height}>
      {latest ? (
        <>
          <MetricRow
            label="UI FPS"
            value={latest.uiFps}
            max={60}
            unit="fps"
            values={snapshots.map((s) => s.uiFps)}
            sparkWidth={sparkWidth}
          />
          <MetricRow
            label="JS FPS"
            value={latest.jsFps}
            max={60}
            unit="fps"
            values={snapshots.map((s) => s.jsFps)}
            sparkWidth={sparkWidth}
          />
          <MetricRow
            label="RAM   "
            value={latest.memoryUsage}
            max={512}
            unit="MB"
            values={snapshots.map((s) => s.memoryUsage)}
            sparkWidth={sparkWidth}
            warnAt={0.6}
            critAt={0.85}
          />
          <MetricRow
            label="CPU   "
            value={latest.cpuUsage}
            max={100}
            unit="%"
            values={snapshots.map((s) => s.cpuUsage)}
            sparkWidth={sparkWidth}
            warnAt={0.6}
            critAt={0.8}
          />
        </>
      ) : (
        <Text color="gray" dimColor>
          Waiting for performance data...
        </Text>
      )}
    </Panel>
  );
}
