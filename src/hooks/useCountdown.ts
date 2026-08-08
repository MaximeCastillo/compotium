import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';

const MAX_SECONDS = 60 * 60; // a session is capped at 60 minutes
const CHIME = require('../../assets/sounds/chime.wav');

/**
 * The timer's brain: it knows how time flows, not how it looks.
 * State is a single number — seconds left — and everything derives from it.
 * `incrementSeconds` (how much one tap adds) comes from user settings.
 */
export function useCountdown(incrementSeconds: number) {
  const [remaining, setRemaining] = useState(0);
  const isRunning = remaining > 0;
  const isAtMax = remaining >= MAX_SECONDS;

  // Detect the exact moment we hit zero, and tell a natural end from a manual stop.
  const previousRemaining = useRef(0);
  const manualStop = useRef(false);

  // The gentle chime played when a session completes.
  const chime = useAudioPlayer(CHIME);

  // The ticking clock. Recreated only when we cross the running boundary.
  useEffect(() => {
    if (!isRunning) return;
    const intervalId = setInterval(() => {
      setRemaining((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(intervalId); // drop the timer when we stop / unmount
  }, [isRunning]);

  // On a *natural* end: play the chime (no haptic). Skipped on a manual stop.
  useEffect(() => {
    const endedNaturally = previousRemaining.current > 0 && remaining === 0 && !manualStop.current;
    if (endedNaturally) {
      chime.seekTo(0);
      chime.play();
    }
    if (remaining === 0) manualStop.current = false; // clear once handled
    previousRemaining.current = remaining;
  }, [remaining, chime]);

  // One tap adds the configured amount, never above the 60-minute cap.
  const addTime = () => {
    Haptics.impactAsync(
      isAtMax ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium,
    );
    setRemaining((seconds) => Math.min(MAX_SECONDS, seconds + incrementSeconds));
  };

  // Manual stop: back to rest, silently and without the completion chime.
  const reset = () => {
    manualStop.current = true;
    setRemaining(0);
  };

  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');

  return { remaining, isRunning, isAtMax, minutes, seconds, addTime, reset };
}
