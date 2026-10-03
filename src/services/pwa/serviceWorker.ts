/**
 * The service worker only handles notification clicks for now (public/sw.js). It needs a
 * secure context: https, or localhost while developing.
 */
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
    // Without it, notifications fall back to the page and clicks still work while open.
  });
}

/** Navigation requests from the service worker (a notification clicked while the app is open). */
export function onServiceWorkerNavigate(handler: (path: string) => void): () => void {
  const container = typeof navigator === 'undefined' ? undefined : navigator.serviceWorker;
  if (!container) return () => {};
  const listener = (event: MessageEvent) => {
    const data = event.data as { type?: string; url?: string } | null;
    if (data?.type !== 'navigate' || typeof data.url !== 'string') return;
    const url = new URL(data.url, window.location.origin);
    if (url.origin === window.location.origin) handler(`${url.pathname}${url.search}`);
  };
  container.addEventListener('message', listener);
  return () => container.removeEventListener('message', listener);
}
