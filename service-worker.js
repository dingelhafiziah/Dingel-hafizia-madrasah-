/* DINGEL HAFIZIA — retired service worker */
"use strict";

// This project no longer uses a service worker. Existing installations can
// otherwise keep serving an old cached index.html and make GitHub Pages appear
// blank. Clean the old cache and unregister this worker immediately.
self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: "window", includeUncontrolled: true }))
      .then(clients => clients.forEach(client => client.navigate(client.url)))
  );
});
