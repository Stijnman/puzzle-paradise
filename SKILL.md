# Puzzle Paradise Agent Guide

## Repository purpose

Puzzle Paradise is a static GitHub Pages puzzle arcade. The production surface is plain HTML, CSS, and JavaScript.

## Important files

- `index.html`: catalogue, filtering, sorting, daily puzzle, modal shell
- `player.html`: shared puzzle player and puzzle-to-engine mapping
- `js/*.js`: individual puzzle engines
- `tests/repository.test.mjs`: repository contract tests
- `.github/workflows/test.yml`: pull-request quality gates
- `.github/workflows/deploy-pages.yml`: GitHub Pages deployment
- `TESTING.md`: manual and automated testing expectations

## Change rules

When adding or renaming a puzzle, keep these three layers synchronized:

1. catalogue ID in `index.html`
2. loader mapping in `player.html`
3. engine file at `js/<id>.js`

The engine must expose the init function named by `player.html`.

Do not mark a puzzle complete merely because it renders. Verify that legal interactions work, reset works, and the engine can reach a real success or loss state.

## Required checks

```bash
find js -name "*.js" -type f -print0 | xargs -0 -n1 node --check
node --test tests/*.test.mjs
```

Also follow the browser checklist in [TESTING.md](TESTING.md) for gameplay changes.

## Design constraints

- keep the site ad-free and tracking-free
- prefer zero runtime dependencies
- preserve mobile usability
- preserve keyboard accessibility and live status messages
- avoid unnecessary network requests
- keep repository claims evidence-based

## Licensing

See [LICENSE](LICENSE) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Preserve upstream attribution when adapting third-party work.
