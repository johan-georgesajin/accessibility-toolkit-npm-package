import { findContrastIssues } from './contrast';
import { findKeyboardIssues } from './keyboard';
import { calculateWcagScore } from './score';
import type { AccessibilityIssue, ScanOptions, ScanSummary } from './types';

function hasAccessibleName(element: Element): boolean {
  return Boolean(
    element.textContent?.trim() ||
    element.getAttribute('aria-label')?.trim() ||
    element.getAttribute('aria-labelledby')?.trim(),
  );
}

export function scanAccessibility(
  root: ParentNode = document,
  options: ScanOptions = {},
): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];

  // Rule 1: Images must have an alt attribute.
  root.querySelectorAll('img').forEach((image) => {
    if (!image.hasAttribute('alt')) {
      issues.push({
        rule: 'image-alt',
        severity: 'error',
        message: 'Image is missing alternative text.',
        element: '<img>',
        suggestion: 'Add an alt attribute, for example: alt="Company logo".',
        wcag: '1.1.1 Non-text Content',
      });
    }
  });

  // Rule 2: Buttons need an accessible name.
  root.querySelectorAll('button').forEach((button) => {
    if (!hasAccessibleName(button)) {
      issues.push({
        rule: 'button-name',
        severity: 'error',
        message: 'Button has no accessible name.',
        element: '<button>',
        suggestion: 'Add visible text or an aria-label attribute.',
        wcag: '4.1.2 Name, Role, Value',
      });
    }
  });

  // Rule 3: Links need readable text or an aria-label.
  root.querySelectorAll('a').forEach((link) => {
    if (!hasAccessibleName(link)) {
      issues.push({
        rule: 'link-name',
        severity: 'error',
        message: 'Link has no accessible name.',
        element: '<a>',
        suggestion: 'Add descriptive link text or an aria-label attribute.',
        wcag: '2.4.4 Link Purpose',
      });
    }
  });

  // Rule 4: Form controls need an associated label or ARIA label.
  root.querySelectorAll("input:not([type='hidden']), textarea, select").forEach((control) => {
    const id = control.getAttribute('id');

    const hasLabel = Boolean(
      control.closest('label') ||
      control.getAttribute('aria-label')?.trim() ||
      control.getAttribute('aria-labelledby')?.trim() ||
      (id && Array.from(root.querySelectorAll('label')).some((label) => label.htmlFor === id)),
    );

    if (!hasLabel) {
      issues.push({
        rule: 'form-label',
        severity: 'error',
        message: 'Form control has no accessible label.',
        element: `<${control.tagName.toLowerCase()}>`,
        suggestion: 'Add a <label> connected with htmlFor/id, or add an aria-label.',
        wcag: '3.3.2 Labels or Instructions',
      });
    }
  });

  // Rule 5: Do not skip heading levels, such as h1 to h3.
  let previousLevel = 0;

  root.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
    const currentLevel = Number(heading.tagName.slice(1));

    if (previousLevel !== 0 && currentLevel > previousLevel + 1) {
      issues.push({
        rule: 'heading-order',
        severity: 'warning',
        message: `Heading order skips from h${previousLevel} to h${currentLevel}.`,
        element: `<${heading.tagName.toLowerCase()}>`,
        suggestion: 'Use heading levels in order without skipping levels.',
        wcag: '2.4.6 Headings and Labels',
      });
    }

    previousLevel = currentLevel;
  });

  if (options.checkContrast !== false) {
    issues.push(...findContrastIssues(root));
  }

  if (options.checkKeyboard !== false) {
    issues.push(...findKeyboardIssues(root));
  }

  return issues;
}

export function scanAccessibilityWithSummary(
  root: ParentNode = document,
  options: ScanOptions = {},
): ScanSummary {
  const issues = scanAccessibility(root, options);
  return calculateWcagScore(issues);
}
