import { parseResponseHeaders } from '../parse-response-headers'

describe('parseResponseHeaders', () => {
  it('should return empty object when headers string is empty', () => {
    expect(parseResponseHeaders('')).toEqual({})
  })

  it('should parse single header', () => {
    const headers = parseResponseHeaders('Content-Type: application/json')

    expect(headers).toEqual({
      'Content-Type': 'application/json',
    })
  })

  it('should parse multiple headers', () => {
    const headers = parseResponseHeaders(
      [
        'Content-Type: application/json',
        'Authorization: Bearer token',
        'X-Test: 123',
      ].join('\r\n')
    )

    expect(headers).toEqual({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer token',
      'X-Test': '123',
    })
  })

  it('should trim spaces from keys and values', () => {
    const headers = parseResponseHeaders(
      '  Content-Type  :   application/json   '
    )

    expect(headers).toEqual({
      'Content-Type': 'application/json',
    })
  })

  it('should ignore invalid lines', () => {
    const headers = parseResponseHeaders(
      ['Content-Type: application/json', 'invalid-line', ': missing-key'].join(
        '\n'
      )
    )

    expect(headers).toEqual({
      'Content-Type': 'application/json',
    })
  })

  it('should support values containing colon', () => {
    const headers = parseResponseHeaders('Authorization: Bearer abc:def:ghi')

    expect(headers).toEqual({
      Authorization: 'Bearer abc:def:ghi',
    })
  })

  it('should overwrite duplicated headers', () => {
    const headers = parseResponseHeaders(
      ['X-Test: first', 'X-Test: second'].join('\n')
    )

    expect(headers).toEqual({
      'X-Test': 'second',
    })
  })
})
