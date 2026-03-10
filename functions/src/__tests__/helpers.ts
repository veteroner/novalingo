/**
 * Shared mock helpers for callable function tests.
 * Mocks onCall to pass through the handler, and provides
 * chainable Firestore mock utilities.
 */
import { vi } from 'vitest';

// ─── HttpsError mock ────────────────────────────────
export class MockHttpsError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'HttpsError';
  }
}

// ─── Firestore document mock ────────────────────────
export function createMockDocRef(data: Record<string, unknown> | null = null) {
  const exists = data !== null;
  const snapshot = {
    exists,
    data: () => data,
    id: 'mock-doc-id',
    ref: {} as FirebaseFirestore.DocumentReference,
  };

  const ref = {
    get: vi.fn().mockResolvedValue(snapshot),
    set: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    collection: vi.fn(),
  };

  // Make ref self-referential for snapshot.ref
  snapshot.ref = ref as unknown as FirebaseFirestore.DocumentReference;

  return { ref, snapshot };
}

// ─── Firestore collection mock ──────────────────────
export function createMockCollectionRef(
  docs: Array<{ id: string; data: Record<string, unknown> }> = [],
) {
  const snapshotDocs = docs.map((d) => {
    const docRef = {
      id: d.id,
      ref: {
        delete: vi.fn().mockResolvedValue(undefined),
        collection: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            get: vi.fn().mockResolvedValue({ empty: true, docs: [], size: 0 }),
          }),
        }),
      },
      data: () => d.data,
      exists: true,
    };
    return docRef;
  });

  return {
    get: vi.fn().mockResolvedValue({
      empty: docs.length === 0,
      docs: snapshotDocs,
      size: docs.length,
    }),
    count: vi.fn().mockReturnValue({
      get: vi.fn().mockResolvedValue({ data: () => ({ count: docs.length }) }),
    }),
    limit: vi.fn().mockReturnValue({
      get: vi.fn().mockResolvedValue({
        empty: docs.length === 0,
        docs: snapshotDocs,
        size: docs.length,
      }),
    }),
    doc: vi.fn().mockReturnValue(createMockDocRef(null).ref),
    where: vi.fn().mockReturnThis(),
  };
}

// ─── Request builder ────────────────────────────────
export function makeRequest(uid: string, data: Record<string, unknown>) {
  return { auth: { uid }, data };
}
