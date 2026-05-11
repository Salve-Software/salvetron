import { IconPress } from "../../ui/icon";
import { useSideBarIsOpen, useSideBarToggle } from "./store";

export function Sidebar({ children }: React.PropsWithChildren) {
  const isOpen = useSideBarIsOpen();
  const toggle = useSideBarToggle();
  return (
    <div
      className={`flex flex-col border border-olive-700 shadow min-h-screen items-center bg-olive-900 rounded-tr-lg rounded-br-lg transition-all duration-200 ease-in ${isOpen ? "w-[25vw]" : "w-0"}`}
    >
      <div className="flex flex-col flex-1 w-full p-4">
        <div className="w-full gap-2 flex justify-end">
          <IconPress
            name={isOpen ? "panelRightOpen" : "panelRight"}
            size={22}
            onPress={toggle}
          />
        </div>
        {isOpen && children}
      </div>
    </div>
  );
}
