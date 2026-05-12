import { WorkspaceDeviceSelection } from "../../../modules/workspace/components/workspace-device-selection";
import { WorkspaceProjectSelection } from "../../../modules/workspace/components/workspace-project-selection";

export function Header() {
  return (
    <div
      data-tauri-drag-region="true"
      className="w-full flex relative bg-[linear-gradient(to_right,theme(colors.blue.500/10%)_0%,theme(colors.blue.500/35%)_10%,theme(colors.blue.500/25%)_14%,transparent_20%,transparent_100%)]"
    >
      <div className="flex gap-5 pl-23">
        <WorkspaceProjectSelection />
        <WorkspaceDeviceSelection />
      </div>
    </div>
  );
}
