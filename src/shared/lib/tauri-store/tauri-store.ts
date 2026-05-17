import { Store } from "@tauri-apps/plugin-store";
import type { StateStorage } from "zustand/middleware";

let storePromise: Promise<Store> | null = null;

async function getStore(): Promise<Store> {
  if (!storePromise) {
    storePromise = Store.load("mako-store.json", { autoSave: true, defaults: {} });
  }
  return storePromise;
}

export const tauriStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const s = await getStore();
      return (await s.get<string>(name)) ?? null;
    } catch (error) {
      console.warn("Tauri store unavailable:", error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const s = await getStore();
      await s.set(name, value);
    } catch (error) {
      console.warn("Tauri store unavailable:", error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      const s = await getStore();
      await s.delete(name);
    } catch (error) {
      console.warn("Tauri store unavailable:", error);
    }
  },
};
