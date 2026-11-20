const C = 'baobab-' + '04cf277eb1';
self.addEventListener('install', (e) => { self.skipWaiting(); e.waitUntil(caches.open(C).then((c) => c.addAll(['./', 'manifest.webmanifest', 'icon-192.png', 'fonts/schibsted-grotesk-latin-400-normal.woff2', 'fonts/schibsted-grotesk-latin-500-normal.woff2', 'fonts/schibsted-grotesk-latin-600-normal.woff2', 'fonts/schibsted-grotesk-latin-700-normal.woff2', 'fonts/schibsted-grotesk-latin-800-normal.woff2', 'fonts/geist-mono-latin-400-normal.woff2', 'fonts/geist-mono-latin-500-normal.woff2', 'fonts/geist-mono-latin-600-normal.woff2', 'fonts/big-shoulders-display-latin-700-normal.woff2', 'fonts/big-shoulders-display-latin-800-normal.woff2', 'fonts/big-shoulders-display-latin-900-normal.woff2']))); });
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C && k !== 'baobab-push').map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  // Fonts never change: straight from the cache, so text draws in its real face from the first frame.
  if (u.pathname.includes('/fonts/')) return e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then((x) => { const k = x.clone(); caches.open(C).then((c) => c.put(e.request, k)); return x; })));
  e.respondWith(fetch(e.request).then((r) => { const k = r.clone(); caches.open(C).then((c) => c.put(e.request, k)); return r; }).catch(() => caches.match(e.request).then((r) => r || caches.match('./'))));
});
// Notifications: the push is empty; ask your Baobab script what to say, then show it (iPhone requires a notification for every push).
self.addEventListener('push', (e) => e.waitUntil((async () => {
  let m = null;
  try {
    const r = await (await caches.open('baobab-push')).match('cfg'), cfg = r && await r.json(), sub = await self.registration.pushManager.getSubscription();
    if (cfg && sub) { const j = await (await fetch(cfg.u, {method: 'POST', body: JSON.stringify({key: cfg.k, api: 'api_pushInbox', args: [sub.endpoint]})})).json(); if (j.ok && j.result && j.result[0]) m = j.result[0]; }
  } catch (err) {}
  m = m || {title: 'Jaeger', body: 'Something changed in your money. Tap to see.', tag: 'baobab'};
  await self.registration.showNotification(m.title, {body: m.body, tag: (m.tag || 'baobab') + '-' + Date.now(), icon: 'icon-192.png', badge: 'icon-192.png', data: {url: './#today'}});
})()));
self.addEventListener('notificationclick', (e) => { e.notification.close(); e.waitUntil(clients.matchAll({type: 'window', includeUncontrolled: true}).then((ws) => { const w = ws.find((x) => 'focus' in x); return w ? w.focus() : clients.openWindow((e.notification.data && e.notification.data.url) || './#today'); })); });
