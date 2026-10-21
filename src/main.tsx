import '@/i18n';
import '@/styles/globals.css';

import { AgeScreenGate } from '@/features/auth/screens/AgeScreenGate';
import { LoadingScreen } from '@components/atoms/Spinner/LoadingScreen';
import { createLogger, installGlobalErrorHandlers } from '@/utils/logger';
import { getPlatform, isNative } from '@/utils/platform';
import { lazy, StrictMode, Suspense } from 'react';

import { createRoot } from 'react-dom/client';

const BootstrapApp = lazy(() => import('@/app/BootstrapApp'));

// Yakalanmamış hata/promise dinleyicileri — React hiç mount olmadan patlarsa tek kaynağımız bu
installGlobalErrorHandlers();

const log = createLogger('boot');

log.step('uygulama başlıyor', {
  platform: getPlatform(),
  native: isNative(),
  appEnv: import.meta.env.VITE_APP_ENV ?? 'unset',
  mode: import.meta.env.MODE,
  version: __APP_VERSION__,
  online: navigator.onLine,
});

/**
 * Service worker.
 *
 * Web'de PWA kurulabilirliği için gerekli. **Native kabukta ise zararlı:** `sw.js`
 * app shell'i (`/`, `/index.html`) cache-first sunar; WKWebView de uygulamayı
 * `https://localhost` üzerinden servis ettiği için yeni bir build yüklense bile
 * eski `index.html` (ve onun işaret ettiği eski hash'li asset'ler) önbellekten
 * dönmeye devam eder — yani cihazda "düzelttiğim hata hâlâ duruyor" tablosu.
 * Bu yüzden native'de kaydetmiyor, daha önce kaydolmuş olanı da temizliyoruz.
 */
if ('serviceWorker' in navigator) {
  if (isNative()) {
    void (async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length > 0) {
          log.warn('native kabukta eski service worker bulundu — kaldırılıyor', {
            count: registrations.length,
          });
          await Promise.all(registrations.map((registration) => registration.unregister()));
        }
        if ('caches' in window) {
          const keys = await caches.keys();
          if (keys.length > 0) {
            log.warn('service worker önbellekleri siliniyor', { keys });
            await Promise.all(keys.map((key) => caches.delete(key)));
          }
        }
      } catch (error) {
        log.warn('service worker temizliği başarısız', { error });
      }
    })();
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
        // SW kaydı başarısız olsa da uygulama çalışır
        log.warn('service worker kaydı başarısız', { error });
      });
    });
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Check index.html has <div id="root">.');
}

// Firebase başlatılamadıysa (ör. eksik yapılandırma), uygulamayı mount edip
// çökmek yerine net bir hata ekranı göster.
createRoot(rootElement).render(
  <StrictMode>
    <AgeScreenGate>
      <Suspense fallback={<LoadingScreen />}>
        <BootstrapApp />
      </Suspense>
    </AgeScreenGate>
  </StrictMode>,
);
