const CACHE_NAME = "arcane-last-stand-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./src/styles.css",
  "./dist/main.js",
  "./manifest.webmanifest",
  "./assets/pwa/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys
      .filter((key) => key !== CACHE_NAME)
      .map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(caches.match(event.request).then((cached) => {
    if (cached) return cached;

    return fetch(event.request).then((response) => {
      if (!response || !response.ok || response.type === "opaque") return response;
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match("./index.html"));
  }));
});
