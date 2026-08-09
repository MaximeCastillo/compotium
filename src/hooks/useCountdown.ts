import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import type { SoundLength } from './useSettings';

const MAX_SECONDS = 60 * 60; // a session is capped at 60 minutes
const CHIME_SHORT = require('../../assets/sounds/chime.wav');
const CHIME_LONG = require('../../assets/sounds/chime-long.wav');

// How often we re-read the wall clock. Faster than one second so the displayed
// value flips close to the real boundary even when a tick fires late.
const SYNC_INTERVAL_MS = 250;

// Past this delay we consider we missed the end (the app was backgrounded or
// frozen), so we don't chime retroactively.
const LIVE_END_TOLERANCE_MS = 2000;

/** Whole seconds left until a deadline, floored at zero. */
function secondsUntil(deadline: number) {
  return Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
}

/**
 * The timer's brain: it knows how time flows, not how it looks.
 *
 * The source of truth is `endsAt`, a wall-clock timestamp — not a counter we
 * decrement. The OS freezes JS in the background, so any tick-based count would
 * drift or stall; reading the clock instead makes the countdown self-correcting.
 * `incrementSeconds` (how much one tap adds) and `soundLength` come from settings.
 */
export function useCountdown(incrementSeconds: number, soundLength: SoundLength) {
  const [endsAt, setEndsAt] = useState<number | null>(null); // null = at rest
  const [remaining, setRemaining] = useState(0);
  const isRunning = remaining > 0;
  const isAtMax = remaining >= MAX_SECONDS;

  // Both chimes are preloaded; we play whichever the setting selects. Held in a
  // ref so changing the setting never tears down the running clock below.
  const shortChime = useAudioPlayer(CHIME_SHORT);
  const longChime = useAudioPlayer(CHIME_LONG);
  const playChime = useRef(() => {});
  useEffect(() => {
    playChime.current = () => {
      const chime = soundLength === 'long' ? longChime : shortChime;
      chime.seekTo(0);
      chime.play();
    };
  }, [soundLength, shortChime, longChime]);

  // The clock. Recomputes from the deadline on every tick and every time the app
  // comes back to the foreground, which is when a frozen JS thread wakes up.
  useEffect(() => {
    if (endsAt === null) return;

    // Ticks keep firing until React tears this effect down, so latch the end to
    // make sure we only chime once.
    let hasEnded = false;

    const sync = () => {
      if (hasEnded) return;
      const secondsLeft = secondsUntil(endsAt);
      setRemaining(secondsLeft);
      if (secondsLeft > 0) return;

      hasEnded = true;
      // Natural end. Chime only if we witnessed it live — an end noticed long
      // after the fact belongs to the scheduled notification, not to a late sound.
      if (Date.now() - endsAt < LIVE_END_TOLERANCE_MS) playChime.current();
      setEndsAt(null);
    };

    sync(); // immediately, so the display never lags one interval behind
    const intervalId = setInterval(sync, SYNC_INTERVAL_MS);
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') sync();
    });

    return () => {
      clearInterval(intervalId);
      appStateSubscription.remove();
    };
  }, [endsAt]);

  // One tap pushes the deadline further, never above the 60-minute cap.
  const addTime = () => {
    Haptics.impactAsync(
      isAtMax ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium,
    );
    setEndsAt((currentEndsAt) => {
      const now = Date.now();
      const base = Math.max(currentEndsAt ?? 0, now); // extend a running timer, or start now
      return Math.min(base + incrementSeconds * 1000, now + MAX_SECONDS * 1000);
    });
  };

  // Manual stop: back to rest. Dropping the deadline tears the clock down, so the
  // natural-end branch above is never reached — no completion chime, by construction.
  const reset = () => {
    setEndsAt(null);
    setRemaining(0);
  };

  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');

  return { remaining, endsAt, isRunning, isAtMax, minutes, seconds, addTime, reset };
}
