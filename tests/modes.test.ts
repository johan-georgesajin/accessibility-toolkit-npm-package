import { describe, expect, it } from 'vitest';
import { DEFAULT_ACCESSIBILITY_PREFERENCES } from '../packages/core/src/types';
import { composeMode } from '../packages/modes/src/presets';

describe('mode composer', () => {
  it('builds a full dyslexia preset from the shared preferences', () => {
    const mode = composeMode('dyslexia', DEFAULT_ACCESSIBILITY_PREFERENCES);
    expect(mode.visual.fontFamily).toBe('opendyslexic');
    expect(mode.reading.syllableSplittingEnabled).toBe(true);
    expect(mode.reading.bionicReadingEnabled).toBe(true);
    expect(mode.reading.coloredOverlay).toBe(true);
  });

  it('builds an ADHD preset with focus and reading-session support', () => {
    const mode = composeMode('adhd', DEFAULT_ACCESSIBILITY_PREFERENCES);
    expect(mode.interaction.distractionFree).toBe(true);
    expect(mode.reading.autoScrollEnabled).toBe(true);
    expect(mode.reading.readingTimer).toBe(true);
    expect(mode.reading.showProgress).toBe(true);
  });

  it('builds a low-vision preset with every visual aid enabled', () => {
    const mode = composeMode('lowVision', DEFAULT_ACCESSIBILITY_PREFERENCES);
    expect(mode.visual).toMatchObject({
      contrast: 'high',
      magnifierEnabled: true,
      cursorSize: 'large',
      largeControls: true,
    });
  });
});
