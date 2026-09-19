# Repository Status

Last reviewed: 2026-09-19

## Current state

| Area | State |
| --- | --- |
| Puzzle catalogue | 43 advertised puzzles |
| Puzzle engine files | 43 JavaScript engines |
| Full-screen responsive arcade | Implemented |
| Full-screen player | Implemented |
| Languages | EN, NL, FR, DE, ES |
| Language detection / persistence | Implemented |
| Per-puzzle guide payloads | 43 × 5 dictionaries |
| Seeded session runtime | Implemented |
| Difficulty selector | Easy / Medium / Hard / Expert |
| Difficulty-aware generators | Sudoku, Arrow Escape |
| Autosave / restore | localStorage |
| Undo / Redo | Replay-based session history |
| Metrics | Moves, time, accuracy, stars, best time |
| Themes | Dark, Light, OLED Black |
| Keyboard navigation | Enabled |
| Audio / haptics | Optional |
| GitHub Pages deployment | Enabled |
| Shared + engine JavaScript checks | Enabled |
| Repository / app-shell tests | Enabled |
| 43-engine startup/reset/interaction smoke tests | Enabled |
| Markdown lint / spelling / pre-commit | Enabled |
| Secret scan | Enabled |
| License / attribution / security policy | Present |

## Quality definition

A green CI run means repository structure, engine entry points, first interactions, shared runtime modules, translation dictionaries, documentation, spelling, and configured security checks passed.

CI does not mathematically prove every possible randomly generated position. Gameplay-rule changes therefore also use the browser checklist in [TESTING.md](TESTING.md).

## Release readiness

Merge to `main` only after the pull-request checks are green and affected gameplay surfaces pass browser verification.
