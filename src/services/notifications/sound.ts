/**
 * Breakbit's short pause sound, played by the app itself: notifications can't carry a
 * sound of their own everywhere, and a notification alone is easy to miss while looking
 * at another screen. It only plays while the app is open (in any tab state).
 *
 * Browsers only let a page play audio once the user has interacted with it; Safari also
 * wants that first play() to come from a tap or key press on the very same element. So the
 * first interaction plays it muted for an instant, and later pauses can sound on their own.
 */
const SOUND_URL = `${import.meta.env.BASE_URL}sounds/breakbit-notify.mp3`;
const VOLUME = 0.7;

let audio: HTMLAudioElement | undefined;
let unlock: 'locked' | 'unlocking' | 'unlocked' = 'locked';

function element(): HTMLAudioElement | undefined {
  if (typeof Audio === 'undefined') return undefined;
  if (!audio) {
    audio = new Audio(SOUND_URL);
    audio.preload = 'auto';
    audio.volume = VOLUME;
  }
  return audio;
}

/** Plays the sound once, from the start. A refusal (autoplay rules, no device) is ignored. */
export function playPauseSound(): void {
  const sound = element();
  if (!sound) return;
  sound.muted = false;
  try {
    sound.currentTime = 0;
    void sound.play().catch(() => {});
  } catch {
    // Old browsers return no promise from play(); nothing else to do.
  }
}

/**
 * Lets the browser play the sound later without a tap. Call it from a user's tap or key
 * press: it plays muted and stops at once, so nothing is heard. Retried on the next
 * interaction if the browser said no.
 */
export function unlockPauseSound(): void {
  const sound = element();
  if (!sound || unlock !== 'locked') return;
  unlock = 'unlocking';
  sound.muted = true;
  const settle = (unlocked: boolean) => {
    unlock = unlocked ? 'unlocked' : 'locked';
    // The same tap may have started the real sound ("Probar sonido"): leave that one be.
    if (!sound.muted) return;
    if (unlocked) {
      sound.pause();
      sound.currentTime = 0;
    }
    sound.muted = false;
  };
  try {
    sound.play().then(
      () => settle(true),
      () => settle(false),
    );
  } catch {
    settle(false);
  }
}

/**
 * Unlocks the sound with the user's first tap or key press on the page ("Empezar jornada",
 * or anything after a reload mid-day). Returns the function that stops listening.
 */
export function unlockPauseSoundOnInteraction(): () => void {
  const onInteraction = () => unlockPauseSound();
  window.addEventListener('click', onInteraction, true);
  window.addEventListener('keydown', onInteraction, true);
  return () => {
    window.removeEventListener('click', onInteraction, true);
    window.removeEventListener('keydown', onInteraction, true);
  };
}
