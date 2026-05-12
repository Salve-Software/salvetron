import { IconPress } from "../../ui/icon";

import { useSideBarIsOpen, useSideBarToggle } from "./store";

export function Sidebar({ children }: React.PropsWithChildren) {
  const isOpen = useSideBarIsOpen();
  const toggle = useSideBarToggle();
  return (
    <div
      className={`flex flex-col border-r border-r-olive-700 shadow h-full items-center transition-all duration-150 ease-in ${isOpen ? "w-50" : "w-18"}`}
    >
      <div className="flex flex-col flex-1 w-full p-4">
        <div className="w-full h-6 flex  items-start justify-end px-2 pb-12 mb-10 border-b border-b-olive-600">
          <IconPress
            name={isOpen ? "panelRightOpen" : "panelRight"}
            size={24}
            onPress={toggle}
            className="text-olive-300"
          />
        </div>
        {children}
      </div>
    </div>
  );
}
