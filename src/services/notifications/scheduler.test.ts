import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PlannedNotification } from '@/domain/notifications/schedule';
import { createLocalScheduler } from './scheduler';

const MIN = 60_000;
const NOW = new Date(2026, 9, 5, 10, 0).getTime();
const planned = (id: string, at: number): PlannedNotification => ({
  id,
  kind: 'pause',
  at,
  date: '2026-10-05',
  tag: `pause:${id}`,
  activityId: id,
});
const render = () => ({
  title: 'Hora de moverte',
  body: 'Cuello · 40 s',
  url: '/pause/x',
  icon: '',
});

let shown: { title: string; options?: NotificationOptions }[];

beforeEach(() => {
  localStorage.clear();
  shown = [];
  class FakeNotification {
    static permission: NotificationPermission = 'granted';
    onclick: (() => void) | null = null;
    constructor(title: string, options?: NotificationOptions) {
      shown.push({ title, options });
    }
    close() {}
  }
  vi.stubGlobal('Notification', FakeNotification);
  vi.spyOn(document, 'hasFocus').mockReturnValue(false);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('local notification scheduler', () => {
  it('shows each due notification once, with its tag', async () => {
    const scheduler = createLocalScheduler({ render, onOpen: () => {} });
    const agenda = [planned('a', NOW - MIN), planned('b', NOW + 10 * MIN)];
    scheduler.sync(agenda, NOW);
    scheduler.sync(agenda, NOW + MIN);
    await flush();
    expect(shown).toHaveLength(1);
    expect(shown[0]).toMatchObject({ title: 'Hora de moverte', options: { tag: 'pause:a' } });
  });

  it('remembers what it showed across reloads', async () => {
    createLocalScheduler({ render, onOpen: () => {} }).sync([planned('a', NOW)], NOW);
    createLocalScheduler({ render, onOpen: () => {} }).sync([planned('a', NOW)], NOW);
    await flush();
    expect(shown).toHaveLength(1);
  });

  it('drops reminders that are long overdue', async () => {
    createLocalScheduler({ render, onOpen: () => {} }).sync([planned('a', NOW - 20 * MIN)], NOW);
    await flush();
    expect(shown).toEqual([]);
  });

  it('stays quiet while the app is in front (the banner covers it)', async () => {
    vi.spyOn(document, 'hasFocus').mockReturnValue(true);
    createLocalScheduler({ render, onOpen: () => {} }).sync([planned('a', NOW)], NOW);
    await flush();
    expect(shown).toEqual([]);
  });

  it('shows nothing without permission', async () => {
    (Notification as unknown as { permission: string }).permission = 'denied';
    createLocalScheduler({ render, onOpen: () => {} }).sync([planned('a', NOW)], NOW);
    await flush();
    expect(shown).toEqual([]);
  });
});
