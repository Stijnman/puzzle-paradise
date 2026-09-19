(() => {
  const nativeRandom = Math.random.bind(Math);
  const runtime = {
    game: null,
    config: null,
    dictionary: null,
    session: null,
    history: [],
    redo: [],
    replaying: false,
    startedAt: 0,
    timer: null,
    completed: false,
    lastTarget: null,
    invalidMoves: 0,
    statusBeforeMove: '',
    audioContext: null,
    observer: null
  };

  function readJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function hashSeed(value) {
    let hash = 2166136261;
    for (const char of String(value)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
    return hash >>> 0;
  }

  function mulberry32(seed) {
    let value = seed >>> 0;
    return () => {
      value += 0x6D2B79F5;
      let t = value;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function freshSeed() {
    if (crypto?.getRandomValues) {
      const values = new Uint32Array(2);
      crypto.getRandomValues(values);
      return `${values[0].toString(36)}${values[1].toString(36)}`;
    }
    return `${Date.now().toString(36)}-${nativeRandom().toString(36).slice(2)}`;
  }

  function resetRandom() {
    Math.random = mulberry32(hashSeed(`${runtime.session.seed}:${runtime.session.difficulty}`));
  }

  function t(path, fallback = '') {
    return window.PPI18N.get(runtime.dictionary, path, fallback);
  }

  function allSessions() {
    return readJSON('pp.sessions', {});
  }

  function saveSession() {
    const all = allSessions();
    runtime.session.actions = runtime.history;
    runtime.session.redo = runtime.redo;
    runtime.session.elapsed = Math.max(0, Date.now() - runtime.startedAt);
    runtime.session.invalidMoves = runtime.invalidMoves;
    all[runtime.game] = runtime.session;
    writeJSON('pp.sessions', all);
  }

  function loadSession(difficulty) {
    const current = allSessions()[runtime.game];
    if (current && current.difficulty === difficulty && current.seed) {
      runtime.session = current;
      runtime.history = Array.isArray(current.actions) ? current.actions : [];
      runtime.redo = Array.isArray(current.redo) ? current.redo : [];
      runtime.invalidMoves = current.invalidMoves || 0;
      runtime.startedAt = Date.now() - (current.elapsed || 0);
      return;
    }
    runtime.session = { seed: freshSeed(), difficulty, actions: [], redo: [], elapsed: 0, invalidMoves: 0 };
    runtime.history = [];
    runtime.redo = [];
    runtime.invalidMoves = 0;
    runtime.startedAt = Date.now();
  }

  function saveStats(result = {}) {
    const all = readJSON('pp.stats', {});
    const stats = all[runtime.game] || { completions: 0, best: {}, stars: 0, moves: 0, accuracy: 100 };
    if (result.completed) stats.completions += 1;
    stats.moves = result.moves ?? stats.moves;
    stats.accuracy = result.accuracy ?? stats.accuracy;
    stats.stars = Math.max(stats.stars || 0, result.stars || 0);
    if (result.time != null) {
      const old = stats.best[runtime.session.difficulty];
      if (!old || result.time < old) stats.best[runtime.session.difficulty] = result.time;
    }
    all[runtime.game] = stats;
    writeJSON('pp.stats', all);
    parent.postMessage({ type: 'pp:stats', game: runtime.game }, '*');
  }

  function formatTime(milliseconds) {
    const total = Math.max(0, Math.floor(milliseconds / 1000));
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
  }

  function currentStatus() {
    for (const id of ['arrow-status','sudoku-status','net-status']) {
      const node = document.getElementById(id);
      if (node && getComputedStyle(node).display !== 'none') return node;
    }
    return document.getElementById('arrow-status');
  }

  function updateHUD() {
    document.getElementById('move-count').textContent = runtime.history.length;
    document.getElementById('timer').textContent = formatTime(Date.now() - runtime.startedAt);
    const total = runtime.history.length;
    const accuracy = total ? Math.max(0, Math.round((total - runtime.invalidMoves) / total * 100)) : 100;
    document.getElementById('accuracy').textContent = `${accuracy}%`;
    const all = readJSON('pp.stats', {});
    const best = all[runtime.game]?.best?.[runtime.session.difficulty];
    document.getElementById('personal-best').textContent = best ? formatTime(best) : '—';
    document.getElementById('undo').disabled = runtime.history.length === 0;
    document.getElementById('redo').disabled = runtime.redo.length === 0;
  }

  function decorateActions() {
    const roots = [
      document.getElementById('arrow-board'),
      document.getElementById('sudoku-board'),
      document.getElementById('net-board'),
      document.getElementById('number-pad')
    ].filter(Boolean);

    for (const root of roots) {
      const candidates = [...root.querySelectorAll('[role="button"],button,.grid-cell')].filter(node =>
        typeof node.onclick === 'function' || node.getAttribute('role') === 'button' || node.tagName === 'BUTTON'
      );
      candidates.forEach((node, index) => {
        node.dataset.ppActionKey = `${root.id}:${index}`;
      });
    }
  }

  function findAction(key) {
    return [...document.querySelectorAll('[data-pp-action-key]')].find(node => node.dataset.ppActionKey === key);
  }

  function playSound(kind) {
    if (localStorage.getItem('pp.sound') === '0') return;
    try {
      runtime.audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const ctx = runtime.audioContext;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const table = { move:[420,.035], invalid:[150,.07], victory:[720,.18], hint:[560,.05] };
      const [frequency,duration] = table[kind] || table.move;
      osc.frequency.value = frequency;
      osc.type = kind === 'invalid' ? 'sawtooth' : 'sine';
      gain.gain.setValueAtTime(.0001,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.06,ctx.currentTime+.006);
      gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime+duration+.01);
    } catch {}
  }

  function vibrate(kind) {
    if (localStorage.getItem('pp.haptics') === '0' || !navigator.vibrate) return;
    navigator.vibrate(kind === 'invalid' ? [25,30,25] : kind === 'victory' ? [30,40,60] : 12);
  }

  function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function isWarningStatus(status) {
    const text = (status?.textContent || '').toLowerCase();
    const style = status?.style?.color || '';
    return style.includes('warning') || /(invalid|cannot|may not|conflict|wrong|duplicate|forbidden|do not|does not|not yet|mine hit)/i.test(text);
  }

  function isVictoryStatus(status) {
    const text = (status?.textContent || '').toLowerCase();
    const style = status?.style?.color || '';
    return style.includes('success') && /(solved|complete|connected|powered|formed|collected|in order|valid|balanced|found|cleared|null|match)/i.test(text) ||
      /(puzzle solved|path complete|network connected|all .* collected|everything is null)/i.test(text);
  }

  function handleStatusChange() {
    const status = currentStatus();
    if (!status) return;
    if (runtime.lastTarget && isWarningStatus(status) && !runtime.replaying) {
      runtime.invalidMoves += 1;
      runtime.lastTarget.classList.add('pp-invalid');
      setTimeout(() => runtime.lastTarget?.classList.remove('pp-invalid'), 350);
      playSound('invalid');
      vibrate('invalid');
      runtime.lastTarget = null;
      saveSession();
      updateHUD();
    }
    if (!runtime.completed && isVictoryStatus(status)) completePuzzle();
  }

  function completePuzzle() {
    runtime.completed = true;
    saveSession();
    const elapsed = Date.now() - runtime.startedAt;
    const moves = runtime.history.length;
    const accuracy = moves ? Math.max(0, Math.round((moves - runtime.invalidMoves) / moves * 100)) : 100;
    const par = ({ easy: 80, medium: 120, hard: 180, expert: 260 })[runtime.session.difficulty] || 120;
    const score = Math.max(1, 3 - (runtime.invalidMoves > 2 ? 1 : 0) - (moves > par ? 1 : 0));
    saveStats({ completed:true, time:elapsed, moves, accuracy, stars:score });
    playSound('victory');
    vibrate('victory');
    document.getElementById('victory-stars').textContent = '★'.repeat(score) + '☆'.repeat(3-score);
    document.getElementById('victory-summary').textContent =
      `${moves} ${t('ui.moves','moves')} · ${formatTime(elapsed)} · ${accuracy}%`;
    document.getElementById('victory').classList.add('open');
  }

  function recordAction(target) {
    if (runtime.replaying || runtime.completed) return;
    const key = target?.dataset?.ppActionKey;
    if (!key) return;
    runtime.history.push({ key });
    runtime.redo = [];
    runtime.lastTarget = target;
    playSound('move');
    vibrate('move');
    queueMicrotask(() => {
      decorateActions();
      handleStatusChange();
      saveSession();
      updateHUD();
    });
  }

  function dispatchAction(action) {
    decorateActions();
    const target = findAction(action.key);
    if (!target) return false;
    target.dispatchEvent(new MouseEvent('click',{ bubbles:true, cancelable:true, view:window }));
    return true;
  }

  function getStartFunction() {
    return window[runtime.config[0]];
  }

  function initEngine() {
    const start = getStartFunction();
    if (typeof start !== 'function') throw new Error('Puzzle init function unavailable');
    resetRandom();
    start();
    decorateActions();
  }

  function replayHistory() {
    runtime.replaying = true;
    runtime.completed = false;
    initEngine();
    for (const action of runtime.history) {
      if (!dispatchAction(action)) break;
    }
    runtime.replaying = false;
    decorateActions();
    handleStatusChange();
    updateHUD();
    saveSession();
  }

  function undo() {
    if (!runtime.history.length || runtime.completed) return;
    runtime.redo.push(runtime.history.pop());
    replayHistory();
  }

  function redo() {
    if (!runtime.redo.length || runtime.completed) return;
    runtime.history.push(runtime.redo.pop());
    replayHistory();
  }

  function resetSamePuzzle() {
    runtime.history = [];
    runtime.redo = [];
    runtime.invalidMoves = 0;
    runtime.startedAt = Date.now();
    runtime.completed = false;
    document.getElementById('victory').classList.remove('open');
    replayHistory();
  }

  function newPuzzle() {
    runtime.session.seed = freshSeed();
    resetSamePuzzle();
  }

  function applyTheme(value) {
    const next = ['dark','light','oled'].includes(value) ? value : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('pp.theme', next);
    document.getElementById('theme-select').value = next;
  }

  async function changeLanguage(value) {
    window.PPI18N.save(value);
    runtime.dictionary = await window.PPI18N.load(value);
    window.PPI18N.apply(document, runtime.dictionary);
    document.getElementById('language-select').value = runtime.dictionary.locale;
    populateGuide();
    document.getElementById('game-name').textContent =
      runtime.dictionary.puzzles?.[runtime.game]?.title || runtime.game;
    document.getElementById('instructions').textContent =
      runtime.dictionary.puzzles?.[runtime.game]?.objective || runtime.config[1];
  }

  function populateGuide() {
    const puzzle = runtime.dictionary?.puzzles?.[runtime.game] || {};
    document.getElementById('guide-objective').textContent = puzzle.objective || runtime.config[1];
    document.getElementById('guide-rules').innerHTML = (runtime.dictionary?.guide?.rules || []).map(item => `<li>${item}</li>`).join('');
    document.getElementById('guide-tutorial').innerHTML = (runtime.dictionary?.guide?.tutorial || []).map((item,index) => `<div class="demo-step"><strong>${index+1}</strong><br>${item}</div>`).join('');
    document.getElementById('guide-tips').innerHTML = (runtime.dictionary?.guide?.tips || []).map(item => `<li>${item}</li>`).join('');
  }

  function hint() {
    const puzzle = runtime.dictionary?.puzzles?.[runtime.game] || {};
    showToast(puzzle.hint || t('ui.hint','Hint'));
    playSound('hint');
  }

  function toggleDrawer(name) {
    for (const id of ['rules-drawer','settings-drawer']) {
      document.getElementById(id).classList.toggle('open', id === name && !document.getElementById(id).classList.contains('open'));
    }
  }

  function setupKeyboard() {
    document.addEventListener('keydown', event => {
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && key === 'z') {
        event.preventDefault();
        event.shiftKey ? redo() : undo();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && key === 'y') {
        event.preventDefault(); redo(); return;
      }
      if (event.key === 'Escape') {
        const openDrawer = document.querySelector('.drawer.open');
        if (openDrawer) openDrawer.classList.remove('open');
        else parent.postMessage({ type:'pp:close' }, '*');
        return;
      }
      if (key === 'h' && !/input|select|textarea/i.test(document.activeElement?.tagName || '')) hint();
      if (key === 'r' && !/input|select|textarea/i.test(document.activeElement?.tagName || '')) resetSamePuzzle();

      if (!['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(key)) return;
      const active = document.activeElement;
      if (!active?.classList?.contains('grid-cell')) return;
      event.preventDefault();
      const cells = [...document.querySelectorAll('.grid-board .grid-cell[tabindex="0"],.grid-board .grid-cell[role="button"]')]
        .filter(cell => getComputedStyle(cell).display !== 'none');
      const rect = active.getBoundingClientRect();
      const cx = rect.left + rect.width/2, cy = rect.top + rect.height/2;
      const dir = ({arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1],arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0]})[key];
      let best = null, score = Infinity;
      for (const cell of cells) {
        if (cell === active) continue;
        const r = cell.getBoundingClientRect();
        const x = r.left+r.width/2, y=r.top+r.height/2;
        const dx=x-cx, dy=y-cy;
        if (dir[0] && Math.sign(dx)!==dir[0] || dir[1] && Math.sign(dy)!==dir[1]) continue;
        const primary = Math.abs(dir[0] ? dx : dy);
        const cross = Math.abs(dir[0] ? dy : dx);
        const candidate = primary + cross*2.4;
        if (candidate < score) { score=candidate; best=cell; }
      }
      best?.focus();
    });
  }

  function observeStatus() {
    runtime.observer?.disconnect();
    runtime.observer = new MutationObserver(() => {
      decorateActions();
      handleStatusChange();
    });
    for (const id of ['arrow-status','sudoku-status','net-status']) {
      const node = document.getElementById(id);
      if (node) runtime.observer.observe(node,{ childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['style','class'] });
    }
  }

  function bindControls() {
    document.getElementById('undo').onclick = undo;
    document.getElementById('redo').onclick = redo;
    document.getElementById('reset').onclick = resetSamePuzzle;
    document.getElementById('new-game').onclick = newPuzzle;
    document.getElementById('hint').onclick = hint;
    document.getElementById('rules').onclick = () => toggleDrawer('rules-drawer');
    document.getElementById('settings').onclick = () => toggleDrawer('settings-drawer');
    document.querySelectorAll('[data-close-drawer]').forEach(button => button.onclick = () => button.closest('.drawer').classList.remove('open'));
    document.getElementById('victory-continue').onclick = () => document.getElementById('victory').classList.remove('open');
    document.getElementById('victory-new').onclick = newPuzzle;

    document.getElementById('difficulty-select').onchange = event => {
      runtime.session.difficulty = event.target.value;
      runtime.session.seed = freshSeed();
      resetSamePuzzle();
    };
    document.getElementById('language-select').onchange = event => changeLanguage(event.target.value);
    document.getElementById('theme-select').onchange = event => applyTheme(event.target.value);
    document.getElementById('sound-toggle').onclick = event => {
      const enabled = localStorage.getItem('pp.sound') !== '0';
      localStorage.setItem('pp.sound', enabled ? '0' : '1');
      event.currentTarget.textContent = enabled ? 'OFF' : 'ON';
    };
    document.getElementById('haptics-toggle').onclick = event => {
      const enabled = localStorage.getItem('pp.haptics') !== '0';
      localStorage.setItem('pp.haptics', enabled ? '0' : '1');
      event.currentTarget.textContent = enabled ? 'OFF' : 'ON';
    };

    document.getElementById('stage').addEventListener('click', event => {
      const target = event.target.closest('[data-pp-action-key]');
      if (target) recordAction(target);
    });
  }

  function loadEngine() {
    return new Promise((resolve,reject) => {
      const script = document.createElement('script');
      script.src = `js/${runtime.game}.js`;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Puzzle engine failed to load'));
      document.body.appendChild(script);
    });
  }

  function setupSudokuPad() {
    const pad = document.getElementById('number-pad');
    if (runtime.game !== 'sudoku') { pad.hidden = true; return; }
    pad.hidden = false;
    pad.innerHTML = [1,2,3,4,5,6,7,8,9].map(number => `<button data-number="${number}" role="button">${number}</button>`).join('');
    pad.onclick = event => {
      const button = event.target.closest('[data-number]');
      if (button && typeof window.inputSudokuNumber === 'function') window.inputSudokuNumber(Number(button.dataset.number));
    };
  }

  async function boot({ game, config }) {
    runtime.game = game;
    runtime.config = config;
    const params = new URLSearchParams(location.search);
    const requestedLanguage = params.get('lang') || window.PPI18N.detect();
    const difficulty = params.get('difficulty') || localStorage.getItem('pp.defaultDifficulty') || 'medium';

    runtime.dictionary = await window.PPI18N.load(requestedLanguage);
    loadSession(difficulty);
    window.PP_DIFFICULTY = runtime.session.difficulty;
    window.PP_SEED = runtime.session.seed;

    document.getElementById('difficulty-select').value = runtime.session.difficulty;
    document.getElementById('language-select').value = runtime.dictionary.locale;
    applyTheme(localStorage.getItem('pp.theme') || 'dark');
    document.getElementById('sound-toggle').textContent = localStorage.getItem('pp.sound') === '0' ? 'OFF' : 'ON';
    document.getElementById('haptics-toggle').textContent = localStorage.getItem('pp.haptics') === '0' ? 'OFF' : 'ON';

    document.getElementById('game-name').textContent = runtime.dictionary.puzzles?.[game]?.title || game;
    document.getElementById('instructions').textContent = runtime.dictionary.puzzles?.[game]?.objective || config[1];
    populateGuide();
    window.PPI18N.apply(document,runtime.dictionary);

    const type = config[2] || 'arrow';
    ['arrow','sudoku','net'].forEach(name => {
      document.getElementById(`${name}-board`).style.display = name === type ? 'grid' : 'none';
      document.getElementById(`${name}-status`).style.display = name === type ? 'block' : 'none';
    });

    bindControls();
    setupKeyboard();
    observeStatus();

    try {
      await loadEngine();
      setupSudokuPad();
      replayHistory();
      runtime.timer = setInterval(() => { updateHUD(); saveSession(); },1000);
    } catch (error) {
      document.getElementById('player').innerHTML = `<p class="error">${error.message}</p>`;
    }
  }

  window.PPRuntime = { boot };
})();
