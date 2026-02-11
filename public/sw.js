// Service Worker v2.0 - Pure Scramjet (NO BareMux)
const SW_VERSION = '2.0';
const CACHE_NAME = 'scramjet-cache-v2';

importScripts('/scram/scramjet.all.js');

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

async function handleRequest(event) {
  await scramjet.loadConfig();
  
  if (scramjet.route(event)) {
    return scramjet.fetch(event);
  }
  
  return fetch(event.request);
}

self.addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event));
});

self.addEventListener('install', (event) => {
  console.log('[SW v' + SW_VERSION + '] Installing...');
  self.skipWaiting();
  
  // Clear old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW v' + SW_VERSION + '] Activating...');
  event.waitUntil(self.clients.claim());
});
