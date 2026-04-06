const CACHE_NAME = 'quotes-app-v20';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json'
];

// Установка
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE).catch(err => {
                console.log('[SW] Cache error:', err);
            });
        })
    );
    self.skipWaiting();
});

// Активация
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Перехват запросов — ТОЛЬКО для своих файлов!
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Пропускаем внешние запросы (API, шрифты, картинки)
    if (url.origin !== location.origin) {
        return; // Не перехватываем!
    }
    
    // Перехватываем только свои файлы
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
                // Офлайн — возвращаем index.html
                return caches.match('./index.html');
            });
        })
    );
});
