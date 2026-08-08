import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';

const FIVE_MINUTES = 5 * 60; // one tap grants five minutes, in seconds
const MAX_SECONDS = 60 * 60; // a session is capped at 60 minutes

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

  // The ticking clock. Recreated only when we cross the running boundary;
  // the functional update always sees the latest value, so it stays correct.
  useEffect(() => {
    if (!isRunning) return;
    const intervalId = setInterval(() => {
      setRemaining((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(intervalId); // drop the timer when we stop / unmount
  }, [isRunning]);

  // Gentle completion feedback the instant the countdown reaches zero.
  useEffect(() => {
    if (previousRemaining.current > 0 && remaining === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    previousRemaining.current = remaining;
  }, [remaining]);

  // One tap = +5 minutes, never above the 60-minute cap.
  const addFiveMinutes = () => {
    Haptics.impactAsync(
      isAtMax ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium,
    );
    setRemaining((seconds) => Math.min(MAX_SECONDS, seconds + FIVE_MINUTES));
  };

  // Long-press cancels back to rest.
  const reset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setRemaining(0);
  };

  // Total minutes never exceed 60, so this is always two digits (max "60").
  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');

  return { remaining, isRunning, isAtMax, minutes, seconds, addFiveMinutes, reset };
}
