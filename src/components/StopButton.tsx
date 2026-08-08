import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../theme/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 116; // big enough that the ring stays visible around a fingertip
const STROKE = 5;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;
const HOLD_MS = 1000; // hold ~1s to confirm the stop

type StopButtonProps = {
  running: boolean;
  onStop: () => void;
};

/**
 * Hold-to-stop. While held, an inner ring fills clockwise over ~1.5s; when
 * full, the timer stops and the button disintegrates. It fades/scales in when
 * a timer starts, and gently fades out if the timer ends on its own.
 *
 * (The disintegration is a scale+fade "poof"; true per-pixel particles need
 * Skia — that comes with the development build.)
 */
export function StopButton({ running, onStop }: StopButtonProps) {
  const [rendered, setRendered] = useState(running);
  const appear = useRef(new Animated.Value(running ? 1 : 0)).current; // entrance / gentle exit
  const hold = useRef(new Animated.Value(0)).current; // ring fill 0 -> 1
  const disintegrate = useRef(new Animated.Value(0)).current; // exit burst 0 -> 1
  const isDisintegrating = useRef(false);

  useEffect(() => {
    if (running) {
      isDisintegrating.current = false;
      hold.setValue(0);
      disintegrate.setValue(0);
      setRendered(true);
      Animated.timing(appear, {
        toValue: 1,
        duration: 440,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }).start();
    } else if (rendered && !isDisintegrating.current) {
      // Timer ended on its own: gentle fade out.
      Animated.timing(appear, {
        toValue: 0,
        duration: 320,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setRendered(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const startHold = () => {
    if (isDisintegrating.current) return;
    Animated.timing(hold, {
      toValue: 1,
      duration: HOLD_MS,
      easing: Easing.linear,
      useNativeDriver: false, // strokeDashoffset is not native-drivable
    }).start(({ finished }) => {
      if (finished) confirmStop();
    });
  };

  const cancelHold = () => {
    if (isDisintegrating.current) return;
    Animated.timing(hold, {
      toValue: 0,
      duration: 240,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  };

  const confirmStop = () => {
    isDisintegrating.current = true;
    onStop(); // stop the timer at the very same instant
    Animated.timing(disintegrate, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setRendered(false);
    });
  };

  if (!rendered) return <View style={styles.slot} />;

  const strokeDashoffset = hold.interpolate({ inputRange: [0, 1], outputRange: [CIRCUMFERENCE, 0] });
  const opacity = Animated.multiply(appear, disintegrate.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }));
  const scale = Animated.multiply(
    appear.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
    disintegrate.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }),
  );

  return (
    <View style={styles.slot}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Pressable onPressIn={startHold} onPressOut={cancelHold} hitSlop={18} style={styles.pressable}>
          <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
            <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={colors.stopTrack} strokeWidth={STROKE} fill="none" />
            <AnimatedCircle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              stroke={colors.stopProgress}
              strokeWidth={STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            />
          </Svg>
          <View style={styles.glyph} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressable: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    width: 18,
    height: 18,
    borderRadius: 5,
    backgroundColor: colors.stopGlyph,
  },
});
