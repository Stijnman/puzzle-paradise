import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { loadRegistry } from './helpers/registry.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const registry = loadRegistry();
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const index = read('index.html');
const player = read('player.html');

function catalogueIds() {
  return registry.map(puzzle => puzzle.id);
}

function playerMappings() {
  return new Map(registry.map(puzzle => [puzzle.id, puzzle.init]));
}

test('registry contains exactly 43 unique, complete puzzle records', () => {
  const ids = catalogueIds();
  assert.equal(ids.length, 43);
  assert.equal(new Set(ids).size, ids.length);
  for (const puzzle of registry) {
    assert.match(puzzle.id, /^[a-z0-9-]+$/);
    assert.ok(puzzle.name);
    assert.ok(puzzle.category);
    assert.ok(puzzle.description);
    assert.ok(puzzle.icon);
    assert.ok(puzzle.init);
    assert.ok(['arrow','sudoku','net'].includes(puzzle.boardType));
    assert.ok(Number.isInteger(puzzle.difficulty) && puzzle.difficulty >= 1 && puzzle.difficulty <= 4);
  }
});

test('registry is the single catalogue/player source of truth', () => {
  const ids = new Set(catalogueIds());
  const mappings = playerMappings();
  assert.deepEqual([...mappings.keys()].sort(), [...ids].sort());
  assert.match(index, /assets\/puzzle-registry\.js/);
  assert.match(player, /assets\/puzzle-registry\.js/);
  assert.doesNotMatch(index, /const games=\[/);
  assert.doesNotMatch(player, /const puzzles=\{/);
});

test('every advertised puzzle has a parseable engine and expected init function', () => {
  for (const [id, initFunction] of playerMappings()) {
    const enginePath = path.join(root, 'js', `${id}.js`);
    assert.ok(fs.existsSync(enginePath), `Missing engine: js/${id}.js`);
    const source = fs.readFileSync(enginePath, 'utf8');
    assert.doesNotThrow(() => new vm.Script(source, { filename: enginePath }));
    assert.match(source, new RegExp(`function\\s+${initFunction}\\s*\\(`), `${id} must define ${initFunction}()`);
  }
});

test('no orphan JavaScript puzzle engines exist', () => {
  const mapped = new Set(playerMappings().keys());
  const files = fs.readdirSync(path.join(root, 'js'))
    .filter(file => file.endsWith('.js'))
    .map(file => file.replace(/\.js$/, ''));
  assert.deepEqual(files.sort(), [...mapped].sort());
});

test('home page keeps essential discoverability and accessibility hooks', () => {
  assert.match(index, /<html[^>]*lang="en"/);
  assert.match(index, /<meta name="description"/);
  assert.match(index, /<main[^>]*id="top"/);
  assert.match(index, /role="dialog"/);
  assert.match(index, /aria-modal="true"/);
  assert.match(index, /aria-label="Close puzzle"/);
});

test('player keeps live status regions for interactive puzzles', () => {
  assert.match(player, /id="arrow-status" aria-live="polite"/);
  assert.match(player, /id="sudoku-status" aria-live="polite"/);
  assert.match(player, /id="net-status" aria-live="polite"/);
});
