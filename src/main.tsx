import { initSentry } from '@/config/sentry';
import '@/i18n';
import '@/styles/globals.css';

// Initialize Sentry before React renders so it captures all errors
initSentry();

import { App } from '@/app/App';
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

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
