const CACHE_NAME = "reforma-profissional-v9";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=3",
  "./payments.js?v=1",
  "./business-rules.js?v=1",
  "./provider.js?v=2",
  "./app.js?v=7",
  "./domain/order-engine.js?v=1",
  "./services/pricing-engine.js?v=1",
  "./services/geo-engine.js?v=1",
  "./services/availability-engine.js?v=1",
  "./services/matching-engine.js?v=1",
  "./services/dispatch-engine.js?v=1",
  "./services/market-balance-engine.js?v=1",
  "./services/reputation-engine.js?v=1",
  "./services/fraud-engine.js?v=1",
  "./services/payment-engine.js?v=1",
  "./services/notification-engine.js?v=1",
  "./services/analytics-engine.js?v=1",
  "./services/audit-engine.js?v=1",
  "./services/event-bus.js?v=1",
  "./repositories/interfaces.js?v=1",
  "./adapters/gestao-click-adapter.js?v=1",
  "./landing-pages.css?v=1",
  "./landing-pages.js?v=1",
  "./eletricista-bh/",
  "./bombeiro-hidraulico-bh/",
  "./ar-condicionado-bh/",
  "./pedreiro-bh/",
  "./marido-de-aluguel-bh/",
  "./solicitar-servico/",
  "./manifest.webmanifest",
  "./icons/icon-192.svg",
  "./icons/icon-512.svg",
  "./icons/icon-maskable-512.svg"
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
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match("./index.html")))
  );
});
