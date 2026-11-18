import { retentionBucket, screenPath } from './analytics';

const DAY = 86_400_000;

describe('screenPath', () => {
  it('drops the id of a pause, an activity or a week', () => {
    expect(screenPath('/pause/abc-123/play')).toBe('/pause/play');
    expect(screenPath('/pause/abc-123')).toBe('/pause');
    expect(screenPath('/main/xyz/done')).toBe('/main/done');
    expect(screenPath('/week/2026-W47')).toBe('/week');
  });

  it('keeps screens without ids as they are', () => {
    expect(screenPath('/')).toBe('/');
    expect(screenPath('/onboarding/intro')).toBe('/onboarding/intro');
    expect(screenPath('/settings/about')).toBe('/settings/about');
  });
});

describe('retentionBucket', () => {
  it('groups the days since the set-up', () => {
    const start = Date.UTC(2026, 10, 2, 9);
    expect(retentionBucket(start, start + 3_600_000)).toBe('d0');
    expect(retentionBucket(start, start + DAY)).toBe('d1');
    expect(retentionBucket(start, start + 6 * DAY)).toBe('d2-6');
    expect(retentionBucket(start, start + 7 * DAY)).toBe('w1');
    expect(retentionBucket(start, start + 20 * DAY)).toBe('w2-3');
    expect(retentionBucket(start, start + 40 * DAY)).toBe('m1');
    expect(retentionBucket(start, start + 90 * DAY)).toBe('m2+');
  });
});
