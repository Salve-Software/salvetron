import { randomUUID } from 'node:crypto'
import { WebSocketServer, type WebSocket } from 'ws'
import type { ProjectInfoEvent, RnTuiEvent } from '@salve-software/salvetron-types'
import { useJsLogsStore } from '../modules/js-logs/store/js-logs.store.js'
import { useNativeLogsStore } from '../modules/native-logs/store/native-logs.store.js'
import { useNetworkStore } from '../modules/network/store/network.store.js'
import { useDashboardStore } from '../modules/dashboard/store/dashboard.store.js'
import { useDeviceStore } from '../shared/store/device.store.js'

interface SocketState {
  deviceId?: string
  pendingProjectInfo?: ProjectInfoEvent
}

export function startWsServer(port: number) {
  const wss = new WebSocketServer({ port, host: '0.0.0.0' })
  const socketState = new Map<WebSocket, SocketState>()

  wss.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} already in use. Set SALVETRON_PORT env var to change port.`)
      process.exit(1)
    }
  })

  wss.on('connection', (socket) => {
    socketState.set(socket, {})

    socket.on('message', (raw) => {
      try {
        const event: RnTuiEvent = JSON.parse(raw.toString())
        dispatch(event, socket, socketState)
      } catch {}
    })

    socket.on('close', () => {
      const state = socketState.get(socket)
      if (state?.deviceId) {
        useDeviceStore.getState().setDeviceDisconnected(state.deviceId)
      }
      socketState.delete(socket)
    })
  })
}

function dispatch(event: RnTuiEvent, socket: WebSocket, socketState: Map<WebSocket, SocketState>) {
  const state = socketState.get(socket) ?? {}

  switch (event.type) {
    case 'device_info': {
      const deviceId = event.deviceId ?? randomUUID()
      state.deviceId = deviceId
      useDeviceStore.getState().upsertDevice({ ...event, deviceId })
      if (state.pendingProjectInfo) {
        useDeviceStore.getState().setProjectInfo(deviceId, state.pendingProjectInfo)
        state.pendingProjectInfo = undefined
      }
      socketState.set(socket, state)
      break
    }
    case 'project_info': {
      if (state.deviceId) {
        useDeviceStore.getState().setProjectInfo(state.deviceId, event)
      } else {
        state.pendingProjectInfo = event
        socketState.set(socket, state)
      }
      break
    }
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
