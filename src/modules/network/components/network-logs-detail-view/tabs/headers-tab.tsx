import type { NetworkLog } from "@mako/types";

interface HeadersTabProps {
  log: NetworkLog;
}

interface HeadersTableProps {
  headers: Record<string, string>;
  emptyMessage: string;
}

function HeadersTable({ headers, emptyMessage }: HeadersTableProps) {
  const entries = Object.entries(headers);

  if (entries.length === 0) {
    return <p className="text-sm text-olive-500 italic">{emptyMessage}</p>;
  }

  return (
    <div className="rounded-lg border border-olive-800 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-olive-900/50">
            <th className="text-left px-3 py-2 text-xs text-olive-500 uppercase font-medium border-b border-olive-800">
              Name
            </th>
            <th className="text-left px-3 py-2 text-xs text-olive-500 uppercase font-medium border-b border-olive-800">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, value], index) => (
            <tr
              key={key}
              className={index % 2 === 0 ? "bg-olive-950/30" : "bg-olive-950/50"}
            >
              <td className="px-3 py-2 text-olive-300 font-mono text-xs whitespace-nowrap">
                {key}
              </td>
              <td className="px-3 py-2 text-olive-200 font-mono text-xs break-all">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function HeadersTab({ log }: HeadersTabProps) {
  const hasRequestHeaders = Object.keys(log.requestHeaders).length > 0;
  const hasResponseHeaders =
    log.responseHeaders && Object.keys(log.responseHeaders).length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Request Headers */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-olive-500 uppercase font-medium">
          Request Headers
          {hasRequestHeaders && (
            <span className="ml-2 text-olive-600">
              ({Object.keys(log.requestHeaders).length})
            </span>
          )}
        </p>
        <HeadersTable
          headers={log.requestHeaders}
          emptyMessage="No request headers"
        />
      </div>

      {/* Response Headers */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-olive-500 uppercase font-medium">
          Response Headers
          {hasResponseHeaders && (
            <span className="ml-2 text-olive-600">
              ({Object.keys(log.responseHeaders!).length})
            </span>
          )}
        </p>
        {log.state === "pending" ? (
          <p className="text-sm text-olive-500 italic">
            Waiting for response...
          </p>
        ) : (
          <HeadersTable
            headers={log.responseHeaders ?? {}}
            emptyMessage="No response headers"
          />
        )}
      </div>
    </div>
  );
}
