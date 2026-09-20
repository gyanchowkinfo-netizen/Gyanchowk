self.addEventListener('push', (event) => {
  let data = { title: 'Gyan Chowk', body: '', href: '/' };
  try {
    data = { ...data, ...(event.data ? event.data.json() : {}) };
  } catch {
    data.body = event.data ? event.data.text() : '';
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Gyan Chowk', {
      body: data.body || '',
      icon: '/icon.png',
      data: { href: data.href || '/' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const href = event.notification.data?.href || '/';
  event.waitUntil(self.clients.openWindow(href));
});
