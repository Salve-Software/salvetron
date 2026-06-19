export const METHOD_COLOR: Record<string, string> = {
  GET: 'green',
  POST: 'cyan',
  PUT: 'yellow',
  PATCH: 'yellow',
  DELETE: 'red',
  HEAD: 'gray',
}

export function getStatusColor(statusCode: number | null): string {
  if (!statusCode) return 'gray'
  if (statusCode >= 500) return 'red'
  if (statusCode >= 400) return 'yellow'
  return 'green'
}
