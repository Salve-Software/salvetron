import { Icon } from "../../../../shared/ui/icon";

export function ComponentInspectorEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
      <Icon name="component" size={32} className="text-olive-500" />
      <p className="text-olive-500 text-sm">No component data available</p>
      <p className="text-olive-600 text-xs">Start the inspector in your app</p>
    </div>
  );
}
