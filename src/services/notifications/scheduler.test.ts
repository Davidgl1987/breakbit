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

let shown: { title: string; options?: NotificationOptions; closed?: boolean }[];

beforeEach(() => {
  localStorage.clear();
  shown = [];
  class FakeNotification {
    static permission: NotificationPermission = 'granted';
    onclick: (() => void) | null = null;
    private readonly entry: (typeof shown)[number];
    constructor(title: string, options?: NotificationOptions) {
      this.entry = { title, options };
      shown.push(this.entry);
    }
    close() {
      this.entry.closed = true;
    }
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

describe('due notifications', () => {
  it('reports each one once as it comes due, even with the app in front', async () => {
    vi.spyOn(document, 'hasFocus').mockReturnValue(true);
    const onDue = vi.fn();
    const scheduler = createLocalScheduler({ render, onOpen: () => {}, onDue });
    const agenda = [planned('a', NOW - MIN), planned('b', NOW + 10 * MIN)];
    scheduler.sync(agenda, NOW);
    scheduler.sync(agenda, NOW + MIN);
    await flush();
    expect(onDue).toHaveBeenCalledOnce();
    expect(onDue).toHaveBeenCalledWith(agenda[0]);
    expect(shown).toEqual([]);
  });

  it('reports nothing long overdue', () => {
    const onDue = vi.fn();
    createLocalScheduler({ render, onOpen: () => {}, onDue }).sync(
      [planned('a', NOW - 20 * MIN)],
      NOW,
    );
    expect(onDue).not.toHaveBeenCalled();
  });

  it('delivers once between two schedulers alive at once (Strict Mode, two tabs)', async () => {
    const onDue = vi.fn();
    const first = createLocalScheduler({ render, onOpen: () => {}, onDue });
    const second = createLocalScheduler({ render, onOpen: () => {}, onDue });
    first.sync([planned('a', NOW)], NOW);
    second.sync([planned('a', NOW)], NOW);
    await flush();
    expect(onDue).toHaveBeenCalledOnce();
    expect(shown).toHaveLength(1);
  });
});

describe('notifications kept on screen', () => {
  const kept = () => ({ ...render(), requireInteraction: true });

  it('stay while the pause waits for an answer and go once it is answered', async () => {
    const scheduler = createLocalScheduler({ render: kept, onOpen: () => {} });
    scheduler.sync([planned('a', NOW)], NOW);
    await flush();
    expect(shown[0]?.options).toMatchObject({ requireInteraction: true });

    scheduler.sync([planned('a', NOW)], NOW + MIN);
    await flush();
    expect(shown[0]?.closed).toBeUndefined();

    // Answered (or started, or missed): it is no longer on the agenda.
    scheduler.sync([], NOW + 2 * MIN);
    await flush();
    expect(shown[0]?.closed).toBe(true);
  });

  it('are closed through the service worker too, leaving the others alone', async () => {
    const answered = { tag: 'pause:a', requireInteraction: true, close: vi.fn() };
    const waiting = { tag: 'pause:b', requireInteraction: true, close: vi.fn() };
    const fading = { tag: 'day-start', requireInteraction: false, close: vi.fn() };
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        getRegistration: async () => ({
          showNotification: vi.fn(),
          getNotifications: async () => [answered, waiting, fading],
        }),
      },
    });
    try {
      createLocalScheduler({ render: kept, onOpen: () => {} }).sync([planned('b', NOW)], NOW);
      await flush();
      expect(answered.close).toHaveBeenCalled();
      expect(waiting.close).not.toHaveBeenCalled();
      expect(fading.close).not.toHaveBeenCalled();
    } finally {
      Reflect.deleteProperty(navigator, 'serviceWorker');
    }
  });
});
