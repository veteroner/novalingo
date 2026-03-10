/**
 * Test setup for Firebase Cloud Functions.
 * Mocks firebase-admin to prevent actual initialization.
 */
import { vi } from 'vitest';

// Mock firebase-admin globally so any module importing it won't try to initialize.
// `import * as admin from 'firebase-admin'` expects named exports.
vi.mock('firebase-admin', () => {
  const firestoreMock: Record<string, unknown> = {};
  const firestoreFn = Object.assign(() => firestoreMock, {
    FieldValue: {
      serverTimestamp: () => 'SERVER_TIMESTAMP',
      increment: (n: number) => n,
      arrayUnion: (...args: unknown[]) => args,
      arrayRemove: (...args: unknown[]) => args,
    },
  });

  const mod = {
    apps: [{ name: 'mock' }],
    initializeApp: vi.fn(),
    firestore: firestoreFn,
    auth: () => ({ deleteUser: vi.fn() }),
    storage: () => ({}),
    messaging: () => ({}),
  };

  return { ...mod, default: mod };
});

// Mock firebase-admin/firestore separately (admin.ts imports from this path)
vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  FieldValue: {
    serverTimestamp: () => 'SERVER_TIMESTAMP',
    increment: (n: number) => n,
    arrayUnion: (...args: unknown[]) => args,
    arrayRemove: (...args: unknown[]) => args,
  },
}));

// Mock rate limiter globally — no-op in tests
vi.mock('../utils/rateLimit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue(undefined),
  RATE_LIMITS: {
    sensitive: { maxCalls: 5, windowSeconds: 300 },
    write: { maxCalls: 20, windowSeconds: 60 },
    read: { maxCalls: 60, windowSeconds: 60 },
    monetary: { maxCalls: 10, windowSeconds: 300 },
  },
}));
