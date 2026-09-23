import type { AccessibilityMode, AccessibilityPreferences } from '@a11y-toolkit/core';
export type ModePreferencePatch = Omit<AccessibilityPreferences, 'version'>;
export function composeMode(
  mode: AccessibilityMode,
  current: AccessibilityPreferences,
): ModePreferencePatch {
  const base: ModePreferencePatch = {
    visual: { ...current.visual },
    reading: { ...current.reading },
    interaction: { ...current.interaction },
    activeMode: mode,
    custom: { ...current.custom },
  };
  if (mode === 'dyslexia')
    return {
      ...base,
      visual: {
        ...base.visual,
        fontFamily: 'opendyslexic',
        letterSpacing: Math.max(base.visual.letterSpacing, 1),
        wordSpacing: Math.max(base.visual.wordSpacing, 2),
      },
      reading: {
        ...base.reading,
        syllableSplittingEnabled: true,
        syllableSplitting: true,
        bionicReadingEnabled: true,
        bionicReading: true,
        coloredOverlay: true,
      },
    };
  if (mode === 'adhd')
    return {
      ...base,
      reading: {
        ...base.reading,
        autoScrollEnabled: true,
        autoScroll: true,
        showProgress: true,
        readingTimer: true,
      },
      interaction: { ...base.interaction, distractionFree: true },
    };
  return {
    ...base,
    visual: {
      ...base.visual,
      contrast: 'high',
      fontSize: Math.max(base.visual.fontSize, 20),
      zoom: Math.max(base.visual.zoom, 1.25),
      magnifierEnabled: true,
      cursorSize: 'large',
      largeControls: true,
    },
  };
}
