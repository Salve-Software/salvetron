import { useSideBarStore } from "./sidebar.store";

export function useSideBarIsOpen() {
  return useSideBarStore((state) => state.isOpen);
}

export function useSideBarToggle() {
  return useSideBarStore((state) => state.toggle);
}
