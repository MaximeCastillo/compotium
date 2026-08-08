import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { type Palette, type ThemeName } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import type { TapUnit } from '../hooks/useSettings';

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 60;

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
  onClose: () => void;
};

export function SettingsSheet(props: SettingsSheetProps) {
  const { visible, keepAwake, onToggleKeepAwake, tapAmount, onChangeTapAmount, tapUnit, onChangeTapUnit, themeName, onChangeTheme, onClose } = props;
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

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.title}>Réglages</Text>

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
        </Pressable>
      </Pressable>
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
    backdrop: {
      flex: 1,
      justifyContent: 'flex-end',
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
