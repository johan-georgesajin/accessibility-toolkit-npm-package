# Framework integration

`accessibility-toolkit` is a React package. The scanner and its DOM API are framework-neutral.

## React

Install the package and wrap the application once with `AccessibilityProvider`. Render
`AccessibilityPanel` near the application root and import `accessibility-toolkit/style.css`.

```tsx
import { AccessibilityPanel, AccessibilityProvider } from 'accessibility-toolkit';
import 'accessibility-toolkit/style.css';

export function App() {
  return (
    <AccessibilityProvider>
      <AccessibilityPanel />
    </AccessibilityProvider>
  );
}
```

## Next.js

Render the provider and panel in a client component because the panel uses browser APIs. The provider
is SSR-safe: it does not use local storage until the browser is available.

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

The visual panel is React-specific. Use the framework-neutral scanner from any client-side DOM lifecycle
hook after the page is rendered:

```ts
import { createAccessibilityScanner } from 'accessibility-toolkit';

const scanner = createAccessibilityScanner();
const report = scanner.scanWithSummary(document);
console.log(report.score, report.issues);
```

For a native panel in these frameworks, use the scanner output and the exported TypeScript preference
types to render controls in the framework's own component system. Do not call DOM APIs during SSR.

## Tailwind

The package uses prefixed `a11y-` class names and CSS custom properties, so it does not require a
Tailwind configuration change. Import the package stylesheet after your global Tailwind stylesheet.

## Privacy

The demo translator sends entered text to a public translation endpoint. Production applications should
provide their own `TextProcessor` implementation and document their privacy policy before sending user
content to any external service.
