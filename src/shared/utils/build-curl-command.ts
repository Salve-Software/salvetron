import type { NetworkLog } from '@salve-software/salvetron-types'

function shellSingleQuote(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`
}

export function buildCurlCommand(log: NetworkLog): string {
  const parts: string[] = [`curl -X ${log.method}`, `  ${shellSingleQuote(log.url)}`]

  for (const [key, value] of Object.entries(log.requestHeaders ?? {})) {
    parts.push(`  -H ${shellSingleQuote(`${key}: ${value}`)}`)
  }

  if (log.requestBody != null) {
    parts.push(`  --data ${shellSingleQuote(log.requestBody)}`)
  }

  return parts.join(' \\\n')
}
