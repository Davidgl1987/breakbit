/**
 * Asks the browser not to evict our IndexedDB data under storage pressure (and, in
 * Safari, after a week without visits). Best effort: the answer doesn't change anything.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}

/** Whether the browser already keeps our data under storage pressure; undefined if unknown. */
export async function isStoragePersisted(): Promise<boolean | undefined> {
  try {
    return (await navigator.storage?.persisted?.()) ?? undefined;
  } catch {
    return undefined;
  }
}
