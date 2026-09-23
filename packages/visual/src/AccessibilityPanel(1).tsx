import { useEffect, useState } from 'react';
import { useAccessibility } from '@a11y-toolkit/core';
import type { ReadableFont, VisualPreferences } from '@a11y-toolkit/core';
import { AccessibilityMagnifier } from './AccessibilityMagnifier';
import {
  AccessibilityVisualEffects,
  type AccessibilityVisualEffectsProps,
} from './AccessibilityVisualEffects';

export interface AccessibilityPanelProps extends AccessibilityVisualEffectsProps {
  label?: string;
}

type ToolId =
  | 'contrast'
  | 'text-size'
  | 'text-spacing'
  | 'line-height'
  | 'font-family'
  | 'theme'
  | 'zoom'
  | 'magnifier'
  | 'cursor'
  | 'bigger-buttons'
  | 'accent-color'
  | 'reset';

const FONTS: ReadonlyArray<{ value: ReadableFont; label: string }> = [
  { value: 'system', label: 'System default' },
  { value: 'opendyslexic', label: 'OpenDyslexic' },
  { value: 'lexend', label: 'Lexend' },
  { value: 'atkinson-hyperlegible', label: 'Atkinson Hyperlegible' },
];

const TOOLS: ReadonlyArray<{ id: ToolId; title: string; icon: string; reset?: boolean }> = [
  { id: 'contrast', title: 'Contrast', icon: 'sun' },
  { id: 'text-size', title: 'Text Size', icon: 'text' },
  { id: 'text-spacing', title: 'Text Spacing', icon: 'spacing' },
  { id: 'line-height', title: 'Line Height', icon: 'line-height' },
  { id: 'font-family', title: 'Font Family', icon: 'font' },
  { id: 'theme', title: 'Screen Mode', icon: 'moon' },
  { id: 'zoom', title: 'Page Zoom', icon: 'zoom' },
  { id: 'magnifier', title: 'Magnifier', icon: 'magnifier' },
  { id: 'cursor', title: 'Cursor', icon: 'cursor' },
  { id: 'bigger-buttons', title: 'Bigger Buttons', icon: 'buttons' },
  { id: 'accent-color', title: 'Theme Color', icon: 'palette' },
  { id: 'reset', title: 'Reset All', icon: 'reset', reset: true },
];

function ToolIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    sun: (
      <>
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
    text: (
      <>
        <path d="M4 18 9 6h2l5 12M6.4 13h7.2" />
        <path d="M18 8h3M19.5 6.5v3" />
      </>
    ),
    spacing: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
        <path d="M7 3v6M12 9v6M17 15v6" />
      </>
    ),
    'line-height': (
      <>
        <path d="M4 5h16M4 12h16M4 19h16" />
        <path d="M2 8l2-3 2 3M2 16l2 3 2-3" />
      </>
    ),
    font: (
      <>
        <path d="M7 4h7a4 4 0 0 1 0 8H8" />
        <path d="M8 12h7a4 4 0 0 1 0 8H7" />
      </>
    ),
    moon: <path d="M20 15.2A8.2 8.2 0 0 1 8.8 4 8.2 8.2 0 1 0 20 15.2Z" />,
    zoom: (
      <>
        <circle cx="10.5" cy="10.5" r="5.5" />
        <path d="m15 15 5 5M8 10.5h5M10.5 8v5" />
      </>
    ),
    magnifier: (
      <>
        <circle cx="10" cy="10" r="5" />
        <path d="m14 14 6 6M8 10h4M10 8v4" />
      </>
    ),
    cursor: <path d="m4 3 6.5 16 2.3-6 5.2 5.2 2.2-2.2-5.2-5.2 6-2.3L4 3Z" />,
    buttons: (
      <>
        <rect x="4" y="5" width="16" height="5" rx="1" />
        <rect x="4" y="14" width="16" height="5" rx="1" />
      </>
    ),
    palette: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="8" cy="10" r="1" fill="currentColor" />
        <circle cx="12" cy="7" r="1" fill="currentColor" />
        <circle cx="16" cy="10" r="1" fill="currentColor" />
        <path d="M13 20c-2 0-2-3 0-3h2a2 2 0 0 0 0-4" />
      </>
    ),
    reset: (
      <>
        <path d="M4 9V4h5" />
        <path d="M4.6 4.6A8 8 0 1 1 4 15" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function RangeControl({
  id,
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="a11y-setting">
      <label htmlFor={id}>
        <span>{label}</span>
        <output htmlFor={id}>{`${value}${unit}`}</output>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

function ToggleControl({
  label,
  description,
  pressed,
  onClick,
}: {
  label: string;
  description: string;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button className="a11y-toggle" type="button" aria-pressed={pressed} onClick={onClick}>
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <span aria-hidden="true" className="a11y-switch" />
    </button>
  );
}

/** Keyboard-accessible floating visual accessibility controls. */
export function AccessibilityPanel({
  rootElement,
  label = 'Accessibility controls',
}: AccessibilityPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ToolId | null>(null);
  const [saveStatus, setSaveStatus] = useState('Preferences save automatically.');
  const {
    preferences,
    updatePreferences,
    resetPreferences,
    savePreferences,
    loadPreferences,
    registerPlugin,
  } = useAccessibility();
  const visual = preferences.visual;

  useEffect(
    () => registerPlugin({ id: 'visual.panel', title: 'Visual controls', track: 'visual' }),
    [registerPlugin],
  );

  const updateVisual = (patch: Partial<VisualPreferences>) =>
    updatePreferences({ visual: { ...visual, ...patch } });
  const selectedTitle = TOOLS.find((tool) => tool.id === selectedTool)?.title;

  const settingView = () => {
    switch (selectedTool) {
      case 'text-size':
        return (
          <RangeControl
            id="a11y-font-size"
            label="Text size"
            value={visual.fontSize}
            min={14}
            max={28}
            step={1}
            unit="px"
            onChange={(fontSize) => updateVisual({ fontSize })}
          />
        );
      case 'text-spacing':
        return (
          <>
            <RangeControl
              id="a11y-letter-spacing"
              label="Letter spacing"
              value={visual.letterSpacing}
              min={0}
              max={6}
              step={0.5}
              unit="px"
              onChange={(letterSpacing) => updateVisual({ letterSpacing })}
            />
            <RangeControl
              id="a11y-word-spacing"
              label="Word spacing"
              value={visual.wordSpacing}
              min={0}
              max={12}
              step={1}
              unit="px"
              onChange={(wordSpacing) => updateVisual({ wordSpacing })}
            />
          </>
        );
      case 'line-height':
        return (
          <RangeControl
            id="a11y-line-height"
            label="Line height"
            value={visual.lineHeight}
            min={1.2}
            max={2.4}
            step={0.1}
            unit=""
            onChange={(lineHeight) => updateVisual({ lineHeight })}
          />
        );
      case 'font-family':
        return (
          <label className="a11y-select" htmlFor="a11y-font-family">
            <span>Readable font</span>
            <select
              id="a11y-font-family"
              value={visual.fontFamily}
              onChange={(event) => updateVisual({ fontFamily: event.target.value as ReadableFont })}
            >
              {FONTS.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </label>
        );
      case 'contrast':
        return (
          <label className="a11y-select" htmlFor="a11y-contrast">
            <span>Contrast mode</span>
            <select
              id="a11y-contrast"
              value={visual.contrast}
              onChange={(event) =>
                updateVisual({ contrast: event.target.value as VisualPreferences['contrast'] })
              }
            >
              <option value="normal">Normal</option>
              <option value="high">High contrast</option>
              <option value="inverted">Inverted</option>
            </select>
          </label>
        );
      case 'theme':
        return (
          <label className="a11y-select" htmlFor="a11y-theme">
            <span>Screen mode</span>
            <select
              id="a11y-theme"
              value={visual.theme}
              onChange={(event) =>
                updateVisual({ theme: event.target.value as VisualPreferences['theme'] })
              }
            >
              <option value="system">Use device setting</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        );
      case 'zoom':
        return (
          <RangeControl
            id="a11y-zoom"
            label="Page zoom"
            value={visual.zoom}
            min={1}
            max={1.5}
            step={0.1}
            unit="×"
            onChange={(zoom) => updateVisual({ zoom })}
          />
        );
      case 'magnifier':
        return (
          <ToggleControl
            label="Text magnifier"
            description="Magnify text under the pointer"
            pressed={visual.magnifierEnabled}
            onClick={() => updateVisual({ magnifierEnabled: !visual.magnifierEnabled })}
          />
        );
      case 'cursor':
        return (
          <ToggleControl
            label="Large cursor"
            description="Increase pointer visibility"
            pressed={visual.cursorSize === 'large'}
            onClick={() =>
              updateVisual({ cursorSize: visual.cursorSize === 'large' ? 'default' : 'large' })
            }
          />
        );
      case 'bigger-buttons':
        return (
          <ToggleControl
            label="Bigger buttons"
            description="Use 48px touch targets"
            pressed={visual.largeControls}
            onClick={() => updateVisual({ largeControls: !visual.largeControls })}
          />
        );
      case 'accent-color':
        return (
          <label className="a11y-color" htmlFor="a11y-accent-color">
            <span>Accent color</span>
            <input
              id="a11y-accent-color"
              type="color"
              value={visual.accentColor}
              onChange={(event) => updateVisual({ accentColor: event.target.value })}
            />
          </label>
        );
      case 'reset':
        return (
          <button
            className="a11y-reset-confirm"
            type="button"
            onClick={() => {
              resetPreferences();
              setSaveStatus('Preferences reset to defaults.');
              setSelectedTool(null);
            }}
          >
            Reset all preferences
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <AccessibilityVisualEffects rootElement={rootElement} />
      {visual.magnifierEnabled && <AccessibilityMagnifier />}
      <button
        className="a11y-launcher"
        type="button"
        aria-expanded={isOpen}
        aria-controls="a11y-accessibility-panel"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span aria-hidden="true">◉</span> Accessibility
      </button>
      {isOpen && (
        <aside id="a11y-accessibility-panel" className="a11y-panel" aria-label={label}>
          <header className="a11y-panel-header">
            <div className="a11y-brand-mark" aria-hidden="true">
              ✦
            </div>
            <h2>
              Access<span>One</span>
            </h2>
            <button
              type="button"
              className="a11y-icon-button"
              aria-label="Close accessibility controls"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </header>
          <div className="a11y-profile">
            Visual profile <span aria-hidden="true">⌄</span>
          </div>
          {selectedTool ? (
            <section className="a11y-detail">
              <button className="a11y-back" type="button" onClick={() => setSelectedTool(null)}>
                ← All tools
              </button>
              <h3>{selectedTitle}</h3>
              {settingView()}
            </section>
          ) : (
            <section className="a11y-tool-grid" aria-label="Visual accessibility tools">
              {TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  className={tool.reset ? 'a11y-tool a11y-tool-reset' : 'a11y-tool'}
                  onClick={() => setSelectedTool(tool.id)}
                >
                  <ToolIcon name={tool.icon} />
                  <span>{tool.title}</span>
                </button>
              ))}
            </section>
          )}
          <footer className="a11y-panel-footer">
            <p aria-live="polite">{saveStatus}</p>
            <div>
              <button
                type="button"
                onClick={() => {
                  loadPreferences();
                  setSaveStatus('Saved preferences loaded.');
                }}
              >
                Load saved
              </button>
              <button
                type="button"
                onClick={() => {
                  savePreferences();
                  setSaveStatus('Preferences saved.');
                }}
              >
                Save now
              </button>
            </div>
          </footer>
        </aside>
      )}
    </>
  );
}
