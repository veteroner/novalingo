/**
 * auth — native (Capacitor) ve web giriş akışları.
 *
 * Native'de `signInWithPopup` WebView içinde çalışmaz; kimlik bilgisi
 * `@capacitor-firebase/authentication` ile alınıp `signInWithCredential` ile
 * Firebase JS SDK'sına verilmelidir.
 */

import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const platform = vi.hoisted(() => ({ current: 'web' as 'web' | 'ios' | 'android' }));

// Metot yerine bağımsız mock fonksiyonlar (eslint unbound-method).
const native = vi.hoisted(() => ({
  signInWithGoogle: vi.fn(),
  signInWithApple: vi.fn(),
  signOut: vi.fn(() => Promise.resolve()),
}));
const googleCredential = vi.hoisted(() => vi.fn(() => 'google-credential'));

vi.mock('@capacitor-firebase/authentication', () => ({ FirebaseAuthentication: native }));

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: () => platform.current !== 'web',
    getPlatform: () => platform.current,
  },
}));

vi.mock('../app', () => ({ auth: { name: 'test-auth' } }));

vi.mock('@services/parentGate/parentGateSession', () => ({ resetParentGate: vi.fn() }));

const {
  SIGN_IN_CANCELLED_ERROR,
  isAppleSignInAvailable,
  isSignInCancelled,
  signInWithApple,
  signInWithGoogle,
  signOut,
} = await import('../auth');

const fakeUser = { uid: 'u1' };

describe('auth — Google girişi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    platform.current = 'web';
    vi.mocked(signInWithCredential).mockResolvedValue({ user: fakeUser } as never);
    vi.mocked(signInWithPopup).mockResolvedValue({ user: fakeUser } as never);
    (GoogleAuthProvider as unknown as { credential: unknown }).credential = googleCredential;
  });

  it("web'de açılır pencere kullanır", async () => {
    const user = await signInWithGoogle();
    expect(signInWithPopup).toHaveBeenCalledTimes(1);
    expect(native.signInWithGoogle).not.toHaveBeenCalled();
    expect(user).toBe(fakeUser);
  });

  it("native'de hesap seçiciden gelen idToken ile giriş yapar (popup YOK)", async () => {
    platform.current = 'android';
    vi.mocked(native.signInWithGoogle).mockResolvedValue({
      user: null,
      additionalUserInfo: null,
      credential: { providerId: 'google.com', idToken: 'id-123', accessToken: 'acc-456' },
    });

    const user = await signInWithGoogle();

    expect(native.signInWithGoogle).toHaveBeenCalledWith({ skipNativeAuth: true });
    expect(googleCredential).toHaveBeenCalledWith('id-123', 'acc-456');
    expect(signInWithCredential).toHaveBeenCalledWith({ name: 'test-auth' }, 'google-credential');
    expect(signInWithPopup).not.toHaveBeenCalled();
    expect(user).toBe(fakeUser);
  });

  it('idToken gelmezse iptal hatası fırlatır', async () => {
    platform.current = 'ios';
    vi.mocked(native.signInWithGoogle).mockResolvedValue({
      user: null,
      additionalUserInfo: null,
      credential: null,
    });

    await expect(signInWithGoogle()).rejects.toThrow(SIGN_IN_CANCELLED_ERROR);
    expect(signInWithCredential).not.toHaveBeenCalled();
  });
});

describe('auth — Apple girişi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(signInWithCredential).mockResolvedValue({ user: fakeUser } as never);
  });

  it("iOS'ta idToken + nonce ile OAuth kimlik bilgisi oluşturur", async () => {
    platform.current = 'ios';
    const credentialFn = vi.fn(() => 'apple-credential');
    vi.mocked(OAuthProvider).mockImplementation(
      () => ({ addScope: vi.fn(), credential: credentialFn }) as never,
    );
    vi.mocked(native.signInWithApple).mockResolvedValue({
      user: null,
      additionalUserInfo: null,
      credential: { providerId: 'apple.com', idToken: 'apple-id', nonce: 'raw-nonce' },
    });

    await signInWithApple();

    expect(native.signInWithApple).toHaveBeenCalledWith({ skipNativeAuth: true });
    expect(credentialFn).toHaveBeenCalledWith({ idToken: 'apple-id', rawNonce: 'raw-nonce' });
    expect(signInWithCredential).toHaveBeenCalledWith({ name: 'test-auth' }, 'apple-credential');
  });

  it("Apple girişi yalnızca iOS'ta sunulur", () => {
    platform.current = 'ios';
    expect(isAppleSignInAvailable()).toBe(true);
    platform.current = 'android';
    expect(isAppleSignInAvailable()).toBe(false);
    platform.current = 'web';
    expect(isAppleSignInAvailable()).toBe(false);
  });
});

describe('auth — iptal ve çıkış', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('kullanıcı iptallerini tanır, gerçek hataları tanımaz', () => {
    expect(isSignInCancelled(new Error(SIGN_IN_CANCELLED_ERROR))).toBe(true);
    expect(isSignInCancelled(new Error('The user canceled the sign-in flow.'))).toBe(true);
    expect(
      isSignInCancelled(Object.assign(new Error('x'), { code: 'auth/popup-closed-by-user' })),
    ).toBe(true);
    expect(isSignInCancelled(new Error('network-request-failed'))).toBe(false);
    expect(isSignInCancelled('iptal')).toBe(false);
  });

  it("native'de çıkışta native oturumu da kapatır", async () => {
    platform.current = 'android';
    await signOut();
    expect(native.signOut).toHaveBeenCalledTimes(1);
    expect(firebaseSignOut).toHaveBeenCalledTimes(1);
  });

  it("web'de native çıkış çağrılmaz", async () => {
    platform.current = 'web';
    await signOut();
    expect(native.signOut).not.toHaveBeenCalled();
    expect(firebaseSignOut).toHaveBeenCalledTimes(1);
  });
});
