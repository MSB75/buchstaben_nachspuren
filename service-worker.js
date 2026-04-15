const CACHE_VERSION = 'nachspuren-v3';

const CORE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

const ICON_FILES = [
  'icons/m.png','icons/a.png','icons/i.png','icons/o.png','icons/l.png',
  'icons/u.png','icons/f.png','icons/e.png','icons/n.png',
  'icons/s.png','icons/p.png','icons/ei.png','icons/t.png','icons/au.png',
  'icons/h.png','icons/d.png','icons/sch.png','icons/k.png','icons/r.png',
  'icons/b.png','icons/w.png','icons/g.png','icons/z.png',
  'icons/ie.png','icons/ss.png','icons/ch.png','icons/eu.png',
  'icons/j.png','icons/v.png','icons/aeu.png','icons/ng.png',
  'icons/qu.png','icons/x.png','icons/c.png','icons/y.png',
  'icons/0.png','icons/1.png','icons/2.png','icons/3.png','icons/4.png',
  'icons/5.png','icons/6.png','icons/7.png','icons/8.png','icons/9.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(async cache => {
      await cache.addAll(CORE_FILES);
      await Promise.allSettled(
        ICON_FILES.map(url =>
          fetch(url).then(res => { if (res.ok) return cache.put(url, res); }).catch(()=>{})
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        if (event.request.destination === 'document') return caches.match('./index.html');
      });
    })
  );
});
