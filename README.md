# AccessOne Accessibility Toolkit

AccessOne is a TypeScript accessibility toolkit for React applications. It provides a shared preference provider, a keyboard-accessible control panel, reading helpers, accessibility modes, and developer scanner utilities.

## What is included

- Visual controls: text size and spacing, contrast, themes, readable fonts, magnifier, zoom, large cursor, large controls, and saved profiles.
- Reading tools: browser read aloud with word highlighting, bionic reading, syllable view, progress, auto-scroll controls, and pluggable text processing.
- Interaction: skip link, panel focus trap, distraction-free view, OCR image reading, and Dyslexia, ADHD Focus, and Low Vision modes.
- Developer tools: DOM scanner for alt text, labels, headings, contrast, and keyboard issues; WCAG-style score; feature analytics; plugin metadata registry.

## Run the demo

Requirements: Node.js 20 or newer and pnpm 10.

```powershell
corepack enable
pnpm install
pnpm dev
```

If PowerShell blocks `pnpm`, use:

```powershell
npx.cmd pnpm@10.17.0 install
npx.cmd pnpm@10.17.0 dev
```

Open the address shown in the terminal, normally `http://localhost:5173`.

## React setup

Install the publishable package when it is released:

```bash
npm install @a11y-toolkit/toolkit react react-dom
```

Wrap the application once and render the panel anywhere inside it:

```tsx
import { AccessibilityPanel, AccessibilityProvider } from '@a11y-toolkit/toolkit';

export function App() {
  return (
    <AccessibilityProvider>
      <AccessibilityPanel />
      <main>Your application content</main>
    </AccessibilityProvider>
  );
}
```

## Next.js

Render the provider and panel from a client component because they use browser storage and browser accessibility APIs.

```tsx
'use client';
import { AccessibilityPanel, AccessibilityProvider } from '@a11y-toolkit/toolkit';

export function AccessibilityShell({ children }: { children: React.ReactNode }) {
  return <AccessibilityProvider><AccessibilityPanel />{children}</AccessibilityProvider>;
}
```

## Plain HTML and other frameworks

The scanner is framework-neutral and works after a DOM is available:

```ts
import { createAccessibilityScanner } from '@a11y-toolkit/toolkit';

const scanner = createAccessibilityScanner();
console.log(scanner.scanWithSummary(document));
```

React visual controls require React. Vue, Angular, Svelte, and plain HTML applications can use the framework-neutral scanner, analytics, and text-processing utilities directly.

## Preferences and privacy

Preferences automatically persist under the local browser key `a11y-toolkit:prefs`. Named profiles are saved in the same browser only. Analytics events remain in memory and are never sent to a server by this toolkit.

## Development checks

```powershell
pnpm typecheck
pnpm build
pnpm lint
```

See [CONTRACT.md](CONTRACT.md) for the public preference schema, CSS variables, storage behavior, and plugin contract.
