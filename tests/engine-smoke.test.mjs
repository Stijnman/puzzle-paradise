import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const playerSource = fs.readFileSync(path.join(root, 'player.html'), 'utf8');

class FakeClassList {
  constructor(element) {
    this.element = element;
    this.values = new Set();
  }

  setFromString(value) {
    this.values = new Set(String(value).split(/\s+/).filter(Boolean));
  }

  add(...names) {
    names.forEach(name => this.values.add(name));
  }

  remove(...names) {
    names.forEach(name => this.values.delete(name));
  }

  contains(name) {
    return this.values.has(name);
  }

  toggle(name, force) {
    if (force === true) {
      this.values.add(name);
      return true;
    }
    if (force === false) {
      this.values.delete(name);
      return false;
    }
    if (this.values.has(name)) {
      this.values.delete(name);
      return false;
    }
    this.values.add(name);
    return true;
  }

  toString() {
    return [...this.values].join(' ');
  }
}

class FakeElement {
  constructor(document, tagName = 'div') {
    this.ownerDocument = document;
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.parentElement = null;
    this.style = {};
    this.dataset = {};
    this.attributes = new Map();
    this.classList = new FakeClassList(this);
    this._innerText = '';
    this._innerHTML = '';
    this.hidden = false;
    this.disabled = false;
    this.value = '';
    this.id = '';
  }

  get className() {
    return this.classList.toString();
  }

  set className(value) {
    this.classList.setFromString(value);
  }

  get innerText() {
    return this._innerText;
  }

  set innerText(value) {
    this._innerText = String(value ?? '');
  }

  get textContent() {
    return this._innerText;
  }

  set textContent(value) {
    this._innerText = String(value ?? '');
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(value) {
    this._innerHTML = String(value ?? '');
    if (this._innerHTML === '') this.children = [];
  }

  appendChild(child) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  append(...children) {
    children.forEach(child => this.appendChild(child));
  }

  removeChild(child) {
    this.children = this.children.filter(item => item !== child);
    child.parentElement = null;
    return child;
  }

  replaceChildren(...children) {
    this.children = [];
    this.append(...children);
  }

  setAttribute(name, value) {
    const stringValue = String(value);
    this.attributes.set(name, stringValue);
    if (name === 'id') this.id = stringValue;
    if (name === 'class') this.className = stringValue;
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  addEventListener(type, handler) {
    this[`on${type}`] = handler;
  }

  focus() {
    this.ownerDocument.activeElement = this;
  }

  querySelectorAll(selector) {
    return this.ownerDocument.querySelectorAll(selector, this);
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  closest() {
    return null;
  }

  getBoundingClientRect() {
    return { x: 0, y: 0, top: 0, left: 0, right: 48, bottom: 48, width: 48, height: 48 };
  }
}

class FakeDocument {
  constructor() {
    this.elements = new Set();
    this.activeElement = null;
    this.body = this.createElement('body');
    this.documentElement = this.createElement('html');

    for (const id of [
      'player',
      'instructions',
      'arrow-board',
      'sudoku-board',
      'net-board',
      'arrow-status',
      'sudoku-status',
      'net-status',
      'number-pad',
      'new-game'
    ]) {
      const element = this.createElement(id.includes('board') ? 'div' : 'p');
      element.id = id;
    }
  }

  createElement(tagName) {
    const element = new FakeElement(this, tagName);
    this.elements.add(element);
    return element;
  }

  getElementById(id) {
    return [...this.elements].find(element => element.id === id) ?? null;
  }

  querySelector(selector, rootElement = null) {
    return this.querySelectorAll(selector, rootElement)[0] ?? null;
  }

  querySelectorAll(selector, rootElement = null) {
    let elements = [...this.elements];

    if (rootElement) {
      const descendants = new Set();
      const visit = element => {
        for (const child of element.children) {
          descendants.add(child);
          visit(child);
        }
      };
      visit(rootElement);
      elements = elements.filter(element => descendants.has(element));
    }

    if (selector.includes('.grid-cell')) {
      elements = elements.filter(element => element.classList.contains('grid-cell'));
    }

    if (selector.startsWith('#')) {
      const id = selector.slice(1).split(/\s+/)[0];
      const root = this.getElementById(id);
      if (!root) return [];
      if (selector.includes('.grid-cell')) return root.querySelectorAll('.grid-cell');
      return [root];
    }

    return elements;
  }

  addEventListener() {}
}

function puzzleMappings() {
  const match = playerSource.match(/const puzzles=\{(.*?)\};/s);
  assert.ok(match, 'player.html puzzle mapping was not found');

  const result = [];
  const pattern = /(?:'([^']+)'|([a-z0-9-]+)):\['([^']+)'/g;
  for (const item of match[1].matchAll(pattern)) {
    result.push({ id: item[1] || item[2], initFunction: item[3] });
  }
  return result;
}

function createContext() {
  const document = new FakeDocument();
  const storage = new Map();
  const context = {
    console,
    document,
    location: { search: '', href: '' },
    navigator: { userAgent: 'PuzzleParadiseTest' },
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: key => storage.delete(key),
      clear: () => storage.clear()
    },
    alert: () => {},
    confirm: () => true,
    prompt: () => null,
    setTimeout: () => 1,
    clearTimeout: () => {},
    setInterval: () => 1,
    clearInterval: () => {},
    requestAnimationFrame: callback => {
      if (typeof callback === 'function') callback(0);
      return 1;
    }
  };

  context.window = context;
  context.globalThis = context;
  return vm.createContext(context);
}

for (const { id, initFunction } of puzzleMappings()) {
  test(`${id} initializes and resets without a runtime exception`, () => {
    const enginePath = path.join(root, 'js', `${id}.js`);
    const source = fs.readFileSync(enginePath, 'utf8');
    const context = createContext();
    const script = new vm.Script(
      `${source}\n;globalThis.__puzzleInit = typeof ${initFunction} === 'function' ? ${initFunction} : undefined;`,
      { filename: enginePath }
    );

    script.runInContext(context);
    assert.equal(typeof context.__puzzleInit, 'function', `${id} must expose ${initFunction}()`);

    assert.doesNotThrow(() => context.__puzzleInit(), `${id} failed during first initialization`);
    const document = context.document;
    const boardCellCount = [
      document.getElementById('arrow-board'),
      document.getElementById('sudoku-board'),
      document.getElementById('net-board')
    ].reduce((total, board) => total + board.children.length, 0);

    assert.ok(boardCellCount > 0, `${id} did not render any board cells`);

    const interactiveCells = [
      document.getElementById('arrow-board'),
      document.getElementById('sudoku-board'),
      document.getElementById('net-board')
    ].flatMap(board => board.children).filter(cell => typeof cell.onclick === 'function');

    assert.ok(interactiveCells.length > 0, `${id} did not expose an interactive board cell`);
    assert.doesNotThrow(
      () => interactiveCells[0].onclick({ target: interactiveCells[0] }),
      `${id} failed on its first legal board interaction`
    );

    assert.doesNotThrow(() => context.__puzzleInit(), `${id} failed while resetting`);
  });
}
