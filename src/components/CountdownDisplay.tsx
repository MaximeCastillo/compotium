import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors, durations } from '../theme/colors';

type CountdownDisplayProps = {
  minutes: string; // always two chars, e.g. "05" (capped at "60")
  seconds: string; // always two chars, e.g. "00"
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
 * One digit, one glyph on screen at any instant. On change it falls & fades
 * out, we swap the character while invisible, then it rises & fades back in.
 * Because there is a single layer, two glyphs can NEVER overlap — the old
 * "flash / ghost digit" is structurally impossible.
 */
function Digit({ value, active }: { value: string; active: boolean }) {
  const [shown, setShown] = useState(value);
  const shownRef = useRef(value);
  const anim = useRef(new Animated.Value(1)).current; // 1 = fully shown, 0 = swap point

  useEffect(() => {
    if (value === shownRef.current) return;
    const target = value;
    Animated.timing(anim, {
      toValue: 0,
      duration: durations.digitDissolve,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;
      shownRef.current = target;
      setShown(target);
      Animated.timing(anim, {
        toValue: 1,
        duration: durations.digitDissolve,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
    // React only to value changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const color = active ? colors.digitBright : colors.digitDim;
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] });

  return (
    <View style={styles.digitBox}>
      <Animated.Text style={[styles.digit, { color, opacity: anim, transform: [{ translateY }, { scale }] }]}>
        {shown}
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
        Animated.timing(pulse, { toValue: 0.35, duration: durations.colonPulse / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: durations.colonPulse / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
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
