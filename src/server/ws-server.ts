import { WebSocketServer } from 'ws'
import type { RnTuiEvent } from '@salve-software/rn-tui-types'
import { useJsLogsStore } from '../modules/js-logs/store/js-logs.store.js'
import { useNativeLogsStore } from '../modules/native-logs/store/native-logs.store.js'
import { useNetworkStore } from '../modules/network/store/network.store.js'
import { useDashboardStore } from '../modules/dashboard/store/dashboard.store.js'
import { useDeviceStore } from '../shared/store/device.store.js'

export function startWsServer(port: number) {
  const wss = new WebSocketServer({ port, host: '0.0.0.0' })

  wss.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} already in use. Set RN_TUI_PORT env var to change port.`)
      process.exit(1)
    }
  })

  wss.on('connection', (socket) => {
    socket.on('message', (raw) => {
      try {
        const event: RnTuiEvent = JSON.parse(raw.toString())
        dispatch(event)
      } catch {}
    })

    socket.on('close', () => {
      useDeviceStore.getState().setDisconnected()
    })
  })
}

function dispatch(event: RnTuiEvent) {
  switch (event.type) {
    case 'device_info':
    case 'project_info':
      useDeviceStore.getState().setInfo(event)
      break
    case 'log':
      useJsLogsStore.getState().addLog(event)
      break
    case 'native':
      useNativeLogsStore.getState().addLog(event)
      break
    case 'network':
      useNetworkStore.getState().addOrUpdateLog(event)
      break
    case 'performance_metrics':
      useDashboardStore.getState().addSnapshot(event)
      break
  }
}
