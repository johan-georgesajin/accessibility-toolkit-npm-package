# Parallel development

Use short-lived branches scoped to one package: `track-1/visual`, `track-2/reading`,
`track-3/modes`, or `track-4/devtools`. Do not combine unrelated track work in one pull request.

`packages/core` and `CONTRACT.md` are shared surfaces. Changes there require review by the four tracks
and must preserve backward compatibility. Before opening a pull request, run `pnpm typecheck`,
`pnpm lint`, and `pnpm format:check`.
