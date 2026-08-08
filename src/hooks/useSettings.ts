import { useState } from 'react';

export type TapUnit = 'min' | 'sec';

/**
 * User preferences. In-memory for now (resets on relaunch); we can persist
 * later with AsyncStorage without touching the components that consume this.
 */
export function useSettings() {
  const [keepAwake, setKeepAwake] = useState(false);
  const [tapAmount, setTapAmount] = useState(5); // value added per tap
  const [tapUnit, setTapUnit] = useState<TapUnit>('min'); // default: 5 minutes

  return { keepAwake, setKeepAwake, tapAmount, setTapAmount, tapUnit, setTapUnit };
}
