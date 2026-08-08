import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet } from 'react-native';
import { type Palette } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

const SIZE = 84;
const DISARM_MS = 2500; // if not confirmed, it disarms itself

type StopButtonProps = {
  running: boolean;
  onStop: () => void;
};

/**
 * Double-tap to stop. First tap arms it (turns to the accent color, icon
 * becomes a check); a second tap within a few seconds confirms — the timer
 * stops and the button disintegrates. No confirmation → it quietly disarms.
 */
export function StopButton({ running, onStop }: StopButtonProps) {
  const colors = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [rendered, setRendered] = useState(running);
  const [armed, setArmed] = useState(false);

  const appear = useRef(new Animated.Value(running ? 1 : 0)).current;
  const disintegrate = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;
  const isDisintegrating = useRef(false);
  const disarmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (running) {
      isDisintegrating.current = false;
      setArmed(false);
      disintegrate.setValue(0);
      setRendered(true);
      Animated.timing(appear, { toValue: 1, duration: 440, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }).start();
    } else if (rendered && !isDisintegrating.current) {
      Animated.timing(appear, { toValue: 0, duration: 320, easing: Easing.in(Easing.quad), useNativeDriver: true }).start(({ finished }) => {
        if (finished) setRendered(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => () => {
    if (disarmTimer.current) clearTimeout(disarmTimer.current);
  }, []);

  const pop = () => {
    bounce.setValue(0);
    Animated.sequence([
      Animated.timing(bounce, { toValue: 1, duration: 110, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(bounce, { toValue: 0, duration: 160, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start();
  };

  const confirmStop = () => {
    isDisintegrating.current = true;
    onStop();
    Animated.timing(disintegrate, { toValue: 1, duration: 480, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(({ finished }) => {
      if (finished) setRendered(false);
    });
  };

  const handlePress = () => {
    if (isDisintegrating.current) return;
    if (!armed) {
      setArmed(true);
      Haptics.selectionAsync();
      pop();
      if (disarmTimer.current) clearTimeout(disarmTimer.current);
      disarmTimer.current = setTimeout(() => setArmed(false), DISARM_MS);
    } else {
      if (disarmTimer.current) clearTimeout(disarmTimer.current);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setArmed(false);
      pop();
      confirmStop();
    }
  };

  if (!rendered) return <Animated.View style={styles.slot} />;

  const opacity = Animated.multiply(appear, disintegrate.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }));
  const scale = Animated.multiply(
    Animated.multiply(
      appear.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
      disintegrate.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }),
    ),
    bounce.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }),
  );

  return (
    <Animated.View style={[styles.slot, { opacity, transform: [{ scale }] }]}>
      <Pressable onPress={handlePress} hitSlop={16} style={[styles.button, armed && styles.buttonArmed]}>
        <Ionicons
          name={armed ? 'checkmark' : 'stop'}
          size={armed ? 30 : 26}
          color={armed ? colors.stopProgress : colors.stopGlyph}
        />
      </Pressable>
    </Animated.View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    slot: {
      height: 128,
      alignItems: 'center',
      justifyContent: 'center',
    },
    button: {
      width: SIZE,
      height: SIZE,
      borderRadius: SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.buttonBg,
      borderWidth: 1,
      borderColor: colors.buttonBorderIdle,
    },
    buttonArmed: {
      borderColor: colors.stopProgress,
      backgroundColor: colors.buttonBg,
    },
  });
