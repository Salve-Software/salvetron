import type { NetworkLog } from "@mako/types";
import { normalizeHttpMethod } from "@mako/types";
import type { IncomingNetworkEvent } from "../../../../infra/web-socket-server/types";

/**
 * Transform incoming network event to NetworkLog domain type.
 *
 * @deprecated This function is no longer used. The network store now handles
 * event transformation internally via addOrUpdateLog which supports merging
 * request/response events by requestId.
 */
export function transformNetworkEvent(
  event: IncomingNetworkEvent
): NetworkLog {
  const isResponse = event.stage === "response";

  return {
    requestId: event.requestId,
    deviceId: event.deviceId ?? "unknown",
    projectId: event.projectId,
    method: normalizeHttpMethod(event.method),
    url: event.url,
    requestHeaders: isResponse ? {} : (event.headers ?? {}),
    requestBody: isResponse ? null : (event.body ?? null),
    requestTimestamp: isResponse
      ? event.timestamp - (event.duration ?? 0)
      : event.timestamp,
    statusCode: isResponse ? event.statusCode : null,
    responseHeaders: isResponse ? (event.headers ?? {}) : null,
    responseBody: isResponse ? (event.body ?? null) : null,
    responseTimestamp: isResponse ? event.timestamp : null,
    duration: isResponse ? event.duration : null,
    state: isResponse ? "completed" : "pending",
  };
}
