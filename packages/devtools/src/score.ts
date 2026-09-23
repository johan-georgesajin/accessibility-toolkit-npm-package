import type { AccessibilityIssue, ScanSummary, Severity } from './types';

const deductions: Record<Severity, number> = {
  error: 10,
  warning: 3,
  info: 1,
};

export function calculateWcagScore(issues: AccessibilityIssue[]): ScanSummary {
  const totals: Record<Severity, number> = {
    error: 0,
    warning: 0,
    info: 0,
  };

  const deduction = issues.reduce((total, issue) => {
    totals[issue.severity] += 1;
    return total + deductions[issue.severity];
  }, 0);

  return {
    score: Math.max(0, 100 - deduction),
    issues,
    totals,
  };
}
