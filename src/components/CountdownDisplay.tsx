import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { durations } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

type CountdownDisplayProps = {
  minutes: string; // always two chars, e.g. "05"
  seconds: string; // always two chars
  isRunning: boolean;
};

const DIGIT_WIDTH = 52;
const DIGIT_HEIGHT = 96;
const FONT_SIZE = 80;

// Trailing copies of the glyph, drifting further and faster than the one before.
// Three reads as vapour; more just costs nodes without adding to the illusion.
const TRAIL = [
  { rise: 26, drift: -5, peak: 0.5 },
  { rise: 44, drift: 6, peak: 0.3 },
  { rise: 64, drift: -3, peak: 0.16 },
];

/**
 * The time, dissolving rather than ticking.
 *
 * A changing digit lifts and fades while trailing copies of itself rise faster
 * and thin out behind it, so it appears to disperse upward. The character is
 * swapped while nothing is visible, then it settles back.
 *
 * Deliberately plain React Native text. Drawing it with Skia meant matching a
 * system font, and when that match failed the countdown vanished outright (see
 * DECISIONS.md) — this is the app's one indispensable readout, so it is built
 * from the most boring thing available. It is also cheaper than a blur: only
 * opacity and transforms, all on the UI thread.
 *
 * One character is on screen per slot at any instant, so old and new can never
 * overlap — the original ghosting bug stays structurally impossible.
 */
export function CountdownDisplay({ minutes, seconds, isRunning }: CountdownDisplayProps) {
  const colors = useTheme();
  const color = isRunning ? colors.digitBright : colors.digitDim;

  const colonPulse = useSharedValue(1);
  useEffect(() => {
    colonPulse.value = withRepeat(
      withTiming(0.35, { duration: durations.colonPulse / 2, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [colonPulse]);

  return (
    <View style={styles.row}>
      <DissolvingDigit char={minutes[0]} color={color} />
      <DissolvingDigit char={minutes[1]} color={color} />
      <Colon color={color} pulse={colonPulse} />
      <DissolvingDigit char={seconds[0]} color={color} />
      <DissolvingDigit char={seconds[1]} color={color} />
    </View>
  );
}

function DissolvingDigit({ char, color }: { char: string; color: string }) {
  const [shown, setShown] = useState(char);
  // 1 = settled, 0 = fully dispersed (and safe to swap the character).
  const solidity = useSharedValue(1);

  useEffect(() => {
    if (char === shown) return;
    solidity.value = withTiming(
      0,
      { duration: durations.digitDissolve, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(setShown)(char);
      },
    );
    // Only the incoming value should retrigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [char]);

  useEffect(() => {
    solidity.value = withTiming(1, {
      duration: durations.digitDissolve,
      easing: Easing.out(Easing.cubic),
    });
  }, [shown, solidity]);

  const mainStyle = useAnimatedStyle(() => ({
    opacity: solidity.value,
    transform: [
      { translateY: (1 - solidity.value) * -12 },
      { scale: 0.92 + solidity.value * 0.08 },
    ],
  }));

  return (
    <View style={styles.digitBox}>
      {TRAIL.map((layer, index) => (
        <TrailingGlyph key={index} layer={layer} solidity={solidity} char={shown} color={color} />
      ))}
      <Animated.Text style={[styles.digit, { color }, mainStyle]}>{shown}</Animated.Text>
    </View>
  );
}

/**
 * A ghost of the glyph, visible only mid-transition: its opacity follows
 * solidity × (1 − solidity), which is zero at both ends of the animation and
 * peaks halfway through. So the smear appears as the digit leaves and is gone
 * once it has settled — no permanent double image.
 */
function TrailingGlyph({
  layer,
  solidity,
  char,
  color,
}: {
  layer: (typeof TRAIL)[number];
  solidity: SharedValue<number>;
  char: string;
  color: string;
}) {
  const style = useAnimatedStyle(() => {
    const dispersing = solidity.value * (1 - solidity.value) * 4; // peaks at 1 mid-way
    return {
      opacity: dispersing * layer.peak,
      transform: [
        { translateY: (1 - solidity.value) * -layer.rise },
        { translateX: (1 - solidity.value) * layer.drift },
        { scale: 1 + (1 - solidity.value) * 0.12 },
      ],
    };
  });

  return <Animated.Text style={[styles.digit, styles.ghost, { color }, style]}>{char}</Animated.Text>;
}

/** The separator, breathing softly once per second. */
function Colon({ color, pulse }: { color: string; pulse: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));
  return <Animated.Text style={[styles.digit, styles.colon, { color }, style]}>:</Animated.Text>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  digitBox: {
    width: DIGIT_WIDTH,
    height: DIGIT_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: {
    fontSize: FONT_SIZE,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
    textAlign: 'center',
  },
  // Stacked under the real glyph so the trail never shifts the layout.
  ghost: {
    position: 'absolute',
  },
  colon: {
    width: 26,
    marginBottom: 8,
  },
});
