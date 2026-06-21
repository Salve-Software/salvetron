/**
 * Check if URL should be ignored based on patterns
 */
export function shouldIgnoreUrl(url: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(url));
}
