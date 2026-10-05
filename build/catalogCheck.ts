import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { formatCatalogIssues, validateCatalog } from '../src/content/validateCatalog.ts';

const CATALOG_FILE = /catalogo-breakbit\.json$/;

/**
 * Validates the content catalog whenever it is loaded: `pnpm build` fails and the dev
 * server shows its error overlay, naming each item and problem. A production build also
 * lists the icons the catalog names that don't exist yet (the app shows a generic one).
 */
export function catalogCheck(): Plugin {
  let isBuild = false;
  let iconsDir = '';
  return {
    name: 'breakbit-catalog-check',
    enforce: 'pre',
    configResolved(config) {
      isBuild = config.command === 'build' && config.mode !== 'test';
      iconsDir = join(config.publicDir, 'icons');
    },
    transform(code, id) {
      if (!CATALOG_FILE.test(id)) return null;
      let data: unknown;
      try {
        data = JSON.parse(code);
      } catch (error) {
        this.error(`El catálogo de contenido no es un JSON válido: ${(error as Error).message}`);
      }
      const issues = validateCatalog(data);
      if (issues.length > 0) this.error(formatCatalogIssues(issues));
      if (isBuild) {
        const missing = missingIcons(data, iconsDir);
        if (missing.length > 0) {
          this.warn(
            `Iconos del catálogo que aún no existen (se usa uno genérico): ${missing.join(', ')}`,
          );
        }
      }
      return null;
    },
  };
}

/** `section "id" → icon` for every icon the catalog names without an SVG in public/icons. */
export function missingIcons(data: unknown, iconsDir: string): string[] {
  const available = existsSync(iconsDir)
    ? new Set(
        readdirSync(iconsDir)
          .filter((file) => file.endsWith('.svg'))
          .map((file) => file.slice(0, -4)),
      )
    : new Set<string>();
  const missing: string[] = [];
  const sections = data as Record<string, { id: string; icon?: string }[]>;
  for (const section of ['areas', 'equipment', 'exercises', 'routines', 'mainActivities']) {
    for (const item of sections[section] ?? []) {
      if (item.icon && !available.has(item.icon))
        missing.push(`${section} "${item.id}" → ${item.icon}`);
    }
  }
  return missing;
}
