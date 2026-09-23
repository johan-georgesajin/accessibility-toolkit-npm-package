import { useCallback, useRef } from 'react';
import { useAccessibility } from '@a11y-toolkit/core';
import type { AccessibilityMode, AccessibilityPreferences } from '@a11y-toolkit/core';
import { composeMode } from './presets';
export function useAccessibilityModes() {
  const { preferences, updatePreferences } = useAccessibility();
  const baseline = useRef<AccessibilityPreferences | null>(null);
  const activateMode = useCallback(
    (mode: AccessibilityMode) => {
      const original = baseline.current ?? preferences;
      baseline.current = original;
      updatePreferences(composeMode(mode, original));
    },
    [preferences, updatePreferences],
  );
  const deactivateMode = useCallback(() => {
    const original = baseline.current;
    baseline.current = null;
    if (original)
      updatePreferences({
        visual: original.visual,
        reading: original.reading,
        interaction: original.interaction,
        activeMode: null,
        custom: original.custom,
      });
    else updatePreferences({ activeMode: null });
  }, [updatePreferences]);
  return { activeMode: preferences.activeMode, activateMode, deactivateMode };
}
