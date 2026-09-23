# Accessibility Toolkit

An open-source, TypeScript accessibility toolkit for React applications. It combines visual
preferences, reading assistance, accessibility modes, OCR, and DOM-based WCAG checks in one package.

## Packages

- `@a11y-toolkit/core` - shared provider, preferences, storage, and plugins.
- `@a11y-toolkit/visual` - floating accessibility panel and visual effects.
- `@a11y-toolkit/reading` - speech and text-processing hooks.
- `@a11y-toolkit/modes` - presets, keyboard helpers, OCR, and reading session UI.
- `@a11y-toolkit/devtools` - scanner, scoring, analytics utilities, and plugin registry.
- `accessibility-toolkit` - the single package that re-exports all of the above.

## Quick start (React)

```tsx
import { AccessibilityPanel, AccessibilityProvider } from 'accessibility-toolkit';
import 'accessibility-toolkit/style.css';

export function App() {
  return (
    <AccessibilityProvider>
      <main id="main">Your application</main>
      <AccessibilityPanel />
    </AccessibilityProvider>
  );
}
```

See [framework setup guidance](docs/frameworks.md) for Next.js, Vue, Angular, Svelte, and plain HTML
integration notes.

## Local development

```powershell
pnpm.cmd install
pnpm.cmd typecheck
pnpm.cmd lint
pnpm.cmd format:check
pnpm.cmd --filter @a11y-toolkit/demo dev
```

## Release policy

Do not publish until `pnpm.cmd build`, the automated tests, and a clean install in a separate React app
have passed. Publishing to npm is a deliberate release action, not part of local development.

## Team Members

- Arjun VM
- Albin Eldhose
- Delna Maria Saji
- Johan George Sajin
