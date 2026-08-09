import { useKeepAwake } from 'expo-keep-awake';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { CountdownDisplay } from './src/components/CountdownDisplay';
import { PulsingBackground } from './src/components/PulsingBackground';
import { SettingsButton } from './src/components/SettingsButton';
import { SettingsSheet } from './src/components/SettingsSheet';
import { StopButton } from './src/components/StopButton';
import { TapButton } from './src/components/TapButton';
import { useCountdown } from './src/hooks/useCountdown';
import { useEndNotification } from './src/hooks/useEndNotification';
import { useSettings } from './src/hooks/useSettings';
import { themes } from './src/theme/colors';
import { ThemeProvider } from './src/theme/ThemeContext';

export default function App() {
  const { keepAwake, setKeepAwake, tapAmount, setTapAmount, tapUnit, setTapUnit, themeName, setThemeName, soundLength, setSoundLength } = useSettings();
  const incrementSeconds = tapUnit === 'min' ? tapAmount * 60 : tapAmount;
  const { endsAt, isRunning, minutes, seconds, addTime, reset } = useCountdown(incrementSeconds, soundLength);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // The OS rings when the app can't: it holds the deadline too.
  useEndNotification(endsAt);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={themes[themeName]}>
        <View style={styles.root}>
          <PulsingBackground />
          <StatusBar style="light" />

          {/* Keep the screen awake only while it matters: a running timer + the setting on. */}
          {keepAwake && isRunning && <KeepScreenAwake />}

          <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <View style={styles.topBar}>
              <SettingsButton onPress={() => setSettingsOpen(true)} />
            </View>

            <View style={styles.content}>
              <CountdownDisplay minutes={minutes} seconds={seconds} isRunning={isRunning} />
              <TapButton isRunning={isRunning} amount={tapAmount} unit={tapUnit} onPress={addTime} />
              <StopButton running={isRunning} onStop={reset} />
            </View>
          </SafeAreaView>

          <SettingsSheet
            visible={settingsOpen}
            keepAwake={keepAwake}
            onToggleKeepAwake={setKeepAwake}
            tapAmount={tapAmount}
            onChangeTapAmount={setTapAmount}
            tapUnit={tapUnit}
            onChangeTapUnit={setTapUnit}
            themeName={themeName}
            onChangeTheme={setThemeName}
            soundLength={soundLength}
            onChangeSound={setSoundLength}
            onClose={() => setSettingsOpen(false)}
          />
        </View>
      </ThemeProvider>
    </SafeAreaProvider>
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
    backgroundColor: '#05070E', // base flash color before the themed background paints
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
