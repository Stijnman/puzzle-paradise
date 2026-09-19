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
    observer: null,
    sessionKey: null,
    dailyDate: null,
    engine: null
  };


  function saveSession() {
    runtime.session.actions = runtime.history;
    runtime.session.redo = runtime.redo;
    runtime.session.elapsed = Math.max(0, Date.now() - runtime.startedAt);
    runtime.session.invalidMoves = runtime.invalidMoves;
    runtime.session.completed = runtime.completed;
    if (runtime.engine?.serialize) {
      try {
        runtime.session.engineVersion = runtime.engine.version || 1;
        runtime.session.snapshot = runtime.engine.serialize();
      } catch {
        delete runtime.session.snapshot;
      }
    }
    window.PPStorage.setSession(runtime.sessionKey, runtime.session);
  }

  function sessionKeyFor(seed, dailyDate) {
    if (dailyDate) return `${runtime.game}:daily:${dailyDate}`;
    if (seed) return `${runtime.game}:seed:${seed}`;
    return runtime.game;
  }

  function loadSession(difficulty, requestedSeed = null, dailyDate = null) {
    runtime.sessionKey = sessionKeyFor(requestedSeed, dailyDate);
    const current = window.PPStorage.getSession(runtime.sessionKey);
    if (
      current &&
      current.difficulty === difficulty &&
      current.seed &&
      (!requestedSeed || current.seed === requestedSeed)
    ) {
      runtime.session = current;
      runtime.history = Array.isArray(current.actions) ? current.actions : [];
      runtime.redo = Array.isArray(current.redo) ? current.redo : [];
      runtime.invalidMoves = current.invalidMoves || 0;
      runtime.completed = Boolean(current.completed);
      runtime.startedAt = Date.now() - (current.elapsed || 0);
      return;
    }
    runtime.session = {
      saveVersion: 2,
      seed: requestedSeed || freshSeed(),
      difficulty,
      actions: [],
      redo: [],
      elapsed: 0,
      invalidMoves: 0,
      completed: false
    };
    runtime.history = [];
    runtime.redo = [];
    runtime.invalidMoves = 0;
    runtime.completed = false;
    runtime.startedAt = Date.now();
  }

  function saveStats(result = {}) {
    const all = window.PPStorage.getStats();
    const stats = all[runtime.game] || { completions: 0, best: {}, stars: 0, moves: 0, accuracy: 100 };
    if (result.completed) stats.completions += 1;
    stats.moves = result.moves ?? stats.moves;
    stats.accuracy = result.accuracy ?? stats.accuracy;
    stats.stars = Math.max(stats.stars || 0, result.stars || 0);
    if (result.time != null) {
      const old = stats.best[runtime.session.difficulty];
      if (!old || result.time < old) stats.best[runtime.session.difficulty] = result.time;
    }
    window.PPStorage.setGameStats(runtime.game, stats);
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
    const all = window.PPStorage.getStats();
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
    const rawText = status.textContent;
    const wasLocalized = status.dataset.ppLocalizedText === rawText;
    const previousSemantic = status.dataset.ppSemantic;
    const engineSolved = runtime.engine?.isSolved ? Boolean(runtime.engine.isSolved()) : false;
    const engineValidation = runtime.engine?.validate ? runtime.engine.validate() : null;
    const victoryState = engineSolved || (wasLocalized ? previousSemantic === 'success' : isVictoryStatus(status));
    const warningState = engineValidation === false || (wasLocalized ? previousSemantic === 'warning' : isWarningStatus(status));
    if (!wasLocalized && rawText) status.dataset.ppRawText = rawText;
    if (runtime.lastTarget && warningState && !runtime.replaying) {
      runtime.invalidMoves += 1;
      runtime.lastTarget.classList.add('pp-invalid');
      setTimeout(() => runtime.lastTarget?.classList.remove('pp-invalid'), 350);
      playSound('invalid');
      vibrate('invalid');
      runtime.lastTarget = null;
      saveSession();
      updateHUD();
    }
    if (!runtime.completed && victoryState) completePuzzle();
    if (runtime.dictionary?.locale !== 'en' && rawText) {
      const localized = victoryState
        ? t('ui.statusSolved','Puzzle solved!')
        : warningState
          ? t('ui.statusInvalid','That move conflicts with the current puzzle constraints.')
          : t('ui.statusProgress','Keep solving — the puzzle is still in progress.');
      status.dataset.ppSemantic = victoryState ? 'success' : warningState ? 'warning' : 'progress';
      status.dataset.ppLocalizedText = localized;
      if (status.textContent !== localized) status.textContent = localized;
    }
  }

  function completePuzzle() {
    const alreadyCounted = Boolean(runtime.session.completed);
    runtime.completed = true;
    runtime.session.completed = true;
    saveSession();
    const elapsed = Date.now() - runtime.startedAt;
    const moves = runtime.history.length;
    const accuracy = moves ? Math.max(0, Math.round((moves - runtime.invalidMoves) / moves * 100)) : 100;
    const par = ({ easy: 80, medium: 120, hard: 180, expert: 260 })[runtime.session.difficulty] || 120;
    const score = Math.max(1, 3 - (runtime.invalidMoves > 2 ? 1 : 0) - (moves > par ? 1 : 0));
    if (!alreadyCounted) {
      saveStats({ completed:true, time:elapsed, moves, accuracy, stars:score });
      if (runtime.dailyDate) {
        window.PPStorage.recordDailyCompletion(runtime.dailyDate, runtime.game, {
          time: elapsed,
          moves,
          accuracy,
          stars: score,
          seed: runtime.session.seed
        });
      }
    }
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
    return window[runtime.config.init];
  }

  function initEngine() {
    const start = getStartFunction();
    if (typeof start !== 'function') throw new Error('Puzzle init function unavailable');
    window.PP_DIFFICULTY = runtime.session.difficulty;
    window.PP_SEED = runtime.session.seed;
    document.getElementById('seed-label').textContent = `${t(`ui.${runtime.session.difficulty}`,runtime.session.difficulty)} · ${t('ui.seeded','Seed')} ${runtime.session.seed.slice(0,10)}`;
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

  function restoreSavedSnapshot() {
    if (!runtime.engine?.restore || runtime.session.snapshot == null) return false;
    try {
      runtime.replaying = true;
      initEngine();
      const restored = runtime.engine.restore(runtime.session.snapshot) !== false;
      runtime.replaying = false;
      decorateActions();
      handleStatusChange();
      updateHUD();
      return restored;
    } catch {
      runtime.replaying = false;
      return false;
    }
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
    runtime.session.completed = false;
    delete runtime.session.snapshot;
    document.getElementById('victory').classList.remove('open');
    replayHistory();
  }

  function newPuzzle() {
    if (runtime.dailyDate) return;
    runtime.session.seed = freshSeed();
    runtime.sessionKey = sessionKeyFor(runtime.session.seed, null);
    resetSamePuzzle();
  }

  async function sharePuzzle() {
    const params = new URLSearchParams({
      game: runtime.game,
      difficulty: runtime.session.difficulty,
      seed: runtime.session.seed,
      lang: runtime.dictionary?.locale || 'en'
    });
    if (runtime.dailyDate) params.set('daily', runtime.dailyDate);
    const url = new URL(`index.html?${params.toString()}`, location.href).href;
    const title = runtime.dictionary?.puzzles?.[runtime.game]?.title || runtime.config.name;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: `${title} · Puzzle Paradise`, url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        showToast(url);
      } else {
        showToast(url);
      }
    } catch (error) {
      if (error?.name !== 'AbortError') showToast(url);
    }
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
      runtime.dictionary.puzzles?.[runtime.game]?.objective || runtime.config.description;
    const status = currentStatus();
    if (status) {
      if (runtime.dictionary.locale === 'en' && status.dataset.ppRawText) {
        status.textContent = status.dataset.ppRawText;
        delete status.dataset.ppLocalizedText;
      } else if (status.textContent) {
        handleStatusChange();
      }
    }
  }

  function populateGuide() {
    const puzzle = runtime.dictionary?.puzzles?.[runtime.game] || {};
    document.getElementById('guide-objective').textContent = puzzle.objective || runtime.config.description;
    document.getElementById('guide-rules').innerHTML = (puzzle.rules || runtime.dictionary?.guide?.rules || []).map(item => `<li>${item}</li>`).join('');
    document.getElementById('guide-tutorial').innerHTML = (puzzle.tutorial || runtime.dictionary?.guide?.tutorial || []).map((item,index) => `<button class="demo-step" type="button"><strong>${index+1}</strong><br>${item}</button>`).join('');
    document.querySelectorAll('#guide-tutorial .demo-step').forEach(step => step.onclick = () => step.classList.toggle('active'));
    document.getElementById('guide-tips').innerHTML = (puzzle.tips || runtime.dictionary?.guide?.tips || []).map(item => `<li>${item}</li>`).join('');
  }

  function hint() {
    const puzzle = runtime.dictionary?.puzzles?.[runtime.game] || {};
    const status = currentStatus();
    const contextual = status && isWarningStatus(status) ? t('ui.statusInvalid','That move conflicts with the current puzzle constraints.') : '';
    let engineHint = null;
    if (runtime.engine?.getHint) {
      try { engineHint = runtime.engine.getHint(); } catch {}
    }
    const message = typeof engineHint === 'string' ? engineHint : engineHint?.message;
    const selector = typeof engineHint === 'object' ? engineHint?.selector : null;
    if (selector) {
      const target = document.querySelector(selector);
      if (target) {
        target.classList.add('selected');
        setTimeout(() => target.classList.remove('selected'), 2200);
      }
    }
    showToast(message || (contextual ? `${contextual} ${puzzle.hint || ''}`.trim() : (puzzle.hint || t('ui.hint','Hint'))));
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
      const active = document.activeElement;
      if ((event.key === 'Enter' || event.key === ' ') && active?.classList?.contains('grid-cell') && typeof active.onclick === 'function' && !event.defaultPrevented) {
        event.preventDefault();
        active.click();
        return;
      }
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
    document.getElementById('share-game').onclick = sharePuzzle;
    document.getElementById('collapse-ui').onclick = () => {
      document.getElementById('player-app').classList.toggle('compact');
      localStorage.setItem('pp.playerCompact', document.getElementById('player-app').classList.contains('compact') ? '1' : '0');
    };
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
      event.currentTarget.textContent = enabled ? t('ui.off','Off') : t('ui.on','On');
    };
    document.getElementById('haptics-toggle').onclick = event => {
      const enabled = localStorage.getItem('pp.haptics') !== '0';
      localStorage.setItem('pp.haptics', enabled ? '0' : '1');
      event.currentTarget.textContent = enabled ? t('ui.off','Off') : t('ui.on','On');
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
    const requestedSeed = params.get('seed');
    runtime.dailyDate = params.get('daily');

    runtime.dictionary = await window.PPI18N.load(requestedLanguage);
    loadSession(difficulty, requestedSeed, runtime.dailyDate);
    window.PPStorage.recordRecent(game);
    window.PP_DIFFICULTY = runtime.session.difficulty;
    window.PP_SEED = runtime.session.seed;

    document.getElementById('difficulty-select').value = runtime.session.difficulty;
    if (runtime.dailyDate) {
      document.getElementById('difficulty-select').disabled = true;
      document.getElementById('new-game').disabled = true;
    }
    document.getElementById('language-select').value = runtime.dictionary.locale;
    applyTheme(localStorage.getItem('pp.theme') || 'dark');
    document.getElementById('player-app').classList.toggle('compact', localStorage.getItem('pp.playerCompact') === '1');
    document.getElementById('sound-toggle').textContent = localStorage.getItem('pp.sound') === '0' ? t('ui.off','Off') : t('ui.on','On');
    document.getElementById('haptics-toggle').textContent = localStorage.getItem('pp.haptics') === '0' ? t('ui.off','Off') : t('ui.on','On');

    document.getElementById('game-name').textContent = runtime.dictionary.puzzles?.[game]?.title || game;
    document.getElementById('instructions').textContent = runtime.dictionary.puzzles?.[game]?.objective || config.description;
    populateGuide();
    window.PPI18N.apply(document,runtime.dictionary);

    const type = config.boardType || 'arrow';
    ['arrow','sudoku','net'].forEach(name => {
      document.getElementById(`${name}-board`).style.display = name === type ? 'grid' : 'none';
      document.getElementById(`${name}-status`).style.display = name === type ? 'block' : 'none';
    });

    bindControls();
    setupKeyboard();
    observeStatus();

    try {
      await loadEngine();
      runtime.engine = window.PPEngine?.get(game) || null;
      setupSudokuPad();
      if (!restoreSavedSnapshot()) replayHistory();
      runtime.timer = setInterval(() => { updateHUD(); saveSession(); },1000);
    } catch (error) {
      document.getElementById('player').innerHTML = `<p class="error">${error.message}</p>`;
    }
  }

  window.PPRuntime = { boot };
})();
