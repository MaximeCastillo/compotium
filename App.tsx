import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { CountdownDisplay } from './src/components/CountdownDisplay';
import { PulsingBackground } from './src/components/PulsingBackground';
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
          <TapButton isRunning={isRunning} onPress={addFiveMinutes} onLongPress={reset} />
          <Text style={styles.hint}>
            {isRunning ? 'Tapote pour +5 · appui long pour arrêter' : 'Tapote pour te poser'}
          </Text>
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
    gap: 56,
  },
  hint: {
    color: colors.hint,
    fontSize: 14,
    letterSpacing: 0.3,
  },
});
