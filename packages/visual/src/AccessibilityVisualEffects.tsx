import { useEffect } from 'react';
import { useAccessibility } from '@a11y-toolkit/core';
export interface AccessibilityVisualEffectsProps {
  rootElement?: HTMLElement | null;
}
export function AccessibilityVisualEffects({ rootElement }: AccessibilityVisualEffectsProps) {
  const { preferences } = useAccessibility();
  useEffect(() => {
    const root = rootElement ?? (typeof document === 'undefined' ? null : document.documentElement);
    if (!root) return;
    const v = preferences.visual;
    root.dataset.a11yRoot = 'true';
    root.style.setProperty('--a11y-font-size-base', `${v.fontSize}px`);
    root.style.setProperty('--a11y-line-height', String(v.lineHeight));
    root.style.setProperty('--a11y-letter-spacing', `${v.letterSpacing}px`);
    root.style.setProperty('--a11y-word-spacing', `${v.wordSpacing}px`);
    root.style.setProperty('--a11y-accent-color', v.accentColor);
    root.style.setProperty('--a11y-zoom', String(v.zoom));
    root.style.setProperty(
      '--a11y-color-bg',
      v.contrast === 'high' ? '#000' : v.theme === 'dark' ? '#111827' : '#fff',
    );
    root.style.setProperty(
      '--a11y-color-fg',
      v.contrast === 'high' || v.theme === 'dark' ? '#fff' : '#172033',
    );
    root.dataset.a11yLargeControls = String(v.largeControls);
    root.dataset.a11yLargeCursor = String(v.cursorSize === 'large');
  }, [preferences.visual, rootElement]);
  return null;
}
