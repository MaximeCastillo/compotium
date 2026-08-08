import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';

const FIVE_MINUTES = 5 * 60; // one tap grants five minutes, in seconds
const MAX_SECONDS = 60 * 60; // a session is capped at 60 minutes
const CHIME = require('../../assets/sounds/chime.wav');

/**
 * The timer's brain: it knows how time flows, not how it looks.
 * State is a single number — seconds left — and everything derives from it.
 */
export function useCountdown() {
  const [remaining, setRemaining] = useState(0);
  const isRunning = remaining > 0;
  const isAtMax = remaining >= MAX_SECONDS;

  // Remember the previous value to detect the exact moment we hit zero.
  const previousRemaining = useRef(0);
  // A manual stop also sends remaining to 0 — this flag tells the two apart
  // so the chime only celebrates a *natural* completion.
  const manualStop = useRef(false);

  // The gentle chime played when a session completes.
  const chime = useAudioPlayer(CHIME);

  // The ticking clock. Recreated only when we cross the running boundary;
  // the functional update always sees the latest value, so it stays correct.
  useEffect(() => {
    if (!isRunning) return;
    const intervalId = setInterval(() => {
      setRemaining((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(intervalId); // drop the timer when we stop / unmount
  }, [isRunning]);

  // Gentle feedback the instant the countdown reaches zero on its own:
  // a soft haptic and the chime. Skipped on a manual stop.
  useEffect(() => {
    const endedNaturally = previousRemaining.current > 0 && remaining === 0 && !manualStop.current;
    if (endedNaturally) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      chime.seekTo(0);
      chime.play();
    }
    if (remaining === 0) manualStop.current = false; // clear once handled
    previousRemaining.current = remaining;
  }, [remaining, chime]);

  // One tap = +5 minutes, never above the 60-minute cap.
  const addFiveMinutes = () => {
    Haptics.impactAsync(
      isAtMax ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium,
    );
    setRemaining((seconds) => Math.min(MAX_SECONDS, seconds + FIVE_MINUTES));
  };

  // Manual stop (hold-to-stop): back to rest, without the completion chime.
  const reset = () => {
    manualStop.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setRemaining(0);
  };

  // Total minutes never exceed 60, so this is always two digits (max "60").
  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');

  return { remaining, isRunning, isAtMax, minutes, seconds, addFiveMinutes, reset };
}
