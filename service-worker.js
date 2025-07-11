const cacheName = 'todo-pwa-v1';
const filesToCache = [
  '/',
  '/index.html',
  '/script.js',
  '/style.css',
  '/manifest.json',
];

// インストール
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => cache.addAll(filesToCache))
  );
});

// フェッチ時にキャッシュから返す
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(res => res || fetch(event.request))
  );
});

self.addEventListener('push', event => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
  });
});
