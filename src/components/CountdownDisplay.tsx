import { BlurMask, Canvas, Group, matchFont, Text as SkiaText, type SkFont } from '@shopify/react-native-skia';
import { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import {
  Easing,
  runOnJS,
  useDerivedValue,
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

const FONT_SIZE = 80;
const SLOT = 52;
const COLON_SLOT = 26;
const HEIGHT = 128; // taller than the glyphs, so blur has room to spread
const BASELINE = 96;

const DISSOLVE_MS = durations.digitDissolve;
const MAX_BLUR = 9; // only ever reached mid-transition

/**
 * `matchFont` defaults to the family "System", which is an iOS name — on Android
 * nothing matches it, the font comes back with no typeface, and text silently
 * draws nothing. So we try real family names and check that one actually landed.
 */
const FONT_FAMILIES = Platform.select({
  android: ['sans-serif', 'Roboto', 'Noto Sans'],
  ios: ['Helvetica Neue', 'Helvetica', 'System'],
  default: ['System'],
});

function resolveFont(): SkFont | null {
  for (const fontFamily of FONT_FAMILIES) {
    try {
      const candidate = matchFont({ fontFamily, fontSize: FONT_SIZE, fontWeight: '200' });
      if (candidate.getTypeface()) return candidate;
    } catch {
      // try the next family
    }
  }
  return null;
}

/**
 * The time, dissolving rather than ticking.
 *
 * A changing digit blurs out and drifts up until it is gone, the character is
 * swapped while nothing is visible, then it condenses back. One glyph exists per
 * slot at any instant, so two characters can never overlap — the old ghosting
 * bug is structurally impossible.
 *
 * All five glyphs share ONE canvas, and blur sits at zero except during those
 * few hundred milliseconds, so the effect costs nothing at rest.
 */
export function CountdownDisplay({ minutes, seconds, isRunning }: CountdownDisplayProps) {
  const colors = useTheme();
  const color = isRunning ? colors.digitBright : colors.digitDim;

  const slots = [SLOT, SLOT, COLON_SLOT, SLOT, SLOT];
  const width = slots.reduce((total, slot) => total + slot, 0);
  const centres = useMemo(() => {
    let cursor = 0;
    return slots.map((slot) => {
      const centre = cursor + slot / 2;
      cursor += slot;
      return centre;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const colonPulse = useSharedValue(1);
  useEffect(() => {
    colonPulse.value = withRepeat(
      withTiming(0.3, { duration: durations.colonPulse / 2, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [colonPulse]);

  // Resolved once per launch, so this branch never flips between renders.
  const font = useMemo(resolveFont, []);

  // The countdown IS the app. If no typeface resolved we show plain text rather
  // than an empty screen — a missing effect beats a missing timer.
  if (!font) {
    return (
      <View style={[styles.fallbackRow, { height: HEIGHT }]}>
        <Text style={[styles.fallbackText, { color }]}>
          {minutes}:{seconds}
        </Text>
      </View>
    );
  }

  return (
    <Canvas style={[styles.canvas, { width }]} pointerEvents="none">
      <DissolvingGlyph char={minutes[0]} centre={centres[0]} color={color} font={font} />
      <DissolvingGlyph char={minutes[1]} centre={centres[1]} color={color} font={font} />
      <PulsingColon centre={centres[2]} color={color} pulse={colonPulse} font={font} />
      <DissolvingGlyph char={seconds[0]} centre={centres[3]} color={color} font={font} />
      <DissolvingGlyph char={seconds[1]} centre={centres[4]} color={color} font={font} />
    </Canvas>
  );
}

function DissolvingGlyph({
  char,
  centre,
  color,
  font,
}: {
  char: string;
  centre: number;
  color: string;
  font: SkFont;
}) {
  const [shown, setShown] = useState(char);
  // 1 = fully condensed, 0 = fully dissolved (and safe to swap the character).
  const solidity = useSharedValue(1);

  useEffect(() => {
    if (char === shown) return;
    solidity.value = withTiming(
      0,
      { duration: DISSOLVE_MS, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(setShown)(char);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [char]);

  useEffect(() => {
    // Condense back once the swapped character is on screen.
    solidity.value = withTiming(1, { duration: DISSOLVE_MS, easing: Easing.out(Easing.cubic) });
  }, [shown, solidity]);

  const opacity = useDerivedValue(() => solidity.value, [solidity]);
  const blur = useDerivedValue(() => (1 - solidity.value) * MAX_BLUR, [solidity]);
  const transform = useDerivedValue(
    () => [{ translateY: (1 - solidity.value) * -14 }, { scale: 0.9 + solidity.value * 0.1 }],
    [solidity],
  );

  const width = font.measureText(shown).width;

  return (
    <Group opacity={opacity} transform={transform} origin={{ x: centre, y: BASELINE - FONT_SIZE / 3 }}>
      <SkiaText x={centre - width / 2} y={BASELINE} text={shown} font={font} color={color}>
        <BlurMask blur={blur} style="normal" />
      </SkiaText>
    </Group>
  );
}

function PulsingColon({
  centre,
  color,
  pulse,
  font,
}: {
  centre: number;
  color: string;
  pulse: SharedValue<number>;
  font: SkFont;
}) {
  const width = font.measureText(':').width;
  const opacity = useDerivedValue(() => pulse.value, [pulse]);

  return (
    <Group opacity={opacity}>
      <SkiaText x={centre - width / 2} y={BASELINE - 6} text=":" font={font} color={color} />
    </Group>
  );
}

const styles = StyleSheet.create({
  canvas: {
    height: HEIGHT,
  },
  fallbackRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontSize: FONT_SIZE,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
});
