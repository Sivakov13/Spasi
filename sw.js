/**
 * Service Worker for Orthodox Dating App
 * Implements caching strategies for improved performance and offline functionality
 */

const CACHE_NAME = 'orthodox-dating-v1.0.0';
const STATIC_CACHE_NAME = 'orthodox-dating-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'orthodox-dating-dynamic-v1.0.0';

// Resources to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/manifest.json'
];

// Resources to cache on first request
const DYNAMIC_ASSETS = [
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Cache strategies
const CACHE_STRATEGIES = {
    // Cache first, then network (for static assets)
    CACHE_FIRST: 'cache-first',
    // Network first, then cache (for dynamic content)
    NETWORK_FIRST: 'network-first',
    // Stale while revalidate (for frequently updated content)
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        Promise.all([
            // Cache static assets
            caches.open(STATIC_CACHE_NAME).then(cache => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            }),
            // Skip waiting to activate immediately
            self.skipWaiting()
        ])
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE_NAME && 
                            cacheName !== DYNAMIC_CACHE_NAME &&
                            cacheName.startsWith('orthodox-dating-')) {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Claim all clients immediately
            self.clients.claim()
        ])
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http requests
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    event.respondWith(handleRequest(request));
});

// Handle different types of requests with appropriate caching strategies
async function handleRequest(request) {
    const url = new URL(request.url);
    
    try {
        // Static assets - Cache First strategy
        if (isStaticAsset(request)) {
            return await cacheFirst(request, STATIC_CACHE_NAME);
        }
        
        // API requests - Network First strategy
        if (isApiRequest(request)) {
            return await networkFirst(request, DYNAMIC_CACHE_NAME);
        }
        
        // External resources - Stale While Revalidate
        if (isExternalResource(request)) {
            return await staleWhileRevalidate(request, DYNAMIC_CACHE_NAME);
        }
        
        // Default - Network First
        return await networkFirst(request, DYNAMIC_CACHE_NAME);
        
    } catch (error) {
        console.error('Service Worker: Request failed:', error);
        
        // Return offline fallback if available
        return await getOfflineFallback(request);
    }
}

// Cache First strategy - good for static assets that rarely change
async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        // Return cached version immediately
        return cachedResponse;
    }
    
    // Fetch from network and cache
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
}

// Network First strategy - good for dynamic content
async function networkFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache successful responses
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        // Network failed, try cache
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

// Stale While Revalidate strategy - good for frequently updated content
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    // Fetch from network in background
    const networkResponsePromise = fetch(request).then(response => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => {
        // Network failed, but we don't need to handle it here
        // as we're already returning the cached response
    });
    
    // Return cached version immediately if available
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // If no cached version, wait for network
    return await networkResponsePromise;
}

// Check if request is for static assets
function isStaticAsset(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    return pathname.endsWith('.css') ||
           pathname.endsWith('.js') ||
           pathname.endsWith('.html') ||
           pathname.endsWith('.ico') ||
           pathname.endsWith('.png') ||
           pathname.endsWith('.jpg') ||
           pathname.endsWith('.jpeg') ||
           pathname.endsWith('.gif') ||
           pathname.endsWith('.svg') ||
           pathname.endsWith('.woff') ||
           pathname.endsWith('.woff2') ||
           pathname.endsWith('.ttf') ||
           pathname === '/';
}

// Check if request is for API
function isApiRequest(request) {
    const url = new URL(request.url);
    return url.pathname.startsWith('/api/');
}

// Check if request is for external resources
function isExternalResource(request) {
    const url = new URL(request.url);
    return url.origin !== self.location.origin;
}

// Get offline fallback
async function getOfflineFallback(request) {
    const url = new URL(request.url);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
        const cache = await caches.open(STATIC_CACHE_NAME);
        return await cache.match('/index.html');
    }
    
    // Return placeholder for images
    if (request.destination === 'image') {
        return new Response(
            '<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f5f5f5"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Изображение недоступно</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
        );
    }
    
    // Return generic offline response
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
}

// Background sync for offline actions
self.addEventListener('sync', event => {
    console.log('Service Worker: Background sync triggered:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

// Perform background sync
async function doBackgroundSync() {
    try {
        // Get pending actions from IndexedDB or localStorage
        const pendingActions = await getPendingActions();
        
        for (const action of pendingActions) {
            try {
                await performAction(action);
                await removePendingAction(action.id);
            } catch (error) {
                console.error('Service Worker: Failed to sync action:', error);
            }
        }
        
    } catch (error) {
        console.error('Service Worker: Background sync failed:', error);
    }
}

// Get pending actions (placeholder - implement with IndexedDB)
async function getPendingActions() {
    // This would typically read from IndexedDB
    return [];
}

// Perform action (placeholder)
async function performAction(action) {
    // Implement actual action execution
    console.log('Service Worker: Performing action:', action);
}

// Remove pending action (placeholder)
async function removePendingAction(actionId) {
    // This would typically remove from IndexedDB
    console.log('Service Worker: Removing action:', actionId);
}

// Push notification handling
self.addEventListener('push', event => {
    console.log('Service Worker: Push notification received');
    
    const options = {
        body: 'У вас новое сообщение!',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Открыть',
                icon: '/icon-192x192.png'
            },
            {
                action: 'close',
                title: 'Закрыть',
                icon: '/icon-192x192.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Спаси и Сохрани', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'explore') {
        // Open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handling from main thread
self.addEventListener('message', event => {
    console.log('Service Worker: Message received:', event.data);
    
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;
            case 'GET_VERSION':
                event.ports[0].postMessage({ version: CACHE_NAME });
                break;
            case 'CLEAR_CACHE':
                clearAllCaches().then(() => {
                    event.ports[0].postMessage({ success: true });
                });
                break;
        }
    }
});

// Clear all caches
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
    );
}

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
    self.addEventListener('periodicsync', event => {
        if (event.tag === 'content-sync') {
            event.waitUntil(syncContent());
        }
    });
}

// Sync content in background
async function syncContent() {
    try {
        // Sync profiles, messages, etc.
        console.log('Service Worker: Syncing content in background');
        
        // This would typically update cached content
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        
        // Prefetch important content
        const importantUrls = [
            '/api/profiles',
            '/api/messages'
        ];
        
        await Promise.all(
            importantUrls.map(async url => {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        await cache.put(url, response);
                    }
                } catch (error) {
                    console.log('Service Worker: Failed to prefetch:', url, error);
                }
            })
        );
        
    } catch (error) {
        console.error('Service Worker: Content sync failed:', error);
    }
}