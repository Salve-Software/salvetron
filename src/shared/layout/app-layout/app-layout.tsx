import { Outlet } from "react-router-dom";
import { WorkspaceDebugTabs } from "../../../modules/workspace/components/workspace-debug-tabs";
import { Sidebar } from "../sidebar";
import { WorkspaceHeader } from "../../../modules/workspace/components/workspace-header";

export function AppLayout() {
  return (
    <div className="flex flex-col flex-1 h-screen bg-olive-900">
      <WorkspaceHeader />
      <div className="flex flex-1 items-start h-full flex-row">
        <Sidebar>
          <WorkspaceDebugTabs />
        </Sidebar>
        <Outlet />
      </div>
    </div>
  );
}
