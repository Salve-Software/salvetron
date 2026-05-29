/**
 * Component Handler Utilities
 */

import type { MemoType } from '@salve-software/mako-types';

/**
 * Generate a unique component instance ID
 */
export function generateComponentId(): string {
  return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Detect memoization type from component info
 */
export function detectMemoType(
  isMemoized: boolean,
  memoType: MemoType
): MemoType {
  if (!isMemoized) return 'none';
  return memoType;
}
