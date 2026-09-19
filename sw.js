const CACHE_NAME = "reforma-profissional-v18-pr30-production-fix";
const APP_SHELL = [
  "/",
  "/index.html",
  "/styles.css?v=7",
  "/app.js?v=13",
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

function expectedContentType(url) {
  const pathname = new URL(url, self.location.origin).pathname;
  if (pathname.endsWith(".css")) return /^text\/css(?:;|$)/i;
  if (pathname.endsWith(".js")) return /^(?:text|application)\/javascript(?:;|$)/i;
  if (pathname.endsWith(".svg")) return /^image\/svg\+xml(?:;|$)/i;
  if (pathname.endsWith(".webmanifest")) return /^(?:application\/manifest\+json|application\/json)(?:;|$)/i;
  if (pathname.endsWith("/") || pathname.endsWith(".html")) return /^text\/html(?:;|$)/i;
  return null;
}

function isCacheable(request, response) {
  if (!response.ok || response.redirected) return false;
  const expected = expectedContentType(request.url || request);
  return !expected || expected.test(response.headers.get("content-type") || "");
}

async function fetchValidated(request) {
  const response = await fetch(request, { cache: "reload" });
  if (!isCacheable(request, response)) {
    throw new Error(`Invalid app-shell response: ${request.url || request}`);
  }
  return response;
}

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(APP_SHELL.map(async asset => {
      const request = new Request(asset, { cache: "reload" });
      const response = await fetchValidated(request);
      await cache.put(request, response);
    }));
  })());
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("reforma-profissional-") && key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/") || /\/(admin|finance|private|antecedentes|sessao)\b/.test(url.pathname)) return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (isCacheable(event.request, response) && ["document", "script", "style", "image", "manifest"].includes(event.request.destination)) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => {
        if (cached) return cached;
        if (event.request.destination === "document") return caches.match("/index.html");
        return Response.error();
      }))
  );
});
