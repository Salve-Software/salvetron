import { Icon } from "../../../../../../shared/ui/icon";
import { IconName } from "../../../../../../shared/ui/icon/types";

export interface DebugTabItemProps {
  isOpen: boolean;
  tabName: string;
  iconName: IconName;
  isFocused?: boolean;
  onClick?: () => void;
}

export function DebugTabItem({
  isOpen,
  tabName,
  iconName,
  isFocused,
  onClick,
}: DebugTabItemProps) {
  return (
    <div
      className={`flex gap-2 ${isFocused ? "bg-blue-500" : ""} w-full justify-start cursor-pointer rounded-lg p-2 transition-all duration-150 hover:bg-olive-800`}
      onClick={onClick}
    >
      <div className="w-6 h-6">
        <Icon
          name={iconName}
          size={22}
          className={isFocused ? "text-olive-300" : "text-olive-500"}
        />
      </div>
      <div className="flex flex-1 items-center">
        {isOpen && <p className="text-md">{tabName}</p>}
      </div>
    </div>
  );
}
