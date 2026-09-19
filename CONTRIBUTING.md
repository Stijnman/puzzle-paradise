# Contributing to Puzzle Paradise

Contributions that improve puzzle correctness, accessibility, performance, documentation, or the player experience are welcome.

## Before changing code

- Check existing issues and pull requests for overlapping work.
- Keep the site framework-free unless a dependency solves a clear problem that cannot reasonably be handled with the current stack.
- Do not advertise a puzzle until its engine, loader mapping, instructions, and success condition all exist.

## Local checks

Use Node.js 20 or newer:

```bash
find js -name "*.js" -type f -print0 | xargs -0 -n1 node --check
node --test tests/*.test.mjs
```

For the full test matrix, see [TESTING.md](TESTING.md).

## Adding a puzzle

A puzzle contribution must update all relevant layers:

1. Add catalogue metadata in `index.html`.
2. Add the puzzle ID, initialization function, and instructions in `player.html`.
3. Add `js/<puzzle-id>.js`.
4. Give the engine a working reset path through the shared **New puzzle** button.
5. Implement a meaningful success or completion condition.
6. Verify keyboard and small-screen usability where practical.
7. Update documentation if the puzzle introduces a new interaction pattern.

The repository contract tests intentionally fail when the catalogue, loader, and engine files drift apart.

## Gameplay fixes

For a gameplay bug, include in the pull request:

- the puzzle affected
- steps to reproduce the old behavior
- the expected behavior
- the code path changed
- how the fix was tested

Prefer deterministic logic for tests. Random generation is fine for gameplay, but invariants should be testable without depending on a lucky random board.

## Code style

- Use plain JavaScript compatible with the browsers supported by GitHub Pages.
- Keep puzzle-specific state inside its engine file.
- Use descriptive function and variable names.
- Preserve the shared player element IDs unless the shell changes with the engine.
- Use `textContent` or `innerText` for user-controlled text.
- Add ARIA labels or live status text for important interactive state.
- Avoid hidden tracking, analytics, advertising, and unnecessary network calls.

## Documentation

Keep claims evidence-based. Do not mark a feature as complete merely because a placeholder file or workflow exists.

Third-party inspiration or adapted code must retain appropriate attribution and license notices. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Pull requests

Create a focused branch, make the change, run the local checks, and open a pull request against `main`.

Use clear commit messages such as:

```text
fix: correct mines reveal logic
test: cover puzzle loader mappings
docs: update gameplay testing guide
```

A pull request is ready to merge when relevant CI checks are green and affected puzzles pass the manual gameplay checklist.

## Security

Do not place credentials, tokens, private keys, or personal data in the repository. Report security issues according to [SECURITY.md](SECURITY.md).

## Code of conduct

Participation in the project is covered by [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
