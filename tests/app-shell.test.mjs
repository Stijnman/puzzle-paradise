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
const arcadeCss = read('assets/arcade.css');
const playerCss = read('assets/player.css');

const catalogueMatch = index.match(/const games=\[(.*?)\]\.map/s);
assert.ok(catalogueMatch, 'catalogue literal missing');
const puzzleIds = [...catalogueMatch[1].matchAll(/\['([^']+)'/g)].map(match => match[1]);

test('shared browser JavaScript parses', () => {
  for (const file of ['assets/i18n.js','assets/arcade.js','assets/player-runtime.js']) {
    assert.doesNotThrow(() => new vm.Script(read(file), { filename: file }), `${file} must parse`);
  }
});

test('all five translation dictionaries are valid and cover every puzzle', () => {
  const requiredUi = [
    'brand','search','difficulty','language','theme','sound','haptics','rules',
    'objective','constraints','tutorial','tips','hint','undo','redo','reset',
    'newPuzzle','moves','time','accuracy','best','victory'
  ];

  for (const code of ['en','nl','fr','de','es']) {
    const dictionary = JSON.parse(read(`i18n/${code}.json`));
    assert.equal(dictionary.locale, code);
    for (const key of requiredUi) assert.ok(dictionary.ui[key], `${code}: missing ui.${key}`);
    for (const id of puzzleIds) {
      assert.ok(dictionary.puzzles[id], `${code}: missing puzzle ${id}`);
      assert.ok(dictionary.puzzles[id].title, `${code}: missing ${id} title`);
      assert.ok(dictionary.puzzles[id].objective, `${code}: missing ${id} objective`);
      assert.ok(dictionary.puzzles[id].hint, `${code}: missing ${id} hint`);
    }
    assert.ok(dictionary.guide.rules.length >= 3);
    assert.ok(dictionary.guide.tutorial.length >= 3);
    assert.ok(dictionary.guide.tips.length >= 2);
  }
});

test('arcade is a fixed viewport application shell', () => {
  assert.match(index, /assets\/arcade\.css/);
  assert.match(index, /assets\/arcade\.js/);
  assert.match(index, /id="toggle-rail"/);
  assert.match(index, /id="language"/);
  assert.match(index, /id="theme"/);
  assert.match(index, /id="default-difficulty"/);
  assert.match(arcadeCss, /height:100dvh/);
  assert.match(arcadeCss, /overflow:hidden/);
  assert.match(arcadeCss, /repeat\(auto-fit,minmax\(190px,1fr\)\)/);
});

test('player exposes advanced gameplay controls', () => {
  for (const id of [
    'undo','redo','reset','hint','rules','settings','collapse-ui','difficulty-select',
    'move-count','timer','accuracy','personal-best','rules-drawer','settings-drawer',
    'language-select','theme-select','sound-toggle','haptics-toggle','victory'
  ]) {
    assert.match(player, new RegExp(`id="${id}"`), `missing #${id}`);
  }
  assert.match(player, /assets\/player-runtime\.js/);
  assert.match(playerCss, /height:100dvh/);
  assert.match(playerCss, /\.drawer\.open/);
  assert.match(playerCss, /\.player-app\.compact/);
});

test('player runtime contains persistence, deterministic seed, history, audio and haptic hooks', () => {
  const runtime = read('assets/player-runtime.js');
  assert.match(runtime, /pp\.sessions/);
  assert.match(runtime, /pp\.stats/);
  assert.match(runtime, /mulberry32/);
  assert.match(runtime, /function undo\(/);
  assert.match(runtime, /function redo\(/);
  assert.match(runtime, /AudioContext/);
  assert.match(runtime, /navigator\.vibrate/);
  assert.match(runtime, /MutationObserver/);
  assert.match(runtime, /PP_DIFFICULTY/);
  assert.match(runtime, /Ctrl|ctrlKey/);
});
