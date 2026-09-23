export { AccessibilityAnalytics, createAnalyticsDashboard } from './analytics';
export { findContrastIssues } from './contrast';
export { createAccessibilityScanner } from './factory';
export { findKeyboardIssues } from './keyboard';
export { DevtoolsPluginRegistry } from './plugins';
export { scanAccessibility, scanAccessibilityWithSummary } from './scanner';
export { calculateWcagScore } from './score';
export type {
  AccessibilityIssue,
  AccessibilityScanner,
  AccessibilityRuleId,
  AnalyticsDashboard,
  AnalyticsEvent,
  AnalyticsSnapshot,
  DevtoolsPlugin,
  ScanOptions,
  ScanSummary,
  Severity,
} from './types';
