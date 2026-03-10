/**
 * Firebase App Initialization
 *
 * Tüm Firebase servislerinin merkezi başlatma noktası.
 * Emülatör desteği dahil.
 */

import { getAnalytics, type Analytics } from 'firebase/analytics';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider, type AppCheck } from 'firebase/app-check';
import {
  connectAuthEmulator,
  getAuth,
  initializeAuth,
  inMemoryPersistence,
  type Auth,
} from 'firebase/auth';
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions, type Functions } from 'firebase/functions';
import { connectStorageEmulator, getStorage, type FirebaseStorage } from 'firebase/storage';

const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true';
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim() ?? '';

// Firebase config — environment variables'dan
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim() ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim() ?? '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID?.trim() ?? '',
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
  } else if (!useEmulators) {
    console.warn('[Firebase] App Check skipped because VITE_RECAPTCHA_SITE_KEY is missing.');
  }

  try {
    auth = useEmulators ? initializeAuth(app, { persistence: inMemoryPersistence }) : getAuth(app);
  } catch (error) {
    throw new Error(
      '[Firebase] Auth initialization failed. Check VITE_FIREBASE_API_KEY and related Firebase web config values.',
      { cause: error },
    );
  }

  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
  storage = getStorage(app);
  functions = getFunctions(app, 'europe-west1');

  // Analytics sadece production'da
  if (import.meta.env.VITE_APP_ENV === 'production') {
    analytics = getAnalytics(app);
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
initializeFirebase();

export { analytics, app, appCheck, auth, db, functions, storage };
