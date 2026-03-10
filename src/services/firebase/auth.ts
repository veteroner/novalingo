/**
 * Firebase Authentication Service
 *
 * Google, Apple Sign-In ve Anonymous auth.
 * COPPA uyumlu — çocuk verisi toplamaz, ebeveyn hesabı üzerinden çalışır.
 */

import {
  signInWithPopup,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  OAuthProvider,
  linkWithPopup,
  type User as FirebaseUser,
  type Unsubscribe,
} from 'firebase/auth';
import { auth } from './app';

const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

/**
 * Google ile giriş yap
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Apple ile giriş yap
 */
export async function signInWithApple(): Promise<FirebaseUser> {
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
export async function linkAnonymousAccount(
  provider: 'google' | 'apple',
): Promise<FirebaseUser> {
  const currentUser = auth.currentUser;
  if (!currentUser?.isAnonymous) {
    throw new Error('Current user is not anonymous');
  }

  const authProvider = provider === 'google' ? googleProvider : appleProvider;
  const result = await linkWithPopup(currentUser, authProvider);
  return result.user;
}

/**
 * Çıkış yap
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Auth state değişikliklerini dinle
 */
export function onAuthChanged(
  callback: (user: FirebaseUser | null) => void,
): Unsubscribe {
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
