# Testing Guide

Puzzle Paradise uses layered tests so a green CI run means more than "the workflow started successfully."

## Automated checks

### JavaScript syntax

Every puzzle engine must parse successfully:

```bash
find js -name "*.js" -type f -print0 | xargs -0 -n1 node --check
```

### Repository contract tests

Run:

```bash
node --test tests/*.test.mjs
```

The contract suite verifies that:

- the catalogue contains unique puzzle IDs
- every catalogue puzzle exists in the player mapping
- the player mapping does not contain orphan puzzles
- every mapped puzzle has a matching `js/<id>.js` engine
- every engine defines the initialization function expected by the player
- every engine parses as JavaScript
- required accessibility and metadata hooks remain present
- the repository does not silently drift away from the expected puzzle count

These tests are dependency-free and use the Node.js built-in test runner.

## CI checks

Pull requests and pushes are checked by `.github/workflows/test.yml` for:

- engine syntax
- repository contract tests
- Markdown lint
- spelling
- pre-commit hooks
- verified-secret scanning where supported by the event

A skipped code test is not considered equivalent to a passing code test.

## Browser smoke test

Before merging a change that affects gameplay or the player shell:

1. Open the home page at desktop width.
2. Search for a puzzle and clear the search.
3. Test every category filter.
4. Test A-Z and difficulty sorting.
5. Open a puzzle card.
6. Start a new puzzle.
7. Close the modal with the close button.
8. Close the modal with Escape.
9. Repeat at a narrow mobile width.
10. Confirm no browser-console errors appear.

## Puzzle gameplay checklist

For every puzzle changed in a pull request, verify:

- the board initializes without an exception
- a new puzzle resets the state
- legal input changes the board
- illegal input is ignored or clearly rejected
- the documented goal matches the implementation
- a solvable state can reach its success condition
- the success message appears exactly once
- losing games expose a clear restart path
- the board remains usable on a small screen

## Regression policy

A puzzle should not be advertised in `index.html` unless its engine exists and loads through `player.html`. The contract suite enforces that rule automatically.

When a gameplay bug is fixed, add an automated invariant when practical and document the manual reproduction in the pull request.
