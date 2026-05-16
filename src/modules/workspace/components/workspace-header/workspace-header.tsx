import { Header } from "../../../../shared/layout/header";
import { DeviceSelection } from "../../../devices/components/device-selection";
import { ProjectsSelection } from "../../../projects/components/projects-selection";
import { useCurrentProject } from "../../store";

export function WorkspaceHeader() {
  const currentProject = useCurrentProject();

  return (
    <Header color={currentProject?.color}>
      <ProjectsSelection />
      <DeviceSelection />
    </Header>
  );
}
