import { Store } from "@tauri-apps/plugin-store";
import type { StateStorage } from "zustand/middleware";

let store: Store | null = null;

async function getStore(): Promise<Store> {
  if (!store) {
    store = await Store.load("mako-store.json", { autoSave: true });
  }
  return store;
}

export const tauriStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const s = await getStore();
      return (await s.get<string>(name)) ?? null;
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const s = await getStore();
      await s.set(name, value);
    } catch {
      // Silently fail in browser dev mode
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      const s = await getStore();
      await s.delete(name);
    } catch {
      // Silently fail in browser dev mode
    }
  },
};
