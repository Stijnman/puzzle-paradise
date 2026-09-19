# Testing Guide

Puzzle Paradise uses layered checks so a green workflow represents actual application behavior rather than skipped scripts.

## Automated checks

### JavaScript and translation syntax

```bash
find js assets -name "*.js" -type f -print0 | xargs -0 -n1 node --check
node -e "for (const f of require('fs').readdirSync('i18n')) JSON.parse(require('fs').readFileSync('i18n/'+f,'utf8'))"
```

### Full test suite

```bash
node --test tests/*.test.mjs
```

The suite verifies:

- exactly 43 unique catalogue IDs
- one-to-one catalogue/player mappings
- matching parseable engine/init function for every puzzle
- no orphan engines
- startup, reset, and first legal interaction for every engine
- full-screen arcade/player shell hooks
- all five translation dictionaries
- title, objective, hint, rules, tutorial, and tips for every puzzle
- persistence/history/seed/audio/haptic runtime hooks
- required accessibility and live-status elements

## Browser smoke test

Before merging shell or player changes:

1. Confirm the desktop page itself does not scroll.
2. Collapse and expand the discovery rail.
3. Test search, category filters, and all sort modes.
4. Switch EN/NL/FR/DE/ES, reload, and confirm persistence.
5. Test Dark, Light, and OLED Black, then reload.
6. Open a puzzle and confirm the player fills the remaining viewport.
7. Open and close How to Play and Settings drawers.
8. Try every difficulty.
9. Make moves, reload, and confirm seed/progress restoration.
10. Exercise Undo, Redo, Reset, and New Puzzle.
11. Test Tab, arrows/WASD, Enter/Space, Escape, and Ctrl/Cmd+Z.
12. Trigger Hint and an invalid move.
13. Toggle sound and haptics where supported.
14. Solve a puzzle and verify moves, time, accuracy, stars, best time, and victory UI.
15. Repeat at phone portrait and phone landscape widths.
16. Confirm no console errors or clipped controls.

## Puzzle gameplay checklist

For every changed puzzle verify:

- initialization is deterministic for the same seed
- procedural engines can produce a different position from a new seed
- legal input changes state
- invalid input is rejected or visibly identified
- Reset restores the same seed
- Undo/Redo reproduce expected state
- the documented objective matches the implementation
- the success condition is reachable
- success is emitted once
- losing games expose a restart path
- keyboard and touch both work
- the board remains usable on narrow screens

## Regression policy

A puzzle must not be advertised unless its catalogue metadata, player mapping, engine, and five localization entries all exist. Automated contracts enforce those relationships.
