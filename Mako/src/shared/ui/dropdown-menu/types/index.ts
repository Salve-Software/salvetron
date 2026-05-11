import { IconName } from "../../icon/types";

export interface DropdownOption {
  label: string;
  value: string;
  iconName?: IconName;
  onClick?: () => void;
}
