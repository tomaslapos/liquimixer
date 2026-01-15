// LiquiMixer Service Worker
// DŮLEŽITÉ: Změna verze vynutí aktualizaci cache u všech uživatelů
const CACHE_NAME = 'liquimixer-v111';

// Soubory pro precaching
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/auth-modal.css',
  '/app.js',
  '/locales/cs.json',
  '/locales/sk.json',
  '/locales/en.json',
  '/database.js',
  '/i18n.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;600&display=swap'
];

// Soubory které se mají vždy načítat ze sítě (network-first)
const networkFirstFiles = [
  '/app.js',
  '/database.js', 
  '/subscription.js',
  '/i18n.js',
  '/index.html',
  '/locales/cs.json',
  '/locales/sk.json',
  '/locales/en.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('LiquiMixer SW: Installing version', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('LiquiMixer SW: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Okamžitě aktivovat nový SW
        self.skipWaiting();
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('LiquiMixer SW: Activating version', CACHE_NAME);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('LiquiMixer SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Okamžitě převzít kontrolu nad všemi klienty
      self.clients.claim();
      // Upozornit klienty na aktualizaci
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SW_UPDATED', version: CACHE_NAME });
        });
      });
    })
  );
});

// Fetch event - Network-first pro JS, cache-first pro ostatní
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Pro JS a HTML soubory použít network-first strategii
  const isNetworkFirst = networkFirstFiles.some(file => url.pathname.endsWith(file));
  
  if (isNetworkFirst) {
    // Network-first: zkusit síť, pak cache
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Aktualizovat cache s novou verzí
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline - použít cache
          return caches.match(event.request);
        })
    );
  } else {
    // Cache-first pro statické soubory (CSS, obrázky, fonty)
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
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
        });
      })
      .catch(() => {
          return caches.match('/index.html');
      })
  );
  }
});

// Poslouchání zpráv od klientů
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

