// UPDATE THIS on every deploy — browser detects new SW when this string changes
const CACHE = 'tke-pro-20260613b';

const ASSETS = ['/tke-pro/icon.jpg', '/tke-pro/manifest.json'];

self.addEventListener('install', e => {
  // Pre-cache only static assets (not index.html — served network-first)
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // Delete all old caches
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // index.html — always network-first, never serve stale
  if (url.pathname === '/tke-pro/' || url.pathname === '/tke-pro/index.html' || url.pathname === '/') {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Other assets — network-first, cache fallback
  e.respondWith(
    fetch(e.request).then(res => {
      var clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
