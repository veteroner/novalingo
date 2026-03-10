/**
 * Tests for updateChildProfile callable.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { MockHttpsError, mockUpdate, mockDocRef } = vi.hoisted(() => {
  class MockHttpsError extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  }
  const mockUpdate = vi.fn().mockResolvedValue(undefined);
  const mockDocRef = { update: mockUpdate };
  return { MockHttpsError, mockUpdate, mockDocRef };
});

vi.mock('firebase-functions/v2/https', () => ({
  HttpsError: MockHttpsError,
  onCall: (_opts: unknown, handler: Function) => handler,
}));

vi.mock('../utils/admin', () => ({
  db: { doc: vi.fn(() => mockDocRef) },
  REGION: 'europe-west1',
  callableOpts: { region: 'europe-west1', enforceAppCheck: false },
  requireAuth: vi.fn((req: { auth?: { uid: string } }) => {
    if (!req.auth?.uid) throw new MockHttpsError('unauthenticated', 'Auth required');
    return req.auth.uid;
  }),
  requireChildOwnership: vi.fn().mockResolvedValue(undefined),
  serverTimestamp: vi.fn(() => 'SERVER_TS'),
}));

vi.mock('../utils/validators', () => ({
  validateId: vi.fn((v: string) => {
    if (!v || typeof v !== 'string') throw new MockHttpsError('invalid-argument', 'Invalid id');
    return v;
  }),
  validateString: vi.fn((v: string, _field: string, min: number, max: number) => {
    if (typeof v !== 'string' || v.trim().length < min || v.trim().length > max) {
      throw new MockHttpsError('invalid-argument', 'Invalid string');
    }
    return v.trim();
  }),
}));

import { updateChildProfile } from '../callables/updateChildProfile';

const handler = updateChildProfile as unknown as (
  req: Record<string, unknown>,
) => Promise<Record<string, unknown>>;

function makeReq(data: Record<string, unknown>) {
  return { auth: { uid: 'parent-1' }, data };
}

describe('updateChildProfile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates name only', async () => {
    const result = await handler(makeReq({ childId: 'c1', name: 'Yeni İsim' }));

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Yeni İsim', updatedAt: 'SERVER_TS' }),
    );
    expect(result).toEqual(expect.objectContaining({ childId: 'c1' }));
  });

  it('updates avatarId only', async () => {
    const result = await handler(makeReq({ childId: 'c1', avatarId: 'fox' }));

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ avatarId: 'fox', updatedAt: 'SERVER_TS' }),
    );
    expect(result.childId).toBe('c1');
  });

  it('updates both name and avatarId', async () => {
    await handler(makeReq({ childId: 'c1', name: 'Ali', avatarId: 'cat' }));

    const arg = mockUpdate.mock.calls[0][0];
    expect(arg.name).toBe('Ali');
    expect(arg.avatarId).toBe('cat');
  });

  it('rejects empty avatarId', async () => {
    await expect(handler(makeReq({ childId: 'c1', avatarId: '  ' }))).rejects.toThrow(
      'avatarId must be a non-empty string',
    );
  });

  it('rejects when no fields provided', async () => {
    await expect(handler(makeReq({ childId: 'c1' }))).rejects.toThrow('No fields to update');
  });

  it('rejects unauthenticated request', async () => {
    await expect(handler({ auth: null, data: { childId: 'c1', name: 'X' } })).rejects.toThrow();
  });
});
