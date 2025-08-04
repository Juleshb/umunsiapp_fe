const CACHE_NAME = 'Umunsi-Media-v1.0.0';
const STATIC_CACHE = 'Umunsi-Media-static-v1.0.0';
const DYNAMIC_CACHE = 'Umunsi-Media-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/index.css',
  '/src/App.css'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static files', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
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

  // Handle API requests differently
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (url.pathname.startsWith('/src/') || url.pathname.startsWith('/assets/')) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Default: try network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Handle API requests - network first, no caching
async function handleApiRequest(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    // Return offline response for API requests
    return new Response(
      JSON.stringify({ error: 'You are offline. Please check your connection.' }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// Handle static requests - cache first, fallback to network
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.status === 200) {
      const responseClone = response.clone();
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, responseClone);
    }
    return response;
  } catch (error) {
    return new Response('Static asset not found', { status: 404 });
  }
}

// Handle navigation requests - network first, fallback to cached index.html
async function handleNavigationRequest(request) {
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      const responseClone = response.clone();
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, responseClone);
    }
    return response;
  } catch (error) {
    // Return cached index.html for SPA navigation
    const cachedResponse = await caches.match('/index.html');
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Page not found', { status: 404 });
  }
}

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Chart App',
    icon: '/vite.svg',
    badge: '/vite.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/vite.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/vite.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Chart App', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync event', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Background sync function
async function doBackgroundSync() {
  try {
    // Perform background sync operations here
    console.log('Service Worker: Performing background sync');
    
    // Example: Sync offline data
    const offlineData = await getOfflineData();
    if (offlineData.length > 0) {
      await syncOfflineData(offlineData);
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

// Helper function to get offline data (placeholder)
async function getOfflineData() {
  // This would typically read from IndexedDB
  return [];
}

// Helper function to sync offline data (placeholder)
async function syncOfflineData(data) {
  // This would typically send data to the server
  console.log('Service Worker: Syncing offline data', data);
}

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
}); 