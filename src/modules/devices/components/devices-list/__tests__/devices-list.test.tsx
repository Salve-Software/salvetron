import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DevicesList } from '../devices-list'
import type { Device } from '@mako/types'

jest.mock('../../../store', () => ({
  useDevices: jest.fn(),
}))

jest.mock('../../../../workspace/store', () => ({
  useSetWorkspaceDevice: jest.fn(),
}))

const { useDevices } = jest.requireMock('../../../store')
const { useSetWorkspaceDevice } = jest.requireMock('../../../../workspace/store')

const devices: Device[] = [
  {
    type: 'device',
    deviceId: 'device-1',
    deviceName: 'Pixel 7',
    platform: 'android',
    appName: 'MyApp',
  },
  {
    type: 'device',
    deviceId: 'device-2',
    deviceName: 'iPhone 15',
    platform: 'ios',
    appName: 'MyApp',
  },
]

describe('DevicesList', () => {
  const setWorkspaceDevice = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    useSetWorkspaceDevice.mockReturnValue(setWorkspaceDevice)
  })

  it('renders all devices', () => {
    useDevices.mockReturnValue(devices)
    render(<DevicesList />)

    expect(screen.getByText('Pixel 7')).toBeInTheDocument()
    expect(screen.getByText('iPhone 15')).toBeInTheDocument()
  })

  it('renders the Devices label', () => {
    useDevices.mockReturnValue([])
    render(<DevicesList />)

    expect(screen.getByText('Devices')).toBeInTheDocument()
  })

  it('calls setWorkspaceDevice with the clicked device', async () => {
    useDevices.mockReturnValue(devices)
    render(<DevicesList />)

    await userEvent.click(screen.getByText('Pixel 7'))

    expect(setWorkspaceDevice).toHaveBeenCalledWith(devices[0])
  })

  it('renders nothing when devices list is empty', () => {
    useDevices.mockReturnValue([])
    render(<DevicesList />)

    expect(screen.queryByText('Pixel 7')).not.toBeInTheDocument()
  })
})
