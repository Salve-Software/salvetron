import { motion, AnimatePresence } from "motion/react";
import { Icon } from "../icon";

export interface FloatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function FloatingModal({
  isOpen,
  onClose,
  title,
  children,
}: FloatingModalProps) {
  return (
    <AnimatePresence>
      {isOpen
        ?
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl max-h-[70vh] bg-olive-900 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden border border-olive-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-olive-700 shrink-0">
              <h3 className="text-base font-semibold text-olive-100">{title}</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-olive-800 transition-colors"
              >
                <Icon name="close" size={18} className="text-olive-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {children}
            </div>
          </motion.div>
        </>
        : null
      }
    </AnimatePresence>
  );
}
