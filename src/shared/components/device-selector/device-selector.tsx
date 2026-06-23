/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { Box, Text, useInput } from 'ink'
import { useEffect, useState } from 'react'
import { useDevices, useSelectedDeviceId, useDeviceStore } from '../../store/device.store.js'
import { useDeviceSelectorStore } from '../../store/device-selector.store.js'

export function DeviceSelector() {
  const devices = useDevices()
  const selectedDeviceId = useSelectedDeviceId()
  const [focusedIndex, setFocusedIndex] = useState(0)

  useEffect(() => {
    const selectedIndex = devices.findIndex((d) => d.device.deviceId === selectedDeviceId)
    setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0)
  }, [])

  useInput((_input, key) => {
    if (key.escape) {
      useDeviceSelectorStore.getState().close()
      return
    }
    if (key.upArrow) {
      setFocusedIndex((i) => Math.max(0, i - 1))
      return
    }
    if (key.downArrow) {
      setFocusedIndex((i) => Math.min(devices.length - 1, i + 1))
      return
    }
    if (key.return) {
      const target = devices[focusedIndex]
      if (target) {
        useDeviceStore.getState().selectDevice(target.device.deviceId)
        useDeviceSelectorStore.getState().close()
      }
    }
  })

  return (
    <Box flexDirection="column" borderStyle="single" borderColor="cyan" paddingX={1}>
      <Text color="cyan" bold>Select device</Text>
      {devices.length === 0
        ?
        <Text dimColor>No devices connected yet</Text>
        : null
      }
      {devices.map((entry, index) =>
        <Box key={entry.device.deviceId}>
          <Text color={entry.connected ? 'green' : 'gray'}>{entry.connected ? '● ' : '○ '}</Text>
          <Text
            bold={index === focusedIndex}
            color={index === focusedIndex ? 'cyan' : undefined}
            inverse={entry.device.deviceId === selectedDeviceId}
          >
            {entry.device.deviceName} ({entry.device.platform})
          </Text>
        </Box>
      )}
      <Text dimColor>↑↓ navigate · enter select · esc close</Text>
    </Box>
  )
}
