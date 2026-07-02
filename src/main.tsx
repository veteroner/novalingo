import { initSentry } from '@/config/sentry';
import '@/i18n';
import '@/styles/globals.css';

// Initialize Sentry before React renders so it captures all errors
initSentry();

import { App } from '@/app/App';
import { FirebaseConfigError } from '@/app/FirebaseConfigError';
import { firebaseInitError } from '@/services/firebase/app';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Register service worker for PWA installability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW registration failure is non-fatal — app still works
    });
  });
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Check index.html has <div id="root">.');
}

// Firebase başlatılamadıysa (ör. eksik yapılandırma), uygulamayı mount edip
// çökmek yerine net bir hata ekranı göster.
createRoot(rootElement).render(
  <StrictMode>
    {firebaseInitError ? <FirebaseConfigError error={firebaseInitError} /> : <App />}
  </StrictMode>,
);
