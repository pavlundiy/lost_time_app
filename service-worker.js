const CACHE_NAME = 'quotes-app-v25';
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(names => 
        Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    ));
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);
    if (url.origin !== location.origin) return; // Пропускаем внешние API
    
    e.respondWith(
        caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
            return resp;
        }).catch(() => caches.match('./index.html')))
    );
});
