import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ICON_NAMES } from './iconNames';

const iconsDir = join(process.cwd(), 'public/icons');

describe('icon library', () => {
  it('has a sprite for every named icon, and no other', () => {
    const files = readdirSync(iconsDir)
      .filter((file) => file.endsWith('.png'))
      .map((file) => file.replace(/\.png$/, ''))
      .sort();
    expect(files).toEqual([...ICON_NAMES].sort());
  });

  it('has the bitmaps notifications use', () => {
    const files = readdirSync(join(iconsDir, 'notify')).sort();
    expect(files).toEqual(['goal.png', 'moon.png', 'stretch.png', 'sun.png']);
  });
});
