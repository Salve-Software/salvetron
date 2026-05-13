import type { NetworkLog } from "@mako/types";

interface RequestTabProps {
  log: NetworkLog;
}

function tryFormatJson(str: string | null): { formatted: string; isJson: boolean } {
  if (!str) return { formatted: "", isJson: false };

  try {
    const parsed = JSON.parse(str);
    return { formatted: JSON.stringify(parsed, null, 2), isJson: true };
  } catch {
    return { formatted: str, isJson: false };
  }
}

function getContentType(headers: Record<string, string>): string | null {
  const key = Object.keys(headers).find(
    (k) => k.toLowerCase() === "content-type"
  );
  return key ? headers[key] : null;
}

export function RequestTab({ log }: RequestTabProps) {
  const { formatted: bodyFormatted, isJson } = tryFormatJson(log.requestBody);
  const contentType = getContentType(log.requestHeaders);
  const hasBody = log.requestBody && log.requestBody.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Content Type indicator */}
      {contentType && (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-olive-500 uppercase">Content-Type</p>
          <p className="text-sm text-olive-300 font-mono">{contentType}</p>
        </div>
      )}

      {/* Request Body */}
      <div className="flex flex-col gap-1">
        <p className="text-xs text-olive-500 uppercase">Request Body</p>
        {hasBody ? (
          <pre
            className={`text-xs rounded-lg p-3 overflow-x-auto max-h-96 overflow-y-auto ${
              isJson ? "bg-olive-950" : "bg-olive-900"
            }`}
          >
            <code className="text-olive-200">{bodyFormatted}</code>
          </pre>
        ) : (
          <p className="text-sm text-olive-500 italic">No request body</p>
        )}
      </div>

      {/* Body Size */}
      {hasBody && (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-olive-500 uppercase">Size</p>
          <p className="text-sm text-olive-400">
            {log.requestBody!.length.toLocaleString()} bytes
          </p>
        </div>
      )}
    </div>
  );
}
