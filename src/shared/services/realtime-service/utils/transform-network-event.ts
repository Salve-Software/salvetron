import type { NetworkLog } from "@mako/types";
import type { IncomingNetworkEvent } from "../../../../infra/web-socket-server/types";

export function transformNetworkEvent(event: IncomingNetworkEvent): NetworkLog {
  return {
    body: event.body ?? null,
    deviceId: event.deviceId ?? "unknown",
    headers: event.headers ?? {},
    method: event.method,
    requestId: event.requestId,
    stage: event.stage,
    timestamp: event.timestamp,
    type: event.type,
    url: event.url,
    projectId: event.projectId,
  };
}
