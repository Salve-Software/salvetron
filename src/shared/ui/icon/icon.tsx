import { buildIcon } from "./library/build-icon";
import type { IconName } from "./types";

export interface IconProps {
  name: IconName;
  size: number;
  className?: string;
  strokeWidth?: number;
}

export function Icon({ name, size, className, strokeWidth }: IconProps) {
  const Icon = buildIcon(name);
  return <Icon size={size} className={className} strokeWidth={strokeWidth} />;
}
