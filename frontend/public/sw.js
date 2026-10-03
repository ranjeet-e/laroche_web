// Service Worker for La Roche Cafe PWA & Live Notifications
const CACHE_NAME = 'laroche-cafe-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'La Roche Cafe Alert', body: event.data.text() };
    }
  }

  const title = data.title || 'La Roche Cafe';
  const options = {
    body: data.body || 'Your order status has been updated.',
    icon: data.icon || '/logo2.png',
    badge: data.badge || '/logo2.png',
    vibrate: [200, 100, 200],
    data: data.data || { url: '/orders' },
    tag: data.tag || 'laroche-order-update',
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Open order tracking when notification is clicked
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || '/orders';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
