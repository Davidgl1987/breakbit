import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * WCAG AA contrast of the color pairs the components use: 4.5:1 for text, 3:1 for focus
 * rings and control outlines. axe checks the screens it can reach; this checks every pair,
 * including states it may not see (a postponed badge, a disabled-looking caption…).
 */
// Read from disk: the test runner hands CSS imports over empty.
const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'tokens.css'), 'utf8');

function block(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  const body = css.slice(start, css.indexOf('\n}', start));
  return Object.fromEntries(
    [...body.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})\b/gi)].map(([, name, value]) => [
      name!,
      value!.toLowerCase(),
    ]),
  );
}

const light = block(':root');
const themes = { light, dark: { ...light, ...block(":root[data-theme='dark']") } };

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const channel = parseInt(hex.slice(i, i + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

const TEXT = 4.5;
const UI = 3;

/** [foreground, background, minimum] by token name. */
const PAIRS: [string, string, number][] = [
  ...['bg', 'surface', 'surface-muted', 'surface-sunken', 'nav'].map(
    (bg): [string, string, number] => ['text', `color-${bg}`, TEXT],
  ),
  ['text-muted', 'color-bg', TEXT],
  ['text-muted', 'color-surface', TEXT],
  ['text-muted', 'color-surface-muted', TEXT],
  // Captions and secondary labels, only ever on cards.
  ['text-subtle', 'color-surface', TEXT],
  ['on-primary', 'color-primary', TEXT],
  ['on-primary', 'color-primary-hover', TEXT],
  ['on-primary', 'color-primary-pressed', TEXT],
  ['on-danger', 'color-danger', TEXT],
  ['on-danger', 'color-danger-pressed', TEXT],
  ['primary-text', 'color-bg', TEXT],
  ['primary-text', 'color-surface', TEXT],
  ['primary-text', 'color-primary-soft', TEXT],
  ['danger-text', 'color-surface', TEXT],
  ['danger-text', 'color-primary-soft', TEXT],
  ['danger-text', 'color-bg', TEXT],
  ['danger-text', 'color-danger-soft', TEXT],
  ['warning-text', 'color-surface', TEXT],
  ['warning-text', 'color-warning-soft', TEXT],
  ['pending', 'color-surface', TEXT],
  ['pending', 'color-pending-soft', TEXT],
  ['extra', 'color-surface', TEXT],
  ['extra', 'color-extra-soft', TEXT],
  ['focus', 'color-bg', UI],
  ['focus', 'color-surface', UI],
  ['primary', 'color-surface', UI],
];

describe.each(Object.entries(themes))('%s theme contrast', (_, tokens) => {
  it.each(PAIRS)('%s on %s ≥ %s:1', (fg, bg, min) => {
    const foreground = tokens[`color-${fg}`];
    const background = tokens[bg];
    expect(foreground, fg).toBeDefined();
    expect(background, bg).toBeDefined();
    expect(contrast(foreground!, background!)).toBeGreaterThanOrEqual(min);
  });
});

it('white on the "Tengo un hueco" gradient stays ≥ 4:1 at both ends (more in the middle)', () => {
  const stops = [
    ...css.matchAll(/--fab-gradient: linear-gradient\(180deg, (#\w{6}) 0%, (#\w{6}) 100%\)/g),
  ];
  expect(stops).toHaveLength(2);
  for (const stop of stops.flatMap((match) => [match[1]!, match[2]!])) {
    expect(contrast('#ffffff', stop), stop).toBeGreaterThanOrEqual(4);
  }
});
