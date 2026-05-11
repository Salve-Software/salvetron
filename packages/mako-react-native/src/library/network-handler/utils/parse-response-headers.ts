/**
 * Parse HTTP response headers string into object
 */
export function parseResponseHeaders(headersString: string): Record<string, string> {
  const headers: Record<string, string> = {};
  if (!headersString) return headers;

  const lines = headersString.trim().split(/[\r\n]+/);
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      if (key) {
        headers[key] = value;
      }
    }
  }
  return headers;
}
