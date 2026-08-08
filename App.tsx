import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { CountdownDisplay } from './src/components/CountdownDisplay';
import { PulsingBackground } from './src/components/PulsingBackground';
import { StopButton } from './src/components/StopButton';
import { TapButton } from './src/components/TapButton';
import { useCountdown } from './src/hooks/useCountdown';
import { colors } from './src/theme/colors';

export default function App() {
  const { isRunning, minutes, seconds, addFiveMinutes, reset } = useCountdown();

  return (
    <View style={styles.root}>
      <PulsingBackground active={isRunning} />
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <CountdownDisplay minutes={minutes} seconds={seconds} isRunning={isRunning} />
          <TapButton isRunning={isRunning} onPress={addFiveMinutes} />
          <StopButton running={isRunning} onStop={reset} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgTop,
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
});
