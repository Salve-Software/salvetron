import { Header } from "../../../../shared/layout/header";
import { WorkspaceDeviceSelection } from "../workspace-device-selection";
import { WorkspaceProjectSelection } from "../workspace-project-selection";

export function WorkspaceHeader() {
  return (
    <Header>
      <WorkspaceProjectSelection />
      <WorkspaceDeviceSelection />
    </Header>
  );
}
