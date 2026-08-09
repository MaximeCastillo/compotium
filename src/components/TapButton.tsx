import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  RadialGradient,
  SweepGradient,
  vec,
} from '@shopify/react-native-skia';
import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { withAlpha } from '../theme/alpha';
import { durations, type Palette } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

type TapButtonProps = {
  isRunning: boolean;
  amount: number; // how much one tap adds (from settings)
  unit: string; // "min" or "sec"
  onPress: () => void;
};

const CORE = 100; // radius of the dark centre — the "shadow" of the hole
const CANVAS = 420; // wide enough for the disc and its glow to fade out inside
const CENTRE = CANVAS / 2;
// The canvas is far larger than the space the button should claim in the column,
// so it overflows symmetrically instead of pushing the countdown around.
const FOOTPRINT = CORE * 2 + 56;
const CANVAS_OFFSET = (FOOTPRINT - CANVAS) / 2;
const DISC = 158; // radius of the accretion disc
const DISC_FLATTEN = 0.2; // seen nearly edge-on, as in the film
const ROTATION_MS = 72000; // one revolution — slow enough to feel like drift

/**
 * The single gesture of the app, drawn as a black hole.
 *
 * Layered back to front: an outer glow, the far side of the accretion disc, the
 * dark core that hides its middle, the photon ring hugging that core, then the
 * near side of the disc and the vertical bow of light arcing over the top —
 * which is what makes the shape read as Gargantua rather than as a ring.
 *
 * Skia draws all of it, including the core, so that the parts meant to pass in
 * front of the hole actually do. The Pressable is a transparent overlay.
 */
export function TapButton({ isRunning, amount, unit, onPress }: TapButtonProps) {
  const colors = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const spin = useSharedValue(0);
  const breath = useSharedValue(0);
  const press = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(withTiming(1, { duration: ROTATION_MS, easing: Easing.linear }), -1, false);
    breath.value = withRepeat(
      withTiming(1, { duration: durations.buttonBreath, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [spin, breath]);

  // A running timer burns brighter; at rest the hole is banked down.
  const intensity = isRunning ? 1 : 0.62;

  const discTransform = useDerivedValue(
    () => [{ rotate: spin.value * 2 * Math.PI }, { scaleY: DISC_FLATTEN }],
    [spin],
  );
  const bowTransform = useDerivedValue(
    () => [{ rotate: -spin.value * 2 * Math.PI }, { scaleX: DISC_FLATTEN }],
    [spin],
  );
  const glowScale = useDerivedValue(
    () => [{ scale: 1 + breath.value * 0.06 - press.value * 0.05 }],
    [breath, press],
  );
  const coreScale = useDerivedValue(() => [{ scale: 1 - press.value * 0.06 }], [press]);

  const origin = vec(CENTRE, CENTRE);
  const hot = withAlpha(colors.buttonPlus, 0.95 * intensity); // the bright limb
  const cool = withAlpha(colors.auraTeal, 0.18 * intensity); // the receding one

  return (
    <View style={styles.wrapper}>
      <Canvas style={styles.canvas} pointerEvents="none">
        {/* Diffuse light spilling into the surrounding space. */}
        <Group transform={glowScale} origin={origin}>
          <Circle c={origin} r={DISC * 1.25}>
            <RadialGradient
              c={origin}
              r={DISC * 1.25}
              colors={[withAlpha(colors.auraTeal, 0.16 * intensity), withAlpha(colors.auraTeal, 0)]}
            />
          </Circle>
        </Group>

        {/* Far side of the disc — drawn first, so the core will cover its middle. */}
        <Group transform={discTransform} origin={origin}>
          <Circle c={origin} r={DISC} style="stroke" strokeWidth={54}>
            <SweepGradient c={origin} colors={[hot, cool, cool, hot]} positions={[0, 0.3, 0.7, 1]} />
            <BlurMask blur={22} style="normal" />
          </Circle>
        </Group>

        {/* The shadow itself. */}
        <Group transform={coreScale} origin={origin}>
          <Circle c={origin} r={CORE} color={colors.bgTop} />
          {/* Photon ring: a thin, very bright edge is what sells the scale. */}
          <Circle
            c={origin}
            r={CORE + 1}
            style="stroke"
            strokeWidth={2.5}
            color={withAlpha(colors.buttonPlus, 0.9 * intensity)}
          >
            <BlurMask blur={4} style="normal" />
          </Circle>
        </Group>

        {/* Light bent over the top and under the bottom — Gargantua's signature. */}
        <Group transform={bowTransform} origin={origin} opacity={0.55}>
          <Circle c={origin} r={DISC * 0.92} style="stroke" strokeWidth={34}>
            <SweepGradient c={origin} colors={[cool, hot, hot, cool]} positions={[0, 0.28, 0.72, 1]} />
            <BlurMask blur={26} style="normal" />
          </Circle>
        </Group>
      </Canvas>

      <Pressable
        onPress={onPress}
        onPressIn={() => {
          press.value = withTiming(1, { duration: 120 });
        }}
        onPressOut={() => {
          press.value = withSpring(0, { damping: 18, stiffness: 260 });
        }}
        style={styles.hitArea}
      >
        <Text style={styles.plus}>+{amount}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </Pressable>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    wrapper: {
      width: FOOTPRINT,
      height: FOOTPRINT,
      alignItems: 'center',
      justifyContent: 'center',
    },
    canvas: {
      position: 'absolute',
      top: CANVAS_OFFSET,
      left: CANVAS_OFFSET,
      width: CANVAS,
      height: CANVAS,
    },
    // Transparent: the core it sits on is painted by Skia underneath.
    hitArea: {
      width: CORE * 2,
      height: CORE * 2,
      borderRadius: CORE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    plus: {
      color: colors.buttonPlus,
      fontSize: 40,
      fontWeight: '200',
      letterSpacing: 1,
    },
    unit: {
      color: colors.buttonUnit,
      fontSize: 14,
      letterSpacing: 3,
      textTransform: 'uppercase',
      marginTop: 2,
    },
  });
