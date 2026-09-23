# Shared contract

This document is the compatibility agreement for the four packages. Keep changes additive during
parallel development. Changes to existing fields, token names, or exports require team agreement.

## Ownership and layout

```
packages/
  core/      Shared provider, preference schema, persistence, plugin contracts
  visual/    Track 1 - visual controls and UI shell
  reading/   Track 2 - reading and AI engine
  modes/     Track 3 - interaction and mode composition
  devtools/  Track 4 - developer tooling, scanner, packaging
examples/
  react-demo/ Shared integration fixture
```

Each track owns its package. Cross-package feature logic is prohibited; packages communicate through
`@a11y-toolkit/core` types and APIs. New core fields must be optional or have a default.

## Package names

| Folder              | Package                  |
| ------------------- | ------------------------ |
| `packages/core`     | `@a11y-toolkit/core`     |
| `packages/visual`   | `@a11y-toolkit/visual`   |
| `packages/reading`  | `@a11y-toolkit/reading`  |
| `packages/modes`    | `@a11y-toolkit/modes`    |
| `packages/devtools` | `@a11y-toolkit/devtools` |

## Preferences and persistence

All settings live in a single versioned document persisted by `AccessibilityProvider`.

```ts
interface AccessibilityPreferences {
  version: 1;
  visual: VisualPreferences;
  reading: ReadingPreferences;
  activeMode: AccessibilityMode | null;
  custom: Record<string, unknown>;
}
```

Storage key: `a11y-toolkit:prefs`.

Tracks must use `useAccessibility().setPreferences()` or `updatePreferences()`; they must not read or
write browser storage themselves. The provider accepts a `storage` adapter for SSR or custom persistence.

Track 2 reading preferences currently include `ttsEnabled`, `ttsRate` (0.1-10), `ttsPitch`
(0-2), `readingLevel`, `rulerEnabled`, `autoScrollEnabled`, `syllableSplittingEnabled`, and
`bionicReadingEnabled`. Hooks may keep transient playback state locally, but persistent settings
must use this shared object. Track 3 composes modes by toggling these flags and calling Track 2's
exported hooks/functions; it must not reproduce speech, text-processing, or scroll logic.

## Track 2 public integration API

Track 2 ships no panel UI. Track 1 hosts controls and Track 3 can compose the following exports:

- `useReadAloud()` including `speakSelection()` and word-position state.
- `useSummarize()`, `useExplain()`, `useRewrite()`, `useTranslate()`, and
  `useReadingLevelDetection()`, all backed by the `TextProcessor` adapter.
- `useAutoScroll()`, `useReadingProgress()`, and `ReadingRuler`.
- `splitSyllables()`, `syllabifyText()`, and `createBionicSegments()`.

## CSS custom properties

Visual output is configured on the provider's `rootElement` using the `--a11y-*` prefix. Tokens use
lowercase kebab case. Track 1 owns this token list; other tracks consume tokens but do not rename them.

| Token                                 | Meaning                                 |
| ------------------------------------- | --------------------------------------- |
| `--a11y-font-size-base`               | Base readable text size                 |
| `--a11y-line-height`                  | Body line-height multiplier             |
| `--a11y-letter-spacing`               | Letter spacing                          |
| `--a11y-word-spacing`                 | Word spacing                            |
| `--a11y-color-bg` / `--a11y-color-fg` | Active background and foreground colors |
| `--a11y-font-family`                  | Selected readable font stack            |
| `--a11y-zoom`                         | Page zoom scale                         |
| `--a11y-cursor-size`                  | Cursor size                             |
| `--a11y-control-min-size`             | Minimum interactive control size        |

## Plugin registration

Packages register metadata only; the registry never imports or executes track logic.

```ts
interface AccessibilityPlugin {
  id: string;
  title: string;
  description?: string;
  track: 'visual' | 'reading' | 'modes' | 'devtools' | 'custom';
}

interface AccessibilityContextValue {
  registerPlugin(plugin: AccessibilityPlugin): () => void;
  plugins: readonly AccessibilityPlugin[];
}
```

Plugin IDs are stable, namespaced strings (for example, `visual.text-size`). A duplicate ID replaces no
existing plugin and throws in development.
