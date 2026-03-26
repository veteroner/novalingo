/**
 * Vitest Test Setup
 *
 * Global test configuration, mocks, and cleanup.
 */

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, vi } from 'vitest';

// Automatic cleanup after each test
afterEach(() => {
  cleanup();
});

// ─── Global Mocks ────────────────────────────────────────────

// Guard: DOM mocks only when running in a browser-like environment
const isBrowserEnv = typeof window !== 'undefined';

if (isBrowserEnv) {
  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
} // end isBrowserEnv guard for matchMedia

if (isBrowserEnv) {
  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
} // end isBrowserEnv guard for observers

// Mock crypto.getRandomValues
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
    randomUUID: () => '00000000-0000-4000-8000-000000000000',
  },
});

// Mock Howler.js
vi.mock('howler', () => ({
  Howl: vi.fn().mockImplementation(() => ({
    play: vi.fn(),
    pause: vi.fn(),
    stop: vi.fn(),
    volume: vi.fn(),
    mute: vi.fn(),
    fade: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    unload: vi.fn(),
  })),
  Howler: {
    volume: vi.fn(),
    mute: vi.fn(),
  },
}));

// Mock Capacitor
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: () => false,
    getPlatform: () => 'web',
  },
}));

vi.mock('@capacitor/haptics', () => ({
  Haptics: {
    impact: vi.fn(),
    notification: vi.fn(),
    vibrate: vi.fn(),
  },
  ImpactStyle: { Light: 'LIGHT', Medium: 'MEDIUM', Heavy: 'HEAVY' },
  NotificationType: { Success: 'SUCCESS', Warning: 'WARNING', Error: 'ERROR' },
}));

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApp: vi.fn(),
  getApps: vi.fn(() => []),
}));

vi.mock('firebase/app-check', () => ({
  initializeAppCheck: vi.fn(),
  ReCaptchaV3Provider: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  initializeAuth: vi.fn(() => ({})),
  inMemoryPersistence: {},
  signInWithPopup: vi.fn(),
  signInAnonymously: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  OAuthProvider: vi.fn(),
  connectAuthEmulator: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  initializeFirestore: vi.fn(() => ({})),
  persistentLocalCache: vi.fn(() => ({})),
  persistentMultipleTabManager: vi.fn(() => ({})),
  persistentSingleTabManager: vi.fn(() => ({})),
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  enableIndexedDbPersistence: vi.fn(),
  connectFirestoreEmulator: vi.fn(),
}));

vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(),
  httpsCallable: vi.fn(),
  connectFunctionsEmulator: vi.fn(),
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(),
  ref: vi.fn(),
  getDownloadURL: vi.fn(),
  uploadBytes: vi.fn(),
  deleteObject: vi.fn(),
  connectStorageEmulator: vi.fn(),
  listAll: vi.fn(),
}));

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'tr', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

// Mock framer-motion (simplified for tests)
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: ReactNode }) => children,
  };
});

// eslint-disable-next-line no-console
console.log('✅ Test setup loaded');
