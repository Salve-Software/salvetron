import { Icon, IconProps } from "./icon";

export interface IconPressProps extends IconProps {
  onPress: () => void;
}

export function IconPress({ onPress, ...iconProps }: IconPressProps) {
  return (
    <button
      onClick={onPress}
      className="transition-all duration-150 ease-in hover:opacity-85"
    >
      <Icon {...iconProps} />
    </button>
  );
}
