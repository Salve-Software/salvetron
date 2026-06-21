import { create } from 'zustand'

interface SearchBarStore {
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
}

export const useSearchBarStore = create<SearchBarStore>((set) => ({
  isOpen: false,
  setOpen: (isOpen) => set({ isOpen }),
}))

export const useIsSearchBarOpen = () => useSearchBarStore((s) => s.isOpen)
