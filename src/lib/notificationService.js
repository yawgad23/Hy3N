import { toast } from "sonner";

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.warn("This browser does not support notifications");
    return false;
  }
  
  if (Notification.permission === "granted") {
    return true;
  }
  
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  
  return false;
};

// Show browser notification
export const showBrowserNotification = (title, body, icon = "/logo.png") => {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon,
      badge: "/logo.png",
      vibrate: [200, 100, 200],
      requireInteraction: false
    });
  }
};

// Show in-app toast notification
export const showInAppNotification = (type, message, duration = 4000) => {
  switch (type) {
    case "success":
      toast.success(message, { duration });
      break;
    case "error":
      toast.error(message, { duration });
      break;
    case "info":
      toast.info(message, { duration });
      break;
    default:
      toast(message, { duration });
  }
};

// Play notification sound
export const playNotificationSound = () => {
  const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a29x9aBcAAJjZ3H1oFwAAmNncfWgXAAA=");
  audio.play().catch(() => {}); // Silent fail if autoplay blocked
};

// Combined notification (browser + in-app + sound)
export const showNotification = (title, body, type = "info") => {
  showBrowserNotification(title, body);
  showInAppNotification(type, body);
  playNotificationSound();
};