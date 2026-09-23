import { useEffect } from 'react';
import { useAccessibility } from '@a11y-toolkit/core';
import type { ContrastMode, ReadableFont, ThemeMode } from '@a11y-toolkit/core';

export interface AccessibilityVisualEffectsProps {
  /** Element that receives the CSS custom properties. Defaults to the document root. */
  rootElement?: HTMLElement | null;
}

const FONT_STACKS: Record<ReadableFont, string> = {
  system: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  opendyslexic: 'OpenDyslexic, "Comic Sans MS", sans-serif',
  lexend: 'Lexend, Arial, sans-serif',
  'atkinson-hyperlegible': 'Atkinson Hyperlegible, Arial, sans-serif',
};

const LARGE_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44"><path d="M3 2v34l9-10 6 15 7-3-6-15h12z" fill="white" stroke="black" stroke-width="3" stroke-linejoin="round"/></svg>',
)}") 3 3, auto`;

function colorsFor(theme: ThemeMode, contrast: ContrastMode) {
  const prefersDark =
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = theme === 'dark' || (theme === 'system' && prefersDark);

  if (contrast === 'high') return { background: '#000000', foreground: '#ffffff' };
  if (contrast === 'inverted') return { background: '#111827', foreground: '#f9fafb' };
  return dark
    ? { background: '#111827', foreground: '#f9fafb' }
    : { background: '#ffffff', foreground: '#172033' };
}

/** Applies visual preferences as documented CSS custom properties. */
export function AccessibilityVisualEffects({ rootElement }: AccessibilityVisualEffectsProps) {
  const { preferences } = useAccessibility();

  useEffect(() => {
    const root = rootElement ?? (typeof document !== 'undefined' ? document.documentElement : null);
    if (!root) return;

    const visual = preferences.visual;
    const colors = colorsFor(visual.theme, visual.contrast);
    const dark =
      visual.contrast !== 'normal' ||
      visual.theme === 'dark' ||
      (visual.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.dataset.a11yRoot = 'true';
    root.dataset.a11yTheme = visual.theme;
    root.dataset.a11yContrast = visual.contrast;
    root.dataset.a11yLargeControls = String(visual.largeControls);
    root.dataset.a11yLargeCursor = String(visual.cursorSize === 'large');
    root.style.colorScheme = dark ? 'dark' : 'light';

    root.style.setProperty('--a11y-font-size-base', `${visual.fontSize}px`);
    root.style.setProperty('--a11y-line-height', String(visual.lineHeight));
    root.style.setProperty('--a11y-letter-spacing', `${visual.letterSpacing}px`);
    root.style.setProperty('--a11y-word-spacing', `${visual.wordSpacing}px`);
    root.style.setProperty('--a11y-color-bg', colors.background);
    root.style.setProperty('--a11y-color-fg', colors.foreground);
    root.style.setProperty('--a11y-font-family', FONT_STACKS[visual.fontFamily]);
    root.style.setProperty('--a11y-accent-color', visual.accentColor);
    root.style.setProperty('--a11y-zoom', String(visual.zoom));
    root.style.setProperty('--a11y-cursor-size', visual.cursorSize === 'large' ? '32px' : 'auto');
    root.style.setProperty('--a11y-cursor', visual.cursorSize === 'large' ? LARGE_CURSOR : 'auto');
    root.style.setProperty('--a11y-control-min-size', visual.largeControls ? '48px' : 'auto');
  }, [preferences.visual, rootElement]);

  return null;
}
