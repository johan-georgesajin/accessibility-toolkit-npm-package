# @a11y-toolkit/visual

Track 1's React visual controls. The package reads and writes only through `@a11y-toolkit/core`.

```tsx
import { AccessibilityProvider } from '@a11y-toolkit/core';
import { AccessibilityPanel } from '@a11y-toolkit/visual';

export function App() {
  return (
    <AccessibilityProvider>
      <AccessibilityPanel />
      <main>Your app content</main>
    </AccessibilityProvider>
  );
}
```

`AccessibilityPanel` applies the documented `--a11y-*` CSS properties to `document.documentElement`.
Pass `rootElement` to scope those properties to a specific element instead. Preferences save automatically
through the provider's shared storage adapter; the panel's Save and Load buttons use the same core API.

The panel includes text size, spacing, contrast, theme, readable-font selection, accent color, zoom,
text magnification, large cursor, bigger controls, reset, and save/load controls. It is keyboard-operable
and uses native form elements for predictable screen-reader support.
