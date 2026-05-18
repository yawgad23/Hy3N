export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then((swRegistration) => {
        console.log('Service Worker registered successfully:', swRegistration);
        
        // Check for updates periodically
        setInterval(() => {
          swRegistration.update();
        }, 60000); // Check every minute
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  }
}

export default registerServiceWorker;