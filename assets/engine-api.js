(() => {
  const engines = new Map();

  function register(id, api) {
    if (!/^[a-z0-9-]+$/.test(id)) throw new Error(`Invalid engine id: ${id}`);
    if (!api || typeof api !== 'object') throw new Error(`Engine ${id} API must be an object`);
    const normalized = Object.freeze({
      version: 1,
      serialize: null,
      restore: null,
      validate: null,
      isSolved: null,
      getHint: null,
      ...api
    });
    for (const method of ['serialize','restore','validate','isSolved','getHint']) {
      if (normalized[method] !== null && typeof normalized[method] !== 'function') {
        throw new Error(`Engine ${id} ${method} must be a function`);
      }
    }
    engines.set(id, normalized);
    return normalized;
  }

  function get(id) {
    return engines.get(id) || null;
  }

  window.PPEngine = Object.freeze({ register, get });
})();
