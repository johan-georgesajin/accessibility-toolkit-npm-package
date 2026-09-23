import type { AccessibilityIssue } from './types';

type RgbColor = readonly [number, number, number];

function parseRgb(value: string): RgbColor | null {
  const match = value.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) return null;

  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function relativeLuminance([red, green, blue]: RgbColor): number {
  const channel = (value: number) => {
    const normalized = value / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
}

function contrastRatio(foreground: RgbColor, background: RgbColor): number {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

export function findContrastIssues(root: ParentNode): AccessibilityIssue[] {
  if (typeof getComputedStyle === 'undefined') return [];

  const issues: AccessibilityIssue[] = [];
  const selector = root instanceof Document ? 'body *' : '*';
  root.querySelectorAll<HTMLElement>(selector).forEach((element) => {
    if (!element.textContent?.trim() || element.children.length > 0) return;

    const styles = getComputedStyle(element);
    const foreground = parseRgb(styles.color);
    const background = parseRgb(styles.backgroundColor);

    // Transparent, inherited, image, and gradient backgrounds cannot be measured reliably here.
    if (!foreground || !background || styles.backgroundColor === 'rgba(0, 0, 0, 0)') return;

    const ratio = contrastRatio(foreground, background);
    const fontSize = Number.parseFloat(styles.fontSize);
    const isLargeText = fontSize >= 24 || (fontSize >= 18.66 && Number(styles.fontWeight) >= 700);
    const minimum = isLargeText ? 3 : 4.5;

    if (ratio < minimum) {
      issues.push({
        rule: 'color-contrast',
        severity: 'error',
        message: `Text contrast ratio is ${ratio.toFixed(2)}:1; at least ${minimum}:1 is needed.`,
        element: `<${element.tagName.toLowerCase()}>`,
        suggestion: 'Choose foreground and background colors with stronger contrast.',
        wcag: '1.4.3 Contrast (Minimum)',
      });
    }
  });

  return issues;
}
