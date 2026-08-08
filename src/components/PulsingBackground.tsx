import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors, durations } from '../theme/colors';

/**
 * The deep-space backdrop. A static night gradient, plus two soft auras
 * that breathe in and out on a slow sine loop — calm, but alive.
 * `active` (timer running) slightly intensifies the glow.
 */
export function PulsingBackground({ active }: { active: boolean }) {
  const breath = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1,
          duration: durations.backgroundBreath,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          toValue: 0,
          duration: durations.backgroundBreath,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breath]);

  const base = active ? 0.26 : 0.16; // brighter aura while a timer runs

  const tealScale = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.22] });
  const tealOpacity = breath.interpolate({ inputRange: [0, 1], outputRange: [base, base + 0.1] });

  const skyScale = breath.interpolate({ inputRange: [0, 1], outputRange: [1.2, 0.98] });
  const skyOpacity = breath.interpolate({ inputRange: [0, 1], outputRange: [base + 0.06, base - 0.04] });

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[colors.bgTop, colors.bgMid, colors.bgBottom]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View
        style={[
          styles.aura,
          styles.auraTop,
          { backgroundColor: colors.auraTeal, opacity: tealOpacity, transform: [{ scale: tealScale }] },
        ]}
      />
      <Animated.View
        style={[
          styles.aura,
          styles.auraBottom,
          { backgroundColor: colors.auraSky, opacity: skyOpacity, transform: [{ scale: skyScale }] },
        ]}
      />
    </View>
  );
}

const AURA_SIZE = 560;
const styles = StyleSheet.create({
  aura: {
    position: 'absolute',
    width: AURA_SIZE,
    height: AURA_SIZE,
    borderRadius: AURA_SIZE / 2,
    alignSelf: 'center',
  },
  auraTop: {
    top: '2%',
  },
  auraBottom: {
    bottom: '-6%',
  },
});
