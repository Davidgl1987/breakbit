import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type * as SoundModule from './sound';

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
let play: ReturnType<typeof vi.fn<(this: HTMLMediaElement) => Promise<void>>>;
let pause: ReturnType<typeof vi.spyOn>;
/** Whether each play() call was muted at the time. */
let mutedAtPlay: boolean[];
let sound: typeof SoundModule;

beforeEach(async () => {
  mutedAtPlay = [];
  play = vi.fn(function (this: HTMLMediaElement) {
    mutedAtPlay.push(this.muted);
    return Promise.resolve();
  });
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(play);
  pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  // The module keeps one element and its unlock state: a fresh one per test.
  vi.resetModules();
  sound = await import('./sound');
});
afterEach(() => vi.restoreAllMocks());

describe('pause sound', () => {
  it('plays Breakbit’s sound once, from the start, at a fixed volume', () => {
    sound.playPauseSound();
    expect(play).toHaveBeenCalledOnce();
    const element = play.mock.contexts[0] as HTMLAudioElement;
    expect(element.src).toMatch(/\/sounds\/breakbit-notify\.mp3$/);
    expect(element.volume).toBe(0.7);
    expect(mutedAtPlay).toEqual([false]);
  });

  it('ignores a refusal from the browser', async () => {
    play.mockImplementation(() => Promise.reject(new DOMException('No', 'NotAllowedError')));
    expect(() => sound.playPauseSound()).not.toThrow();
    await flush();
  });

  it('unlocks without being heard: muted, then stopped', async () => {
    sound.unlockPauseSound();
    expect(mutedAtPlay).toEqual([true]);
    await flush();
    expect(pause).toHaveBeenCalledOnce();
    const element = play.mock.contexts[0] as HTMLAudioElement;
    expect(element.muted).toBe(false);
  });

  it('does not cut the sound that the same tap starts ("Probar sonido")', async () => {
    sound.unlockPauseSound();
    sound.playPauseSound();
    await flush();
    expect(mutedAtPlay).toEqual([true, false]);
    expect(pause).not.toHaveBeenCalled();
  });

  it('unlocks on a tap or key press, trying again until the browser allows it', async () => {
    play.mockImplementationOnce(() => Promise.reject(new Error('Not yet')));
    const stop = sound.unlockPauseSoundOnInteraction();
    document.body.click();
    await flush();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await flush();
    document.body.click();
    await flush();
    // Refused, then allowed (muted); once unlocked, taps play nothing.
    expect(play).toHaveBeenCalledTimes(2);
    expect(mutedAtPlay).toEqual([true]);
    stop();
  });
});
