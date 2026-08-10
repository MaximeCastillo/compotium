// Two palettes with the SAME keys. Swapping the active one re-colors the whole
// app (see ThemeContext). Key names follow the "Calme spatial" theme but are
// really semantic slots (aura1/2/3 = the three breathing auras, etc.).

export const spatial = {
  // Background gradient (top -> middle -> bottom).
  bgTop: '#05070E',
  bgMid: '#0A1526',
  bgBottom: '#0B1E2E',

  // Breathing auras.
  auraTeal: '#2DD4BF',
  auraSky: '#38BDF8',
  auraGreen: '#0F766E',

  // Time digits.
  digitBright: '#EAF2FF',
  digitDim: '#2B3A52',

  // Tap button.
  buttonBg: 'rgba(16, 28, 48, 0.55)',
  buttonBorderIdle: 'rgba(90, 120, 160, 0.28)',
  buttonBorderActive: '#2DD4BF',
  buttonPlus: '#5EEAD4',
  buttonUnit: '#5B6C86',

  // Stop button.
  stopTrack: 'rgba(120, 150, 190, 0.16)',
  stopProgress: '#5EEAD4',
  stopGlyph: 'rgba(180, 200, 230, 0.5)',

  // Settings (gear + sheet).
  settingsIcon: 'rgba(180, 200, 230, 0.55)',
  sheetBackdrop: 'rgba(3, 6, 12, 0.6)',
  sheetBg: '#0E1726',
  sheetBorder: 'rgba(90, 120, 160, 0.2)',
  sheetLabel: '#EAF2FF',
  sheetSub: '#5B6C86',
  switchTrackOff: '#26303C',
  switchThumb: '#EAF2FF',
} as const;

// "Énergie solaire" — same slots, warm/solar values.
export const solar: Palette = {
  bgTop: '#0B0503',
  bgMid: '#1C0A05',
  bgBottom: '#2C0F06',

  auraTeal: '#FB923C', // orange flare
  auraSky: '#FCD34D', // gold
  auraGreen: '#DC2626', // deep red / fire

  digitBright: '#FFF7ED',
  digitDim: '#5A3A2A',

  buttonBg: 'rgba(48, 20, 10, 0.55)',
  buttonBorderIdle: 'rgba(180, 110, 60, 0.28)',
  buttonBorderActive: '#FB923C',
  buttonPlus: '#FDBA74',
  buttonUnit: '#8A6650',

  stopTrack: 'rgba(200, 140, 90, 0.16)',
  stopProgress: '#FDBA74',
  stopGlyph: 'rgba(255, 220, 190, 0.5)',

  settingsIcon: 'rgba(255, 220, 190, 0.55)',
  sheetBackdrop: 'rgba(12, 5, 2, 0.6)',
  sheetBg: '#1A0C06',
  sheetBorder: 'rgba(180, 110, 60, 0.2)',
  sheetLabel: '#FFF7ED',
  sheetSub: '#8A6650',
  switchTrackOff: '#3A2418',
  switchThumb: '#FFF7ED',
};

// Same keys as `spatial`, but values widened to `string` so other palettes
// (solar, …) can hold different colors.
export type Palette = { [K in keyof typeof spatial]: string };
export type ThemeName = 'spatial' | 'solar';
export const themes: Record<ThemeName, Palette> = { spatial, solar };

// Animation timings, in milliseconds. Theme-independent. Slow = calm.
export const durations = {
  backgroundBreath: 5200,
  buttonBreath: 2800,
  digitDissolve: 240, // long enough for the dissolve to be seen, short enough to stay crisp
  colonPulse: 1000,
} as const;
