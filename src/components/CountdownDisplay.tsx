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
 * A single digit that dissolves on change: the old glyph fades and drifts
 * down, then the new one descends from above and settles. The two layers
 * never overlap (staggered opacity), so there is no bright flash.
 *
 * `settledRef` always holds the last target value, so even rapid changes
 * pick the correct "previous" glyph — no stray digit.
 */
function Digit({ value, active }: { value: string; active: boolean }) {
  const [pair, setPair] = useState({ previous: value, current: value });
  const anim = useRef(new Animated.Value(1)).current; // 1 = settled
  const settledRef = useRef(value);

  useEffect(() => {
    if (value === settledRef.current) return;
    setPair({ previous: settledRef.current, current: value });
    settledRef.current = value;
    anim.stopAnimation(() => {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: durations.digitDissolve * 2,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
    // React only to value changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const color = active ? colors.digitBright : colors.digitDim;

  // Outgoing glyph: visible then fades out in the first half, drifting down.
  const outOpacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0, 0] });
  const outTranslate = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 18] });
  const outScale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.8] });

  // Incoming glyph: appears only in the second half, descending into place.
  const inOpacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });
  const inTranslate = anim.interpolate({ inputRange: [0, 1], outputRange: [-18, 0] });
  const inScale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });

  return (
    <View style={styles.digitBox}>
      <Animated.Text
        style={[
          styles.digit,
          styles.digitLayer,
          { color, opacity: outOpacity, transform: [{ translateY: outTranslate }, { scale: outScale }] },
        ]}
      >
        {pair.previous}
      </Animated.Text>
      <Animated.Text
        style={[
          styles.digit,
          styles.digitLayer,
          { color, opacity: inOpacity, transform: [{ translateY: inTranslate }, { scale: inScale }] },
        ]}
      >
        {pair.current}
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
      style={[
        styles.digit,
        styles.colon,
        { color: active ? colors.digitBright : colors.digitDim, opacity: pulse },
      ]}
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
