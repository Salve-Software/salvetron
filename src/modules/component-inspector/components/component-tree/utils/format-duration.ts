export function formatDuration(duration: number): string {
  if (duration < 1) return `${duration.toFixed(2)}ms`;
  return `${duration.toFixed(1)}ms`;
}
