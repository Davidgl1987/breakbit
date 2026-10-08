import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { missingIcons } from './catalogCheck';

describe('missingIcons', () => {
  it('lists the icons the catalog names without a sprite', () => {
    const dir = mkdtempSync(join(tmpdir(), 'breakbit-icons-'));
    writeFileSync(join(dir, 'neck.png'), '');
    writeFileSync(join(dir, 'mat.svg'), '');
    const data = {
      areas: [{ id: 'neck', icon: 'neck' }],
      equipment: [{ id: 'mat', icon: 'mat' }, { id: 'band' }],
    };
    expect(missingIcons(data, dir)).toEqual(['equipment "mat" → mat']);
  });

  it('finds every icon the bundled catalog names', () => {
    const catalog: unknown = JSON.parse(
      readFileSync(join(process.cwd(), 'src/content/catalogo-breakbit.json'), 'utf8'),
    );
    expect(missingIcons(catalog, join(process.cwd(), 'public/icons'))).toEqual([]);
  });
});
