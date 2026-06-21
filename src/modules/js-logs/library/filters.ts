import type { LogEvent, LogLevel } from '@salve-software/salvetron-types'
import type { FilterGroup } from '../../../shared/components/filter-bar/index.js'

const LEVEL_COLOR: Record<LogLevel, string> = {
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  debug: 'gray',
  log: 'white',
}

const LEVELS: LogLevel[] = ['error', 'warn', 'info', 'debug', 'log']

export const JS_LOG_FILTER_GROUPS: FilterGroup[] = [
  {
    id: 'level',
    label: 'Level',
    chips: LEVELS.map((level) => ({ id: level, label: level.toUpperCase(), color: LEVEL_COLOR[level] })),
  },
]

export function matchesJsLog(log: LogEvent, query: string, active: Record<string, Set<string>>): boolean {
  const levels = active.level
  if (levels && levels.size > 0 && !levels.has(log.level)) return false
  if (query) return log.message.toLowerCase().includes(query.toLowerCase())
  return true
}
