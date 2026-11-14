const CACHE_NAME = "wasl-islamic-v2";
const STATIC_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/branding/wasl-logo-light.png",
  "/branding/wasl-logo-dark.png",
  "/branding/wasl-icon-light.png",
  "/branding/wasl-icon-dark.png",
  "/branding/favicon/favicon.ico",
  "/branding/favicon/icon-192.png",
  "/branding/favicon/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Never intercept external audio/HLS streams or dynamic API endpoints
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && (url.pathname === "/" || url.pathname.startsWith("/_next/static/"))) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

self.addEventListener("push", (event) => {
  let payload = {
    title: "وصل الإسلامية",
    body: "تذكير إسلامي من منصة وصل",
    url: "/notifications",
    tag: "wasl-reminder",
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    } catch {
      const text = event.data.text();
      if (text) payload.body = text;
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/branding/favicon/android-chrome-192x192.png",
      badge: "/branding/favicon/favicon-32x32.png",
      dir: "rtl",
      lang: "ar",
      tag: payload.tag || "wasl-reminder",
      data: { url: payload.url || "/notifications" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetPath = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client && client.url.includes(self.location.origin)) {
          if ("navigate" in client) {
            return client.navigate(targetPath).then(() => client.focus());
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetPath);
      }
      return undefined;
    })
  );
});
