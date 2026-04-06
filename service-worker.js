const CACHE_NAME = 'quotes-app-v19';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json'
];

// Установка
self.addEventListener('install', (event) => {
    console.log('[SW] Install');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching');
            return cache.addAll(ASSETS_TO_CACHE).catch(err => {
                console.log('[SW] Cache error:', err);
            });
        }).catch(err => {
            console.log('[SW] Install error:', err);
        })
    );
    self.skipWaiting();
});

// Активация
self.addEventListener('activate', (event) => {
    console.log('[SW] Activate');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Delete old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }
            return fetch(event.request).then((response) => {
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                return response;
            }).catch(() => {
                console.log('[SW] Fetch failed');
            });
        })
    );
});
