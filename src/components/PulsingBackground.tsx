import { LinearGradient } from 'expo-linear-gradient';
import { memo, useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');
const BLOB = Math.max(width, height) * 1.45; // each aura is bigger than the screen

type BlobConfig = {
  id: string;
  color: string;
  core: number; // center opacity of the aura
  left: number;
  top: number;
  driftX: number;
  driftY: number;
  breathMs: number; // visible pulse: faster = livelier
  driftMs: number; // slow wander
  boost: number; // extra glow while a timer runs
};

/**
 * The deep-space backdrop: a static night gradient plus a few soft radial
 * auras that clearly breathe (opacity + scale) and slowly drift. Radial
 * gradients fade to full transparency, so there are no hard edges.
 */
function PulsingBackgroundBase({ active }: { active: boolean }) {
  const blobs: BlobConfig[] = [
    { id: 'teal', color: colors.auraTeal, core: 0.5, left: -BLOB * 0.24, top: -BLOB * 0.18, driftX: 40, driftY: 30, breathMs: 4200, driftMs: 9000, boost: 0.14 },
    { id: 'sky', color: colors.auraSky, core: 0.42, left: width - BLOB * 0.74, top: height - BLOB * 0.66, driftX: -46, driftY: -34, breathMs: 5200, driftMs: 11000, boost: 0.12 },
    { id: 'green', color: colors.auraGreen, core: 0.44, left: width * 0.5 - BLOB * 0.5, top: height * 0.24, driftX: 26, driftY: -28, breathMs: 6000, driftMs: 13000, boost: 0.12 },
  ];

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[colors.bgTop, colors.bgMid, colors.bgBottom]}
        style={StyleSheet.absoluteFill}
      />
      {blobs.map((blob) => (
        <Blob key={blob.id} config={blob} active={active} />
      ))}
    </View>
  );
}

// Memoized: the background only depends on `active`, so unrelated app state
// changes (opening settings, toggling a switch) no longer re-render it.
export const PulsingBackground = memo(PulsingBackgroundBase);

function Blob({ config, active }: { config: BlobConfig; active: boolean }) {
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

  // Visible breathing: the whole aura waxes and wanes in opacity and size.
  const opacity = breath.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] });
  const breathScale = breath.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.16] });

  // Slow organic wander.
  const translateX = drift.interpolate({ inputRange: [0, 1], outputRange: [-config.driftX, config.driftX] });
  const translateY = drift.interpolate({ inputRange: [0, 1], outputRange: [-config.driftY, config.driftY] });

  const core = active ? config.core + config.boost : config.core;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.blob,
        { left: config.left, top: config.top, opacity, transform: [{ translateX }, { translateY }, { scale: breathScale }] },
      ]}
    >
      <Svg width={BLOB} height={BLOB}>
        <Defs>
          <RadialGradient id={config.id} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={config.color} stopOpacity={core} />
            <Stop offset="42%" stopColor={config.color} stopOpacity={core * 0.4} />
            <Stop offset="100%" stopColor={config.color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={BLOB} height={BLOB} fill={`url(#${config.id})`} />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    width: BLOB,
    height: BLOB,
  },
});
