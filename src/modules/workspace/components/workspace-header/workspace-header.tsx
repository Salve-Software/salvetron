import { Header } from "../../../../shared/layout/header";
import { DeviceSelection } from "../../../devices/components/device-selection";
import { ProjectsSelection } from "../../../projects/components/projects-selection";

export function WorkspaceHeader() {
  return (
    <Header>
      <ProjectsSelection />
      <DeviceSelection />
    </Header>
  );
}
