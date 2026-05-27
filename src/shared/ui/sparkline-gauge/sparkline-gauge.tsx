export interface SparklineGaugeProps {
  label: string;
  values: number[];
  maxValue: number;
  currentValue: number;
  unit?: string;
  barCount?: number;
}

export function SparklineGauge({
  label,
  values,
  maxValue,
  currentValue,
  unit = "",
  barCount = 30,
}: SparklineGaugeProps) {
  const displayValues = values.slice(-barCount);

  // Pad with zeros if not enough values
  const paddedValues = [
    ...Array(Math.max(0, barCount - displayValues.length)).fill(0),
    ...displayValues,
  ];

  const formatValue = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value % 1 === 0 ? value.toString() : value.toFixed(1);
  };

  return (
    <div className="flex items-center gap-3 h-8">
      <span className="text-sm text-olive-300 w-20 shrink-0">{label}</span>

      <div className="flex-1 flex items-end gap-[2px] h-5">
        {paddedValues.map((value, index) => {
          const height = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;
          return (
            <div
              key={index}
              className="w-[3px] bg-blue-500 rounded-t-sm transition-all duration-150"
              style={{ height: `${Math.max(height, 2)}%` }}
            />
          );
        })}
      </div>

      <span className="text-sm text-olive-100 font-mono w-20 text-right shrink-0">
        {formatValue(currentValue)}{unit}
      </span>
    </div>
  );
}
