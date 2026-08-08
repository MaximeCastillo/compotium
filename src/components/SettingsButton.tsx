import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

/** A small, unobtrusive gear that opens the settings sheet. */
export function SettingsButton({ onPress }: { onPress: () => void }) {
  const colors = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={16}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      accessibilityLabel="Réglages"
    >
      <Ionicons name="settings-outline" size={22} color={colors.settingsIcon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
  pressed: {
    opacity: 0.5,
  },
});
