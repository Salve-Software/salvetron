/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { Box, Text } from 'ink'
import { useDevice, useConnectionStatus } from '../../store/device.store.js'

export function StatusBar() {
  const device = useDevice()
  const connected = useConnectionStatus()

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
      {connected && device
        ?
        <>
          <Text color="green">● </Text>
          <Text>{device.deviceName} ({device.platform})  ·  port {process.env.SALVETRON_PORT ?? '8765'}</Text>
        </>
        :
        <>
          <Text color="gray">○ </Text>
          <Text color="gray">Waiting for connection on :{process.env.SALVETRON_PORT ?? '8765'}</Text>
        </>
      }
    </Box>
  )
}
