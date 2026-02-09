// Service Worker Disabled - Preventing fetch errors
// This service worker is intentionally minimal to avoid blocking resources

self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker Installing - Minimal Mode');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker Activated - Minimal Mode');
  // Clear all caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => caches.delete(cache))
      );
    })
  );
  return self.clients.claim();
});

// No fetch interception - let all requests pass through normally
self.addEventListener('fetch', (event) => {
  // Do nothing - let the browser handle all fetches normally
  return;
});
