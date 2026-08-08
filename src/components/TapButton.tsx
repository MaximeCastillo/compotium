import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors, durations } from '../theme/colors';

type TapButtonProps = {
  isRunning: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

const SIZE = 224; // the button circle
const GLOW = 320; // the soft aura behind it

/**
 * The single gesture of the app. It breathes gently on its own and sinks a
 * little when pressed. A soft radial glow (SVG) sits behind it — a crisp
 * circle with a diffuse halo, no polygonal Android elevation shadow.
 */
export function TapButton({ isRunning, onPress, onLongPress }: TapButtonProps) {
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
    breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.045] }),
    press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.94] }),
  );
  const glowOpacity = breath.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });
  const glowScale = breath.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.1] });

  return (
    <View style={styles.wrapper}>
      <Animated.View
        pointerEvents="none"
        style={[styles.glow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]}
      >
        <Svg width={GLOW} height={GLOW}>
          <Defs>
            <RadialGradient id="buttonGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={colors.auraTeal} stopOpacity={isRunning ? 0.5 : 0.32} />
              <Stop offset="55%" stopColor={colors.auraTeal} stopOpacity={0.12} />
              <Stop offset="100%" stopColor={colors.auraTeal} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width={GLOW} height={GLOW} fill="url(#buttonGlow)" />
        </Svg>
      </Animated.View>

      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={() => animatePress(1)}
        onPressOut={() => animatePress(0)}
      >
        <Animated.View style={[styles.button, isRunning && styles.buttonActive, { transform: [{ scale }] }]}>
          <Text style={styles.plus}>+5</Text>
          <Text style={styles.unit}>min</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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
