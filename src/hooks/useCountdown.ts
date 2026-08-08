import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';

const FIVE_MINUTES = 5 * 60; // one tap grants five minutes, in seconds

/**
 * The timer's brain: it knows how time flows, not how it looks.
 * Everything visual lives in the components; this hook stays pure logic
 * (like a Rails service object). Components just consume what it returns.
 */
export function useCountdown() {
  // The whole state is one number: seconds left. 0 means "at rest".
  const [remaining, setRemaining] = useState(0);
  const isRunning = remaining > 0;

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

  const addFiveMinutes = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRemaining((seconds) => seconds + FIVE_MINUTES);
  };

  const reset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setRemaining(0);
  };

  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');

  return { remaining, isRunning, minutes, seconds, addFiveMinutes, reset };
}
