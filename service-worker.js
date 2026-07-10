// This file is what makes the app work with NO internet connection.
// The first time you open the app on wifi, it saves a full copy of
// itself on your phone. After that, it keeps working even with zero signal.

const CACHE_NAME = 'golf-gps-v1';
const FILES_TO_CACHE = [
  './index.html',
  './styles.css',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Save all the app files the first time it loads
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Clean up old saved copies when the app updates
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Whenever the app asks for a file, hand back the saved copy first.
// If there's wifi, it quietly checks for an update in the background.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => cached); // no internet: fall back to the saved copy

      return cached || fetchPromise;
    })
  );
});
