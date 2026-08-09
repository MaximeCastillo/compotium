import {
  Blur,
  Canvas,
  Circle,
  FractalNoise,
  Group,
  LinearGradient,
  RadialGradient,
  Rect,
  vec,
} from '@shopify/react-native-skia';
import { memo, useEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { withAlpha } from '../theme/alpha';
import { useTheme } from '../theme/ThemeContext';

const { width, height } = Dimensions.get('window');

// One slow revolution drives every drift and breath below. Each aura reads it at
// a different phase and rate, so they never fall into step and the whole field
// keeps wandering instead of pulsing together.
const CYCLE_MS = 24000;

// The noise veil is what makes the background read as liquid rather than as
// three coloured lamps. Kept faint on purpose: it is texture, not subject.
const NOISE_OPACITY = 0.09;
const NOISE_BLUR = 14;

type Aura = {
  color: string;
  x: number; // resting centre, in screen coordinates
  y: number;
  radius: number;
  drift: number; // how far it wanders
  rate: number; // cycles per revolution — irrational-ish ratios avoid lockstep
  phase: number;
};

/**
 * The deep backdrop: a dark vertical gradient, a drifting veil of fractal noise,
 * and three vast auras that breathe. All of it is one Skia canvas, so it costs a
 * single draw pass, and every animation runs on the UI thread.
 *
 * Depends only on the theme (memoized) — timer state never re-renders it, which
 * is the invariant that killed the start/stop stutter (see DECISIONS.md).
 */
function PulsingBackgroundBase() {
  const colors = useTheme();

  const clock = useSharedValue(0);
  useEffect(() => {
    clock.value = withRepeat(
      withTiming(1, { duration: CYCLE_MS, easing: Easing.linear }),
      -1,
      false,
    );
  }, [clock]);

  const auras: Aura[] = [
    { color: colors.auraTeal, x: width * 0.18, y: height * 0.16, radius: width * 0.85, drift: 46, rate: 1, phase: 0 },
    { color: colors.auraSky, x: width * 0.86, y: height * 0.82, radius: width * 0.78, drift: 54, rate: 0.7, phase: 0.33 },
    { color: colors.auraGreen, x: width * 0.5, y: height * 0.52, radius: width * 0.95, drift: 34, rate: 0.45, phase: 0.66 },
  ];

  // The veil drifts diagonally and never repeats visibly, because it is far
  // larger than the screen and only ever shows a moving window onto itself.
  const noiseTransform = useDerivedValue(() => {
    const angle = clock.value * 2 * Math.PI;
    return [
      { translateX: Math.cos(angle) * 60 },
      { translateY: Math.sin(angle * 0.6) * 48 },
    ];
  }, [clock]);

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      <Rect x={0} y={0} width={width} height={height}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, height)}
          colors={[colors.bgTop, colors.bgMid, colors.bgBottom]}
        />
      </Rect>

      {/* Screen blend lets the noise lift the darks without washing them out. */}
      <Group opacity={NOISE_OPACITY} blendMode="screen" transform={noiseTransform}>
        <Rect x={-width * 0.4} y={-height * 0.4} width={width * 1.8} height={height * 1.8}>
          <FractalNoise freqX={0.0035} freqY={0.0035} octaves={3} seed={7} />
          <Blur blur={NOISE_BLUR} />
        </Rect>
      </Group>

      {auras.map((aura, index) => (
        <BreathingAura key={index} aura={aura} clock={clock} />
      ))}
    </Canvas>
  );
}

export const PulsingBackground = memo(PulsingBackgroundBase);

function BreathingAura({
  aura,
  clock,
}: {
  aura: Aura;
  clock: ReturnType<typeof useSharedValue<number>>;
}) {
  // Position and size share the same wave at different rates, so an aura swells
  // as it wanders rather than doing both on the same beat.
  const centre = useDerivedValue(() => {
    const angle = (clock.value * aura.rate + aura.phase) * 2 * Math.PI;
    return vec(aura.x + Math.cos(angle) * aura.drift, aura.y + Math.sin(angle * 1.3) * aura.drift);
  }, [clock]);

  const radius = useDerivedValue(() => {
    const angle = (clock.value * aura.rate * 1.7 + aura.phase) * 2 * Math.PI;
    return aura.radius * (1 + Math.sin(angle) * 0.12);
  }, [clock]);

  const cx = useDerivedValue(() => centre.value.x, [centre]);
  const cy = useDerivedValue(() => centre.value.y, [centre]);

  return (
    <Group>
      <Circle cx={cx} cy={cy} r={radius}>
        <RadialGradient
          c={centre}
          r={radius}
          colors={[withAlpha(aura.color, 0.38), withAlpha(aura.color, 0.12), withAlpha(aura.color, 0)]}
          positions={[0, 0.45, 1]}
        />
      </Circle>
    </Group>
  );
}
