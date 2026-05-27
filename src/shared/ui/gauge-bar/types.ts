export interface GaugeBarThreshold {
  value: number;
  color: string;
}

export interface GaugeBarProps {
  label: string;
  value: number;
  maxValue: number;
  unit?: string;
  thresholds: GaugeBarThreshold[];
  invertThresholds?: boolean;
}
