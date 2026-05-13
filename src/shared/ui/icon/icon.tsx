import { buildIcon } from "./library/build-icon";
import type { IconName } from "./types";

export interface IconComponentProps {
  size: number;
  className?: string;
  strokeWidth?: number;
}

export interface IconProps extends IconComponentProps {
  name: IconName;
}

export function Icon({ name, size, className, strokeWidth }: IconProps) {
  const IconComponent = buildIcon(name);
  return <IconComponent size={size} className={className} strokeWidth={strokeWidth} />;
}
