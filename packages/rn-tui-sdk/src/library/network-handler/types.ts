import type { NetworkRequestEvent, NetworkResponseEvent } from '../types'

export interface NetworkHandlerConfig {
  ignoredUrls: RegExp[]
  onEvent: (event: NetworkRequestEvent | NetworkResponseEvent) => void
}
