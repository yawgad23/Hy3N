import { useEffect } from "react";
import { base44 } from "@/api/base44Client";

export function usePushNotifications() {
  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration.scope);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  const subscribeToPush = async (userId) => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push notifications not supported");
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check for existing subscription
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.log("Notification permission denied");
          return null;
        }

        // Fetch VAPID public key securely from backend
        const { vapidPublicKey } = await base44.functions.invoke("getVapidPublicKey", {});
        if (!vapidPublicKey) {
          console.warn("VAPID key not configured - push notifications disabled");
          return null;
        }
        
        const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
        
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey
        });
      }

      // Send subscription to backend (save to database)
      // await base44.entities.PushSubscription.create({
      //   user_id: userId,
      //   subscription: JSON.stringify(subscription)
      // });

      return subscription;
    } catch (error) {
      console.error("Push subscription error:", error);
      return null;
    }
  };

  const unsubscribeFromPush = async () => {
    if (!("serviceWorker" in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
      }
    } catch (error) {
      console.error("Push unsubscribe error:", error);
    }
  };

  return { subscribeToPush, unsubscribeFromPush };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}