export type Severity = 'error' | 'warning' | 'info';

export type AccessibilityRuleId =
  | 'image-alt'
  | 'button-name'
  | 'link-name'
  | 'form-label'
  | 'heading-order'
  | 'color-contrast'
  | 'tabindex-order'
  | 'focusable-hidden';

export interface AccessibilityIssue {
  rule: AccessibilityRuleId;
  severity: Severity;
  message: string;
  element: string;
  suggestion: string;
  wcag?: string;
}

export interface ScanOptions {
  checkContrast?: boolean;
  checkKeyboard?: boolean;
}

export interface AccessibilityScanner {
  scan(root?: ParentNode): AccessibilityIssue[];
  scanWithSummary(root?: ParentNode): ScanSummary;
}

export interface ScanSummary {
  score: number;
  issues: AccessibilityIssue[];
  totals: Record<Severity, number>;
}

export interface AnalyticsEvent {
  featureId: string;
  enabled: boolean;
  timestamp: number;
}

export interface AnalyticsSnapshot {
  totalEvents: number;
  enabledFeatures: Record<string, number>;
  events: readonly AnalyticsEvent[];
}

export interface AnalyticsDashboard {
  totalEvents: number;
  enabledFeatureCount: number;
  mostUsedFeature: string | null;
  enabledFeatures: ReadonlyArray<{ featureId: string; activations: number }>;
}

export interface DevtoolsPlugin {
  id: string;
  title: string;
  description?: string;
  track: 'devtools' | 'custom';
}
