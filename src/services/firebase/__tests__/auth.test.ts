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
  reauthenticateWithCredential,
  revokeAccessToken,
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

const fakeAuth = vi.hoisted(() => ({
  name: 'test-auth',
  currentUser: null as null | { isAnonymous: boolean; providerData: { providerId: string }[] },
}));
vi.mock('../app', () => ({ auth: fakeAuth }));

vi.mock('@services/parentGate/parentGateSession', () => ({ resetParentGate: vi.fn() }));

const {
  SIGN_IN_CANCELLED_ERROR,
  isAppleSignInAvailable,
  isSignInCancelled,
  reauthenticateForDeletion,
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
    expect(signInWithCredential).toHaveBeenCalledWith(fakeAuth, 'google-credential');
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
    expect(signInWithCredential).toHaveBeenCalledWith(fakeAuth, 'apple-credential');
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

describe('auth — hesap silme öncesi kimlik tazeleme (App Store 5.1.1(v))', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    platform.current = 'ios';
    (GoogleAuthProvider as unknown as { credential: unknown }).credential = googleCredential;
  });

  it('misafir hesapta hiçbir sağlayıcı açılmaz', async () => {
    fakeAuth.currentUser = { isAnonymous: true, providerData: [] };
    await reauthenticateForDeletion();
    expect(native.signInWithApple).not.toHaveBeenCalled();
    expect(native.signInWithGoogle).not.toHaveBeenCalled();
    expect(reauthenticateWithCredential).not.toHaveBeenCalled();
  });

  it("Apple hesabında kimliği tazeler ve Apple token'ını iptal eder", async () => {
    fakeAuth.currentUser = { isAnonymous: false, providerData: [{ providerId: 'apple.com' }] };
    const credentialFn = vi.fn(() => 'apple-credential');
    vi.mocked(OAuthProvider).mockImplementation(
      () => ({ addScope: vi.fn(), credential: credentialFn }) as never,
    );
    vi.mocked(native.signInWithApple).mockResolvedValue({
      user: null,
      additionalUserInfo: null,
      credential: {
        providerId: 'apple.com',
        idToken: 'apple-id',
        nonce: 'raw-nonce',
        authorizationCode: 'auth-code',
      },
    });

    await reauthenticateForDeletion();

    expect(reauthenticateWithCredential).toHaveBeenCalledWith(
      fakeAuth.currentUser,
      'apple-credential',
    );
    expect(revokeAccessToken).toHaveBeenCalledWith(fakeAuth, 'auth-code');
  });

  it('Google hesabında hesap seçiciden gelen kimlikle tazeler', async () => {
    fakeAuth.currentUser = { isAnonymous: false, providerData: [{ providerId: 'google.com' }] };
    vi.mocked(native.signInWithGoogle).mockResolvedValue({
      user: null,
      additionalUserInfo: null,
      credential: { providerId: 'google.com', idToken: 'id-1', accessToken: 'acc-1' },
    });

    await reauthenticateForDeletion();

    expect(googleCredential).toHaveBeenCalledWith('id-1', 'acc-1');
    expect(reauthenticateWithCredential).toHaveBeenCalledWith(
      fakeAuth.currentUser,
      'google-credential',
    );
    expect(revokeAccessToken).not.toHaveBeenCalled();
  });

  it('kullanıcı onayı iptal ederse tazeleme yapılmaz ve iptal hatası fırlar', async () => {
    fakeAuth.currentUser = { isAnonymous: false, providerData: [{ providerId: 'apple.com' }] };
    vi.mocked(native.signInWithApple).mockResolvedValue({
      user: null,
      additionalUserInfo: null,
      credential: null,
    });

    await expect(reauthenticateForDeletion()).rejects.toThrow(SIGN_IN_CANCELLED_ERROR);
    expect(reauthenticateWithCredential).not.toHaveBeenCalled();
  });
});
