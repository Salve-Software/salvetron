import "./app.css";

import { Sidebar } from "./shared/layout/sidebar";

import { RealtimeServiceProvider } from "./shared/services/realtime-service/context";
import { DevicesList } from "./modules/devices/components/devices-list";
import { WorkspaceContent } from "./modules/workspace/container/workspace-content";
import { WorkspaceProjectSelection } from "./modules/workspace/components/workspace-project-selection";

function App() {
  return (
    <RealtimeServiceProvider>
      <main className="flex flex-col flex-1 min-h-screen">
        <div
          data-tauri-drag-region="true"
          className="w-full flex relative bg-[linear-gradient(to_right,theme(colors.blue.500/10%)_0%,theme(colors.blue.500/40%)_10%,theme(colors.blue.500/35%)_15%,transparent_23%,theme(colors.purple.600/5%)_100%)]"
        >
          <div className="flex gap-1 pl-23">
            <WorkspaceProjectSelection />
          </div>
        </div>
        <div className="flex flex-1 min-h-screen items-center flex-row gap-3">
          <Sidebar>
            <DevicesList />
          </Sidebar>

          <WorkspaceContent />
        </div>
      </main>
    </RealtimeServiceProvider>
  );
}

export default App;
