/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { Box, Text } from 'ink'
import { Gauge } from '../../../../../shared/components/gauge/index.js'
import { Sparkline } from '../../../../../shared/components/sparkline/index.js'

interface MetricRowProps {
  label: string
  value: number
  max: number
  unit: string
  values: number[]
  sparkWidth: number
  warnAt?: number
  critAt?: number
}

export function MetricRow({ label, value, max, unit, values, sparkWidth, warnAt, critAt }: MetricRowProps) {
  return (
    <Box gap={1}>
      <Text color="gray">{label}</Text>
      <Gauge value={value} max={max} width={12} warnAt={warnAt} critAt={critAt} />
      <Sparkline values={values} max={max} width={sparkWidth} />
      <Text>{String(Math.round(value)).padStart(4)}{unit}</Text>
    </Box>
  )
}
