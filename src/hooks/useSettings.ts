import { useState } from 'react';

/**
 * User preferences. In-memory for now (resets on relaunch); we can persist
 * later with AsyncStorage without touching the components that consume this.
 */
export function useSettings() {
  const [keepAwake, setKeepAwake] = useState(false);

  return { keepAwake, setKeepAwake };
}
