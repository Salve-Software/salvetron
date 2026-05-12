import { Icon, IconProps } from "../icon";

export interface InputProps extends React.ComponentProps<"input"> {
  leftIcon?: Omit<IconProps, "size">;
}

export function Input({ leftIcon, ...inputProps }: InputProps) {
  return (
    <div className="flex flex-row w-full shadow gap-2 items-center pl-2 p-1 bg-olive-800 rounded-lg">
      {leftIcon && <Icon {...leftIcon} size={18} className="text-olive-500" />}
      <input type="text" {...inputProps} className=" w-full" />
    </div>
  );
}
