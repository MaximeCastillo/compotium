import { Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type SettingsSheetProps = {
  visible: boolean;
  keepAwake: boolean;
  onToggleKeepAwake: (value: boolean) => void;
  onClose: () => void;
};

/**
 * A minimal bottom sheet. Tapping the dark backdrop closes it; tapping the
 * panel itself does not (the inner Pressable swallows the touch).
 */
export function SettingsSheet({ visible, keepAwake, onToggleKeepAwake, onClose }: SettingsSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.title}>Réglages</Text>

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
    marginBottom: 20,
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
