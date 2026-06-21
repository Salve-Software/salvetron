import type { NativeLogEvent, LogLevel, NativeLogSource } from '@salve-software/salvetron-types'
import type { FilterGroup } from '../../../shared/components/filter-bar/index.js'

const LEVEL_COLOR: Record<LogLevel, string> = {
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  debug: 'gray',
  log: 'white',
}

const LEVELS: LogLevel[] = ['error', 'warn', 'info', 'debug', 'log']

const SOURCE_COLOR: Record<NativeLogSource, string> = {
  ios: 'cyan',
  android: 'green',
}

const SOURCE_LABEL: Record<NativeLogSource, string> = {
  ios: 'iOS',
  android: 'Android',
}

const SOURCES: NativeLogSource[] = ['ios', 'android']

export const NATIVE_LOG_FILTER_GROUPS: FilterGroup[] = [
  {
    id: 'level',
    label: 'Level',
    chips: LEVELS.map((level) => ({ id: level, label: level.toUpperCase(), color: LEVEL_COLOR[level] })),
  },
  {
    id: 'source',
    label: 'Source',
    chips: SOURCES.map((source) => ({ id: source, label: SOURCE_LABEL[source], color: SOURCE_COLOR[source] })),
  },
]

export function matchesNativeLog(log: NativeLogEvent, query: string, active: Record<string, Set<string>>): boolean {
  const levels = active.level
  if (levels && levels.size > 0 && !levels.has(log.level)) return false
  const sources = active.source
  if (sources && sources.size > 0 && !sources.has(log.source)) return false
  if (query) {
    const q = query.toLowerCase()
    return log.message.toLowerCase().includes(q) || (log.tag?.toLowerCase().includes(q) ?? false)
  }
  return true
}
