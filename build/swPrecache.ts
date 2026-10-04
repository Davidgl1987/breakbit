import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import type { Plugin } from 'vite';

/**
 * What the offline shell keeps: the page, built code and styles, fonts, the manifest, app
 * icons and favicons, the wordmark and the pixel icons (small, ~370 KB in all, and shown
 * from the first screen).
 */
export function shellFiles(files: readonly string[]): string[] {
  const keep = (file: string) =>
    file === 'index.html' ||
    file === 'manifest.webmanifest' ||
    file === 'favicon.ico' ||
    file.startsWith('app-icons/') ||
    file.startsWith('brand/') ||
    (file.startsWith('icons/') && file.endsWith('.png')) ||
    (file.startsWith('assets/') && /\.(js|css|woff2)$/.test(file));
  return [
    '/',
    ...files
      .filter(keep)
      .map((file) => `/${file}`)
      .sort(),
  ];
}

/** Fills the service worker's version and shell list after a production build. */
export function swPrecache(): Plugin {
  let outDir = 'dist';
  return {
    name: 'breakbit-sw-precache',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      const files = walk(outDir).map((file) => relative(outDir, file).split(sep).join('/'));
      const shell = shellFiles(files);
      const hash = createHash('sha256');
      for (const file of shell.slice(1)) hash.update(file).update(readFileSync(join(outDir, file)));
      const swPath = join(outDir, 'sw.js');
      const source = readFileSync(swPath, 'utf8');
      if (!source.includes('__BREAKBIT_PRECACHE__')) throw new Error('sw.js has no precache slot');
      writeFileSync(
        swPath,
        source
          .replace('__BREAKBIT_VERSION__', hash.digest('hex').slice(0, 12))
          .replace('/* __BREAKBIT_PRECACHE__ */ []', JSON.stringify(shell)),
      );
    },
  };
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}
