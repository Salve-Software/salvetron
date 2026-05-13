import type { NetworkLog } from "@mako/types";
import { Icon } from "../../../../../shared/ui/icon";

interface ResponseTabProps {
  log: NetworkLog;
}

function tryFormatJson(str: string | null): {
  formatted: string;
  isJson: boolean;
} {
  if (!str) return { formatted: "", isJson: false };

  try {
    const parsed = JSON.parse(str);
    return { formatted: JSON.stringify(parsed, null, 2), isJson: true };
  } catch {
    return { formatted: str, isJson: false };
  }
}

function getContentType(
  headers: Record<string, string> | null
): string | null {
  if (!headers) return null;
  const key = Object.keys(headers).find(
    (k) => k.toLowerCase() === "content-type"
  );
  return key ? headers[key] : null;
}

function getContentLength(
  headers: Record<string, string> | null
): string | null {
  if (!headers) return null;
  const key = Object.keys(headers).find(
    (k) => k.toLowerCase() === "content-length"
  );
  return key ? headers[key] : null;
}

export function ResponseTab({ log }: ResponseTabProps) {
  if (log.state === "pending") {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <Icon
          name="pending"
          size={32}
          className="text-olive-400 animate-spin"
        />
        <p className="text-olive-400">Waiting for response...</p>
      </div>
    );
  }

  const { formatted: bodyFormatted, isJson } = tryFormatJson(log.responseBody);
  const contentType = getContentType(log.responseHeaders);
  const contentLength = getContentLength(log.responseHeaders);
  const hasBody = log.responseBody && log.responseBody.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Status Code */}
      <div className="flex flex-col gap-1">
        <p className="text-xs text-olive-500 uppercase">Status Code</p>
        <p className="text-sm text-olive-200 font-mono">{log.statusCode}</p>
      </div>

      {/* Content Type indicator */}
      {contentType && (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-olive-500 uppercase">Content-Type</p>
          <p className="text-sm text-olive-300 font-mono">{contentType}</p>
        </div>
      )}

      {/* Response Body */}
      <div className="flex flex-col gap-1">
        <p className="text-xs text-olive-500 uppercase">Response Body</p>
        {hasBody ? (
          <pre
            className={`text-xs rounded-lg p-3 overflow-x-auto max-h-96 overflow-y-auto ${
              isJson ? "bg-olive-950" : "bg-olive-900"
            }`}
          >
            <code className="text-olive-200">{bodyFormatted}</code>
          </pre>
        ) : (
          <p className="text-sm text-olive-500 italic">No response body</p>
        )}
      </div>

      {/* Body Size */}
      {(hasBody || contentLength) && (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-olive-500 uppercase">Size</p>
          <p className="text-sm text-olive-400">
            {contentLength
              ? `${parseInt(contentLength).toLocaleString()} bytes`
              : `${log.responseBody!.length.toLocaleString()} bytes`}
          </p>
        </div>
      )}
    </div>
  );
}
