import { describe, expect, it } from 'vitest';
import { screenDepth, transitionKind } from './transitionKind';

describe('transitionKind', () => {
  it('slides between tabs in the order of the bar, sections included', () => {
    expect(transitionKind('/', '/progress')).toBe('slide-forward');
    expect(transitionKind('/progress', '/settings')).toBe('slide-forward');
    expect(transitionKind('/settings', '/')).toBe('slide-back');
    expect(transitionKind('/settings/schedule', '/progress')).toBe('slide-back');
  });

  it('slides between onboarding steps forwards and back', () => {
    expect(transitionKind('/onboarding/welcome', '/onboarding/schedule')).toBe('slide-forward');
    expect(transitionKind('/onboarding/intensity', '/onboarding/equipment')).toBe('slide-back');
  });

  it('grows "Tengo un hueco" out of its button and shrinks it back on closing', () => {
    expect(transitionKind('/', '/gap')).toBe('gap-open');
    expect(transitionKind('/settings/about', '/gap')).toBe('gap-open');
    expect(transitionKind('/gap', '/progress')).toBe('gap-close');
    expect(transitionKind('/gap/m1', '/')).toBe('gap-close');
  });

  it('moves inside the gap flow and out of it into a pause like any deeper screen', () => {
    expect(transitionKind('/gap', '/gap/m3')).toBe('push');
    expect(transitionKind('/gap/m3', '/gap')).toBe('pop');
    expect(transitionKind('/gap/m1', '/pause/2026-10-05%23gap/play')).toBe('push');
    expect(transitionKind('/gap', '/day/start')).toBe('push');
  });

  it('rises going deeper and drops coming back', () => {
    expect(transitionKind('/', '/pause/a')).toBe('push');
    expect(transitionKind('/pause/a', '/pause/a/play')).toBe('push');
    expect(transitionKind('/pause/a/play', '/pause/a/done')).toBe('push');
    expect(transitionKind('/pause/a/done', '/')).toBe('pop');
    expect(transitionKind('/settings', '/settings/schedule')).toBe('push');
    expect(transitionKind('/settings/schedule', '/settings')).toBe('pop');
    expect(transitionKind('/day/end', '/')).toBe('pop');
  });

  it('cross-fades between screens at the same depth', () => {
    expect(transitionKind('/onboarding/summary', '/')).toBe('fade');
    expect(transitionKind('/day/end', '/main/x')).toBe('fade');
  });
});

describe('screenDepth', () => {
  it('orders the steps of a pause and of the main activity', () => {
    expect(['/', '/pause/a', '/pause/a/play', '/pause/a/done'].map(screenDepth)).toEqual([
      0, 1, 2, 3,
    ]);
    expect(['/main/a', '/main/a/done'].map(screenDepth)).toEqual([1, 2]);
  });
});
