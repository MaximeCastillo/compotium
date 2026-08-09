import { Ionicons } from '@expo/vector-icons';
import { Canvas, Circle } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet } from 'react-native';
import {
  Easing as ReanimatedEasing,
  runOnJS,
  useDerivedValue,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { withAlpha } from '../theme/alpha';
import { type Palette } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

const SIZE = 84;
const DISARM_MS = 2500; // if not confirmed, it disarms itself

const BURST_MS = 660;
const PARTICLE_COUNT = 24;
const BURST_CANVAS = 260;
const BURST_CENTRE = BURST_CANVAS / 2;
const GRAVITY = 90; // pixels pulled down over the whole burst

/**
 * Deterministic per-particle constants. Derived from the index rather than
 * randomised, so the burst looks the same every time and nothing has to be
 * stored between runs.
 */
function particleSeed(index: number) {
  const angle = (index / PARTICLE_COUNT) * Math.PI * 2 + (index % 3) * 0.19;
  const speed = 58 + ((index * 37) % 52);
  const size = 2 + ((index * 13) % 4);
  return { angle, speed, size };
}

type StopButtonProps = {
  running: boolean;
  onStop: () => void;
};

/**
 * Double-tap to stop. First tap arms it (turns to the accent color, icon
 * becomes a check); a second tap within a few seconds confirms — the timer
 * stops and the button disintegrates. No confirmation → it quietly disarms.
 */
export function StopButton({ running, onStop }: StopButtonProps) {
  const colors = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [rendered, setRendered] = useState(running);
  const [armed, setArmed] = useState(false);

  const appear = useRef(new Animated.Value(running ? 1 : 0)).current;
  const disintegrate = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;
  const burst = useSharedValue(0);
  const isDisintegrating = useRef(false);
  const disarmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (running) {
      isDisintegrating.current = false;
      setArmed(false);
      disintegrate.setValue(0);
      setRendered(true);
      Animated.timing(appear, { toValue: 1, duration: 440, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }).start();
    } else if (rendered && !isDisintegrating.current) {
      Animated.timing(appear, { toValue: 0, duration: 320, easing: Easing.in(Easing.quad), useNativeDriver: true }).start(({ finished }) => {
        if (finished) setRendered(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => () => {
    if (disarmTimer.current) clearTimeout(disarmTimer.current);
  }, []);

  const pop = () => {
    bounce.setValue(0);
    Animated.sequence([
      Animated.timing(bounce, { toValue: 1, duration: 110, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(bounce, { toValue: 0, duration: 160, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start();
  };

  const confirmStop = () => {
    isDisintegrating.current = true;
    onStop();
    Animated.timing(disintegrate, { toValue: 1, duration: 480, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    // The particles outlive the button, so unmounting waits on them, not on it.
    burst.value = 0;
    burst.value = withTiming(
      1,
      { duration: BURST_MS, easing: ReanimatedEasing.out(ReanimatedEasing.quad) },
      (finished) => {
        if (finished) runOnJS(setRendered)(false);
      },
    );
  };

  const handlePress = () => {
    if (isDisintegrating.current) return;
    if (!armed) {
      setArmed(true);
      Haptics.selectionAsync();
      pop();
      if (disarmTimer.current) clearTimeout(disarmTimer.current);
      disarmTimer.current = setTimeout(() => setArmed(false), DISARM_MS);
    } else {
      if (disarmTimer.current) clearTimeout(disarmTimer.current);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setArmed(false);
      pop();
      confirmStop();
    }
  };

  if (!rendered) return <Animated.View style={styles.slot} />;

  const opacity = Animated.multiply(appear, disintegrate.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }));
  const scale = Animated.multiply(
    Animated.multiply(
      appear.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
      disintegrate.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }),
    ),
    bounce.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }),
  );

  return (
    <Animated.View style={styles.slot}>
      <Canvas style={styles.burstCanvas} pointerEvents="none">
        {Array.from({ length: PARTICLE_COUNT }, (_, index) => (
          <Particle key={index} index={index} burst={burst} color={colors.stopProgress} />
        ))}
      </Canvas>

      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Pressable onPress={handlePress} hitSlop={16} style={[styles.button, armed && styles.buttonArmed]}>
          <Ionicons
            name={armed ? 'checkmark' : 'stop'}
            size={armed ? 30 : 26}
            color={armed ? colors.stopProgress : colors.stopGlyph}
          />
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

/** One shard, thrown outwards and pulled down as it fades. */
function Particle({
  index,
  burst,
  color,
}: {
  index: number;
  burst: SharedValue<number>;
  color: string;
}) {
  const seed = useMemo(() => particleSeed(index), [index]);

  const cx = useDerivedValue(
    () => BURST_CENTRE + Math.cos(seed.angle) * seed.speed * burst.value,
    [burst],
  );
  const cy = useDerivedValue(
    () =>
      BURST_CENTRE +
      Math.sin(seed.angle) * seed.speed * burst.value +
      GRAVITY * burst.value * burst.value,
    [burst],
  );
  const radius = useDerivedValue(() => seed.size * (1 - burst.value * 0.75), [burst]);
  // Fades out over the back half, so the shards do not vanish the instant they leave.
  const opacity = useDerivedValue(() => Math.max(0, 1 - burst.value * burst.value), [burst]);

  return <Circle cx={cx} cy={cy} r={radius} color={withAlpha(color, 1)} opacity={opacity} />;
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    slot: {
      height: 128,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Overflows the slot so shards can fly past its edges without being clipped.
    burstCanvas: {
      position: 'absolute',
      width: BURST_CANVAS,
      height: BURST_CANVAS,
      top: (128 - BURST_CANVAS) / 2,
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
    buttonArmed: {
      borderColor: colors.stopProgress,
      backgroundColor: colors.buttonBg,
    },
  });
