import { readBlobAsText } from '../read-blob-as-text'

describe('readBlobAsText', () => {
  const originalFileReader = global.FileReader

  afterEach(() => {
    global.FileReader = originalFileReader
    jest.restoreAllMocks()
  })

  it('should resolve blob text successfully', async () => {
    class MockFileReader {
      result = 'hello world'

      onloadend: (() => void) | null = null
      onerror: (() => void) | null = null

      readAsText() {
        this.onloadend?.()
      }
    }

    // @ts-ignore
    global.FileReader = MockFileReader

    const blob = new Blob(['hello world'])

    const result = await readBlobAsText(blob)

    expect(result).toBe('hello world')
  })

  it('should resolve undefined on error', async () => {
    class MockFileReader {
      result = null

      onloadend: (() => void) | null = null
      onerror: (() => void) | null = null

      readAsText() {
        this.onerror?.()
      }
    }

    // @ts-ignore
    global.FileReader = MockFileReader

    const blob = new Blob(['test'])

    const result = await readBlobAsText(blob)

    expect(result).toBeUndefined()
  })

  it('should call readAsText with provided blob', async () => {
    const readAsTextMock = jest.fn()

    class MockFileReader {
      result = 'ok'

      onloadend: (() => void) | null = null
      onerror: (() => void) | null = null

      readAsText(blob: Blob) {
        readAsTextMock(blob)
        this.onloadend?.()
      }
    }

    // @ts-ignore
    global.FileReader = MockFileReader

    const blob = new Blob(['content'])

    await readBlobAsText(blob)

    expect(readAsTextMock).toHaveBeenCalledWith(blob)
  })
})
