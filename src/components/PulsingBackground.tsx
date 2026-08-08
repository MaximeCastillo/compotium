import { LinearGradient } from 'expo-linear-gradient';
import { memo, useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';

const { width, height } = Dimensions.get('window');
// Draw each aura in a SMALL svg, then let the GPU scale it up. A radial
// gradient is smooth, so upscaling is invisible — but rasterizing 260px
// instead of ~3500px is ~200x cheaper (fast theme switches, lighter idle).
const SVG_RES = 260;
const REACH = Math.max(width, height) * 1.4; // visual diameter of an aura
const BASE_SCALE = REACH / SVG_RES;

type BlobConfig = {
  id: string;
  color: string;
  core: number;
  cx: number; // center on screen
  cy: number;
  driftX: number;
  driftY: number;
  breathMs: number;
  driftMs: number;
};

/**
 * The deep backdrop: a static gradient plus soft radial auras that breathe and
 * drift. Depends only on the theme (memoized), so timer state never re-renders it.
 */
function PulsingBackgroundBase() {
  const colors = useTheme();

  const blobs: BlobConfig[] = [
    { id: 'a1', color: colors.auraTeal, core: 0.5, cx: width * 0.2, cy: height * 0.15, driftX: 40, driftY: 30, breathMs: 4200, driftMs: 9000 },
    { id: 'a2', color: colors.auraSky, core: 0.42, cx: width * 0.85, cy: height * 0.85, driftX: -46, driftY: -34, breathMs: 5200, driftMs: 11000 },
    { id: 'a3', color: colors.auraGreen, core: 0.44, cx: width * 0.5, cy: height * 0.5, driftX: 26, driftY: -28, breathMs: 6000, driftMs: 13000 },
  ];

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[colors.bgTop, colors.bgMid, colors.bgBottom]}
        style={StyleSheet.absoluteFill}
      />
      {blobs.map((blob) => (
        <Blob key={blob.id} config={blob} />
      ))}
    </View>
  );
}

// Re-renders only when the theme changes (context), never on timer state.
export const PulsingBackground = memo(PulsingBackgroundBase);

function Blob({ config }: { config: BlobConfig }) {
  const breath = useRef(new Animated.Value(0)).current;
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const makeLoop = (value: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(value, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      );
    const breathLoop = makeLoop(breath, config.breathMs);
    const driftLoop = makeLoop(drift, config.driftMs);
    breathLoop.start();
    driftLoop.start();
    return () => {
      breathLoop.stop();
      driftLoop.stop();
    };
  }, [breath, drift, config.breathMs, config.driftMs]);

  const opacity = breath.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] });
  // Breathing scale is folded into the GPU upscale factor.
  const scale = breath.interpolate({ inputRange: [0, 1], outputRange: [BASE_SCALE * 0.92, BASE_SCALE * 1.16] });
  const translateX = drift.interpolate({ inputRange: [0, 1], outputRange: [-config.driftX, config.driftX] });
  const translateY = drift.interpolate({ inputRange: [0, 1], outputRange: [-config.driftY, config.driftY] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.blob,
        {
          left: config.cx - SVG_RES / 2,
          top: config.cy - SVG_RES / 2,
          opacity,
          transform: [{ translateX }, { translateY }, { scale }],
        },
      ]}
    >
      <Svg width={SVG_RES} height={SVG_RES}>
        <Defs>
          <RadialGradient id={config.id} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={config.color} stopOpacity={config.core} />
            <Stop offset="42%" stopColor={config.color} stopOpacity={config.core * 0.4} />
            <Stop offset="100%" stopColor={config.color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={SVG_RES} height={SVG_RES} fill={`url(#${config.id})`} />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    width: SVG_RES,
    height: SVG_RES,
  },
});
