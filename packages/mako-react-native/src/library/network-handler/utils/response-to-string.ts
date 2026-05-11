/**
 * Convert response body to string
 */
export function responseToString(
  response: unknown,
  xhr: XMLHttpRequest
): string | undefined {
  // Try xhr.responseText first (most reliable)
  try {
    if (xhr.responseText) {
      return xhr.responseText;
    }
  } catch {
    // responseText may throw if responseType is not '' or 'text'
  }

  // Fallback: convert response parameter
  if (response !== null && response !== undefined) {
    if (typeof response === 'string') {
      return response;
    }
    if (typeof response === 'object') {
      try {
        return JSON.stringify(response, null, 2);
      } catch {
        return String(response);
      }
    }
  }

  return undefined;
}
