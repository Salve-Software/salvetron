import { colorize } from 'json-colorizer'

export function formatBody(body: string | null | undefined): string[] {
  if (!body) return []
  try {
    const parsed = JSON.parse(body)
    return colorize(JSON.stringify(parsed, null, 2)).split('\n')
  } catch {
    return body.split('\n')
  }
}
