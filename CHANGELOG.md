# Changelog

All notable changes to Puzzle Paradise are documented here.

## [Unreleased]

### Added

- Dependency-free Node repository contract tests covering all advertised puzzle engines.
- MIT license and third-party attribution documentation.
- GitHub CODEOWNERS and Dependabot configuration for GitHub Actions.
- `robots.txt` and `sitemap.xml` for basic crawler discovery.

### Changed

- CI now runs JavaScript validation and contract tests unconditionally instead of skipping code checks when `package.json` is absent.
- README, testing guide, repository status, contributor guide, and contributor information now describe Puzzle Paradise rather than unrelated projects.
- Pre-commit now runs repository contract tests in addition to syntax, documentation, spelling, and secret checks.

### Fixed

- Mines no longer displays mine locations before a cell is selected, now tracks revealed cells correctly, and has working loss and win states.
- Sudoku now reports duplicate conflicts and recognizes a completed valid grid.

---

Changelog started: September 11, 2026.
