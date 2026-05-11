import { create } from "zustand";

export interface SideBarStore {
  isOpen: boolean;
  toggle: () => void;
}

export const useSideBarStore = create<SideBarStore>((set) => ({
  isOpen: true,
  toggle: () => {
    set((state) => ({ isOpen: !state.isOpen }));
  },
}));
