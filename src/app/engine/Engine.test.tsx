import { act, render } from '@testing-library/react';
import { StrictMode } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '@/domain/defaults';
import { clock } from '@/services/clock';
import { useAppStore } from '@/state/store';
import { sampleAt, sampleDay } from '@/test/sampleDay';
import { Engine } from './Engine';

const store = () => useAppStore.getState();
const SECOND = 1000;
let play: ReturnType<typeof vi.spyOn>;
let notifications: string[];

const ui = () =>
  render(
    <StrictMode>
      <MemoryRouter>
        <Engine />
      </MemoryRouter>
    </StrictMode>,
  );

beforeEach(() => {
  localStorage.clear();
  notifications = [];
  vi.stubGlobal(
    'Notification',
    class {
      static permission: NotificationPermission = 'granted';
      constructor(title: string) {
        notifications.push(title);
      }
      close() {}
    },
  );
  // Looking at another screen: Breakbit is open but not in front.
  vi.spyOn(document, 'hasFocus').mockReturnValue(false);
  play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  store().completeOnboarding(DEFAULT_SETTINGS);
  // Pauses at 10:00, 12:30 and 16:00.
  store().startDay(sampleDay());
});
afterEach(() => {
  clock.setOffset(0);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('pause sound', () => {
  it('comes with each pause exactly once, Strict Mode included', async () => {
    clock.travelTo(sampleAt('10:00') + 30 * SECOND);
    ui();
    await act(async () => {});
    expect(play).toHaveBeenCalledOnce();
    expect(notifications).toEqual(['Hora de moverte']);

    // Its reminder 10 min later notifies again, without the sound.
    await act(async () => clock.travelTo(sampleAt('10:10') + 30 * SECOND));
    expect(play).toHaveBeenCalledOnce();
    expect(notifications).toHaveLength(2);

    // The next pause sounds again.
    await act(async () => clock.travelTo(sampleAt('12:30') + 30 * SECOND));
    expect(play).toHaveBeenCalledTimes(2);
  });

  it('stays silent when turned off, the notification still shown', async () => {
    store().updateSettings({ notifications: { ...DEFAULT_SETTINGS.notifications, sound: false } });
    clock.travelTo(sampleAt('10:00') + 30 * SECOND);
    ui();
    await act(async () => {});
    expect(play).not.toHaveBeenCalled();
    expect(notifications).toEqual(['Hora de moverte']);
  });
});
