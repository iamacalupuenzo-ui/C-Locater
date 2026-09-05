import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {CameraSharePage} from './shared/components/live/CameraSharePage.tsx';
import {getShareParams} from './shared/lib/cameraShare.ts';
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

// Si la URL trae un enlace de cámara compartida, se monta solo la página
// de transmisión (logo + modal) en lugar de la plataforma completa.
const shareParams = getShareParams();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {shareParams ? <CameraSharePage params={shareParams} /> : <App />}
  </StrictMode>,
);
