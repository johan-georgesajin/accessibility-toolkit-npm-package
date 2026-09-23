# accessibility-toolkit

One TypeScript package for visual accessibility controls, reading assistance, accessibility modes, OCR,
and DOM-based WCAG checks.

## Install

```bash
npm install accessibility-toolkit react react-dom
```

## React

```tsx
import { AccessibilityPanel, AccessibilityProvider } from 'accessibility-toolkit';
import 'accessibility-toolkit/style.css';

export function App() {
  return (
    <AccessibilityProvider>
      <main id="main">Your app</main>
      <AccessibilityPanel />
    </AccessibilityProvider>
  );
}
```

## Next.js

Use the same provider and panel in a client component:

```tsx
'use client';
import { AccessibilityPanel, AccessibilityProvider } from 'accessibility-toolkit';
import 'accessibility-toolkit/style.css';

export function AccessibilityTools() {
  return (
    <AccessibilityProvider>
      <AccessibilityPanel />
    </AccessibilityProvider>
  );
}
```

## Vue, Angular, Svelte, and plain HTML

The React panel is React-specific, but the scanner is framework-neutral. Call it after the DOM is ready:

```ts
import { createAccessibilityScanner } from 'accessibility-toolkit';

const report = createAccessibilityScanner().scanWithSummary(document);
console.log(report.score, report.issues);
```

## Tailwind

The stylesheet uses `a11y-` class names and CSS custom properties. Import
`accessibility-toolkit/style.css` after your global Tailwind stylesheet.

## Privacy

Bring your own `TextProcessor` for production text processing. The included demo translator sends text
to a public translation endpoint and is not a production privacy solution.
