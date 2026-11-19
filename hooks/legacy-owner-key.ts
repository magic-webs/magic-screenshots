"use client";

/**
 * Before sign-in existed, projects were scoped to a random per-browser key in
 * localStorage. These helpers read that legacy key so its projects can be
 * claimed by the signed-in user, then forget it.
 */
const STORAGE_KEY = "magicwebs-owner-key";

export function readLegacyOwnerKey(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearLegacyOwnerKey() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable: nothing to clear.
  }
}
