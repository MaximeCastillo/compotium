import { Canvas, Circle, Group, LinearGradient, RadialGradient, rect, vec } from '@shopify/react-native-skia';
import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Easing, useDerivedValue, useSharedValue, withRepeat, withSpring, withTiming } from 'react-native-reanimated';
import { withAlpha } from '../theme/alpha';
import { durations, type Palette } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

type TapButtonProps = {
  isRunning: boolean;
  amount: number;
  unit: string;
  onPress: () => void;
};

const CORE = 96; // radius of the black disc — the shadow of the hole
const CANVAS = 420;
const CENTRE = CANVAS / 2;
const FOOTPRINT = CORE * 2 + 56; // layout space claimed; the canvas overflows it
const CANVAS_OFFSET = (FOOTPRINT - CANVAS) / 2;

const DISC = 168; // outer radius of the accretion disc
const DISC_WIDTH = 46; // its thickness, before being squashed
const EDGE_ON = 0.15; // how flat the disc is seen — low means nearly edge-on

/**
 * The single gesture of the app, drawn as Gargantua.
 *
 * What makes the shape readable is contrast, not glow: a hard-edged black disc,
 * a thin brilliant ring hugging it, and a disc seen so nearly edge-on that it
 * reads as a band. An earlier attempt leaned on wide blurs and came out as a
 * fuzzy halo — the film's image is sharp.
 *
 * Depth comes from draw order. The disc is painted once behind the core, which
 * hides its middle, then painted again clipped to the lower half so its near
 * side crosses in FRONT. The same ring squashed the other way becomes the light
 * bent over the top and under the bottom — the detail that says "black hole"
 * rather than "ring".
 *
 * The bright side stays put: in the film the asymmetry comes from matter racing
 * towards the viewer, not from the disc turning. That is also cheaper, since
 * nothing has to be re-shaded.
 */
export function TapButton({ isRunning, amount, unit, onPress }: TapButtonProps) {
  const colors = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const breath = useSharedValue(0);
  const press = useSharedValue(0);

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1, { duration: durations.buttonBreath, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [breath]);

  const intensity = isRunning ? 1 : 0.6;
  const origin = vec(CENTRE, CENTRE);

  const halo = useDerivedValue(
    () => [{ scale: 1 + breath.value * 0.03 - press.value * 0.04 }],
    [breath, press],
  );

  // Bright limb on the left, receding limb on the right.
  const discColors = [
    withAlpha(colors.buttonPlus, 0.95 * intensity),
    withAlpha(colors.auraTeal, 0.5 * intensity),
    withAlpha(colors.auraTeal, 0.14 * intensity),
  ];
  const discGradient = (
    <LinearGradient
      start={vec(CENTRE - DISC, CENTRE)}
      end={vec(CENTRE + DISC, CENTRE)}
      colors={discColors}
      positions={[0, 0.55, 1]}
    />
  );

  return (
    <View style={styles.wrapper}>
      <Canvas style={styles.canvas} pointerEvents="none">
        <Group transform={halo} origin={origin}>
          {/* Light spilling into the surrounding space. */}
          <Circle c={origin} r={DISC * 1.15}>
            <RadialGradient
              c={origin}
              r={DISC * 1.15}
              colors={[withAlpha(colors.auraTeal, 0), withAlpha(colors.auraTeal, 0.13 * intensity), withAlpha(colors.auraTeal, 0)]}
              positions={[0.45, 0.62, 1]}
            />
          </Circle>

          {/* Light bent over the top and under the bottom. Its middle will be
              covered by the core, leaving the two arcs that sell the shape. */}
          <Group origin={origin} transform={[{ scaleX: EDGE_ON }]}>
            <Circle c={origin} r={DISC * 0.94} style="stroke" strokeWidth={DISC_WIDTH * 0.8}>
              {discGradient}
            </Circle>
          </Group>

          {/* Far side of the disc. */}
          <Group origin={origin} transform={[{ scaleY: EDGE_ON }]}>
            <Circle c={origin} r={DISC} style="stroke" strokeWidth={DISC_WIDTH}>
              {discGradient}
            </Circle>
          </Group>

          {/* The shadow, hard-edged. */}
          <Circle c={origin} r={CORE} color={colors.bgTop} />
          {/* The photon ring is the brightest thing on screen; it gives the scale. */}
          <Circle
            c={origin}
            r={CORE + 1}
            style="stroke"
            strokeWidth={2}
            color={withAlpha(colors.digitBright, 0.85 * intensity)}
          />

          {/* Near side of the disc, clipped to below the centre so it crosses in front. */}
          <Group clip={rect(0, CENTRE, CANVAS, CANVAS - CENTRE)}>
            <Group origin={origin} transform={[{ scaleY: EDGE_ON }]}>
              <Circle c={origin} r={DISC} style="stroke" strokeWidth={DISC_WIDTH}>
                {discGradient}
              </Circle>
            </Group>
          </Group>
        </Group>
      </Canvas>

      <Pressable
        onPress={onPress}
        onPressIn={() => {
          press.value = withTiming(1, { duration: 120 });
        }}
        onPressOut={() => {
          press.value = withSpring(0, { damping: 18, stiffness: 260 });
        }}
        style={styles.hitArea}
      >
        <Text style={styles.plus}>+{amount}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </Pressable>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    wrapper: {
      width: FOOTPRINT,
      height: FOOTPRINT,
      alignItems: 'center',
      justifyContent: 'center',
    },
    canvas: {
      position: 'absolute',
      top: CANVAS_OFFSET,
      left: CANVAS_OFFSET,
      width: CANVAS,
      height: CANVAS,
    },
    hitArea: {
      width: CORE * 2,
      height: CORE * 2,
      borderRadius: CORE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    plus: {
      color: colors.buttonPlus,
      fontSize: 38,
      fontWeight: '200',
      letterSpacing: 1,
    },
    unit: {
      color: colors.buttonUnit,
      fontSize: 13,
      letterSpacing: 3,
      textTransform: 'uppercase',
      marginTop: 2,
    },
  });
