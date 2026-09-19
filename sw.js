const CACHE_NAME = "reforma-profissional-v15-go-live";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=4",
  "./app.js?v=11",
  "./landing-pages.css?v=1",
  "./landing-pages.js?v=1",
  "./eletricista-bh/",
  "./bombeiro-hidraulico-bh/",
  "./ar-condicionado-bh/",
  "./pedreiro-bh/",
  "./marido-de-aluguel-bh/",
  "./solicitar-servico/",
  "./manifest.webmanifest",
  "./icons/brand-icon-192.svg",
  "./icons/brand-icon-512.svg",
  "./icons/brand-icon-maskable-512.svg",
  "./assets/brand/reforma-profissional-logo.svg",
  "./assets/brand/reforma-profissional-mark.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/") || /\/(admin|finance|private|antecedentes|sessao)\b/.test(url.pathname)) return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok && ["document", "script", "style", "image", "manifest"].includes(event.request.destination)) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match("./index.html")))
  );
});
