import { XHRInterceptor } from '../xhr'

describe('XHRInterceptor', () => {
  let interceptor: XHRInterceptor

  const originalXMLHttpRequest = global.XMLHttpRequest

  const openMock = jest.fn()
  const sendMock = jest.fn()
  const setRequestHeaderMock = jest.fn()

  class MockXMLHttpRequest {
    static HEADERS_RECEIVED = 2
    static DONE = 4

    public readonly HEADERS_RECEIVED =
      MockXMLHttpRequest.HEADERS_RECEIVED

    public readonly DONE =
      MockXMLHttpRequest.DONE

    public readyState = 0
    public status = 200
    public timeout = 0
    public response = '{"success":true}'
    public responseURL = 'https://api.test.com'
    public responseType = 'json'

    private listeners: Record<string, Array<() => void>> = {}

    open(method: string, url: string) {
      openMock(method, url)
    }

    send(data?: unknown) {
      sendMock(data)
    }

    setRequestHeader(header: string, value: string) {
      setRequestHeaderMock(header, value)
    }

    addEventListener(event: string, callback: () => void) {
      if (!this.listeners[event]) {
        this.listeners[event] = []
      }

      this.listeners[event].push(callback)
    }

    emit(event: string) {
      this.listeners[event]?.forEach(listener => listener())
    }

    getResponseHeader(name: string) {
      if (name === 'Content-Type') {
        return 'application/json; charset=utf-8'
      }

      if (name === 'Content-Length') {
        return '128'
      }

      return null
    }

    getAllResponseHeaders() {
      return 'Content-Type: application/json'
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()

    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})

    global.XMLHttpRequest = MockXMLHttpRequest as any

    interceptor = XHRInterceptor.getInstance()

    interceptor.disable()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  afterAll(() => {
    global.XMLHttpRequest = originalXMLHttpRequest
  })

  it('should enable interceptor', () => {
    const result = interceptor.enable({
      onOpen: jest.fn(),
      onSend: jest.fn(),
      onRequestHeader: jest.fn(),
      onHeaderReceived: jest.fn(),
      onResponse: jest.fn(),
    })

    expect(result).toBe(true)
    expect(interceptor.isEnabled()).toBe(true)
  })

  it('should prevent double enable', () => {
    interceptor.enable({
      onOpen: jest.fn(),
      onSend: jest.fn(),
      onRequestHeader: jest.fn(),
      onHeaderReceived: jest.fn(),
      onResponse: jest.fn(),
    })

    const result = interceptor.enable({
      onOpen: jest.fn(),
      onSend: jest.fn(),
      onRequestHeader: jest.fn(),
      onHeaderReceived: jest.fn(),
      onResponse: jest.fn(),
    })

    expect(result).toBe(false)

    expect(console.warn).toHaveBeenCalledWith(
      '[Mako] Network interceptor already enabled'
    )
  })

  it('should intercept open calls', () => {
    const onOpen = jest.fn()

    interceptor.enable({
      onOpen,
      onSend: jest.fn(),
      onRequestHeader: jest.fn(),
      onHeaderReceived: jest.fn(),
      onResponse: jest.fn(),
    })

    const xhr = new XMLHttpRequest()

    xhr.open('GET', 'https://api.test.com')

    expect(onOpen).toHaveBeenCalledTimes(1)

    expect(onOpen).toHaveBeenCalledWith(
      'GET',
      'https://api.test.com',
      xhr
    )

    expect(openMock).toHaveBeenCalledTimes(1)

    expect(openMock).toHaveBeenCalledWith(
      'GET',
      'https://api.test.com'
    )
  })

  it('should intercept request headers', () => {
    const onRequestHeader = jest.fn()

    interceptor.enable({
      onOpen: jest.fn(),
      onSend: jest.fn(),
      onRequestHeader,
      onHeaderReceived: jest.fn(),
      onResponse: jest.fn(),
    })

    const xhr = new XMLHttpRequest()

    xhr.setRequestHeader('Authorization', 'Bearer token')

    expect(onRequestHeader).toHaveBeenCalledTimes(1)

    expect(onRequestHeader).toHaveBeenCalledWith(
      'Authorization',
      'Bearer token',
      xhr
    )

    expect(setRequestHeaderMock).toHaveBeenCalledTimes(1)

    expect(setRequestHeaderMock).toHaveBeenCalledWith(
      'Authorization',
      'Bearer token'
    )
  })

  it('should intercept send calls', () => {
    const onSend = jest.fn()

    interceptor.enable({
      onOpen: jest.fn(),
      onSend,
      onRequestHeader: jest.fn(),
      onHeaderReceived: jest.fn(),
      onResponse: jest.fn(),
    })

    const xhr = new XMLHttpRequest()

    xhr.send({ hello: true })

    expect(onSend).toHaveBeenCalledTimes(1)

    expect(onSend).toHaveBeenCalledWith(
      { hello: true },
      xhr
    )

    expect(sendMock).toHaveBeenCalledTimes(1)

    expect(sendMock).toHaveBeenCalledWith({
      hello: true,
    })
  })

  it('should intercept HEADERS_RECEIVED state', () => {
    const onHeaderReceived = jest.fn()

    interceptor.enable({
      onOpen: jest.fn(),
      onSend: jest.fn(),
      onRequestHeader: jest.fn(),
      onHeaderReceived,
      onResponse: jest.fn(),
    })

    const xhr = new XMLHttpRequest() as any

    xhr.send()

    xhr.readyState = xhr.HEADERS_RECEIVED

    xhr.emit('readystatechange')

    expect(onHeaderReceived).toHaveBeenCalledTimes(1)

    expect(onHeaderReceived).toHaveBeenCalledWith(
      'application/json',
      128,
      'Content-Type: application/json',
      xhr
    )
  })

  it('should intercept DONE state', () => {
    const onResponse = jest.fn()

    interceptor.enable({
      onOpen: jest.fn(),
      onSend: jest.fn(),
      onRequestHeader: jest.fn(),
      onHeaderReceived: jest.fn(),
      onResponse,
    })

    const xhr = new XMLHttpRequest() as any

    xhr.send()

    xhr.readyState = xhr.DONE

    xhr.emit('readystatechange')

    expect(onResponse).toHaveBeenCalledTimes(1)

    expect(onResponse).toHaveBeenCalledWith(
      200,
      false,
      '{"success":true}',
      'https://api.test.com',
      'json',
      xhr
    )
  })

  it('should restore original methods on disable', () => {
    const originalOpen = XMLHttpRequest.prototype.open
    const originalSend = XMLHttpRequest.prototype.send
    const originalSetRequestHeader =
      XMLHttpRequest.prototype.setRequestHeader

    interceptor.enable({
      onOpen: jest.fn(),
      onSend: jest.fn(),
      onRequestHeader: jest.fn(),
      onHeaderReceived: jest.fn(),
      onResponse: jest.fn(),
    })

    expect(XMLHttpRequest.prototype.open).not.toBe(originalOpen)

    expect(XMLHttpRequest.prototype.send).not.toBe(originalSend)

    expect(XMLHttpRequest.prototype.setRequestHeader).not.toBe(
      originalSetRequestHeader
    )

    interceptor.disable()

    expect(XMLHttpRequest.prototype.open).toBe(originalOpen)

    expect(XMLHttpRequest.prototype.send).toBe(originalSend)

    expect(XMLHttpRequest.prototype.setRequestHeader).toBe(
      originalSetRequestHeader
    )
  })
})
