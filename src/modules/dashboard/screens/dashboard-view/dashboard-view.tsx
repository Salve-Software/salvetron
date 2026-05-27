import { DashboardModuleCard } from "../../components/dashboard-module-card";
import { JSLogsPreview } from "../../components/js-logs-preview";
import { NativeLogsPreview } from "../../components/native-logs-preview";
import { NetworkLogsPreview } from "../../components/network-logs-preview";
import { ComponentInspectorPreview } from "../../components/component-inspector-preview";
import { PerfMonitorPreview } from "../../components/perf-monitor-preview";

export function DashboardView() {
  return (
    <div className="flex flex-1 h-full flex-col bg-olive-950 overflow-auto p-4 gap-4">
      {/* Top: Performance bar */}
      <DashboardModuleCard
        icon="flame"
        title="Perf Monitor"
        className="h-auto"
      >
        <PerfMonitorPreview />
      </DashboardModuleCard>

      {/* Bottom: Component Inspector (left) + Logs stack (right) */}
      <div className="flex flex-1 gap-4 min-h-0 max-[950px]:flex-col">
        {/* Left: Component Inspector (large) */}
        <DashboardModuleCard
          icon="component"
          title="Components"
          route="/components"
          className="flex-[2] min-w-0 max-[950px]:flex-none"
        >
          <ComponentInspectorPreview />
        </DashboardModuleCard>

        {/* Right: Logs stacked */}
        <div className="flex flex-col flex-1 gap-4 min-w-0 max-[950px]:contents">
          <DashboardModuleCard
            icon="list"
            title="JS Logs"
            route="/js-logs"
            className="flex-1 min-h-0 max-[950px]:flex-none max-[950px]:h-48"
          >
            <JSLogsPreview />
          </DashboardModuleCard>

          <DashboardModuleCard
            icon="terminal"
            title="Native Logs"
            route="/native"
            className="flex-1 min-h-0 max-[950px]:flex-none max-[950px]:h-48"
          >
            <NativeLogsPreview />
          </DashboardModuleCard>

          <DashboardModuleCard
            icon="earth"
            title="Network"
            route="/network"
            className="flex-1 min-h-0 max-[950px]:flex-none max-[950px]:h-48"
          >
            <NetworkLogsPreview />
          </DashboardModuleCard>
        </div>
      </div>
    </div>
  );
}
