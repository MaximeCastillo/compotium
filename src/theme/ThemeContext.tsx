import { createContext, useContext } from 'react';
import { spatial, type Palette } from './colors';

/**
 * Provides the active palette to the whole tree. Components read it with
 * useTheme() instead of importing a fixed `colors` object, so switching the
 * theme re-colors everything at once.
 */
const ThemeContext = createContext<Palette>(spatial);

export const ThemeProvider = ThemeContext.Provider;

export function useTheme(): Palette {
  return useContext(ThemeContext);
}
