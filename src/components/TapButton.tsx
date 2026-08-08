import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text } from 'react-native';
import { colors, durations } from '../theme/colors';

type TapButtonProps = {
  isRunning: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

/**
 * The single gesture of the app. It breathes gently on its own (a slow
 * heartbeat) and sinks a little when pressed. One tap = +5 min.
 */
export function TapButton({ isRunning, onPress, onLongPress }: TapButtonProps) {
  const breath = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1,
          duration: durations.buttonBreath,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          toValue: 0,
          duration: durations.buttonBreath,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breath]);

  const animatePress = (toValue: number) => {
    Animated.timing(press, {
      toValue,
      duration: 140,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  // Combine the autonomous breath with the press-in shrink.
  const scale = Animated.multiply(
    breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.045] }),
    press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.94] }),
  );

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => animatePress(1)}
      onPressOut={() => animatePress(0)}
    >
      <Animated.View
        style={[
          styles.button,
          isRunning && styles.buttonActive,
          { transform: [{ scale }] },
        ]}
      >
        <Text style={styles.plus}>+5</Text>
        <Text style={styles.unit}>min</Text>
      </Animated.View>
    </Pressable>
  );
}

const SIZE = 224;
const styles = StyleSheet.create({
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.buttonBg,
    borderWidth: 1,
    borderColor: colors.buttonBorderIdle,
    // Soft teal glow (iOS shadow* / Android elevation).
    shadowColor: colors.auraTeal,
    shadowOpacity: 0.4,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  buttonActive: {
    borderColor: colors.buttonBorderActive,
  },
  plus: {
    color: colors.buttonPlus,
    fontSize: 56,
    fontWeight: '200',
  },
  unit: {
    color: colors.buttonUnit,
    fontSize: 15,
    marginTop: 2,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
});
