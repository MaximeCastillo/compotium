import { useKeepAwake } from 'expo-keep-awake';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { CountdownDisplay } from './src/components/CountdownDisplay';
import { PulsingBackground } from './src/components/PulsingBackground';
import { SettingsButton } from './src/components/SettingsButton';
import { SettingsSheet } from './src/components/SettingsSheet';
import { StopButton } from './src/components/StopButton';
import { TapButton } from './src/components/TapButton';
import { useCountdown } from './src/hooks/useCountdown';
import { useSettings } from './src/hooks/useSettings';
import { colors } from './src/theme/colors';

export default function App() {
  const { isRunning, minutes, seconds, addFiveMinutes, reset } = useCountdown();
  const { keepAwake, setKeepAwake } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <View style={styles.root}>
      <PulsingBackground active={isRunning} />
      <StatusBar style="light" />

      {/* Keep the screen awake only while it matters: a running timer + the setting on. */}
      {keepAwake && isRunning && <KeepScreenAwake />}

      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <SettingsButton onPress={() => setSettingsOpen(true)} />
        </View>

        <View style={styles.content}>
          <CountdownDisplay minutes={minutes} seconds={seconds} isRunning={isRunning} />
          <TapButton isRunning={isRunning} onPress={addFiveMinutes} />
          <StopButton running={isRunning} onStop={reset} />
        </View>
      </SafeAreaView>

      <SettingsSheet
        visible={settingsOpen}
        keepAwake={keepAwake}
        onToggleKeepAwake={setKeepAwake}
        onClose={() => setSettingsOpen(false)}
      />
    </View>
  );
}

/** Mounted only when we want the screen to stay on; unmounting releases it. */
function KeepScreenAwake() {
  useKeepAwake();
  return null;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgTop,
  },
  safe: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
});
