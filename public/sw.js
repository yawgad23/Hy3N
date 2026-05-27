// Service Worker for HY3N Rider App
// Push notifications require VAPID keys configured via environment variables

const CACHE_NAME = 'hy3n-rider-v4';

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json'
      ]);
    })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'HY3N', {
      body: data.body || 'New notification',
      icon: 'https://media.base44.com/images/public/user_6a0b47df1b4c35b2346c0b24/97a3a2b69_ed10837d-36bf-405d-9043-0f9ff87a5b4e.png',
      badge: 'https://media.base44.com/images/public/user_6a0b47df1b4c35b2346c0b24/97a3a2b69_ed10837d-36bf-405d-9043-0f9ff87a5b4e.png',
      data: data.data || {}
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
