import { useMemo } from 'react'
import { useSelectedDeviceId } from '../store/device.store.js'

export function useDeviceFiltered<T>(
  items: T[],
  getDeviceId: (item: T) => string | undefined,
): T[] {
  const selectedDeviceId = useSelectedDeviceId()

  return useMemo(
    () =>
      selectedDeviceId
        ? items.filter((item) => (getDeviceId(item) ?? 'unknown') === selectedDeviceId)
        : items,
    [items, selectedDeviceId, getDeviceId],
  )
}
