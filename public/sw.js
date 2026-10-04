/*
 * Breakbit service worker.
 * - Opens the right screen when a notification is clicked.
 * - In production builds it keeps the app shell for offline use. The build fills in the
 *   version and the files to keep (see vite.config.ts); in development nothing is cached,
 *   so the dev server always serves fresh code.
 */
const VERSION = '__BREAKBIT_VERSION__';
const PRECACHE = /* __BREAKBIT_PRECACHE__ */ [];
const SHELL = `breakbit-shell-${VERSION}`;
const OFFLINE = PRECACHE.length > 0;
// Module scripts are requested with an Origin header and servers often answer with
// `Vary`; the kept files belong to this version, so they match whatever the headers.
const MATCH = { ignoreVary: true };

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      if (OFFLINE) await (await caches.open(SHELL)).addAll(PRECACHE);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Caches from older versions go.
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith('breakbit-') && key !== SHELL)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  if (!OFFLINE) return;
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    // Network first, so a new version shows up at once; the kept shell when offline.
    event.respondWith(
      fetch(request).catch(
        async () => (await caches.match('/index.html', MATCH)) ?? Response.error(),
      ),
    );
    return;
  }

  // The shell's files belong to this version (a change makes a new one): cache first.
  event.respondWith(
    (async () => (await caches.match(request, MATCH)) ?? fetch(request))(),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url ?? '/', self.location.origin).href;
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const open = windows.find((client) => new URL(client.url).origin === self.location.origin);
      if (open) {
        // The app is open: bring it to the front and let it navigate.
        await open.focus();
        open.postMessage({ type: 'navigate', url });
        return;
      }
      await self.clients.openWindow(url);
    })(),
  );
});
