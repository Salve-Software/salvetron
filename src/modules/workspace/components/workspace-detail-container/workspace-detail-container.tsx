import { motion, AnimatePresence } from "motion/react";
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
  return (
    <AnimatePresence>
      {isOpen
        ?
        <motion.div
          initial={{ opacity: 0, height: 0, y: 20 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0, y: 20 }}
          transition={{ damping: 25, stiffness: 300, type: "spring" }}
          className="mx-4 mt-4 bg-olive-900 border border-olive-700 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-olive-700">
            {title ? <p className="font-medium text-sm">{title}</p> : null}
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-olive-800 transition-colors duration-150"
            >
              <Icon name="close" size={16} className="text-olive-400" />
            </button>
          </div>
          <div className="p-4 max-h-[50vh] overflow-y-auto">{children}</div>
        </motion.div>
        : null
      }
    </AnimatePresence>
  );
}
