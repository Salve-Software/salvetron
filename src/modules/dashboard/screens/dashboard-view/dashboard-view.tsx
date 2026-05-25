import { DashboardGrid } from "../../components/dashboard-grid";
import { DashboardModuleCard } from "../../components/dashboard-module-card";
import { JSLogsPreview } from "../../components/js-logs-preview";
import { NativeLogsPreview } from "../../components/native-logs-preview";
import { NetworkLogsPreview } from "../../components/network-logs-preview";
import { ComponentInspectorPreview } from "../../components/component-inspector-preview";
import { PerfMonitorPreview } from "../../components/perf-monitor-preview";

export function DashboardView() {
  return (
    <div className="flex flex-1 flex-col bg-olive-950 overflow-auto">
      <DashboardGrid>
        <DashboardModuleCard
          icon="list"
          title="JS Logs"
          route="/js-logs"
        >
          <JSLogsPreview />
        </DashboardModuleCard>

        <DashboardModuleCard
          icon="terminal"
          title="Native Logs"
          route="/native"
        >
          <NativeLogsPreview />
        </DashboardModuleCard>

        <DashboardModuleCard
          icon="earth"
          title="Network"
          route="/network"
        >
          <NetworkLogsPreview />
        </DashboardModuleCard>

        <DashboardModuleCard
          icon="component"
          title="Components"
          route="/components"
        >
          <ComponentInspectorPreview />
        </DashboardModuleCard>

        <DashboardModuleCard
          icon="flame"
          title="Performance"
          route="/performance"
        >
          <PerfMonitorPreview />
        </DashboardModuleCard>
      </DashboardGrid>
    </div>
  );
}
