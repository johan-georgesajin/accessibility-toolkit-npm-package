import { scanAccessibility, scanAccessibilityWithSummary } from './scanner';
import type { AccessibilityScanner, ScanOptions } from './types';

/**
 * Creates a framework-neutral scanner instance. React, Next.js, Vue, Angular,
 * Svelte, and plain HTML can all call the returned methods after the DOM exists.
 */
export function createAccessibilityScanner(options: ScanOptions = {}): AccessibilityScanner {
  return {
    scan(root = document) {
      return scanAccessibility(root, options);
    },
    scanWithSummary(root = document) {
      return scanAccessibilityWithSummary(root, options);
    },
  };
}
