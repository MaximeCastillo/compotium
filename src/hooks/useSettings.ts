import { useState } from 'react';
import type { ThemeName } from '../theme/colors';

export type TapUnit = 'min' | 'sec';
export type SoundLength = 'short' | 'long';

/**
 * User preferences. In-memory for now (resets on relaunch); we can persist
 * later with AsyncStorage without touching the components that consume this.
 */
export function useSettings() {
  const [keepAwake, setKeepAwake] = useState(false);
  const [tapAmount, setTapAmount] = useState(5); // value added per tap
  const [tapUnit, setTapUnit] = useState<TapUnit>('min'); // default: 5 minutes
  const [themeName, setThemeName] = useState<ThemeName>('spatial');
  const [soundLength, setSoundLength] = useState<SoundLength>('short');

  return {
    keepAwake,
    setKeepAwake,
    tapAmount,
    setTapAmount,
    tapUnit,
    setTapUnit,
    themeName,
    setThemeName,
    soundLength,
    setSoundLength,
  };
}
