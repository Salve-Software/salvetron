import { motion, AnimatePresence } from 'framer-motion';
import { ComponentNode } from '@mako/types/domain/component';
import { getHeatColor } from '../component-tree/utils/get-heat-color';
import { X } from 'lucide-react';

interface ComponentInfoCardProps {
  component: ComponentNode | null;
  onClose: () => void;
}

export function ComponentInfoCard({ component, onClose }: ComponentInfoCardProps) {
  return (
    <AnimatePresence>
      {component
        ?
        <InfoCardContent component={component} onClose={onClose} />
        : null
      }
    </AnimatePresence>
  );
}

function InfoCardContent({
  component,
  onClose,
}: {
  component: ComponentNode;
  onClose: () => void;
}) {
  const heatColor = getHeatColor(component.metrics.heatLevel);
  const totalChanges =
    component.metrics.propsChangeCount +
    component.metrics.stateChangeCount +
    component.metrics.contextChangeCount;

  return (
    <motion.div
      key="info-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute top-4 right-4 bg-olive-900 border border-olive-700 rounded-lg shadow-lg p-4 min-w-[280px] z-50"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-olive-100 font-semibold text-base truncate pr-2">
          {component.name}
        </h3>
        <button
          onClick={onClose}
          className="text-olive-400 hover:text-olive-300 transition-colors flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-olive-400">Render count:</span>
          <span className={`font-semibold ${heatColor}`}>
            {component.metrics.renderCount}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-olive-400">Avg time:</span>
          <span className="text-olive-100">
            {component.metrics.averageRenderTime.toFixed(2)}ms
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-olive-400">Last time:</span>
          <span className="text-olive-100">
            {component.metrics.lastRenderTime.toFixed(2)}ms
          </span>
        </div>

        <div className="border-t border-olive-800 my-2" />

        <div className="flex items-center justify-between">
          <span className="text-olive-400">Total changes:</span>
          <span className="text-olive-100">{totalChanges}</span>
        </div>

        <div className="pl-2 space-y-1 text-xs">
          {component.metrics.propsChangeCount > 0
            ?
            <div className="flex items-center justify-between">
              <span className="text-olive-500">Props:</span>
              <span className="text-olive-300">{component.metrics.propsChangeCount}</span>
            </div>
            : null
          }
          {component.metrics.stateChangeCount > 0
            ?
            <div className="flex items-center justify-between">
              <span className="text-olive-500">State:</span>
              <span className="text-olive-300">{component.metrics.stateChangeCount}</span>
            </div>
            : null
          }
          {component.metrics.contextChangeCount > 0
            ?
            <div className="flex items-center justify-between">
              <span className="text-olive-500">Context:</span>
              <span className="text-olive-300">{component.metrics.contextChangeCount}</span>
            </div>
            : null
          }
        </div>

        <div className="border-t border-olive-800 my-2" />

        <div className="flex items-center justify-between">
          <span className="text-olive-400">Memoized:</span>
          <span className={component.metrics.isMemoized ? 'text-green-400' : 'text-olive-500'}>
            {component.metrics.isMemoized ? `Yes (${component.metrics.memoType})` : 'No'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
