import type { ComponentNode } from "@mako/types";

export interface ComponentMetricsPanelProps {
  component: ComponentNode | null;
}

function MetricRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string | React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-olive-800">
      <span className="text-sm text-olive-400">{label}</span>
      <span className={`text-sm font-medium ${valueClassName || "text-olive-200"}`}>
        {value}
      </span>
    </div>
  );
}

export function ComponentMetricsPanel({ component }: ComponentMetricsPanelProps) {
  if (!component) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <span className="text-olive-500 text-sm">Select a component to view metrics</span>
      </div>
    );
  }

  const { name, metrics } = component;

  return (
    <div className="flex flex-col h-full overflow-auto p-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-olive-100 mb-1">{name}</h3>
        <span className="text-xs text-olive-500">Component Metrics</span>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h4 className="text-xs font-semibold text-olive-300 uppercase mb-2">
            Rendering
          </h4>
          <div className="bg-olive-900/40 rounded-lg p-3">
            <MetricRow label="Render Count" value={metrics.renderCount} />
            <MetricRow
              label="Average Time"
              value={`${metrics.averageRenderTime.toFixed(2)}ms`}
            />
            <MetricRow
              label="Last Render"
              value={`${metrics.lastRenderTime.toFixed(2)}ms`}
            />
            <MetricRow
              label="Total Time"
              value={`${metrics.totalRenderTime.toFixed(2)}ms`}
            />
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-olive-300 uppercase mb-2">
            State Changes
          </h4>
          <div className="bg-olive-900/40 rounded-lg p-3">
            <MetricRow
              label="Props Changed"
              value={
                metrics.propsChangeCount > 0
                  ?
                  <span className="text-yellow-400">{metrics.propsChangeCount}</span>
                  : <span className="text-olive-600">0</span>
              }
            />
            <MetricRow
              label="State Changed"
              value={
                metrics.stateChangeCount > 0
                  ?
                  <span className="text-yellow-400">{metrics.stateChangeCount}</span>
                  : <span className="text-olive-600">0</span>
              }
            />
            <MetricRow
              label="Context Changed"
              value={
                metrics.contextChangeCount > 0
                  ?
                  <span className="text-yellow-400">{metrics.contextChangeCount}</span>
                  : <span className="text-olive-600">0</span>
              }
            />
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-olive-300 uppercase mb-2">
            Optimization
          </h4>
          <div className="bg-olive-900/40 rounded-lg p-3">
            <MetricRow
              label="Memoized"
              value={
                metrics.isMemoized
                  ?
                  <span className="text-green-400">Yes ({metrics.memoType})</span>
                  : <span className="text-red-400">No</span>
              }
            />
            <MetricRow
              label="Heat Level"
              value={
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    metrics.heatLevel === "critical"
                      ? "bg-red-500/20 text-red-400"
                      : metrics.heatLevel === "hot"
                        ? "bg-orange-500/20 text-orange-400"
                        : metrics.heatLevel === "warm"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {metrics.heatLevel}
                </span>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
