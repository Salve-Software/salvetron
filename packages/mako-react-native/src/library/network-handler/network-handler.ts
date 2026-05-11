/**
 * Network interception handler
 * Manages XHR request/response tracking and event creation
 */

import type {
  NetworkCallbacks,
  NetworkRequestEvent,
  NetworkResponseEvent,
  PendingRequest,
} from '../types'
import {
  generateRequestId,
  parseResponseHeaders,
  shouldIgnoreUrl,
  readBlobAsText,
  responseToString,
} from './utils'
import type { NetworkHandlerConfig } from './types'

export class NetworkHandler {
  private pendingRequests = new Map<XMLHttpRequest, PendingRequest>()
  private config: NetworkHandlerConfig

  constructor(config: NetworkHandlerConfig) {
    this.config = config
  }

  getCallbacks(): NetworkCallbacks {
    return {
      onOpen: this.handleOpen.bind(this),
      onRequestHeader: this.handleRequestHeader.bind(this),
      onSend: this.handleSend.bind(this),
      onHeaderReceived: this.handleHeaderReceived.bind(this),
      onResponse: this.handleResponse.bind(this),
    }
  }

  private handleOpen(method: string, url: string, xhr: XMLHttpRequest): void {
    if (shouldIgnoreUrl(url, this.config.ignoredUrls)) return

    const request: PendingRequest = {
      id: generateRequestId(),
      method,
      url,
      headers: {},
      startTime: Date.now(),
    }
    this.pendingRequests.set(xhr, request)
  }

  private handleRequestHeader(
    header: string,
    value: string,
    xhr: XMLHttpRequest
  ): void {
    const request = this.pendingRequests.get(xhr)
    if (request) {
      request.headers[header] = value
    }
  }

  private handleSend(data: unknown, xhr: XMLHttpRequest): void {
    const request = this.pendingRequests.get(xhr)
    if (!request) return

    if (data !== null && data !== undefined) {
      request.body = typeof data === 'string' ? data : JSON.stringify(data)
    }

    const event: NetworkRequestEvent = {
      type: 'network',
      stage: 'request',
      requestId: request.id,
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: request.body,
      timestamp: request.startTime,
    }
    this.config.onEvent(event)
  }

  private handleHeaderReceived(
    _responseContentType: string | undefined,
    _responseSize: number | undefined,
    responseHeaders: string,
    xhr: XMLHttpRequest
  ): void {
    const request = this.pendingRequests.get(xhr)
    if (request) {
      request.responseHeaders = parseResponseHeaders(responseHeaders)
    }
  }

  private handleResponse(
    status: number,
    _timeout: boolean,
    response: unknown,
    responseURL: string,
    responseType: string,
    xhr: XMLHttpRequest
  ): void {
    const request = this.pendingRequests.get(xhr)
    if (!request) return

    const endTime = Date.now()

    const sendResponseEvent = (bodyString: string | undefined) => {
      const event: NetworkResponseEvent = {
        type: 'network',
        stage: 'response',
        requestId: request.id,
        method: request.method,
        url: responseURL || request.url,
        statusCode: status,
        duration: endTime - request.startTime,
        headers: request.responseHeaders,
        body: bodyString,
        timestamp: endTime,
      }
      this.config.onEvent(event)
      this.pendingRequests.delete(xhr)
    }

    if (responseType === 'blob' && response instanceof Blob) {
      readBlobAsText(response).then(sendResponseEvent)
      return
    }

    sendResponseEvent(responseToString(response, xhr))
  }

  clear(): void {
    this.pendingRequests.clear()
  }
}
