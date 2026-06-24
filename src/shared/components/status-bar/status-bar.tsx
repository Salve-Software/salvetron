/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { Box, Text } from 'ink'
import { useSelectedDevice, useConnectedDeviceCount } from '../../store/device.store.js'

export function StatusBar() {
  const selected = useSelectedDevice()
  const connectedCount = useConnectedDeviceCount()
  const port = process.env.SALVETRON_PORT ?? '8765'

  return (
    <Box
      borderStyle="single"
      borderColor="gray"
      borderTop={true}
      borderBottom={false}
      borderLeft={false}
      borderRight={false}
      paddingX={1}
    >
      {selected
        ?
        <>
          <Text color={selected.connected ? 'green' : 'gray'}>{selected.connected ? '● ' : '○ '}</Text>
          <Text>{selected.device.deviceName} ({selected.device.platform})</Text>
          <Text dimColor>  ·  {connectedCount} device{connectedCount === 1 ? '' : 's'} connected  ·  d to switch  ·  port {port}</Text>
        </>
        :
        <>
          <Text color="gray">○ </Text>
          <Text color="gray">Waiting for connection on :{port}</Text>
        </>
      }
    </Box>
  )
}
