import { responseToString } from '../response-to-string'

describe('responseToString', () => {
  it('should return xhr.responseText when available', () => {
    const xhr = {
      responseText: 'xhr response',
    } as XMLHttpRequest

    const result = responseToString('fallback', xhr)

    expect(result).toBe('xhr response')
  })

  it('should fallback to response string when responseText is empty', () => {
    const xhr = {
      responseText: '',
    } as XMLHttpRequest

    const result = responseToString('response body', xhr)

    expect(result).toBe('response body')
  })

  it('should stringify object responses', () => {
    const xhr = {
      responseText: '',
    } as XMLHttpRequest

    const response = {
      name: 'Gabriel',
      age: 25,
    }

    const result = responseToString(response, xhr)

    expect(result).toBe(JSON.stringify(response, null, 2))
  })

  it('should return String(response) when JSON.stringify throws', () => {
    const xhr = {
      responseText: '',
    } as XMLHttpRequest

    const circular: any = {}
    circular.self = circular

    const result = responseToString(circular, xhr)

    expect(result).toBe('[object Object]')
  })

  it('should return undefined when response is null', () => {
    const xhr = {
      responseText: '',
    } as XMLHttpRequest

    const result = responseToString(null, xhr)

    expect(result).toBeUndefined()
  })

  it('should return undefined when response is undefined', () => {
    const xhr = {
      responseText: '',
    } as XMLHttpRequest

    const result = responseToString(undefined, xhr)

    expect(result).toBeUndefined()
  })

  it('should fallback when accessing responseText throws', () => {
    const xhr = {} as XMLHttpRequest

    Object.defineProperty(xhr, 'responseText', {
      get() {
        throw new Error('Invalid responseType')
      },
    })

    const result = responseToString('fallback response', xhr)

    expect(result).toBe('fallback response')
  })
})
