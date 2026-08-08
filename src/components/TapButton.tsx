import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { durations, type Palette } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

type TapButtonProps = {
  isRunning: boolean;
  amount: number; // how much one tap adds (from settings)
  unit: string; // "min" or "sec"
  onPress: () => void;
};

const SIZE = 200;
const GLOW = 360;

/**
 * The single gesture of the app. It breathes gently and sinks when pressed.
 * Behind it, an SVG "eclipse" corona hugging the button's edge.
 */
export function TapButton({ isRunning, amount, unit, onPress }: TapButtonProps) {
  const colors = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const breath = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, { toValue: 1, duration: durations.buttonBreath, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(breath, { toValue: 0, duration: durations.buttonBreath, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breath]);

  const animatePress = (toValue: number) => {
    Animated.timing(press, { toValue, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  };

  const scale = Animated.multiply(
    breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }),
    press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.94] }),
  );
  const coronaOpacity = breath.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });
  const coronaScale = breath.interpolate({ inputRange: [0, 1], outputRange: [0.99, 1.05] });

  const peak = isRunning ? 1 : 0.8;

  return (
    <View style={styles.wrapper}>
      <Animated.View
        pointerEvents="none"
        style={[styles.glow, { opacity: coronaOpacity, transform: [{ scale: coronaScale }] }]}
      >
        <Svg width={GLOW} height={GLOW}>
          <Defs>
            <RadialGradient id="eclipse" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={colors.auraTeal} stopOpacity={0.06} />
              <Stop offset="50%" stopColor={colors.auraTeal} stopOpacity={0.06} />
              <Stop offset="55%" stopColor={colors.auraTeal} stopOpacity={0.5 * peak} />
              <Stop offset="59%" stopColor={colors.auraTeal} stopOpacity={0.95 * peak} />
              <Stop offset="64%" stopColor={colors.auraTeal} stopOpacity={0.35 * peak} />
              <Stop offset="80%" stopColor={colors.auraTeal} stopOpacity={0.1 * peak} />
              <Stop offset="100%" stopColor={colors.auraTeal} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width={GLOW} height={GLOW} fill="url(#eclipse)" />
        </Svg>
      </Animated.View>

      <Pressable onPress={onPress} onPressIn={() => animatePress(1)} onPressOut={() => animatePress(0)}>
        <Animated.View style={[styles.button, isRunning && styles.buttonActive, { transform: [{ scale }] }]}>
          <Text style={styles.plus}>+{amount}</Text>
          <Text style={styles.unit}>{unit}</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    wrapper: {
      width: GLOW,
      height: GLOW,
      alignItems: 'center',
      justifyContent: 'center',
    },
    glow: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
    },
    button: {
      width: SIZE,
      height: SIZE,
      borderRadius: SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.buttonBg,
      borderWidth: 1,
      borderColor: colors.buttonBorderIdle,
    },
    buttonActive: {
      borderColor: colors.buttonBorderActive,
    },
    plus: {
      color: colors.buttonPlus,
      fontSize: 52,
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
