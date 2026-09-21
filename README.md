# Puzzle Paradise

Puzzle Paradise is a full-screen, ad-free puzzle arcade built with plain HTML, CSS, and JavaScript and deployed on GitHub Pages.

**Play:** [https://stijnman.github.io/puzzle-paradise/](https://stijnman.github.io/puzzle-paradise/)

## Current experience

The hub exposes **43 puzzle engines** across logic, number, spatial, and strategy categories.

The application now includes:

- a fixed `100dvh` arcade shell with no outer-page scrolling
- responsive auto-fit cards and a collapsible discovery rail
- full-screen gameplay with compact controls and side drawers
- English, Dutch, French, German, and Spanish JSON translations
- browser-language detection with persistent manual override
- per-puzzle objectives, rules, tutorials, strategy tips, and hints
- deterministic seeded sessions
- Easy, Medium, Hard, and Expert difficulty selection
- automatic `localStorage` progress restoration
- replay-based session Undo / Redo
- same-seed Reset and new-seed New Puzzle
- move count, elapsed time, accuracy, star ratings, and personal bests
- Dark, Light, and OLED Black themes
- keyboard navigation with arrows/WASD, Enter/Space, Escape, and Ctrl/Cmd+Z
- procedural Web Audio effects and optional vibration
- localized invalid-move feedback and victory UI
- no ads, analytics, tracking, framework, or runtime package dependency

Sudoku and Arrow Escape explicitly vary generated positions by selected difficulty. Other random engines inherit the deterministic shared session seed.

## Architecture

```text
puzzle-paradise/
├── index.html
├── player.html
├── assets/
│   ├── arcade.css
│   ├── arcade.js
│   ├── i18n.js
│   ├── player.css
│   └── player-runtime.js
├── i18n/
│   ├── en.json
│   ├── nl.json
│   ├── fr.json
│   ├── de.json
│   └── es.json
├── js/
├── tests/
├── .github/workflows/
├── TESTING.md
└── STATUS.md
```

The catalogue remains the source of truth for advertised puzzle IDs. `player.html?game=<id>` maps each ID to its engine initialization function. The shared runtime wraps those engines with seeded randomness, persistence, replay history, metrics, internationalization, accessibility, feedback, and display settings.

## Quality gates

Every pull request to `main` is expected to pass:

1. syntax checks for engine and shared browser JavaScript
2. JSON parsing and translation coverage checks
3. catalogue/player/engine contract tests for all 43 puzzles
4. startup, reset, and first-interaction smoke tests for all engines
5. app-shell, i18n, persistence, history, audio/haptic, and accessibility contracts
6. Markdown lint and spelling
7. pre-commit hooks
8. applicable verified-secret scanning

Run locally with Node.js 20 or newer:

```bash
find js assets -name "*.js" -type f -print0 | xargs -0 -n1 node --check
node --test tests/*.test.mjs
```

See [TESTING.md](TESTING.md) for browser and gameplay verification.

## Adding a puzzle

A puzzle is not complete until all layers agree:

1. Add its catalogue metadata to `index.html`.
2. Add its loader mapping to `player.html`.
3. Add `js/<puzzle-id>.js` with the mapped init function.
4. Add the puzzle to every `i18n/*.json` dictionary.
5. Supply objective, hint, rules, tutorial steps, and strategy tips.
6. Verify reset, interaction, success/loss state, keyboard use, and narrow-screen layout.

## Deployment

`.github/workflows/deploy-pages.yml` publishes `main` to GitHub Pages.

## License and attribution

Original Puzzle Paradise work is released under the MIT License; see [LICENSE](LICENSE).

Upstream inspiration and third-party attribution are documented in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
