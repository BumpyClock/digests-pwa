// src/serviceWorkerRegistration.js

// Register the service worker
export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('DOMContentLoaded', () => {
      navigator.serviceWorker
        .register(`${process.env.PUBLIC_URL}/serviceWorker.js`) // Path to the service-worker.js
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);

          // Update found, install the new version immediately
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New update available, prompt user for action (optional)
                  console.log('New content is available; please refresh.');
                } else {
                  // Content cached for offline use
                  console.log('Content is cached for offline use.');
                }
              }
            };
          };
        })
        .catch((error) => {
          console.error('Error during service worker registration:', error);
        });
    });
  }
}

// To unregister the service worker (for dev purposes), uncomment this and switch in `index.js`
// export function unregister() {
//   if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.ready.then((registration) => {
//       registration.unregister();
//     });
//   }
// }