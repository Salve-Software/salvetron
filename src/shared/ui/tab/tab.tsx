import { Icon } from "../icon";
import { IconName } from "../icon/types";

export interface TabProps {
  iconName: IconName;
  label: string;
  onClick?: () => void;
  isSelected?: boolean;
}

export function Tab({ iconName, onClick, isSelected, label }: TabProps) {
  return (
    <div
      className={`flex flex-col gap-2 min-w-25 items-center justify-center cursor-pointer transition-all duration-150 ease-in  ${isSelected ? "" : "hover:opacity-85 hover:scale-[98%]"}`}
      onClick={onClick}
    >
      <div className="flex gap-2  items-center justify-center">
        <Icon name={iconName} size={18} className="text-olive-500" />
        <p className="text-sm">{label}</p>
      </div>
      <div
        className={`h-1 bg-blue-400  rounded-2xl transition-all duration-150 ease-[cubic-bezier(0.16,0.3,0.5,1)] ${isSelected ? "w-full opacity-100" : "w-0 opacity-0"}`}
      />
    </div>
  );
}
