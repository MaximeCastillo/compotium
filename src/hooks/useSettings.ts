import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import type { ThemeName } from '../theme/colors';

export type TapUnit = 'min' | 'sec';
export type SoundLength = 'short' | 'long';

const STORAGE_KEY = 'compotium.settings.v1';

/**
 * User preferences, persisted on the device with AsyncStorage. They load once
 * on mount and are saved whenever any of them changes. Values are validated on
 * read (never trust stored data blindly).
 */
export function useSettings() {
  const [keepAwake, setKeepAwake] = useState(false);
  const [tapAmount, setTapAmount] = useState(5); // default: 5
  const [tapUnit, setTapUnit] = useState<TapUnit>('min'); // default: minutes
  const [themeName, setThemeName] = useState<ThemeName>('spatial');
  const [soundLength, setSoundLength] = useState<SoundLength>('short');
  const hydrated = useRef(false);

  // Load once.
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (active && raw) {
          try {
            const s = JSON.parse(raw);
            if (typeof s.keepAwake === 'boolean') setKeepAwake(s.keepAwake);
            if (typeof s.tapAmount === 'number') setTapAmount(Math.max(1, Math.min(60, s.tapAmount)));
            if (s.tapUnit === 'min' || s.tapUnit === 'sec') setTapUnit(s.tapUnit);
            if (s.themeName === 'spatial' || s.themeName === 'solar') setThemeName(s.themeName);
            if (s.soundLength === 'short' || s.soundLength === 'long') setSoundLength(s.soundLength);
          } catch {
            // corrupted value — ignore and keep defaults
          }
        }
        hydrated.current = true;
      })
      .catch(() => {
        hydrated.current = true;
      });
    return () => {
      active = false;
    };
  }, []);

  // Save whenever a preference changes (but not before the initial load).
  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ keepAwake, tapAmount, tapUnit, themeName, soundLength }),
    ).catch(() => {});
  }, [keepAwake, tapAmount, tapUnit, themeName, soundLength]);

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
