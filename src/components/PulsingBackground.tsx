import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');
const BLOB = Math.max(width, height) * 1.5; // each aura is bigger than the screen

type BlobConfig = {
  id: string;
  color: string;
  core: number; // center opacity of the aura
  left: number;
  top: number;
  driftX: number; // how far it wanders horizontally
  driftY: number;
  duration: number; // slower = calmer
  boost: number; // extra core opacity while a timer runs
};

/**
 * The deep-space backdrop: a static night gradient, with a few soft radial
 * auras that slowly drift and breathe. Radial gradients fade to full
 * transparency, so there are no hard edges — it reads as a living nebula.
 */
export function PulsingBackground({ active }: { active: boolean }) {
  const blobs: BlobConfig[] = [
    { id: 'teal', color: colors.auraTeal, core: 0.34, left: -BLOB * 0.28, top: -BLOB * 0.2, driftX: 46, driftY: 34, duration: 9000, boost: 0.12 },
    { id: 'sky', color: colors.auraSky, core: 0.28, left: width - BLOB * 0.72, top: height - BLOB * 0.7, driftX: -52, driftY: -40, duration: 11000, boost: 0.1 },
    { id: 'green', color: colors.auraGreen, core: 0.3, left: width * 0.5 - BLOB * 0.5, top: height * 0.28, driftX: 30, driftY: -30, duration: 13000, boost: 0.1 },
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

function Blob({ config, active }: { config: BlobConfig; active: boolean }) {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: config.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: config.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [drift, config.duration]);

  const translateX = drift.interpolate({ inputRange: [0, 1], outputRange: [-config.driftX, config.driftX] });
  const translateY = drift.interpolate({ inputRange: [0, 1], outputRange: [-config.driftY, config.driftY] });
  const scale = drift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });

  const core = active ? config.core + config.boost : config.core;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.blob,
        { left: config.left, top: config.top, transform: [{ translateX }, { translateY }, { scale }] },
      ]}
    >
      <Svg width={BLOB} height={BLOB}>
        <Defs>
          <RadialGradient id={config.id} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={config.color} stopOpacity={core} />
            <Stop offset="45%" stopColor={config.color} stopOpacity={core * 0.4} />
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
