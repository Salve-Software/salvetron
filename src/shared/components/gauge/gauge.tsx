import { Text } from 'ink'

interface GaugeProps {
  value: number
  max: number
  width?: number
  warnAt?: number
  critAt?: number
}

export function Gauge({ value, max, width = 12, warnAt = 0.7, critAt = 0.9 }: GaugeProps) {
  const ratio = Math.min(1, Math.max(0, value / max))
  const filled = Math.round(ratio * width)
  const bar = ':'.repeat(filled) + '.'.repeat(width - filled)
  const color = ratio >= critAt ? 'red' : ratio >= warnAt ? 'yellow' : 'green'

  return <Text color={color}>{bar}</Text>
}
