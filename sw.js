/* Trinetra Route Planner — Service Worker v2.0 (OpenStreetMap) */
const CACHE  = 'trinetra-route-v2';
const ASSETS = ['./', './index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  const live = ['nominatim.openstreetmap.org','router.project-osrm.org','tile.openstreetmap.org','fonts.googleapis.com','fonts.gstatic.com','cdnjs.cloudflare.com'];
  if (live.some(d => url.includes(d))) {
    e.respondWith(fetch(e.request).catch(() => new Response('', { status: 503 })));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (e.request.method==='GET' && res.status===200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
    }).catch(() => new Response('Offline', { status: 503 }))
  );
});
