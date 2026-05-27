import type { PerformanceSnapshot } from "@mako/types";

interface PerformanceMetricsCardProps {
  snapshot: PerformanceSnapshot | null;
}

export function PerformanceMetricsCard({ snapshot }: PerformanceMetricsCardProps) {
  if (!snapshot) {
    return (
      <div className="flex items-center justify-center h-full text-olive-400">
        No performance data available
      </div>
    );
  }

  const getHealthColor = (level: string) => {
    switch (level) {
      case "good":
        return "text-green-400";
      case "moderate":
        return "text-yellow-400";
      case "poor":
        return "text-orange-400";
      case "critical":
        return "text-red-400";
      default:
        return "text-olive-400";
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-olive-300">Health Level</span>
        <span className={`text-lg font-semibold uppercase ${getHealthColor(snapshot.healthLevel)}`}>
          {snapshot.healthLevel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-olive-400">UI FPS</span>
          <span className="text-2xl font-mono text-olive-100">
            {snapshot.uiFps.toFixed(1)}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-olive-400">JS FPS</span>
          <span className="text-2xl font-mono text-olive-100">
            {snapshot.jsFps.toFixed(1)}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-olive-400">Memory</span>
          <span className="text-2xl font-mono text-olive-100">
            {snapshot.memoryUsage.toFixed(0)}
            <span className="text-sm text-olive-400 ml-1">MB</span>
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-olive-400">CPU</span>
          <span className="text-2xl font-mono text-olive-100">
            {snapshot.cpuUsage.toFixed(1)}
            <span className="text-sm text-olive-400 ml-1">%</span>
          </span>
        </div>
      </div>
    </div>
  );
}
