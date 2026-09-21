importScripts('./assets/puzzle-registry.js');

const CACHE_NAME = 'puzzle-paradise-v3';
const ENGINE_URLS = (self.PP_REGISTRY || []).map(puzzle => `./js/${puzzle.id}.js`);
const CORE = [
  './',
  './index.html',
  './player.html',
  './manifest.webmanifest',
  './assets/icon.svg',
  './assets/puzzle-registry.js',
  './assets/storage.js',
  './assets/i18n.js',
  './assets/arcade.css',
  './assets/arcade.js',
  './assets/player.css',
  './assets/player-runtime.js',
  './i18n/en.json',
  './i18n/nl.json',
  './i18n/fr.json',
  './i18n/de.json',
  './i18n/es.json',
  ...ENGINE_URLS
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          return caches.match('./index.html');
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      const network = fetch(event.request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
