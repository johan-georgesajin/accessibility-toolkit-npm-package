import { describe, expect, it } from 'vitest';
import {
  AccessibilityAnalytics,
  calculateWcagScore,
  createAnalyticsDashboard,
  scanAccessibilityWithSummary,
} from '../packages/devtools/src/index';

describe('developer toolkit', () => {
  it('detects known DOM accessibility problems and returns a score', () => {
    document.body.innerHTML = `
      <h1>Page title</h1><h4>Skipped heading</h4>
      <img src="logo.png">
      <button></button>
      <a href="#"></a>
      <input type="text">
      <button tabindex="2">Out of order</button>
    `;

    const report = scanAccessibilityWithSummary(document, { checkContrast: false });
    expect(report.score).toBeLessThan(100);
    expect(report.issues.map((issue) => issue.rule)).toEqual(
      expect.arrayContaining([
        'image-alt',
        'button-name',
        'link-name',
        'form-label',
        'heading-order',
        'tabindex-order',
      ]),
    );
  });

  it('calculates score deductions by severity', () => {
    const report = calculateWcagScore([
      {
        rule: 'image-alt',
        severity: 'error',
        message: '',
        element: '',
        suggestion: '',
      },
      {
        rule: 'heading-order',
        severity: 'warning',
        message: '',
        element: '',
        suggestion: '',
      },
    ]);
    expect(report.score).toBe(87);
    expect(report.totals).toEqual({ error: 1, warning: 1, info: 0 });
  });

  it('summarizes real feature-toggle events', () => {
    const analytics = new AccessibilityAnalytics();
    analytics.record('mode.dyslexia', true);
    analytics.record('mode.dyslexia', false);
    analytics.record('visual.magnifier', true);

    expect(createAnalyticsDashboard(analytics.snapshot())).toMatchObject({
      totalEvents: 3,
      enabledFeatureCount: 2,
      mostUsedFeature: 'mode.dyslexia',
    });
  });
});
