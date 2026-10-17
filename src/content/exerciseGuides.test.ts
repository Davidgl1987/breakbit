import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { EXERCISE_GUIDES } from '@/assets/exerciseGuides';
import { shellFiles } from '../../build/swPrecache';
import { CATALOG } from './catalog';

const root = fileURLToPath(new URL('../../public/exercises/', import.meta.url));

describe('published exercise guides', () => {
  it('covers every catalog exercise with two or three complete, reachable poses', () => {
    expect(Object.keys(EXERCISE_GUIDES).sort()).toEqual(
      CATALOG.exercises.map((exercise) => exercise.id).sort(),
    );
    for (const exercise of CATALOG.exercises) {
      const guide = EXERCISE_GUIDES[exercise.id]!;
      expect([2, 3]).toContain(guide.frames.length);
      expect([...new Set(guide.sequence)].sort()).toEqual(guide.frames.map((_, i) => i));
      expect(readdirSync(`${root}/${exercise.id}`).sort()).toEqual(
        guide.frames.map((_, i) => `${String(i + 1).padStart(2, '0')}.png`),
      );
      for (const [i, frame] of guide.frames.entries()) {
        expect(frame.src).toBe(
          `${import.meta.env.BASE_URL}exercises/${exercise.id}/${String(i + 1).padStart(2, '0')}.png`,
        );
        expect(frame.durationMs).toBeGreaterThan(0);
        expect(frame.description.es.trim()).not.toBe('');
        expect(frame.description.en.trim()).not.toBe('');
        const png = readFileSync(`${root}/${exercise.id}/${String(i + 1).padStart(2, '0')}.png`);
        expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
        expect([png.readUInt32BE(16), png.readUInt32BE(20), png[25]]).toEqual([256, 256, 6]);
      }
    }
  });

  it('includes every published frame and fallback in the offline shell under the Pages path', () => {
    const files = [
      'exercises/avatar.png',
      ...Object.keys(EXERCISE_GUIDES).flatMap((id) =>
        readdirSync(`${root}/${id}`).map((name) => `exercises/${id}/${name}`),
      ),
    ];
    expect(shellFiles(files, '/breakbit/')).toEqual([
      '/breakbit/',
      ...files.sort().map((file) => `/breakbit/${file}`),
    ]);
  });
});
