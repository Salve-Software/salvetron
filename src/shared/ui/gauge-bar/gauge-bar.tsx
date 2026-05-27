import type { GaugeBarProps } from "./types";

function getBarColor(
  value: number,
  thresholds: GaugeBarProps["thresholds"],
  invertThresholds?: boolean
): string {
  if (invertThresholds) {
    const sortedThresholds = [...thresholds].sort((a, b) => b.value - a.value);
    for (const threshold of sortedThresholds) {
      if (value >= threshold.value) {
        return threshold.color;
      }
    }
  } else {
    const sortedThresholds = [...thresholds].sort((a, b) => a.value - b.value);
    for (const threshold of sortedThresholds) {
      if (value <= threshold.value) {
        return threshold.color;
      }
    }
  }
  return thresholds[thresholds.length - 1].color;
}

export function GaugeBar({
  label,
  value,
  maxValue,
  unit = "",
  thresholds,
  invertThresholds = false,
}: GaugeBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const barColor = getBarColor(value, thresholds, invertThresholds);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-olive-300">{label}</span>
        <span className="text-sm font-medium text-olive-100">
          {value.toFixed(1)}
          {unit}
        </span>
      </div>
      <div className="w-full bg-olive-800 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
