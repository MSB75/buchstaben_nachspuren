// Service Worker – Buchstaben nachspuren
// Version 2 – GitHub Pages + iPad kompatibel

const CACHE_VERSION = 'nachspuren-v2';

// Kern-Dateien – müssen immer verfügbar sein
const CORE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

// Anlaut-Icons – werden separat gecacht (Fehler werden ignoriert)
const ICON_FILES = [
  'icons/M.png',
  'icons/A.png',
  'icons/I.png',
  'icons/O.png',
  'icons/L.png',
  'icons/U.png',
  'icons/F.png',
  'icons/E.png',
  'icons/N.png',
  'icons/S.png',
  'icons/P.png',
  'icons/Ei.png',
  'icons/T.png',
  'icons/Au.png',
  'icons/H.png',
  'icons/D.png',
  'icons/Sch.png',
  'icons/K.png',
  'icons/R.png',
  'icons/B.png',
  'icons/W.png',
  'icons/G.png',
  'icons/Z.png',
  'icons/ie.png',
  'icons/ss.png',
  'icons/ch.png',
  'icons/Eu.png',
  'icons/J.png',
  'icons/V.png',
  'icons/Aeu.png',
  'icons/ng.png',
  'icons/Qu.png',
  'icons/X.png',
  'icons/C.png',
  'icons/Y.png',
  'icons/0.png',
  'icons/1.png',
  'icons/2.png',
  'icons/3.png',
  'icons/4.png',
  'icons/5.png',
  'icons/6.png',
  'icons/7.png',
  'icons/8.png',
  'icons/9.png',
];

// ── Installation ────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(async cache => {
      // Kern-Dateien: Pflicht
      await cache.addAll(CORE_FILES);
      // Icons: Best-Effort (fehlende blockieren nicht den Start)
      await Promise.allSettled(
        ICON_FILES.map(url =>
          fetch(url).then(res => {
            if (res.ok) return cache.put(url, res);
          }).catch(() => {})
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// ── Aktivierung: alten Cache entfernen ──────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: Cache-First, Netzwerk-Fallback ───────────────────────
self.addEventListener('fetch', event => {
  // Nur GET, nur gleiche Origin
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (!response || response.status !== 200) return response;
        // Dynamisch cachen
        const clone = response.clone();
        caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        // Offline: Hauptseite als Fallback
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
