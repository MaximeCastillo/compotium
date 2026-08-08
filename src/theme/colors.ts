// Single source of truth for the whole visual identity of Compotium.
// Tune the mood here and it ripples through every component.

export const colors = {
  // Deep-space background gradient (top -> middle -> bottom).
  bgTop: '#05070E',
  bgMid: '#0A1526',
  bgBottom: '#0B1E2E',

  // Breathing auras (the "vibrant but calm" glow behind everything).
  auraTeal: '#2DD4BF',
  auraSky: '#38BDF8',
  auraGreen: '#0F766E',

  // Time digits.
  digitBright: '#EAF2FF',
  digitDim: '#2B3A52',

  // The tap button.
  buttonBg: 'rgba(16, 28, 48, 0.55)',
  buttonBorderIdle: 'rgba(90, 120, 160, 0.28)',
  buttonBorderActive: '#2DD4BF',
  buttonPlus: '#5EEAD4',
  buttonUnit: '#5B6C86',

  // Helper text.
  hint: '#48586F',
} as const;

// Animation timings, in milliseconds. Slow = calm.
export const durations = {
  backgroundBreath: 5200, // one full in/out breath of the aura
  buttonBreath: 2800, // the button's gentle heartbeat
  digitDissolve: 460, // half of a digit's fall-and-fade transition
  colonPulse: 1000, // the colon breathing once per second
} as const;
