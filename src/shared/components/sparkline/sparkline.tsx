import { Text } from 'ink'

const BLOCKS = ' ▁▂▃▄▅▆▇█'

interface SparklineProps {
  values: number[]
  max: number
  width?: number
  color?: string
}

export function Sparkline({ values, max, width = 20, color = 'green' }: SparklineProps) {
  const padded = [
    ...Array(Math.max(0, width - values.length)).fill(0),
    ...values,
  ].slice(-width)

  const chars = padded
    .map((v) => {
      const ratio = Math.min(1, Math.max(0, v / max))
      return BLOCKS[Math.round(ratio * (BLOCKS.length - 1))]
    })
    .join('')

  return <Text color={color}>{chars}</Text>
}
