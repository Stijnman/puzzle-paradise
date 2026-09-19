(() => {
  const ROOT_KEY = 'pp.state';
  const CURRENT_SCHEMA = 2;

  function emptyState() {
    return {
      schemaVersion: CURRENT_SCHEMA,
      sessions: {},
      stats: {},
      favorites: [],
      recent: [],
      daily: { streak: 0, lastCompletedDate: null, completions: {} }
    };
  }

  function safeParse(value, fallback) {
    try { return JSON.parse(value) ?? fallback; } catch { return fallback; }
  }

  function normalize(state) {
    const base = emptyState();
    return {
      ...base,
      ...state,
      schemaVersion: CURRENT_SCHEMA,
      sessions: state?.sessions && typeof state.sessions === 'object' ? state.sessions : {},
      stats: state?.stats && typeof state.stats === 'object' ? state.stats : {},
      favorites: Array.isArray(state?.favorites) ? [...new Set(state.favorites)] : [],
      recent: Array.isArray(state?.recent) ? state.recent.slice(0, 20) : [],
      daily: {
        ...base.daily,
        ...(state?.daily || {}),
        completions: state?.daily?.completions && typeof state.daily.completions === 'object'
          ? state.daily.completions
          : {}
      }
    };
  }

  function migrate() {
    const stored = safeParse(localStorage.getItem(ROOT_KEY), null);
    if (stored?.schemaVersion === CURRENT_SCHEMA) return normalize(stored);

    let next = emptyState();
    if (stored && typeof stored === 'object') {
      if (stored.schemaVersion === 1) {
        next = normalize({
          ...stored,
          favorites: stored.favorites || [],
          recent: stored.recent || [],
          daily: stored.daily || {}
        });
      }
    } else {
      const legacySessions = safeParse(localStorage.getItem('pp.sessions'), {});
      const legacyStats = safeParse(localStorage.getItem('pp.stats'), {});
      next.sessions = legacySessions && typeof legacySessions === 'object' ? legacySessions : {};
      next.stats = legacyStats && typeof legacyStats === 'object' ? legacyStats : {};
    }

    localStorage.setItem(ROOT_KEY, JSON.stringify(next));
    return next;
  }

  function read() {
    return normalize(safeParse(localStorage.getItem(ROOT_KEY), null) || migrate());
  }

  function write(state) {
    const normalized = normalize(state);
    localStorage.setItem(ROOT_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function update(mutator) {
    const state = read();
    const result = mutator(state) || state;
    return write(result);
  }

  function getSession(key) {
    return read().sessions[key] || null;
  }

  function setSession(key, session) {
    return update(state => {
      state.sessions[key] = {
        saveVersion: 2,
        updatedAt: Date.now(),
        ...session
      };
      return state;
    }).sessions[key];
  }

  function removeSession(key) {
    update(state => {
      delete state.sessions[key];
      return state;
    });
  }

  function getSessions() {
    return read().sessions;
  }

  function getStats() {
    return read().stats;
  }

  function setGameStats(game, stats) {
    return update(state => {
      state.stats[game] = { ...(state.stats[game] || {}), ...stats };
      return state;
    }).stats[game];
  }

  function recordRecent(game) {
    update(state => {
      state.recent = [game, ...state.recent.filter(id => id !== game)].slice(0, 12);
      return state;
    });
  }

  function toggleFavorite(game) {
    let enabled = false;
    update(state => {
      const favorites = new Set(state.favorites);
      if (favorites.has(game)) favorites.delete(game);
      else favorites.add(game);
      state.favorites = [...favorites];
      enabled = favorites.has(game);
      return state;
    });
    return enabled;
  }

  function isFavorite(game) {
    return read().favorites.includes(game);
  }

  function localDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function previousDateKey(dateKey) {
    const date = new Date(`${dateKey}T12:00:00`);
    date.setDate(date.getDate() - 1);
    return localDateKey(date);
  }

  function recordDailyCompletion(dateKey, game, result) {
    let daily;
    update(state => {
      const existing = state.daily.completions[dateKey];
      if (!existing) {
        const continues = state.daily.lastCompletedDate === previousDateKey(dateKey);
        state.daily.streak = continues ? state.daily.streak + 1 : 1;
        state.daily.lastCompletedDate = dateKey;
        state.daily.completions[dateKey] = {
          game,
          completedAt: Date.now(),
          ...result
        };
        const dates = Object.keys(state.daily.completions).sort().reverse();
        for (const stale of dates.slice(0 + 90)) delete state.daily.completions[stale];
      }
      daily = state.daily;
      return state;
    });
    return daily;
  }

  migrate();

  window.PPStorage = {
    CURRENT_SCHEMA,
    read,
    write,
    update,
    getSession,
    setSession,
    removeSession,
    getSessions,
    getStats,
    setGameStats,
    recordRecent,
    toggleFavorite,
    isFavorite,
    recordDailyCompletion,
    localDateKey
  };
})();
