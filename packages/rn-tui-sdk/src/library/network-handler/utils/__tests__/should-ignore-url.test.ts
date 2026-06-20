import { shouldIgnoreUrl } from '../should-ignore-url'

describe('shouldIgnoreUrl', () => {
  it('should return true when url matches a pattern', () => {
    const patterns = [/google\.com/, /facebook\.com/]

    const result = shouldIgnoreUrl('https://google.com/search', patterns)

    expect(result).toBe(true)
  })

  it('should return false when url does not match any pattern', () => {
    const patterns = [/google\.com/, /facebook\.com/]

    const result = shouldIgnoreUrl('https://github.com', patterns)

    expect(result).toBe(false)
  })

  it('should return false when patterns array is empty', () => {
    const result = shouldIgnoreUrl('https://google.com', [])

    expect(result).toBe(false)
  })

  it('should stop checking after first matching pattern', () => {
    const firstPattern = {
      test: jest.fn().mockReturnValue(true),
    }

    const secondPattern = {
      test: jest.fn(),
    }

    const result = shouldIgnoreUrl('https://example.com', [
      firstPattern as unknown as RegExp,
      secondPattern as unknown as RegExp,
    ])

    expect(result).toBe(true)

    expect(firstPattern.test).toHaveBeenCalled()
    expect(secondPattern.test).not.toHaveBeenCalled()
  })
})
