import { Tab } from "../../../../shared/ui/tab";
import { WorkspaceTab } from "./types";

export interface WorkspaceTabs {
  onSelectTab: (tab: WorkspaceTab) => void;
  currentTab: WorkspaceTab | null;
}

export function WorkspaceTabs({ onSelectTab, currentTab }: WorkspaceTabs) {
  function handleTabClick(tab: WorkspaceTab) {
    onSelectTab(tab);
  }

  return (
    <div className="flex flex-row w-full justify-start items-center mt-5 border-b border-olive-600">
      <Tab
        iconName="list"
        label="JS logs"
        isSelected={currentTab === WorkspaceTab.JSLogs}
        onClick={() => handleTabClick(WorkspaceTab.JSLogs)}
      />

      <Tab
        iconName="earth"
        label="Network"
        isSelected={currentTab === WorkspaceTab.Network}
        onClick={() => handleTabClick(WorkspaceTab.Network)}
      />
      <Tab
        iconName="terminal"
        label="Native"
        isSelected={currentTab === WorkspaceTab.Native}
        onClick={() => handleTabClick(WorkspaceTab.Native)}
      />
    </div>
  );
}
