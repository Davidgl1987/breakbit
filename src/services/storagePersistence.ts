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
