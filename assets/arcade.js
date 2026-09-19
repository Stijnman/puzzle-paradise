(() => {
  const app = document.getElementById('app');
  const grid = document.getElementById('game-grid');
  const modal = document.getElementById('modal');
  const frame = document.getElementById('game-frame');
  const search = document.getElementById('search');
  const sort = document.getElementById('sort');
  const language = document.getElementById('language');
  const theme = document.getElementById('theme');
  const difficulty = document.getElementById('default-difficulty');
  const state = { category: 'All', query: '', sort: 'featured', dictionary: null };

  function readJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  }

  function stats() {
    return readJSON('pp.stats', {});
  }

  function sessions() {
    return readJSON('pp.sessions', {});
  }

  function setTheme(value) {
    const next = ['dark','light','oled'].includes(value) ? value : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('pp.theme', next);
    theme.value = next;
  }

  function t(path, fallback = '') {
    return window.PPI18N.get(state.dictionary, path, fallback);
  }

  function gameText(game) {
    const translated = state.dictionary?.puzzles?.[game.id] || {};
    return {
      title: translated.title || game.name,
      summary: translated.summary || game.description
    };
  }

  function renderFilters() {
    const categories = ['All', ...new Set(window.PP_GAMES.map(game => game.category))];
    document.getElementById('filters').innerHTML = categories.map(category => {
      const label = category === 'All' ? t('ui.all','All') : t(`categories.${category}`,category);
      return `<button class="filter ${state.category === category ? 'active' : ''}" data-category="${category}">${label}</button>`;
    }).join('');
  }

  function filtered() {
    const query = state.query.toLocaleLowerCase(state.dictionary?.locale || 'en');
    const list = window.PP_GAMES.filter(game => {
      const text = gameText(game);
      return (state.category === 'All' || game.category === state.category) &&
        `${text.title} ${text.summary} ${game.category}`.toLocaleLowerCase().includes(query);
    });
    if (state.sort === 'az') list.sort((a,b) => gameText(a).title.localeCompare(gameText(b).title));
    if (state.sort === 'difficulty') list.sort((a,b) => a.difficulty - b.difficulty || gameText(a).title.localeCompare(gameText(b).title));
    return list;
  }

  function dots(value) {
    return `<span class="difficulty" aria-label="${t('ui.difficulty','Difficulty')} ${value}/4">${[1,2,3,4].map(n => `<i class="${n <= value ? 'on' : ''}"></i>`).join('')}</span>`;
  }

  function render() {
    const list = filtered();
    const activeSessions = sessions();
    const allStats = stats();
    grid.innerHTML = list.map(game => {
      const text = gameText(game);
      const progress = activeSessions[game.id]?.actions?.length > 0;
      const completed = allStats[game.id]?.completions || 0;
      const starRating = allStats[game.id]?.stars || 0;
      return `<button class="game-card" data-game="${game.id}" aria-label="${t('ui.play','Play')} ${text.title}">
        <span class="card-top"><span class="game-icon">${game.icon}</span>${starRating ? `<span class="resume-badge" aria-label="${starRating} ${t('ui.stars','Stars')}">${'★'.repeat(starRating)}${'☆'.repeat(3-starRating)}</span>` : progress ? `<span class="resume-badge">${t('ui.progress','Progress')}</span>` : completed ? `<span class="resume-badge">${completed}✓</span>` : ''}</span>
        <h3>${text.title}</h3>
        <p>${text.summary}</p>
        <span class="card-foot">${dots(game.difficulty)}<span>${t(`categories.${game.category}`,game.category)}</span></span>
      </button>`;
    }).join('');
    document.getElementById('result-count').textContent = `${list.length} / ${window.PP_GAMES.length}`;
    document.getElementById('empty-state').style.display = list.length ? 'none' : 'grid';
    document.getElementById('empty-state').textContent = t('ui.noResults','No puzzles match your search.');

    const totalCompletions = Object.values(allStats).reduce((sum,item) => sum + (item.completions || 0),0);
    document.getElementById('metric-played').textContent = totalCompletions;
    document.getElementById('metric-active').textContent = Object.values(activeSessions).filter(item => item?.actions?.length).length;
  }

  function dailyGame() {
    const dateKey = new Date().toISOString().slice(0,10);
    let hash = 2166136261;
    for (const char of dateKey) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
    return window.PP_GAMES[Math.abs(hash) % window.PP_GAMES.length];
  }

  function renderDaily() {
    const game = dailyGame();
    const text = gameText(game);
    document.getElementById('daily-title').textContent = text.title;
    document.getElementById('daily-copy').textContent = text.summary;
    document.getElementById('daily-play').dataset.game = game.id;
  }

  function openGame(id) {
    const game = window.PP_GAMES.find(item => item.id === id);
    if (!game) return;
    const text = gameText(game);
    const lang = language.value || window.PPI18N.detect();
    const level = difficulty.value || 'medium';
    document.getElementById('modal-title').textContent = text.title;
    document.getElementById('modal-category').textContent = t(`categories.${game.category}`, game.category);
    frame.src = `player.html?game=${encodeURIComponent(id)}&lang=${encodeURIComponent(lang)}&difficulty=${encodeURIComponent(level)}`;
    modal.classList.add('open');
    document.getElementById('close-modal').focus();
  }

  function closeGame() {
    modal.classList.remove('open');
    frame.src = 'about:blank';
    render();
  }

  async function setLanguage(code) {
    window.PPI18N.save(code);
    state.dictionary = await window.PPI18N.load(code);
    language.value = state.dictionary.locale;
    window.PPI18N.apply(document, state.dictionary);
    sort.querySelector('[value="featured"]').textContent = t('ui.featured','Featured');
    sort.querySelector('[value="az"]').textContent = t('ui.az','A–Z');
    sort.querySelector('[value="difficulty"]').textContent = t('ui.difficulty','Difficulty');
    renderFilters();
    renderDaily();
    render();
  }

  search.addEventListener('input', event => { state.query = event.target.value.trim(); render(); });
  sort.addEventListener('change', event => { state.sort = event.target.value; render(); });
  document.getElementById('filters').addEventListener('click', event => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    state.category = button.dataset.category;
    renderFilters();
    render();
  });
  grid.addEventListener('click', event => {
    const card = event.target.closest('[data-game]');
    if (card) openGame(card.dataset.game);
  });
  document.getElementById('daily-play').addEventListener('click', event => openGame(event.currentTarget.dataset.game));
  document.getElementById('close-modal').addEventListener('click', closeGame);
  document.getElementById('toggle-rail').addEventListener('click', () => {
    app.classList.toggle('rail-collapsed');
    localStorage.setItem('pp.railCollapsed', app.classList.contains('rail-collapsed') ? '1' : '0');
  });
  language.addEventListener('change', event => setLanguage(event.target.value));
  theme.addEventListener('change', event => setTheme(event.target.value));
  difficulty.addEventListener('change', event => localStorage.setItem('pp.defaultDifficulty', event.target.value));
  window.addEventListener('message', event => {
    if (event.data?.type === 'pp:close') closeGame();
    if (event.data?.type === 'pp:stats') render();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal.classList.contains('open')) closeGame();
  });

  app.classList.toggle('rail-collapsed', localStorage.getItem('pp.railCollapsed') === '1');
  setTheme(localStorage.getItem('pp.theme') || 'dark');
  difficulty.value = localStorage.getItem('pp.defaultDifficulty') || 'medium';
  setLanguage(window.PPI18N.detect());
})();
