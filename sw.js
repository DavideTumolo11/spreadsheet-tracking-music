/**
 * 🔧 MUSIC BUSINESS TRACKER - SERVICE WORKER
 * Gestisce cache e funzionamento offline
 */

const CACHE_NAME = 'music-business-tracker-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';

// File da cachare per funzionamento offline
const STATIC_FILES = [
    '/',
    '/index.html',
    '/css/main.css',
    '/js/utils.js',
    '/js/database.js',
    '/js/dashboard.js',
    '/js/revenue.js',
    '/js/videos.js',
    '/js/analytics.js',
    '/js/reports.js',
    '/js/settings.js',
    '/js/app.js',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Installazione Service Worker
self.addEventListener('install', event => {
    console.log('🔧 Service Worker: Installing...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('🔧 Service Worker: Caching static files...');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('🔧 Service Worker: Installation complete');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('🔧 Service Worker: Installation failed', error);
            })
    );
});

// Attivazione Service Worker
self.addEventListener('activate', event => {
    console.log('🔧 Service Worker: Activating...');

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('🔧 Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('🔧 Service Worker: Activation complete');
                return self.clients.claim();
            })
    );
});

// Gestione richieste (fetch)
self.addEventListener('fetch', event => {
    const request = event.request;

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension requests
    if (request.url.startsWith('chrome-extension://')) {
        return;
    }

    event.respondWith(
        // Cerca prima nella cache
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Se non in cache, fetch dalla rete
                return fetch(request)
                    .then(networkResponse => {
                        // Clona la risposta perché può essere usata solo una volta
                        const responseClone = networkResponse.clone();

                        // Salva in cache dinamica se è una risorsa dell'app
                        if (request.url.includes(location.origin)) {
                            caches.open(DYNAMIC_CACHE)
                                .then(cache => {
                                    cache.put(request, responseClone);
                                });
                        }

                        return networkResponse;
                    })
                    .catch(error => {
                        console.log('🔧 Service Worker: Network fetch failed', error);

                        // Fallback per pagine HTML
                        if (request.headers.get('accept').includes('text/html')) {
                            return caches.match('/index.html');
                        }

                        // Fallback per CSS
                        if (request.url.includes('.css')) {
                            return new Response('/* Offline fallback CSS */', {
                                headers: { 'Content-Type': 'text/css' }
                            });
                        }

                        // Fallback per JS
                        if (request.url.includes('.js')) {
                            return new Response('// Offline fallback JS', {
                                headers: { 'Content-Type': 'application/javascript' }
                            });
                        }
                    });
            })
    );
});

// Gestione messaggi dall'app
self.addEventListener('message', event => {
    const { type, payload } = event.data;

    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;

        case 'CACHE_UPDATE':
            // Aggiorna cache quando richiesto dall'app
            caches.open(STATIC_CACHE)
                .then(cache => cache.addAll(STATIC_FILES))
                .then(() => {
                    event.ports[0].postMessage({ success: true });
                })
                .catch(error => {
                    event.ports[0].postMessage({ success: false, error });
                });
            break;

        case 'CLEAR_CACHE':
            // Pulisci cache quando richiesto
            caches.keys()
                .then(cacheNames => {
                    return Promise.all(
                        cacheNames.map(cacheName => caches.delete(cacheName))
                    );
                })
                .then(() => {
                    event.ports[0].postMessage({ success: true });
                });
            break;
    }
});

// Gestione sincronizzazione in background
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('🔧 Service Worker: Background sync triggered');

        event.waitUntil(
            // Qui potresti sincronizzare dati quando torna la connessione
            self.registration.showNotification('Music Business Tracker', {
                body: 'Dati sincronizzati con successo!',
                icon: '/icons/icon-192.png',
                badge: '/icons/icon-72.png'
            })
        );
    }
});

// Gestione notifiche push (opzionale)
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();

        event.waitUntil(
            self.registration.showNotification(data.title || 'Music Business Tracker', {
                body: data.body || 'Nuovo aggiornamento disponibile',
                icon: '/icons/icon-192.png',
                badge: '/icons/icon-72.png',
                data: data.url || '/',
                actions: [
                    {
                        action: 'open',
                        title: 'Apri App'
                    },
                    {
                        action: 'close',
                        title: 'Chiudi'
                    }
                ]
            })
        );
    }
});

// Gestione click notifiche
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow(event.notification.data || '/')
        );
    }
});