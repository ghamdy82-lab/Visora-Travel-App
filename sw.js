const CACHE_NAME = 'visora-v3';

// شيلنا index.html من هنا وخليناها / بس
const urlsToCache = [
  '/',
  '/manifest.json',
  '/1.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  let request = event.request;
  
  // الحل السحري لمشكلة Vercel: لو الطلب فيه index.html بنشيلها!
  if (request.url.endsWith('/index.html')) {
    request = new Request(request.url.replace('/index.html', '/'));
  }

  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request).catch(() => {
        // لو النت فاصل، اعرض الصفحة الرئيسية
        if (request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});