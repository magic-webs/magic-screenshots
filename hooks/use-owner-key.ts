"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "magicwebs-owner-key";
let memoryKey: string | null = null;

function newKey() {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
}

function getSnapshot() {
  try {
    let key = localStorage.getItem(STORAGE_KEY);
    if (!key) {
      key = newKey();
      localStorage.setItem(STORAGE_KEY, key);
    }
    return key;
  } catch {
    memoryKey ??= newKey();
    return memoryKey;
  }
}

const subscribe = () => () => {};
const getServerSnapshot = () => null;

/**
 * Anonymous per-browser key that scopes projects to this visitor.
 * Returns null during SSR/prerender.
 */
export function useOwnerKey(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
