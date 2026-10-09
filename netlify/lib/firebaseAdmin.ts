/**
 * Netlify fonksiyonları için Firebase Admin SDK.
 *
 * `FIREBASE_SERVICE_ACCOUNT`: servis hesabı JSON'u (düz metin veya base64).
 * Yalnızca Admin SDK `users.isPremium` ve `subscription*` alanlarını yazabilir;
 * firestore.rules istemcinin bu alanları yazmasını engeller.
 */

import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function loadServiceAccount(): Record<string, string> {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT is not configured');
  const json = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
  return JSON.parse(json) as Record<string, string>;
}

function getAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;
  const account = loadServiceAccount();
  return initializeApp({
    credential: cert({
      projectId: account.project_id,
      clientEmail: account.client_email,
      privateKey: account.private_key,
    }),
  });
}

export function adminAuth() {
  return getAuth(getAdminApp());
}

export function adminDb() {
  return getFirestore(getAdminApp());
}
