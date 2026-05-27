import { useNavigate } from "react-router-dom";
import { Icon } from "../../../../shared/ui/icon";
import type { IconName } from "../../../../shared/ui/icon/types";

export interface DashboardModuleCardProps {
  icon: IconName;
  title: string;
  route?: string;
  children: React.ReactNode;
  className?: string;
}

export function DashboardModuleCard({
  icon,
  title,
  route,
  children,
  className = "",
}: DashboardModuleCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className={`bg-olive-950/30 rounded-xl p-4 flex flex-col ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon name={icon} size={20} className="text-olive-300" />
          <h3 className="text-base font-semibold text-olive-100">{title}</h3>
        </div>
        {route && (
          <button
            onClick={() => navigate(route)}
            className="text-xs text-olive-400 hover:text-olive-200 transition-colors"
          >
            View All
          </button>
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}
