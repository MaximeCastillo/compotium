import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors, durations } from '../theme/colors';

type CountdownDisplayProps = {
  minutes: string; // "05"
  seconds: string; // "00"
  isRunning: boolean;
};

export function CountdownDisplay({ minutes, seconds, isRunning }: CountdownDisplayProps) {
  return (
    <View style={styles.row}>
      <Digit value={minutes[0]} active={isRunning} />
      <Digit value={minutes[1]} active={isRunning} />
      <Colon active={isRunning} />
      <Digit value={seconds[0]} active={isRunning} />
      <Digit value={seconds[1]} active={isRunning} />
    </View>
  );
}

/**
 * A single digit that dissolves on change: the old glyph falls and fades
 * while the new one descends from above and settles in. Two overlaid layers
 * driven by one 0->1 animation give us full control over both directions.
 */
function Digit({ value, active }: { value: string; active: boolean }) {
  const [chars, setChars] = useState({ current: value, previous: value });
  const anim = useRef(new Animated.Value(1)).current; // 1 = settled

  useEffect(() => {
    if (value === chars.current) return;
    setChars({ current: value, previous: chars.current });
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: durations.digitDissolve * 2,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    // We intentionally react only to `value` changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const color = active ? colors.digitBright : colors.digitDim;

  // Outgoing glyph: fades out in the FIRST half while drifting down.
  const outOpacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0, 0] });
  const outTranslate = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 16] });
  const outScale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.82] });

  // Incoming glyph: fades in only in the SECOND half — so the two glyphs
  // never overlap, which is what caused the bright "flash".
  const inOpacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });
  const inTranslate = anim.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] });
  const inScale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] });

  return (
    <View style={styles.digitBox}>
      <Animated.Text
        style={[
          styles.digit,
          styles.digitLayer,
          { color, opacity: outOpacity, transform: [{ translateY: outTranslate }, { scale: outScale }] },
        ]}
      >
        {chars.previous}
      </Animated.Text>
      <Animated.Text
        style={[
          styles.digit,
          styles.digitLayer,
          { color, opacity: inOpacity, transform: [{ translateY: inTranslate }, { scale: inScale }] },
        ]}
      >
        {chars.current}
      </Animated.Text>
    </View>
  );
}

/** The separator, breathing softly once per second. */
function Colon({ active }: { active: boolean }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.35,
          duration: durations.colonPulse / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: durations.colonPulse / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.Text
      style={[styles.digit, styles.colon, { color: active ? colors.digitBright : colors.digitDim, opacity: pulse }]}
    >
      :
    </Animated.Text>
  );
}

const DIGIT_WIDTH = 52;
const DIGIT_HEIGHT = 96;
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
  digitLayer: {
    position: 'absolute',
  },
  digit: {
    fontSize: 80,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
    textAlign: 'center',
  },
  colon: {
    width: 26,
    marginBottom: 8,
  },
});
