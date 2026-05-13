import { useEffect, useRef } from "react";
import { Icon } from "../../../../shared/ui/icon";

interface WorkspaceDetailContainerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function WorkspaceDetailContainer({
  isOpen,
  onClose,
  title,
  children,
}: WorkspaceDetailContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      window.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div
      className={`absolute top-0 left-0 right-0 z-40 transition-all duration-200 ease-out ${
        isOpen
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 -translate-y-4 pointer-events-none"
      }`}
    >
      <div
        ref={containerRef}
        className="mx-4 mt-4 bg-olive-900 border border-olive-700 rounded-xl shadow-lg overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-olive-700">
          {title && <p className="font-medium text-sm">{title}</p>}
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-olive-800 transition-colors duration-150"
          >
            <Icon name="close" size={16} className="text-olive-400" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
