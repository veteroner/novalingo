/**
 * Tests for setParentPin callable.
 */
import { createHash, randomBytes } from 'crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Hoisted so vi.mock factories can reference them
const { MockHttpsError, mockGet, mockUpdate, mockDocRef } = vi.hoisted(() => {
  class MockHttpsError extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  }
  const mockGet = vi.fn();
  const mockUpdate = vi.fn();
  const mockDocRef = { get: mockGet, update: mockUpdate };
  return { MockHttpsError, mockGet, mockUpdate, mockDocRef };
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
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
}));

// Import after mocks
import { setParentPin } from '../callables/setParentPin';

// The handler (onCall is mocked to pass through)
const handler = setParentPin as unknown as (
  request: Record<string, unknown>,
) => Promise<{ success: boolean }>;

describe('setParentPin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sets PIN for user without existing PIN', async () => {
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({ settings: {} }),
    });
    mockUpdate.mockResolvedValue(undefined);

    const result = await handler({
      auth: { uid: 'user1' },
      data: { pin: '1234' },
    });

    expect(result.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledOnce();

    // Verify hash and salt are stored
    const updateArg = mockUpdate.mock.calls[0][0];
    expect(updateArg['settings.parentPinHash']).toBeDefined();
    expect(updateArg['settings.parentPinSalt']).toBeDefined();
    expect(updateArg['settings.parentPin']).toBe('****');
  });

  it('rejects non-4-digit PIN', async () => {
    await expect(handler({ auth: { uid: 'user1' }, data: { pin: '123' } })).rejects.toThrow(
      'PIN must be exactly 4 digits',
    );

    await expect(handler({ auth: { uid: 'user1' }, data: { pin: 'abcd' } })).rejects.toThrow(
      'PIN must be exactly 4 digits',
    );

    await expect(handler({ auth: { uid: 'user1' }, data: { pin: '12345' } })).rejects.toThrow(
      'PIN must be exactly 4 digits',
    );
  });

  it('rejects unauthenticated request', async () => {
    await expect(handler({ data: { pin: '1234' } })).rejects.toThrow('Authentication required');
  });

  it('requires current PIN when PIN already set', async () => {
    const salt = randomBytes(16).toString('hex');
    const existingHash = createHash('sha256')
      .update(salt + '9999')
      .digest('hex');

    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({
        settings: { parentPinHash: existingHash, parentPinSalt: salt },
      }),
    });

    // No currentPin provided
    await expect(handler({ auth: { uid: 'user1' }, data: { pin: '1234' } })).rejects.toThrow(
      'Current PIN required',
    );
  });

  it('rejects wrong current PIN', async () => {
    const salt = randomBytes(16).toString('hex');
    const existingHash = createHash('sha256')
      .update(salt + '9999')
      .digest('hex');

    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({
        settings: { parentPinHash: existingHash, parentPinSalt: salt },
      }),
    });

    await expect(
      handler({
        auth: { uid: 'user1' },
        data: { pin: '1234', currentPin: '0000' },
      }),
    ).rejects.toThrow('Current PIN is incorrect');
  });

  it('accepts correct current PIN and changes PIN', async () => {
    const salt = randomBytes(16).toString('hex');
    const existingHash = createHash('sha256')
      .update(salt + '9999')
      .digest('hex');

    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({
        settings: { parentPinHash: existingHash, parentPinSalt: salt },
      }),
    });
    mockUpdate.mockResolvedValue(undefined);

    const result = await handler({
      auth: { uid: 'user1' },
      data: { pin: '1234', currentPin: '9999' },
    });

    expect(result.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledOnce();
  });

  it('throws not-found when user does not exist', async () => {
    mockGet.mockResolvedValue({ exists: false, data: () => null });

    await expect(handler({ auth: { uid: 'user1' }, data: { pin: '1234' } })).rejects.toThrow(
      'User not found',
    );
  });
});
