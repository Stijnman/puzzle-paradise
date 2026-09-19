# Repository Status

Last reviewed: 2026-09-19

## Current state

| Area | State |
| --- | --- |
| Puzzle catalogue | 43 advertised puzzles |
| Puzzle engine files | 43 JavaScript engines |
| GitHub Pages deployment | Enabled |
| CI | Enabled |
| JavaScript syntax gate | Enabled |
| Repository contract tests | Enabled |
| Markdown lint | Enabled |
| Spell check | Enabled |
| Pre-commit | Enabled |
| Secret scan | Enabled |
| Issue templates | Present |
| Pull request template | Present |
| Security policy | Present |
| License | MIT |
| Third-party attribution | Documented |

## Quality definition

"Green" means the repository contract, syntax, documentation, spelling, pre-commit, and applicable secret checks passed. It does not by itself prove every generated puzzle position is mathematically valid; gameplay changes also require the browser checklist in [TESTING.md](TESTING.md).

## Known focus areas

The project is intentionally framework-free. Future quality work should prioritize puzzle-rule correctness, deterministic test fixtures, browser-level interaction tests, accessibility, and performance without turning the site into a dependency-heavy application.

## Release readiness

Changes should merge to `main` only after the pull-request checks are green and affected puzzles pass the gameplay checklist.
