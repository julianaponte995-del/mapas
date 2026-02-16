const CACHE_NAME = 'explorador-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Instalación - cachear archivos
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Archivos cacheados');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación - limpiar caches antiguos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - servir desde cache, con fallback a red
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - devolver respuesta
        if (response) {
          return response;
        }

        // Clonar request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Verificar respuesta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clonar respuesta
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// Background Sync (para futuro - sincronizar datos cuando vuelva conexión)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-celdas') {
    event.waitUntil(syncPendingData());
  }
});

async function syncPendingData() {
  // Implementar lógica de sincronización si es necesario
  console.log('[SW] Sincronizando datos pendientes...');
}

// Periodic Background Sync (experimental - mantener rastreo)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'keep-alive') {
    event.waitUntil(keepAlive());
  }
});

async function keepAlive() {
  console.log('[SW] Keep alive ping');
  // Mantener service worker activo
}
