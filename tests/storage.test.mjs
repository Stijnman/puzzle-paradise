import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'assets/storage.js'), 'utf8');

function boot(initial = {}) {
  const map = new Map(Object.entries(initial));
  const localStorage = {
    getItem: key => map.has(key) ? map.get(key) : null,
    setItem: (key,value) => map.set(key,String(value)),
    removeItem: key => map.delete(key),
    clear: () => map.clear()
  };
  const context = { window:{}, localStorage, Date, JSON, Set };
  vm.runInNewContext(source, context, { filename:'assets/storage.js' });
  return { api:context.window.PPStorage, map };
}

test('storage migrates legacy sessions and stats into schema v2', () => {
  const legacySessions = { sudoku:{ seed:'old',difficulty:'medium',actions:[{key:'x'}] } };
  const legacyStats = { sudoku:{ completions:2 } };
  const { api } = boot({
    'pp.sessions': JSON.stringify(legacySessions),
    'pp.stats': JSON.stringify(legacyStats)
  });

  const state = api.read();
  assert.equal(state.schemaVersion, 2);
  assert.equal(state.sessions.sudoku.seed, 'old');
  assert.equal(state.stats.sudoku.completions, 2);
});

test('sessions are save-versioned and independently keyed', () => {
  const { api } = boot();
  api.setSession('sudoku', { seed:'normal', difficulty:'medium', actions:[] });
  api.setSession('sudoku:daily:2026-09-19', { seed:'daily:2026-09-19:sudoku', difficulty:'medium', actions:[] });

  assert.equal(api.getSession('sudoku').saveVersion, 2);
  assert.equal(api.getSession('sudoku:daily:2026-09-19').seed, 'daily:2026-09-19:sudoku');
});

test('daily completion produces a consecutive streak without double counting', () => {
  const { api } = boot();
  api.recordDailyCompletion('2026-09-18','sudoku',{stars:2});
  api.recordDailyCompletion('2026-09-19','net',{stars:3});
  api.recordDailyCompletion('2026-09-19','net',{stars:3});

  const daily = api.read().daily;
  assert.equal(daily.streak, 2);
  assert.equal(Object.keys(daily.completions).length, 2);
  assert.equal(daily.completions['2026-09-19'].game, 'net');
});

test('favorites and recent puzzles stay deduplicated', () => {
  const { api } = boot();
  assert.equal(api.toggleFavorite('sudoku'), true);
  assert.equal(api.toggleFavorite('sudoku'), false);
  api.recordRecent('sudoku');
  api.recordRecent('net');
  api.recordRecent('sudoku');
  assert.deepEqual(Array.from(api.read().recent), ['sudoku','net']);
});
