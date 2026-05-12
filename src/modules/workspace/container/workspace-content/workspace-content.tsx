import { WorkspaceFilters } from "../../components/workspace-filters";
import { useWorkspaceDevice } from "../../store";

export function WorkspaceContent() {
  const workspaceDevice = useWorkspaceDevice();

  return (
    <div className="flex flex-1 flex-col h-full w-full pt-4">
      <div className="flex mb-3 gap-2 items-center justify-start w-full px-4 py-2  border-b border-b-olive-700">
        <p className="font-bold text-lg">JS Logs</p>
      </div>
      <WorkspaceFilters />
      <div className="flex mt-3 gap-2 items-center justify-end w-full px-4 py-2 border-t border-t-olive-700 border-b border-b-olive-700">
        <p className="font-medium text-md">Iphone 16</p>
      </div>
      {workspaceDevice && (
        <div>
          <p>{JSON.stringify(workspaceDevice)}</p>
        </div>
      )}
    </div>
  );
}
