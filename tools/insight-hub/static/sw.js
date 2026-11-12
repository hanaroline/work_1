// 화면 껍데기만 저장해 두고, 자료(/api/...)는 저장하지 않는다 — 기기에 내부 자료가 남지 않게.
const CACHE = "insight-shell-v3";
const SHELL = ["/", "/manifest.webmanifest", "/icon.svg", "/icon-192.png", "/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin || u.pathname.startsWith("/api/")) return;
  // 네트워크 먼저, 끊겼을 때만 저장본
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok && SHELL.includes(u.pathname)) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); }
    return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match("/"))));
});
