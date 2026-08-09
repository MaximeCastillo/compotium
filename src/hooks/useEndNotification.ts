import { useEffect, useRef } from 'react';
import { cancelSessionEnd, scheduleSessionEnd } from '../lib/notifications';

/**
 * Keeps the OS-scheduled "session over" notification in step with the deadline.
 * The JS timer cannot ring once the app is asleep or killed; the OS can, so the
 * deadline is mirrored to it and re-mirrored every time it moves.
 */
export function useEndNotification(endsAt: number | null) {
  // Scheduling and cancelling are async, and a burst of taps fires them faster
  // than they resolve. Chaining every call keeps them ordered, so a notification
  // can never survive the cancel that was meant to replace it.
  const pendingWork = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    // On launch this first runs with a null deadline, before a stored session has
    // been read back — a harmless cancel that the hydrated value re-schedules.
    pendingWork.current = pendingWork.current
      .then(() => (endsAt === null ? cancelSessionEnd() : rescheduleSessionEnd(endsAt)))
      .catch(() => {}); // a notification we cannot schedule must not break the timer
  }, [endsAt]);
}

async function rescheduleSessionEnd(endsAt: number): Promise<void> {
  await cancelSessionEnd();
  await scheduleSessionEnd(endsAt);
}
