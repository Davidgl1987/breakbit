import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ICON_NAMES } from './iconNames';

const iconsDir = join(process.cwd(), 'public/icons');

describe('icon library', () => {
  it.each(['16', '24', '32', '48'])('has every named icon at %spx', (size) => {
    const files = readdirSync(join(iconsDir, size))
      .filter((file) => file.endsWith('.png'))
      .map((file) => file.replace(/\.png$/, ''))
      .sort();
    expect(files).toEqual([...ICON_NAMES].sort());
  });
});
