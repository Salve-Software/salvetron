import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import type { WebSocket } from 'ws'
import type { RnTuiEvent } from '@salve-software/salvetron-types'
import { dispatch } from '../ws-server.js'
import { useDeviceStore } from '../../shared/store/device.store.js'
import { useJsLogsStore } from '../../modules/js-logs/store/js-logs.store.js'
import { useNetworkStore } from '../../modules/network/store/network.store.js'

function fakeSocket() {
  return {} as WebSocket
}

beforeEach(() => {
  useDeviceStore.setState({ devices: {}, selectedDeviceId: null })
  useJsLogsStore.getState().clear()
  useNetworkStore.getState().clear()
})

describe('ws-server dispatch', () => {
  it('registers a device on device_info and keeps an explicit deviceId on telemetry', () => {
    const socket = fakeSocket()
    const socketState = new Map()

    dispatch({ type: 'device_info', deviceId: 'device-A', deviceName: 'iPhone', platform: 'ios' } as RnTuiEvent, socket, socketState)
    dispatch({ type: 'log', deviceId: 'device-A', timestamp: 1, level: 'info', source: 'js', message: 'hello' } as RnTuiEvent, socket, socketState)

    assert.equal(useJsLogsStore.getState().logs[0]?.deviceId, 'device-A')
  })

  it('inherits the socket registered deviceId when telemetry omits it', () => {
    const socket = fakeSocket()
    const socketState = new Map()

    dispatch({ type: 'device_info', deviceName: 'Mystery Device', platform: 'ios' } as RnTuiEvent, socket, socketState)
    const { deviceId } = socketState.get(socket) ?? {}
    assert.ok(deviceId, 'server should assign a deviceId when device_info omits one')

    dispatch({ type: 'log', timestamp: 1, level: 'info', source: 'js', message: 'no device id on this event' } as RnTuiEvent, socket, socketState)
    dispatch({ type: 'network', stage: 'request', timestamp: 1, requestId: 'r1', method: 'GET', url: 'https://x.test' } as RnTuiEvent, socket, socketState)

    assert.equal(useJsLogsStore.getState().logs[0]?.deviceId, deviceId)
    assert.equal(useNetworkStore.getState().logsArray[0]?.deviceId, deviceId)
  })

  it('does not invent a deviceId for telemetry that arrives before device_info', () => {
    const socket = fakeSocket()
    const socketState = new Map()

    dispatch({ type: 'log', timestamp: 1, level: 'info', source: 'js', message: 'too early' } as RnTuiEvent, socket, socketState)

    assert.equal(useJsLogsStore.getState().logs[0]?.deviceId, undefined)
  })
})
