export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => {
        console.log('Service Worker registered successfully');
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  }
}

export default registerServiceWorker;