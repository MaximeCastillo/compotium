import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { type Palette, type ThemeName } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import type { SoundLength, TapUnit } from '../hooks/useSettings';

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 60;

// Before the sheet has been laid out we still need a distance to slide in from.
const ASSUMED_SHEET_HEIGHT = 600;
// Past a quarter of its own height, or on a decisive flick, the sheet goes away.
const CLOSE_DISTANCE_RATIO = 0.25;
const CLOSE_VELOCITY = 800;

type SettingsSheetProps = {
  visible: boolean;
  keepAwake: boolean;
  onToggleKeepAwake: (value: boolean) => void;
  tapAmount: number;
  onChangeTapAmount: (value: number) => void;
  tapUnit: TapUnit;
  onChangeTapUnit: (value: TapUnit) => void;
  themeName: ThemeName;
  onChangeTheme: (value: ThemeName) => void;
  soundLength: SoundLength;
  onChangeSound: (value: SoundLength) => void;
  onClose: () => void;
};

export function SettingsSheet(props: SettingsSheetProps) {
  const { visible, keepAwake, onToggleKeepAwake, tapAmount, onChangeTapAmount, tapUnit, onChangeTapUnit, themeName, onChangeTheme, soundLength, onChangeSound, onClose } = props;
  const colors = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const clamp = (value: number) => Math.max(MIN_AMOUNT, Math.min(MAX_AMOUNT, value));

  // Local text state so the field can be cleared/typed freely; committed on blur.
  const [amountText, setAmountText] = useState(String(tapAmount));
  useEffect(() => setAmountText(String(tapAmount)), [tapAmount]);

  const commitAmount = () => {
    const parsed = parseInt(amountText, 10);
    const next = Number.isNaN(parsed) ? tapAmount : clamp(parsed);
    onChangeTapAmount(next);
    setAmountText(String(next));
  };

  // How far the sheet sits below its resting place. Drives both the drag and the
  // opening animation, so a gesture starting mid-open never jumps.
  const translateY = useSharedValue(ASSUMED_SHEET_HEIGHT);
  const sheetHeight = useSharedValue(ASSUMED_SHEET_HEIGHT);

  useEffect(() => {
    if (!visible) return;
    translateY.value = sheetHeight.value;
    translateY.value = withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) });
  }, [visible, translateY, sheetHeight]);

  // Slide away, then unmount. Marked as a worklet so the gesture can call it on
  // the UI thread, while the cross and the backdrop call it from JS.
  const slideAway = () => {
    'worklet';
    translateY.value = withTiming(
      sheetHeight.value,
      { duration: 220, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(onClose)();
      },
    );
  };

  const dragToDismiss = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY); // never above the resting place
    })
    .onEnd((event) => {
      const draggedFarEnough = event.translationY > sheetHeight.value * CLOSE_DISTANCE_RATIO;
      const flickedDown = event.velocityY > CLOSE_VELOCITY;
      if (draggedFarEnough || flickedDown) {
        slideAway();
      } else {
        translateY.value = withSpring(0, { damping: 22, stiffness: 220 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  // The backdrop fades with the sheet, so dragging dims the screen back gradually.
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, sheetHeight.value], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={slideAway}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={slideAway} />
        </Animated.View>

        <Animated.View
          style={[styles.sheet, sheetStyle]}
          onLayout={(event) => {
            sheetHeight.value = event.nativeEvent.layout.height;
          }}
        >
          {/* Only the handle and the title are draggable — the body keeps its taps
              for the stepper and the text field, with no arbitration needed. */}
          <GestureDetector gesture={dragToDismiss}>
            <View style={styles.grabArea}>
              <View style={styles.handle} />
              <Text style={styles.title}>Réglages</Text>
            </View>
          </GestureDetector>

          {/* Deliberately outside the gesture area, so a tap here is never a drag. */}
          <Pressable onPress={slideAway} hitSlop={16} style={styles.close}>
            <Ionicons name="close" size={24} color={colors.settingsIcon} />
          </Pressable>

          {/* Duration per tap */}
          <View style={styles.block}>
            <Text style={styles.label}>Durée par tap</Text>
            <Text style={styles.sub}>Ce qu'un appui ajoute (1–60, saisie possible).</Text>

            <View style={styles.controls}>
              <View style={styles.stepper}>
                <Pressable onPress={() => onChangeTapAmount(clamp(tapAmount - 1))} hitSlop={12} style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}>
                  <Ionicons name="remove" size={20} color={colors.sheetLabel} />
                </Pressable>
                <TextInput
                  style={styles.amountInput}
                  value={amountText}
                  onChangeText={(t) => setAmountText(t.replace(/[^0-9]/g, ''))}
                  onEndEditing={commitAmount}
                  onSubmitEditing={commitAmount}
                  keyboardType="number-pad"
                  maxLength={2}
                  selectTextOnFocus
                  returnKeyType="done"
                />
                <Pressable onPress={() => onChangeTapAmount(clamp(tapAmount + 1))} hitSlop={12} style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}>
                  <Ionicons name="add" size={20} color={colors.sheetLabel} />
                </Pressable>
              </View>

              <View style={styles.segment}>
                <Segmented<TapUnit> label="min" value="min" current={tapUnit} onSelect={onChangeTapUnit} styles={styles} />
                <Segmented<TapUnit> label="sec" value="sec" current={tapUnit} onSelect={onChangeTapUnit} styles={styles} />
              </View>
            </View>
          </View>

          {/* Theme */}
          <View style={styles.block}>
            <Text style={styles.label}>Thème</Text>
            <View style={styles.themeSegment}>
              <Segmented<ThemeName> label="Calme spatial" value="spatial" current={themeName} onSelect={onChangeTheme} styles={styles} grow />
              <Segmented<ThemeName> label="Énergie solaire" value="solar" current={themeName} onSelect={onChangeTheme} styles={styles} grow />
            </View>
          </View>

          {/* End sound */}
          <View style={styles.block}>
            <Text style={styles.label}>Son de fin</Text>
            <View style={styles.themeSegment}>
              <Segmented<SoundLength> label="Court" value="short" current={soundLength} onSelect={onChangeSound} styles={styles} grow />
              <Segmented<SoundLength> label="Long" value="long" current={soundLength} onSelect={onChangeSound} styles={styles} grow />
            </View>
          </View>

          {/* Keep awake */}
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.label}>Garder l'écran allumé</Text>
              <Text style={styles.sub}>Empêche la veille pendant un décompte.</Text>
            </View>
            <Switch
              value={keepAwake}
              onValueChange={onToggleKeepAwake}
              trackColor={{ true: colors.auraTeal, false: colors.switchTrackOff }}
              thumbColor={colors.switchThumb}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function Segmented<T extends string>({
  label,
  value,
  current,
  onSelect,
  styles,
  grow,
}: {
  label: string;
  value: T;
  current: T;
  onSelect: (value: T) => void;
  styles: ReturnType<typeof makeStyles>;
  grow?: boolean;
}) {
  const active = current === value;
  return (
    <Pressable onPress={() => onSelect(value)} style={[styles.segBtn, grow && styles.segBtnGrow, active && styles.segBtnActive]}>
      <Text style={[styles.segText, active && styles.segTextActive]}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      backgroundColor: colors.sheetBackdrop,
    },
    sheet: {
      backgroundColor: colors.sheetBg,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderWidth: 1,
      borderColor: colors.sheetBorder,
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 40,
    },
    // Generously tall on purpose: this is the only place the sheet can be grabbed,
    // so it has to be easy to hit without looking.
    grabArea: {
      paddingBottom: 4,
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.switchTrackOff,
      marginBottom: 20,
    },
    title: {
      color: colors.sheetLabel,
      fontSize: 20,
      fontWeight: '300',
      letterSpacing: 0.5,
      marginBottom: 24,
    },
    close: {
      position: 'absolute',
      top: 26,
      right: 20,
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    block: {
      marginBottom: 28,
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 16,
      gap: 16,
    },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    stepBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.buttonBg,
      borderWidth: 1,
      borderColor: colors.sheetBorder,
    },
    amountInput: {
      color: colors.sheetLabel,
      fontSize: 24,
      fontWeight: '300',
      minWidth: 48,
      textAlign: 'center',
      fontVariant: ['tabular-nums'],
      borderBottomWidth: 1,
      borderColor: colors.sheetBorder,
      paddingVertical: 2,
    },
    segment: {
      flexDirection: 'row',
      backgroundColor: colors.buttonBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.sheetBorder,
      padding: 3,
    },
    themeSegment: {
      flexDirection: 'row',
      marginTop: 14,
      backgroundColor: colors.buttonBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.sheetBorder,
      padding: 3,
    },
    segBtn: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 9,
      alignItems: 'center',
    },
    segBtnGrow: {
      flex: 1,
    },
    segBtnActive: {
      backgroundColor: colors.auraTeal,
    },
    segText: {
      color: colors.sheetSub,
      fontSize: 14,
    },
    segTextActive: {
      color: colors.bgTop,
      fontWeight: '600',
    },
    pressed: {
      opacity: 0.5,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
    },
    rowText: {
      flex: 1,
    },
    label: {
      color: colors.sheetLabel,
      fontSize: 16,
    },
    sub: {
      color: colors.sheetSub,
      fontSize: 13,
      marginTop: 3,
    },
  });
