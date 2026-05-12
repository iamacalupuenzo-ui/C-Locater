import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (import.meta.env.DEV && typeof window !== 'undefined') {
  if ('serviceWorker' in navigator) {
    void navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .catch(() => undefined);
  }

  if ('caches' in window) {
    void caches
      .keys()
      .then((cacheNames) => Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName))))
      .catch(() => undefined);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
