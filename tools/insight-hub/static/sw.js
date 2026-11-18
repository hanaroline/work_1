// 화면 껍데기만 저장해 두고, 자료(/api/...)는 저장하지 않는다 — 기기에 내부 자료가 남지 않게.
const CACHE = "insight-shell-v38";
const SHELL = ["/", "/classic", "/new", "/manifest.webmanifest", "/icon.svg", "/icon-192.png", "/icon-512.png"];
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

// ── 새 글 알림 ── 서버가 암호화해 보낸 알림을 받아 띄운다(내용은 이 기기에서만 풀린다)
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "새 글", {
    body: d.body || "", tag: d.tag || undefined, icon: "/icon-192.png", data: { url: d.url || "/" },
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "/", self.location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    const c = list.find(w => new URL(w.url).origin === self.location.origin);
    if (c) { c.postMessage({ open: url }); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
// 브라우저가 구독을 바꿔 버리면(드묾) 새 구독을 서버에 다시 알린다
self.addEventListener("pushsubscriptionchange", e => {
  const opts = e.oldSubscription && e.oldSubscription.options;
  if (!opts) return;
  e.waitUntil(self.registration.pushManager.subscribe(opts).then(sub => fetch("/api/push/subscribe", {
    method: "POST", credentials: "same-origin",
    headers: { "X-Insight": "1", "Content-Type": "application/json" }, body: JSON.stringify(sub.toJSON()),
  })).catch(() => {}));
});
