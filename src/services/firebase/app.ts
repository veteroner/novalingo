/**
 * Firebase App Initialization
 *
 * Tüm Firebase servislerinin merkezi başlatma noktası.
 * Emülatör desteği dahil.
 */

import { isNative } from '@/utils/platform';
import * as Sentry from '@sentry/react';
import { getAnalytics, type Analytics } from 'firebase/analytics';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider, type AppCheck } from 'firebase/app-check';
import {
  connectAuthEmulator,
  getAuth,
  indexedDBLocalPersistence,
  initializeAuth,
  inMemoryPersistence,
  type Auth,
} from 'firebase/auth';
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
  type Firestore,
} from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions, type Functions } from 'firebase/functions';
import { connectStorageEmulator, getStorage, type FirebaseStorage } from 'firebase/storage';

const env = import.meta.env as Record<string, string | undefined>;
const useEmulators = env.VITE_USE_EMULATORS === 'true';
const recaptchaSiteKey = env.VITE_RECAPTCHA_SITE_KEY?.trim() ?? '';

// Firebase config — environment variables'dan
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY?.trim() ?? '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN?.trim() ?? '',
  projectId: env.VITE_FIREBASE_PROJECT_ID?.trim() ?? '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET?.trim() ?? '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? '',
  appId: env.VITE_FIREBASE_APP_ID?.trim() ?? '',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID?.trim() ?? '',
};

const requiredFirebaseConfigEntries = [
  ['VITE_FIREBASE_API_KEY', firebaseConfig.apiKey],
  ['VITE_FIREBASE_AUTH_DOMAIN', firebaseConfig.authDomain],
  ['VITE_FIREBASE_PROJECT_ID', firebaseConfig.projectId],
  ['VITE_FIREBASE_STORAGE_BUCKET', firebaseConfig.storageBucket],
  ['VITE_FIREBASE_MESSAGING_SENDER_ID', firebaseConfig.messagingSenderId],
  ['VITE_FIREBASE_APP_ID', firebaseConfig.appId],
] as const;

// Singleton instances
let app: FirebaseApp | undefined;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let functions: Functions;
let analytics: Analytics | null = null;
let appCheck: AppCheck | null = null;

function getMissingFirebaseConfigKeys(): string[] {
  return requiredFirebaseConfigEntries.filter(([, value]) => !value).map(([name]) => name);
}

function initializeFirebase() {
  if (app) return;

  const missingFirebaseConfigKeys = getMissingFirebaseConfigKeys();

  if (missingFirebaseConfigKeys.length > 0) {
    throw new Error(
      `[Firebase] Missing required Vite env vars: ${missingFirebaseConfigKeys.join(', ')}`,
    );
  }

  app = initializeApp(firebaseConfig);

  // App Check — emülatörde devre dışı, geliştirmede debug token, üretimde reCAPTCHA v3
  if (!useEmulators && recaptchaSiteKey) {
    if (import.meta.env.DEV) {
      (self as unknown as Record<string, unknown>).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } else if (!useEmulators && import.meta.env.DEV) {
    console.warn('[Firebase] App Check skipped because VITE_RECAPTCHA_SITE_KEY is missing.');
  }

  try {
    if (useEmulators) {
      auth = initializeAuth(app, { persistence: inMemoryPersistence });
    } else if (isNative()) {
      // WKWebView'de getAuth() persistence algılaması asılabilir — explicit persistence kullan
      auth = initializeAuth(app, { persistence: indexedDBLocalPersistence });
    } else {
      auth = getAuth(app);
    }
  } catch (error) {
    throw new Error(
      '[Firebase] Auth initialization failed. Check VITE_FIREBASE_API_KEY and related Firebase web config values.',
      { cause: error },
    );
  }

  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentSingleTabManager(undefined) }),
    // WKWebView/Capacitor can hang with Firestore's default streaming transport.
    // Force the more compatible polling path on native shells.
    experimentalAutoDetectLongPolling: isNative(),
  });
  storage = getStorage(app);
  functions = getFunctions(app, 'europe-west1');

  // Analytics sadece production'da ve measurementId varsa
  if (import.meta.env.VITE_APP_ENV === 'production' && firebaseConfig.measurementId) {
    try {
      analytics = getAnalytics(app);
    } catch (e) {
      console.warn('[Firebase] Analytics initialization failed:', e);
    }
  }

  // Emülatör bağlantıları
  if (useEmulators) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  }
}

// İlk yüklenmede başlat
try {
  initializeFirebase();
} catch (error) {
  if (import.meta.env.DEV) console.error('[Firebase] Initialization failed:', error);
  Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
    extra: { context: '[Firebase] Initialization failed' },
  });
}

export { analytics, app, appCheck, auth, db, functions, storage };
