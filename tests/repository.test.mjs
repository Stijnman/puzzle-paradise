import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const index = read('index.html');
const player = read('player.html');

function catalogueIds() {
  const match = index.match(/const games=\[(.*?)\]\.map/s);
  assert.ok(match, 'index.html must expose the games catalogue');
  return [...match[1].matchAll(/\['([^']+)'/g)].map(item => item[1]);
}

function playerMappings() {
  const match = player.match(/const puzzles=\{(.*?)\};/s);
  assert.ok(match, 'player.html must expose the puzzle loader map');
  const mappings = new Map();
  const pattern = /(?:'([^']+)'|([a-z0-9-]+)):\['([^']+)'/g;
  for (const item of match[1].matchAll(pattern)) {
    mappings.set(item[1] || item[2], item[3]);
  }
  return mappings;
}

test('catalogue contains exactly 43 unique puzzle IDs', () => {
  const ids = catalogueIds();
  assert.equal(ids.length, 43);
  assert.equal(new Set(ids).size, ids.length);
});

test('catalogue and player mappings are one-to-one', () => {
  const ids = new Set(catalogueIds());
  const mappings = playerMappings();
  assert.deepEqual([...mappings.keys()].sort(), [...ids].sort());
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
  assert.match(index, /<html lang="en">/);
  assert.match(index, /<meta name="description"/);
  assert.match(index, /<main id="top">/);
  assert.match(index, /role="dialog"/);
  assert.match(index, /aria-modal="true"/);
  assert.match(index, /aria-label="Close puzzle"/);
});

test('player keeps live status regions for interactive puzzles', () => {
  assert.match(player, /id="arrow-status" aria-live="polite"/);
  assert.match(player, /id="sudoku-status" aria-live="polite"/);
  assert.match(player, /id="net-status" aria-live="polite"/);
});
