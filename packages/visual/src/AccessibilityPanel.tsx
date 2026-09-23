import { useEffect, useRef, useState } from 'react';
import { useAccessibility } from '@a11y-toolkit/core';
import type { VisualPreferences } from '@a11y-toolkit/core';
import {
  AccessibilityVisualEffects,
  type AccessibilityVisualEffectsProps,
} from './AccessibilityVisualEffects';
export interface AccessibilityPanelProps extends AccessibilityVisualEffectsProps {
  label?: string;
}
export function AccessibilityPanel({
  rootElement,
  label = 'Accessibility controls',
}: AccessibilityPanelProps) {
  const [open, setOpen] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const { preferences, updatePreferences, resetPreferences } = useAccessibility();
  const v = preferences.visual;
  const set = (patch: Partial<VisualPreferences>) =>
    updatePreferences({ visual: { ...v, ...patch } });

  useEffect(() => {
    if (!open) return;

    const closeWhenAppropriate = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || launcherRef.current?.contains(target)) return;
      setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      launcherRef.current?.focus();
    };

    document.addEventListener('pointerdown', closeWhenAppropriate);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeWhenAppropriate);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <>
      <AccessibilityVisualEffects rootElement={rootElement} />
      <button
        ref={launcherRef}
        className="a11y-launcher"
        type="button"
        aria-label={open ? 'Close accessibility controls' : 'Open accessibility controls'}
        aria-expanded={open}
        aria-controls="a11y-panel"
        aria-haspopup="dialog"
        title="Accessibility controls"
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        <svg className="a11y-launcher__icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="4.5" r="2.25" />
          <path d="M4 9.25h16M12 9.25v10.25M12 12.5l-4 6.25M12 12.5l4 6.25" />
        </svg>
        <span className="a11y-visually-hidden">Accessibility</span>
      </button>
      {open && (
        <aside
          ref={panelRef}
          id="a11y-panel"
          className="a11y-panel"
          role="dialog"
          aria-label={label}
        >
          <header>
            <h2>Accessibility</h2>
            <button type="button" aria-label="Close panel" onClick={() => setOpen(false)}>
              ×
            </button>
          </header>
          <label>
            Text size{' '}
            <input
              type="range"
              min="14"
              max="28"
              value={v.fontSize}
              onChange={(e) => set({ fontSize: Number(e.target.value) })}
            />
          </label>
          <label>
            Line height{' '}
            <input
              type="range"
              min="1.2"
              max="2.4"
              step=".1"
              value={v.lineHeight}
              onChange={(e) => set({ lineHeight: Number(e.target.value) })}
            />
          </label>
          <label>
            Contrast{' '}
            <select
              value={v.contrast}
              onChange={(e) => set({ contrast: e.target.value as VisualPreferences['contrast'] })}
            >
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="inverted">Inverted</option>
            </select>
          </label>
          <label>
            Theme{' '}
            <select
              value={v.theme}
              onChange={(e) => set({ theme: e.target.value as VisualPreferences['theme'] })}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <button
            type="button"
            aria-pressed={v.largeControls}
            onClick={() => set({ largeControls: !v.largeControls })}
          >
            Large controls
          </button>
          <button
            type="button"
            aria-pressed={v.cursorSize === 'large'}
            onClick={() => set({ cursorSize: v.cursorSize === 'large' ? 'default' : 'large' })}
          >
            Large cursor
          </button>
          <button type="button" onClick={resetPreferences}>
            Reset preferences
          </button>
        </aside>
      )}
    </>
  );
}
