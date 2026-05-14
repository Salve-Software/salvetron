import { useLocation, useNavigate } from "react-router-dom";
import { useSideBarIsOpen } from "../../../../shared/layout/sidebar/store";

import { DebugTabItem } from "./components/debug-tab-item";

export function WorkspaceDebugTabs() {
  const isOpen = useSideBarIsOpen();
  const location = useLocation();
  const navigate = useNavigate();

  function handleTabClick(tabName: string) {
    navigate(`${tabName.toLowerCase()}`);
  }
  return (
    <div className="w-full flex  flex-col gap-6 items-start ">
      <div className="w-full flex flex-col gap-4 items-start">
          {isOpen && (
          <p className="font-medium text-xs uppercase  text-olive-400">
            main
          </p>
        )}
        <DebugTabItem
          iconName="list"
          tabName="JS Logs"
          isOpen={isOpen}
          isFocused={location.pathname.includes("js-logs")}
          onClick={() => handleTabClick("js-logs")}
        />
        <DebugTabItem
          iconName="terminal"
          tabName="Native"
          isOpen={isOpen}
          isFocused={location.pathname.includes("native")}
          onClick={() => handleTabClick("native")}
        />
        <DebugTabItem
          iconName="earth"
          tabName="Network"
          isOpen={isOpen}
          isFocused={location.pathname.includes("network")}
          onClick={() => handleTabClick("network")}
        />
      </div>

      <div className="w-full flex flex-col gap-4 items-start">
        {isOpen && (
          <p className="font-medium text-xs uppercase  text-olive-400">
            Performance
          </p>
        )}
        <DebugTabItem
          iconName="code"
          tabName="Components"
          isOpen={isOpen}
          isFocused={location.pathname.includes("components")}
          onClick={() => handleTabClick("components")}
        />
      </div>
    </div>
  );
}
