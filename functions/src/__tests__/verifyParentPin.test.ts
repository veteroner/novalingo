/**
 * Tests for verifyParentPin callable.
 */
import { createHash, randomBytes } from 'crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { MockHttpsError, mockGet, mockDocRef } = vi.hoisted(() => {
  class MockHttpsError extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  }
  const mockGet = vi.fn();
  const mockDocRef = { get: mockGet };
  return { MockHttpsError, mockGet, mockDocRef };
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
    if (!req.auth?.uid) throw new MockHttpsError('unauthenticated', 'Authentication required');
    return req.auth.uid;
  }),
}));

import { verifyParentPin } from '../callables/verifyParentPin';

const handler = verifyParentPin as unknown as (
  request: Record<string, unknown>,
) => Promise<{ valid: boolean }>;

describe('verifyParentPin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns valid:true for correct PIN', async () => {
    const salt = randomBytes(16).toString('hex');
    const hash = createHash('sha256')
      .update(salt + '1234')
      .digest('hex');

    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({
        settings: { parentPinHash: hash, parentPinSalt: salt },
      }),
    });

    const result = await handler({
      auth: { uid: 'user1' },
      data: { pin: '1234' },
    });

    expect(result.valid).toBe(true);
  });

  it('throws permission-denied for wrong PIN', async () => {
    const salt = randomBytes(16).toString('hex');
    const hash = createHash('sha256')
      .update(salt + '1234')
      .digest('hex');

    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({
        settings: { parentPinHash: hash, parentPinSalt: salt },
      }),
    });

    await expect(handler({ auth: { uid: 'user1' }, data: { pin: '0000' } })).rejects.toThrow(
      'Incorrect PIN',
    );
  });

  it('throws failed-precondition when no PIN set', async () => {
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({ settings: {} }),
    });

    await expect(handler({ auth: { uid: 'user1' }, data: { pin: '1234' } })).rejects.toThrow(
      'No PIN set',
    );
  });

  it('rejects non-4-digit PIN format', async () => {
    await expect(handler({ auth: { uid: 'user1' }, data: { pin: '12' } })).rejects.toThrow(
      'PIN must be exactly 4 digits',
    );
  });

  it('throws not-found when user does not exist', async () => {
    mockGet.mockResolvedValue({ exists: false, data: () => null });

    await expect(handler({ auth: { uid: 'user1' }, data: { pin: '1234' } })).rejects.toThrow(
      'User not found',
    );
  });

  it('rejects unauthenticated request', async () => {
    await expect(handler({ data: { pin: '1234' } })).rejects.toThrow('Authentication required');
  });
});
