import { Icon } from "../../../../shared/ui/icon";

export function NativeLogsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
      <Icon name="info" size={32} className="text-olive-500" />
      <p className="text-olive-500 text-sm">No native logs available</p>
    </div>
  );
}
