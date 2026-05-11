import { useState } from "react";
import { WorkspaceFilters } from "../../components/workspace-filters";
import { WorkspaceTabs } from "../../components/workspace-tabs";
import { useWorkspaceDevice } from "../../store";
import { WorkspaceTab } from "../../components/workspace-tabs/types";
import {
  useSideBarIsOpen,
  useSideBarToggle,
} from "../../../../shared/layout/sidebar/store";
import { IconPress } from "../../../../shared/ui/icon";
import { motion } from "motion/react";

export function WorkspaceContent() {
  const workspaceDevice = useWorkspaceDevice();
  const isOpen = useSideBarIsOpen();
  const toggle = useSideBarToggle();

  const [currentTab, setCurrentTab] = useState<WorkspaceTab | null>(
    WorkspaceTab.JSLogs,
  );

  return (
    <div className="flex flex-1 flex-col h-full min-h-screen ">
      <div
        data-tauri-drag-region="true"
        style={{
          height: 30,
          width: "100%",
        }}
      />
      {!isOpen && (
        <motion.div
          initial={{
            opacity: 0,
            height: 0,
            paddingBottom: 0,
            paddingTop: 0,
          }}
          animate={{
            opacity: 1,
            height: 40,
            paddingBottom: 12,
            paddingTop: 12,
          }}
          exit={{
            opacity: 0,
            height: 0,
            paddingBottom: 0,
            paddingTop: 0,
          }}
          className="w-full flex justify-start items-center"
        >
          <IconPress name="panelRight" size={22} onPress={toggle} />
        </motion.div>
      )}
      <WorkspaceFilters />
      <WorkspaceTabs currentTab={currentTab} onSelectTab={setCurrentTab} />
      {workspaceDevice && (
        <div>
          <p>{JSON.stringify(workspaceDevice)}</p>
        </div>
      )}
    </div>
  );
}
