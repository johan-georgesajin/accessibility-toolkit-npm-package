import type { AccessibilityIssue } from './types';

const focusableSelector = [
  'a[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  '[tabindex]',
].join(', ');

export function findKeyboardIssues(root: ParentNode): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const controls = root.querySelectorAll<HTMLElement>(focusableSelector);

  controls.forEach((control) => {
    const tabIndex = Number(control.getAttribute('tabindex'));
    if (Number.isFinite(tabIndex) && tabIndex > 0) {
      issues.push({
        rule: 'tabindex-order',
        severity: 'warning',
        message: 'Positive tabindex changes the natural keyboard navigation order.',
        element: `<${control.tagName.toLowerCase()}>`,
        suggestion: 'Use tabindex="0" for custom controls or let the browser manage tab order.',
        wcag: '2.4.3 Focus Order',
      });
    }

    if (typeof getComputedStyle === 'undefined') return;
    const styles = getComputedStyle(control);
    const isHidden =
      control.getAttribute('aria-hidden') === 'true' ||
      control.hidden ||
      styles.display === 'none' ||
      styles.visibility === 'hidden';

    if (isHidden && control.tabIndex >= 0) {
      issues.push({
        rule: 'focusable-hidden',
        severity: 'error',
        message: 'A hidden element can still receive keyboard focus.',
        element: `<${control.tagName.toLowerCase()}>`,
        suggestion: 'Remove it from the tab order with tabindex="-1" or make it visible.',
        wcag: '4.1.2 Name, Role, Value',
      });
    }
  });

  return issues;
}
