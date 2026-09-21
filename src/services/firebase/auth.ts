/**
 * Firebase Authentication Service
 *
 * Google, Apple Sign-In ve Anonymous auth.
 * COPPA uyumlu — çocuk verisi toplamaz, ebeveyn hesabı üzerinden çalışır.
 *
 * Native (iOS/Android): `signInWithPopup` Capacitor WebView'inde ÇALIŞMAZ
 * (açılır pencere açılamaz). Bu yüzden native'de kimlik bilgisi
 * `@capacitor-firebase/authentication` ile telefonun kendi hesap seçicisinden
 * alınır ve Firebase JS SDK'sına `signInWithCredential` ile verilir
 * (skipNativeAuth). Böylece uygulamanın geri kalanı yalnızca JS SDK oturumunu
 * görür. Web'de açılır pencere akışı aynen kullanılır.
 */

import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import {
  signInWithPopup,
  signInWithCredential,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  OAuthProvider,
  linkWithPopup,
  linkWithCredential,
  type AuthCredential,
  type User as FirebaseUser,
  type Unsubscribe,
} from 'firebase/auth';
import { resetParentGate } from '@services/parentGate/parentGateSession';
import { auth } from './app';

const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

/** Kullanıcı native hesap seçiciyi kapattığında fırlatılan hata. */
export const SIGN_IN_CANCELLED_ERROR = 'SIGN_IN_CANCELLED';

/**
 * Kullanıcı hesap seçiciyi kendisi kapattı mı? Bu durumda hata gösterilmez.
 * Native SDK'lar iptali farklı mesajlarla bildirir (Android Credential Manager,
 * iOS GoogleSignIn / ASAuthorization, web popup-closed-by-user).
 */
export function isSignInCancelled(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const code = (error as Error & { code?: string }).code ?? '';
  return (
    error.message === SIGN_IN_CANCELLED_ERROR ||
    code === 'auth/popup-closed-by-user' ||
    code === 'auth/cancelled-popup-request' ||
    /cancel/i.test(error.message)
  );
}

function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Apple ile Giriş yalnızca iOS'ta sunulur: App Store (4.8) Google girişi olan iOS
 * uygulamasında zorunlu tutar; Android ve web için ek Apple Services ID +
 * anahtar yapılandırması gerekir.
 */
export function isAppleSignInAvailable(): boolean {
  return Capacitor.getPlatform() === 'ios';
}

/** Native hesap seçiciden Google kimlik bilgisini alır. */
async function getNativeGoogleCredential(): Promise<AuthCredential> {
  const result = await FirebaseAuthentication.signInWithGoogle({ skipNativeAuth: true });
  const idToken = result.credential?.idToken;
  if (!idToken) throw new Error(SIGN_IN_CANCELLED_ERROR);
  return GoogleAuthProvider.credential(idToken, result.credential?.accessToken);
}

/** Native Apple akışından kimlik bilgisini alır (nonce ile). */
async function getNativeAppleCredential(): Promise<AuthCredential> {
  const result = await FirebaseAuthentication.signInWithApple({ skipNativeAuth: true });
  const idToken = result.credential?.idToken;
  if (!idToken) throw new Error(SIGN_IN_CANCELLED_ERROR);
  return new OAuthProvider('apple.com').credential({
    idToken,
    rawNonce: result.credential?.nonce,
  });
}

/**
 * Google ile giriş yap
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  if (isNativePlatform()) {
    const credential = await getNativeGoogleCredential();
    return (await signInWithCredential(auth, credential)).user;
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Apple ile giriş yap
 */
export async function signInWithApple(): Promise<FirebaseUser> {
  if (isNativePlatform()) {
    const credential = await getNativeAppleCredential();
    return (await signInWithCredential(auth, credential)).user;
  }
  const result = await signInWithPopup(auth, appleProvider);
  return result.user;
}

/**
 * Anonim giriş (hızlı başlangıç)
 */
export async function signInAnonymousUser(): Promise<FirebaseUser> {
  const result = await signInAnonymously(auth);
  return result.user;
}

/**
 * Anonim hesabı kalıcı hesaba bağla
 */
export async function linkAnonymousAccount(provider: 'google' | 'apple'): Promise<FirebaseUser> {
  const currentUser = auth.currentUser;
  if (!currentUser?.isAnonymous) {
    throw new Error('Current user is not anonymous');
  }

  if (isNativePlatform()) {
    const credential =
      provider === 'google' ? await getNativeGoogleCredential() : await getNativeAppleCredential();
    return (await linkWithCredential(currentUser, credential)).user;
  }

  const authProvider = provider === 'google' ? googleProvider : appleProvider;
  const result = await linkWithPopup(currentUser, authProvider);
  return result.user;
}

/**
 * Çıkış yap
 */
export async function signOut(): Promise<void> {
  // Ebeveyn kapısı doğrulaması oturuma bağlıdır; çıkışta sıfırlanmalı.
  resetParentGate();
  if (isNativePlatform()) {
    // Native Google/Apple oturumunu da kapat; aksi halde bir sonraki girişte
    // hesap seçici açılmadan önceki hesapla devam eder.
    await FirebaseAuthentication.signOut().catch(() => undefined);
  }
  await firebaseSignOut(auth);
}

/**
 * Auth state değişikliklerini dinle
 */
export function onAuthChanged(callback: (user: FirebaseUser | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

/**
 * Geçerli kullanıcıyı getir
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

/**
 * ID token al (Cloud Functions çağrıları için)
 */
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}
