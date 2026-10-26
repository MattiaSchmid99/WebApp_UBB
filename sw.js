// Offline-Cache. Bei jeder Änderung an den App-Dateien VERSION erhöhen,
// damit die Smartphones die neue Version laden.
const VERSION = 'ubb-v10';
const FILES = ['./', 'index.html', 'app.js', 'schema.js', 'gis-layers.js', 'gis.js', 'features.js', 'export.js', 'jspdf.umd.min.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
const OPTIONAL = ['afry-logo.png', 'afry-logo-white.png']; // Logo-Dateien, falls vorhanden

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION)
    .then(c => c.addAll(FILES).then(() => Promise.all(OPTIONAL.map(f => c.add(f).catch(() => {})))))
    .then(() => self.skipWaiting()));
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
  if (new URL(e.request.url).origin !== location.origin) return; // Kartendienste direkt, ohne Cache
  // Timeout, damit die App bei schwachem Empfang nicht hängt
  const net = Promise.race([
    fetch(e.request, { cache: 'no-cache' }), // Browser-Cache umgehen, immer beim Server nachfragen
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
