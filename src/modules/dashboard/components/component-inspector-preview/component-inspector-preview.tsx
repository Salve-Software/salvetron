import { useTopComponentsByRenderCount } from "../../../component-inspector/store/use-component-store";

export function ComponentInspectorPreview() {
  const topComponents = useTopComponentsByRenderCount(5);

  return (
    <div className="h-full overflow-auto">
      {topComponents.length > 0
        ?
        <div className="space-y-2">
          {topComponents.map((component) => (
            <div
              key={component.id}
              className="flex items-center justify-between p-2 bg-olive-900/30 rounded"
            >
              <span className="text-sm text-olive-200 truncate">
                {component.name}
              </span>
              <span className="text-sm font-medium text-olive-400">
                {component.renderCount}
              </span>
            </div>
          ))}
        </div>
        : null
      }
      {topComponents.length === 0
        ?
        <div className="flex items-center justify-center h-full text-olive-500 text-sm">
          No components tracked
        </div>
        : null
      }
    </div>
  );
}
