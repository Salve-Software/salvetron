import { useEffect, useRef, useState } from "react";
import { Icon } from "../icon";
import { DropdownOption } from "./types";

export interface DropdownMenuProps {
  label: string;
  options: DropdownOption[];
  variant?: "filled" | "outline";
  leftElement?: React.ReactNode;
  renderItem?: (option: DropdownOption) => React.ReactNode;
  containerWidth?: boolean;
  className?: string;
}

const variantClasses = {
  filled: "bg-olive-800",
  outline: "bg-transparent",
};

export function DropdownMenu({
  label,
  options,
  leftElement,
  variant = "filled",
  containerWidth,
  renderItem,
  className,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const variantClass = variantClasses[variant];

  function handleToggleDropdown() {
    setIsOpen((prev) => !prev);
  }

  function handleSelectOption(option: DropdownOption) {
    option.onClick?.();
    setIsOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={handleToggleDropdown}
        className={`flex shadow min-w-5 p-1 px-2 flex-row gap-1 items-center justify-center ${variantClass} rounded-lg cursor-pointer transition-all duration-150 ease-in hover:opacity-85`}
      >
        {leftElement && (
          <div className="flex gap-2 items-center">{leftElement}</div>
        )}
        <p className="truncate">{label}</p>

        <Icon
          name="chevronDown"
          size={20}
          strokeWidth={3}
          className={`text-olive-500 transition-transform duration-200 ml-2 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      <div
        className={`absolute ${containerWidth ? "w-full" : ""} top-[calc(100%+8px)] left-0  rounded-lg bg-olive-800 shadow-lg overflow-hidden border border-olive-800 transition-all duration-200 origin-top z-50 ${
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {options.map((option) =>
          renderItem ? (
            renderItem(option)
          ) : (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelectOption(option)}
              className="flex gap-2 w-full items-center px-3 py-2 text-left transition-colors hover:opacity-85"
            >
              {option.iconName && (
                <Icon
                  name={option.iconName}
                  size={18}
                  className="text-olive-500"
                />
              )}
              <span className="flex-1 truncate ml-3">{option.label}</span>
            </button>
          ),
        )}
      </div>
    </div>
  );
}
