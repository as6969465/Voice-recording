// 敹怠? App 畾澆惜嚗?隞?舫蝺???隤颲刻??祈澈隞?蝬脰楝嚗?const CACHE = 'minutes-v6';
const FILES = ['./', './index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// 蝬脰楝?芸?嚗蝺???翰??self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return; // API 隢?銝翰??  e.respondWith(
    fetch(e.request)
      .then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request))
  );
});
