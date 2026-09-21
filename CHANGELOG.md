# Changelog

All notable changes to Puzzle Paradise are documented here.

## [Unreleased]

### Added

- Full-screen `100dvh` arcade and gameplay shells.
- Collapsible discovery rail, compact gameplay chrome, and rules/settings drawers.
- EN, NL, FR, DE, and ES JSON localization with auto-detection and persistent override.
- Per-puzzle objectives, hints, rules, tutorial steps, and strategy tips.
- Deterministic seeded sessions.
- Persistent progress and per-puzzle metrics in `localStorage`.
- Replay-based Undo/Redo, same-seed Reset, and new-seed New Puzzle.
- Move count, time, accuracy, star ratings, and personal best tracking.
- Easy, Medium, Hard, and Expert selection.
- Difficulty-aware seeded Sudoku and guaranteed-solvable Arrow Escape generation.
- Dark, Light, and OLED Black themes.
- Keyboard navigation, Web Audio feedback, and optional vibration.
- Contextual hints, invalid-move highlighting, and localized victory UI.
- App-shell, localization, runtime, and engine smoke tests.
- MIT license, third-party notices, CODEOWNERS, Dependabot, robots.txt, and sitemap.xml.

### Changed

- CI now validates engine/shared JavaScript, translation JSON, all Node tests, documentation, spelling, pre-commit, and applicable secret scanning.
- Pre-commit runs the complete test suite.
- Repository documentation now describes Puzzle Paradise instead of unrelated projects.
- Multiple puzzle engines were rebuilt from placeholder behavior into rule-based games.

### Fixed

- Mines, Sudoku, Pipe Routing, Null Game, Pattern, Untangle, Map, Towers, Keen, Light Up, Tents, Black Box, Hitori, Range, Slant, Inertia, Magnets, Net Slide, Rectangles, Pearl, Sequencing, Bridges, Dominosa, Filling, Loopy, Galaxies, Signpost, Unequal, Unruly, and Undead received substantial correctness fixes.
- Pattern and Untangle first-interaction runtime crashes were removed.

---

Changelog started: September 11, 2026.
