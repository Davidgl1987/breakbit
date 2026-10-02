/** Controllable matchMedia stub (jsdom has none). */
let systemDark = false;
const listeners = new Set<() => void>();

export function setSystemDark(dark: boolean) {
  systemDark = dark;
  listeners.forEach((listener) => listener());
}

export function resetMatchMedia() {
  systemDark = false;
  listeners.clear();
}

export function installMatchMedia() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      get matches() {
        return query.includes('dark') && systemDark;
      },
      media: query,
      addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
    }),
  });
}
