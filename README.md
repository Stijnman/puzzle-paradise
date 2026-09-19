# Puzzle Paradise

Puzzle Paradise is a fast, free, ad-free puzzle arcade built with plain HTML, CSS, and JavaScript and deployed on GitHub Pages.

**Play:** [https://stijnman.github.io/puzzle-paradise/](https://stijnman.github.io/puzzle-paradise/)

## What is included

The hub currently exposes **43 playable puzzle engines** covering logic, number, spatial, and strategy games, including Sudoku, Mines, Net, Fifteen, Bridges, Light Up, Loopy, Tents, Towers, Untangle, and many more.

The project deliberately stays lightweight:

- no advertising or tracking
- no application framework
- no runtime package dependencies
- responsive desktop and mobile UI
- keyboard-friendly controls where supported
- GitHub Pages deployment
- automated repository, syntax, documentation, spelling, and secret checks

## Architecture

```text
puzzle-paradise/
├── index.html                  # puzzle catalogue, search, filters, daily puzzle
├── player.html                 # shared puzzle player shell and engine loader
├── js/                         # one JavaScript engine per puzzle
├── tests/                      # dependency-free Node contract tests
├── .github/workflows/          # CI and GitHub Pages deployment
├── TESTING.md                  # testing strategy and commands
└── STATUS.md                   # current repository health
```

`index.html` owns the catalogue. Selecting a puzzle opens `player.html?game=<id>`, which resolves the puzzle ID to an initialization function and loads `js/<id>.js`.

## Quality gates

Every pull request to `main` is expected to pass:

1. JavaScript syntax checks for every engine.
2. Repository contract tests that verify catalogue IDs, player mappings, engine files, and init functions stay in sync.
3. Markdown linting.
4. Spelling checks.
5. Pre-commit hooks.
6. Secret scanning.

Run the dependency-free code checks locally with Node.js 20 or newer:

```bash
find js -name "*.js" -type f -print0 | xargs -0 -n1 node --check
node --test tests/*.test.mjs
```

For the full browser-oriented checklist, see [TESTING.md](TESTING.md).

## Adding a puzzle

A new puzzle is not complete until all three layers agree:

1. Add the puzzle metadata to the catalogue in `index.html`.
2. Add its loader mapping to `player.html`.
3. Add `js/<puzzle-id>.js` with the initialization function referenced by the loader.

The automated contract tests fail when one of those layers is missing or mismatched.

## Deployment

`.github/workflows/deploy-pages.yml` publishes `main` to GitHub Pages. Tests run separately so deployment history and code-quality history remain easy to inspect.

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Security reports should follow [SECURITY.md](SECURITY.md).

## License and attribution

Original Puzzle Paradise work is released under the MIT License; see [LICENSE](LICENSE).

Puzzle Paradise is inspired in part by Simon Tatham's Portable Puzzle Collection. The upstream collection is also distributed under the MIT License. Attribution and upstream references are documented in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
