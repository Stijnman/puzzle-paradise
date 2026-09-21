(() => {
  const SUPPORTED = ['en','nl','fr','de','es'];
  const STORAGE_KEY = 'pp.language';
  const cache = new Map();
  let current = null;

  function detect() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED.includes(saved)) return saved;
    const candidates = [...(navigator.languages || []), navigator.language || 'en'];
    for (const value of candidates) {
      const base = String(value).toLowerCase().split('-')[0];
      if (SUPPORTED.includes(base)) return base;
    }
    return 'en';
  }

  async function load(code = detect()) {
    const lang = SUPPORTED.includes(code) ? code : 'en';
    if (!cache.has(lang)) {
      cache.set(lang, fetch(`i18n/${lang}.json`, { cache: 'no-cache' }).then(response => {
        if (!response.ok) throw new Error(`Translation load failed: ${response.status}`);
        return response.json();
      }));
    }
    try {
      const dictionary = await cache.get(lang);
      current = dictionary;
      document.documentElement.lang = dictionary.locale || lang;
      return dictionary;
    } catch (error) {
      if (lang !== 'en') return load('en');
      throw error;
    }
  }

  function save(code) {
    if (SUPPORTED.includes(code)) localStorage.setItem(STORAGE_KEY, code);
  }

  function get(object, path, fallback = '') {
    return String(path).split('.').reduce((value, key) => value?.[key], object) ?? fallback;
  }

  function translate(path, fallback = '') {
    return get(current, path, fallback);
  }

  function apply(root, dictionary) {
    root.querySelectorAll('[data-i18n]').forEach(node => {
      const value = get(dictionary, node.dataset.i18n);
      if (value) node.textContent = value;
    });
    root.querySelectorAll('[data-i18n-placeholder]').forEach(node => {
      const value = get(dictionary, node.dataset.i18nPlaceholder);
      if (value) node.setAttribute('placeholder', value);
    });
    root.querySelectorAll('[data-i18n-label]').forEach(node => {
      const value = get(dictionary, node.dataset.i18nLabel);
      if (value) node.setAttribute('aria-label', value);
    });
  }

  window.PPI18N = { SUPPORTED, detect, load, save, get, translate, apply };
  window.t = translate;
})();
