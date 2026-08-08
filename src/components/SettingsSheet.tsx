import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import type { TapUnit } from '../hooks/useSettings';
import { colors } from '../theme/colors';

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
  onClose: () => void;
};

/**
 * A minimal bottom sheet. Tapping the dark backdrop closes it; tapping the
 * panel itself does not (the inner Pressable swallows the touch).
 */
export function SettingsSheet({
  visible,
  keepAwake,
  onToggleKeepAwake,
  tapAmount,
  onChangeTapAmount,
  tapUnit,
  onChangeTapUnit,
  onClose,
}: SettingsSheetProps) {
  const clamp = (value: number) => Math.max(MIN_AMOUNT, Math.min(MAX_AMOUNT, value));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.title}>Réglages</Text>

          {/* Duration per tap */}
          <View style={styles.block}>
            <Text style={styles.label}>Durée par tap</Text>
            <Text style={styles.sub}>Ce qu'un appui ajoute au minuteur.</Text>

            <View style={styles.controls}>
              <View style={styles.stepper}>
                <Pressable
                  onPress={() => onChangeTapAmount(clamp(tapAmount - 1))}
                  hitSlop={12}
                  style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}
                >
                  <Ionicons name="remove" size={20} color={colors.sheetLabel} />
                </Pressable>
                <Text style={styles.amount}>{tapAmount}</Text>
                <Pressable
                  onPress={() => onChangeTapAmount(clamp(tapAmount + 1))}
                  hitSlop={12}
                  style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}
                >
                  <Ionicons name="add" size={20} color={colors.sheetLabel} />
                </Pressable>
              </View>

              <View style={styles.segment}>
                <UnitOption label="min" value="min" current={tapUnit} onSelect={onChangeTapUnit} />
                <UnitOption label="sec" value="sec" current={tapUnit} onSelect={onChangeTapUnit} />
              </View>
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

function UnitOption({
  label,
  value,
  current,
  onSelect,
}: {
  label: string;
  value: TapUnit;
  current: TapUnit;
  onSelect: (value: TapUnit) => void;
}) {
  const active = current === value;
  return (
    <Pressable onPress={() => onSelect(value)} style={[styles.segBtn, active && styles.segBtnActive]}>
      <Text style={[styles.segText, active && styles.segTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
    gap: 18,
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
  amount: {
    color: colors.sheetLabel,
    fontSize: 24,
    fontWeight: '300',
    minWidth: 36,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  segment: {
    flexDirection: 'row',
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
  },
  segBtnActive: {
    backgroundColor: colors.auraTeal,
  },
  segText: {
    color: colors.sheetSub,
    fontSize: 15,
  },
  segTextActive: {
    color: '#05070E',
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
