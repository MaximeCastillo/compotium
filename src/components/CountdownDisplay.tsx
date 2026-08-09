import { BlurMask, Canvas, Group, matchFont, Text as SkiaText } from '@shopify/react-native-skia';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
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

const font = matchFont({ fontSize: FONT_SIZE, fontWeight: '200' });

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

  return (
    <Canvas style={[styles.canvas, { width }]} pointerEvents="none">
      <DissolvingGlyph char={minutes[0]} centre={centres[0]} color={color} />
      <DissolvingGlyph char={minutes[1]} centre={centres[1]} color={color} />
      <PulsingColon centre={centres[2]} color={color} pulse={colonPulse} />
      <DissolvingGlyph char={seconds[0]} centre={centres[3]} color={color} />
      <DissolvingGlyph char={seconds[1]} centre={centres[4]} color={color} />
    </Canvas>
  );
}

function DissolvingGlyph({ char, centre, color }: { char: string; centre: number; color: string }) {
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
}: {
  centre: number;
  color: string;
  pulse: SharedValue<number>;
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
});
