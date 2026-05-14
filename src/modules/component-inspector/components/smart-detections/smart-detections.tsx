import type { ComponentMetrics } from "@mako/types";
import { Icon } from "../../../../shared/ui/icon";
import type { IconName } from "../../../../shared/ui/icon/types";

export interface SmartDetectionsProps {
  unnecessaryRenders: ComponentMetrics[];
  hotComponents: ComponentMetrics[];
}

interface DetectionCardProps {
  icon: IconName;
  title: string;
  count: number;
  severity: "warning" | "critical";
  components: ComponentMetrics[];
  onComponentClick?: (component: ComponentMetrics) => void;
}

function DetectionCard({
  icon,
  title,
  count,
  severity,
  components,
  onComponentClick,
}: DetectionCardProps) {
  const severityClasses =
    severity === "critical"
      ? "bg-red-500/10 border-red-500/30 text-red-400"
      : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";

  return (
    <div className={`rounded-lg border p-4 ${severityClasses}`}>
      <div className="flex items-start gap-3 mb-3">
        <Icon name={icon} size={20} />
        <div className="flex-1">
          <h4 className="text-sm font-semibold">{title}</h4>
          <span className="text-xs opacity-80">{count} components affected</span>
        </div>
      </div>

      {components.length > 0
        ?
        <div className="flex flex-col gap-1 mt-2">
          {components.slice(0, 5).map((component) => (
            <button
              key={component.componentId}
              onClick={() => onComponentClick?.(component)}
              className="text-xs text-left px-2 py-1.5 rounded bg-olive-900/30 hover:bg-olive-900/50 transition-colors"
            >
              <span className="font-medium">{component.componentName}</span>
              <span className="ml-2 opacity-60">
                ({component.renderCount} renders)
              </span>
            </button>
          ))}
          {components.length > 5
            ?
            <span className="text-xs opacity-60 mt-1">
              +{components.length - 5} more
            </span>
            : null
          }
        </div>
        : null
      }
    </div>
  );
}

export function SmartDetections({
  unnecessaryRenders,
  hotComponents,
}: SmartDetectionsProps) {
  const hasDetections =
    unnecessaryRenders.length > 0 || hotComponents.length > 0;

  if (!hasDetections) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Icon name="checkmark" size={40} className="text-green-400 mb-3" />
        <h3 className="text-sm font-semibold text-olive-200 mb-1">
          No Issues Detected
        </h3>
        <p className="text-xs text-olive-500">
          Your components are performing optimally
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h3 className="text-sm font-semibold text-olive-200 mb-3">
          Smart Detections
        </h3>
        <p className="text-xs text-olive-500 mb-4">
          Automatic analysis of component rendering patterns
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {unnecessaryRenders.length > 0
          ?
          <DetectionCard
            icon="warning"
            title="Unnecessary Renders"
            count={unnecessaryRenders.length}
            severity="warning"
            components={unnecessaryRenders}
          />
          : null
        }

        {hotComponents.length > 0
          ?
          <DetectionCard
            icon="flame"
            title="Hot Components"
            count={hotComponents.length}
            severity="critical"
            components={hotComponents}
          />
          : null
        }
      </div>
    </div>
  );
}
