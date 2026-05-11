import { generateRequestId } from '../generate-request-id'

describe('generateRequestId', () => {
  it('should return a string', () => {
    const id = generateRequestId()

    expect(typeof id).toBe('string')
  })

  it('should generate an id in the expected format', () => {
    const id = generateRequestId()

    expect(id).toMatch(/^\d+-[a-z0-9]+$/)
  })

  it('should generate unique ids', () => {
    const id1 = generateRequestId()
    const id2 = generateRequestId()

    expect(id1).not.toBe(id2)
  })
})
