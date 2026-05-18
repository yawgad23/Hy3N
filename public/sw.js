// Service Worker for HY3N Push Notifications
const NOTIFICATION_ICON = "/logo.png";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "HY3N", body: event.data.text() };
    }
  }
  
  const title = data.title || "HY3N Ride";
  const options = {
    body: data.body || "You have a new notification",
    icon: NOTIFICATION_ICON,
    badge: NOTIFICATION_ICON,
    vibrate: [200, 100, 200],
    data: {
      url: data.url || "/rider"
    },
    actions: [
      {
        action: "view",
        title: "View"
      }
    ],
    requireInteraction: false,
    tag: data.tag || "hy3n-notification"
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || "/rider";
  
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
