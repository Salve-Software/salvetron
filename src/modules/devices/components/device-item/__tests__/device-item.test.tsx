import { render, screen } from '@testing-library/react'
import { DeviceItem } from '../device-item'
import { Device } from '../../../domain/types'

const androidDevice: Device = {
  type: 'device',
  deviceId: 'device-1',
  deviceName: 'Pixel 7',
  platform: 'android',
  appName: 'MyApp',
}

const iosDevice: Device = {
  type: 'device',
  deviceId: 'device-2',
  deviceName: 'iPhone 15',
  platform: 'ios',
  appName: 'MyApp',
}

describe('DeviceItem', () => {
  it('renders device name and app name', () => {
    render(<DeviceItem device={androidDevice} />)

    expect(screen.getByText('Pixel 7')).toBeInTheDocument()
    expect(screen.getByText('MyApp')).toBeInTheDocument()
  })

  it('applies green icon color for android platform', () => {
    const { container } = render(<DeviceItem device={androidDevice} />)

    expect(container.querySelector('.text-green-400')).toBeInTheDocument()
  })

  it('applies blue icon color for ios platform', () => {
    const { container } = render(<DeviceItem device={iosDevice} />)

    expect(container.querySelector('.text-blue-400')).toBeInTheDocument()
  })

  it('renders without app name when not provided', () => {
    const device: Device = { ...androidDevice, appName: undefined }
    render(<DeviceItem device={device} />)

    expect(screen.getByText('Pixel 7')).toBeInTheDocument()
  })
})
