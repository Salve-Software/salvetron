/**
 * Network Log Domain Types
 * Stored representation of network requests in RN TUI CLI
 */

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

export type HttpStatusCategory =
  | 'info'
  | 'success'
  | 'redirect'
  | 'client-error'
  | 'server-error';

export type NetworkRequestState = 'pending' | 'completed' | 'failed';

/**
 * NetworkLog - Merged representation of request + response
 * Events arrive separately but stored as single entry correlated by requestId
 */
export interface NetworkLog {
  // Identity
  requestId: string;
  deviceId: string;
  projectId?: string;

  // Request data
  method: HttpMethod;
  url: string;
  requestHeaders: Record<string, string>;
  requestBody: string | null;
  requestTimestamp: number;

  // Response data (null if pending/failed)
  statusCode: number | null;
  responseHeaders: Record<string, string> | null;
  responseBody: string | null;
  responseTimestamp: number | null;

  // Computed
  duration: number | null;
  state: NetworkRequestState;
}

/**
 * Get status category from HTTP status code
 */
export function getStatusCategory(
  statusCode: number | null
): HttpStatusCategory | null {
  if (statusCode === null) return null;
  if (statusCode >= 100 && statusCode < 200) return 'info';
  if (statusCode >= 200 && statusCode < 300) return 'success';
  if (statusCode >= 300 && statusCode < 400) return 'redirect';
  if (statusCode >= 400 && statusCode < 500) return 'client-error';
  if (statusCode >= 500) return 'server-error';
  return null;
}

/**
 * Normalize HTTP method string to HttpMethod type
 */
export function normalizeHttpMethod(method: string): HttpMethod {
  const upper = method.toUpperCase();
  const validMethods: HttpMethod[] = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'HEAD',
    'OPTIONS',
  ];
  return validMethods.includes(upper as HttpMethod)
    ? (upper as HttpMethod)
    : 'GET';
}
