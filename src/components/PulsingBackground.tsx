import { Canvas, Circle, Group, LinearGradient, RadialGradient, Rect, vec } from '@shopify/react-native-skia';
import { memo, useEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Easing, useDerivedValue, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { withAlpha } from '../theme/alpha';
import { useTheme } from '../theme/ThemeContext';

const { width, height } = Dimensions.get('window');

const CYCLE_MS = 26000;

/**
 * The deep backdrop: a dark vertical gradient and three vast auras that drift
 * out of step with each other.
 *
 * Performance is the whole design here. Every gradient is built ONCE, in the
 * shape's own coordinates, and only a transform moves it — animating a
 * gradient's centre instead would rebuild its shader on every frame. Nothing is
 * blurred: a radial gradient is already soft, and blur is the most expensive
 * thing a canvas can do.
 *
 * Depends only on the theme (memoized), so timer state never re-renders it.
 */
function PulsingBackgroundBase() {
  const colors = useTheme();

  const clock = useSharedValue(0);
  useEffect(() => {
    clock.value = withRepeat(withTiming(1, { duration: CYCLE_MS, easing: Easing.linear }), -1, false);
  }, [clock]);

  const auras = [
    { color: colors.auraTeal, x: width * 0.18, y: height * 0.16, radius: width * 0.9, drift: 40, rate: 1, phase: 0 },
    { color: colors.auraSky, x: width * 0.86, y: height * 0.82, radius: width * 0.82, drift: 48, rate: 0.7, phase: 0.33 },
    { color: colors.auraGreen, x: width * 0.5, y: height * 0.52, radius: width * 1, drift: 30, rate: 0.45, phase: 0.66 },
  ];

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      <Rect x={0} y={0} width={width} height={height}>
        <LinearGradient start={vec(0, 0)} end={vec(0, height)} colors={[colors.bgTop, colors.bgMid, colors.bgBottom]} />
      </Rect>

      {auras.map((aura, index) => (
        <DriftingAura key={index} aura={aura} clock={clock} />
      ))}
    </Canvas>
  );
}

export const PulsingBackground = memo(PulsingBackgroundBase);

type Aura = {
  color: string;
  x: number;
  y: number;
  radius: number;
  drift: number;
  rate: number; // cycles per revolution — unrelated rates keep them out of step
  phase: number;
};

function DriftingAura({ aura, clock }: { aura: Aura; clock: ReturnType<typeof useSharedValue<number>> }) {
  const centre = vec(aura.x, aura.y);

  // Only the transform is animated. The gradient below never changes, so its
  // shader is compiled once and reused for the life of the app.
  const transform = useDerivedValue(() => {
    const angle = (clock.value * aura.rate + aura.phase) * 2 * Math.PI;
    return [
      { translateX: Math.cos(angle) * aura.drift },
      { translateY: Math.sin(angle * 1.3) * aura.drift },
      { scale: 1 + Math.sin(angle * 1.7) * 0.1 },
    ];
  }, [clock]);

  return (
    <Group transform={transform} origin={centre}>
      <Circle c={centre} r={aura.radius}>
        <RadialGradient
          c={centre}
          r={aura.radius}
          colors={[withAlpha(aura.color, 0.34), withAlpha(aura.color, 0.11), withAlpha(aura.color, 0)]}
          positions={[0, 0.45, 1]}
        />
      </Circle>
    </Group>
  );
}
