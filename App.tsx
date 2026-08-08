import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

const FIVE_MINUTES = 5 * 60; // one tap grants five minutes, in seconds

export default function App() {
  // The whole app state fits in one number: how many seconds are left.
  // remaining === 0 means "at rest" (nothing running).
  const [remaining, setRemaining] = useState(0);
  const isRunning = remaining > 0;

  // Keep the previous value so we can detect the exact moment we reach zero.
  const previousRemaining = useRef(0);

  // The ticking clock. We (re)create the interval only when we cross the
  // running/at-rest boundary, not on every second — the functional update
  // (s => s - 1) always sees the latest value, so it stays correct.
  useEffect(() => {
    if (!isRunning) return;
    const intervalId = setInterval(() => {
      setRemaining((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(intervalId); // cleanup: drop the timer when we stop / unmount
  }, [isRunning]);

  // Gentle completion feedback the moment the countdown hits zero.
  useEffect(() => {
    if (previousRemaining.current > 0 && remaining === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    previousRemaining.current = remaining;
  }, [remaining]);

  // One tap = +5 minutes (added to whatever is left) + a crisp tactile pulse.
  const addFiveMinutes = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRemaining((seconds) => seconds + FIVE_MINUTES);
  };

  // Long-press to cancel and go back to rest.
  const reset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setRemaining(0);
  };

  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />

      <View style={styles.content}>
        <Text style={[styles.time, isRunning ? styles.timeActive : styles.timeIdle]}>
          {minutes}:{seconds}
        </Text>

        <Pressable
          onPress={addFiveMinutes}
          onLongPress={reset}
          style={({ pressed }) => [
            styles.button,
            isRunning && styles.buttonActive,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonPlus}>+5</Text>
          <Text style={styles.buttonUnit}>min</Text>
        </Pressable>

        <Text style={styles.hint}>
          {isRunning ? 'Tapote pour +5 · appui long pour arrêter' : 'Tapote pour te poser'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const ACCENT = '#4FD1C5'; // calm teal
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0C0F14',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 48,
  },
  time: {
    fontSize: 76,
    fontVariant: ['tabular-nums'], // digits keep a fixed width, no jitter
    fontWeight: '200',
    letterSpacing: 2,
  },
  timeIdle: {
    color: '#3A424E',
  },
  timeActive: {
    color: '#EDEFF3',
  },
  button: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#141922',
    borderWidth: 1,
    borderColor: '#26303C',
    // Soft glow (iOS uses shadow*, Android uses elevation).
    shadowColor: ACCENT,
    shadowOpacity: 0.25,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  buttonActive: {
    borderColor: ACCENT,
  },
  buttonPressed: {
    transform: [{ scale: 0.96 }],
    backgroundColor: '#171d28',
  },
  buttonPlus: {
    color: ACCENT,
    fontSize: 54,
    fontWeight: '300',
  },
  buttonUnit: {
    color: '#7A828E',
    fontSize: 16,
    marginTop: 2,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  hint: {
    color: '#5B6470',
    fontSize: 14,
    letterSpacing: 0.3,
  },
});
