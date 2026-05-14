/**
 * Tauri Store utilities
 * Provides a singleton store instance and helper functions for persisting data
 */

import { Store } from '@tauri-apps/plugin-store';

let storeInstance: Store | null = null;

/**
 * Returns the singleton Store instance
 * Creates the store if it doesn't exist yet
 */
export function getStore(): Store {
  if (!storeInstance) {
    storeInstance = new Store('mako-store.json');
  }
  return storeInstance;
}

/**
 * Sets a value in the store and saves it
 * @param key - The key to store the value under
 * @param value - The value to store
 */
export async function setStoreValue<T>(key: string, value: T): Promise<void> {
  const store = getStore();
  await store.set(key, value);
  await store.save();
}

/**
 * Gets a value from the store
 * @param key - The key to retrieve the value for
 * @returns The stored value or null if not found
 */
export async function getStoreValue<T>(key: string): Promise<T | null> {
  const store = getStore();
  return await store.get<T>(key);
}

/**
 * Deletes a value from the store
 * @param key - The key to delete
 */
export async function deleteStoreValue(key: string): Promise<void> {
  const store = getStore();
  await store.delete(key);
  await store.save();
}
