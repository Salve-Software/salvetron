import type { JSLog } from "@mako/types";
import type { IncomingLogEvent } from "../../../../infra/web-socket-server/types";

export function transformLogEvent(event: IncomingLogEvent): JSLog {
  return {
    deviceId: event.deviceId ?? "unknown",
    level: event.level as JSLog["level"],
    message: event.message,
    metadata: event.metadata ?? {},
    source: event.source,
    timestamp: event.timestamp,
    type: event.type,
    projectId: event.projectId,
  };
}
