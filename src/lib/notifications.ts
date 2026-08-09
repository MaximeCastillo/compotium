import * as Notifications from 'expo-notifications';
import { AppState, Platform } from 'react-native';

const CHANNEL_ID = 'session-end';
const CHANNEL_NAME = 'Fin de session'; // shown to the user in the Android settings
const TITLE = 'Compotium';
const BODY = 'Reviens quand tu veux.';

/**
 * A notification landing while the app is open would double up with the in-app
 * chime. Foreground belongs to the chime, background to the notification —
 * never both. This handler only runs for notifications received while the app
 * is alive; the OS presents the others on its own.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => {
    const isForeground = AppState.currentState === 'active';
    return {
      shouldShowBanner: !isForeground,
      shouldShowList: !isForeground,
      shouldPlaySound: !isForeground,
      shouldSetBadge: false,
    };
  },
});

/**
 * Ask at the moment it matters — the first tap that starts a timer — never at
 * launch. Returns false when the user declines: the caller must stay silent
 * about it and the app must keep working.
 */
export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/** Android only: without a high-importance channel the notification stays silent. */
async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: CHANNEL_NAME,
    importance: Notifications.AndroidImportance.HIGH,
    // `sound` is deliberately absent: omitting it selects the system default.
    // Any string here is looked up as an embedded resource filename — 'default'
    // is not one, which is what the runtime warning was about — and an explicit
    // `null` would make the channel silent.
    vibrationPattern: [0, 400],
  });
}

/**
 * Hand the deadline to the OS, which rings even if the app is asleep or killed.
 *
 * On Android 12+ the delivery is only punctual when the app may schedule *exact*
 * alarms; without that permission the system silently downgrades to an inexact
 * alarm and batches it, which lands the notification tens of seconds late. A
 * native build must therefore declare `USE_EXACT_ALARM` — Compotium is a timer,
 * which is what that permission is reserved for.
 */
export async function scheduleSessionEnd(endsAt: number): Promise<void> {
  if (!(await ensureNotificationPermission())) return;
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    // 'default' is the API's own literal for the system sound, and it is what
    // iOS reads. On Android 8+ the channel decides instead, so this is inert there.
    content: { title: TITLE, body: BODY, sound: 'default' },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: endsAt,
      channelId: CHANNEL_ID,
    },
  });
}

/**
 * Compotium never has more than one session pending, so clearing everything is
 * both correct and cheaper than tracking identifiers.
 */
export async function cancelSessionEnd(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
