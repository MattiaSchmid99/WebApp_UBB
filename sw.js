// Offline-Cache. Bei jeder Änderung an den App-Dateien VERSION erhöhen,
// damit die Smartphones die neue Version laden.
const VERSION = 'ubb-v1';
const FILES = ['./', 'index.html', 'app.js', 'schema.js', 'jspdf.umd.min.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Netz zuerst (neueste Version), bei fehlendem Empfang aus dem Cache
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Timeout, damit die App bei schwachem Empfang nicht hängt
  const net = Promise.race([
    fetch(e.request),
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000)),
  ]);
  e.respondWith(
    net
      .then(r => {
        if (r.ok && new URL(e.request.url).origin === location.origin) {
          const copy = r.clone();
          caches.open(VERSION).then(c => c.put(e.request, copy));
        }
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});
