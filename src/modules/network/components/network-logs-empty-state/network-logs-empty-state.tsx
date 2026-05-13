import { Icon } from "../../../../shared/ui/icon";

export function NetworkLogsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
      <Icon name="earth" size={32} className="text-olive-500" />
      <p className="text-olive-500 text-sm">No network requests available</p>
    </div>
  );
}
