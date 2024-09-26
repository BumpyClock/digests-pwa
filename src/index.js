import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Check user agent and set body background color to transparent if it matches any version of Digest-electron
if (/Digest-electron\/\d+\.\d+\.\d+/.test(navigator.userAgent)) {
  document.body.style.backgroundColor = 'transparent !important';
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
console.log('Registering service worker');
serviceWorkerRegistration.register({
  onUpdate: registration => {
    console.log('New content is available; please refresh.');
  },
  onSuccess: registration => {
    console.log('Content is cached for offline use.');
  },
}).catch(err => {
  console.error('ServiceWorker registration failed in index.js:', err);
  // Store the error in localStorage to check it in index.html
  localStorage.setItem('swRegistrationFailed', 'true');
});