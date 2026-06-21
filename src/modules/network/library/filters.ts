import type { NetworkLog, HttpMethod } from '@salve-software/salvetron-types'
import type { FilterGroup } from '../../../shared/components/filter-bar/index.js'
import { METHOD_COLOR } from './constants.js'

type StatusBucket = '2xx' | '3xx' | '4xx' | '5xx' | 'pending'

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD']

const STATUS_COLOR: Record<StatusBucket, string> = {
  '2xx': 'green',
  '3xx': 'cyan',
  '4xx': 'yellow',
  '5xx': 'red',
  pending: 'gray',
}

const STATUS_BUCKETS: StatusBucket[] = ['2xx', '3xx', '4xx', '5xx', 'pending']

export const NETWORK_FILTER_GROUPS: FilterGroup[] = [
  {
    id: 'method',
    label: 'Method',
    chips: METHODS.map((method) => ({ id: method, label: method, color: METHOD_COLOR[method] })),
  },
  {
    id: 'status',
    label: 'Status',
    chips: STATUS_BUCKETS.map((bucket) => ({ id: bucket, label: bucket, color: STATUS_COLOR[bucket] })),
  },
]

function statusBucket(log: NetworkLog): StatusBucket {
  if (log.state === 'pending' || log.statusCode === null) return 'pending'
  if (log.statusCode >= 500) return '5xx'
  if (log.statusCode >= 400) return '4xx'
  if (log.statusCode >= 300) return '3xx'
  return '2xx'
}

export function matchesNetworkLog(log: NetworkLog, query: string, active: Record<string, Set<string>>): boolean {
  const methods = active.method
  if (methods && methods.size > 0 && !methods.has(log.method)) return false
  const statuses = active.status
  if (statuses && statuses.size > 0 && !statuses.has(statusBucket(log))) return false
  if (query) return log.url.toLowerCase().includes(query.toLowerCase())
  return true
}
