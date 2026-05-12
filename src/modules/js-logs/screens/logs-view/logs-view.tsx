import { WorkspaceContent } from "../../../workspace/components/workspace-content";
import { WorkspaceFilters } from "../../../workspace/components/workspace-filters";

export function JSLogsView() {
  console.log("JS-LOGS-VIEW");
  return (
    <div className="flex flex-1 flex-col w-full h-full pt-4">
      <div className="flex mb-3 gap-2 items-center justify-start w-full px-4 py-2  border-b border-b-olive-700">
        <p className="font-bold text-lg">JS Logs</p>
      </div>
      <WorkspaceFilters />
      <div className="flex mt-3 gap-2 items-center justify-end w-full px-4 py-2 border-t border-t-olive-700 border-b border-b-olive-700">
        <p className="font-medium text-md">Iphone 16</p>
      </div>

      <WorkspaceContent />
    </div>
  );
}
