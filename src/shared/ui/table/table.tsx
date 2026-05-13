import { TableProps } from "./types";

export function Table<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  isSelected,
  emptyState,
}: TableProps<T>) {
  const gridTemplateColumns = columns.map((col) => col.width).join(" ");

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="flex flex-col w-full">
      <div
        className="grid items-center py-2 px-4 border-b border-olive-700 shrink-0"
        style={{ gridTemplateColumns }}
      >
        {columns.map((col) => (
          <span
            key={col.key}
            className="text-xs text-olive-500 uppercase font-medium"
          >
            {col.header}
          </span>
        ))}
      </div>
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
        {data.map((item, index) => {
          const selected = isSelected?.(item) ?? false;
          return (
            <div
              key={keyExtractor(item, index)}
              onClick={() => onRowClick?.(item)}
              className={`grid items-center py-3 px-4 cursor-pointer transition-all duration-150 border-b border-olive-800 ${
                selected ? "bg-olive-700/50" : "hover:bg-olive-800/30"
              }`}
              style={{ gridTemplateColumns }}
            >
              {columns.map((col) => (
                <div key={col.key}>{col.render(item)}</div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
