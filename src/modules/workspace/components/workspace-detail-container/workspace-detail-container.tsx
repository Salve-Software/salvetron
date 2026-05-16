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
  children,
}: WorkspaceDetailContainerProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, animationDuration: 100 }}
          exit={{ opacity: 0, y: 20 , animationDuration:10}}
          transition={{ damping: 25, stiffness: 500, type: "spring" }}
          className="flex flex-col mx-4 mt-4 bg-olive-900 border border-olive-700 rounded-xl shadow-lg overflow-hidden "
        >
          <div className="flex items-center justify-end px-4 py-3 border-b border-olive-700">
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-olive-800 transition-colors duration-150"
            >
              <Icon name="close" size={16} className="text-olive-400" />
            </button>
          </div>
          <div className="p-4 flex flex-1 flex-col  overflow-y-auto max-h-[40vh]">
            {children}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
