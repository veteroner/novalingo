/**
 * Shared admin SDK initialization and utility helpers
 * for all Cloud Functions.
 */

import * as admin from 'firebase-admin';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';

// Initialize once
if (!admin.apps.length) {
  admin.initializeApp();
}

export const db = getFirestore();
export const auth = admin.auth();
export const storage = admin.storage();
export const messaging = admin.messaging();

/** Firestore server timestamp */
export const serverTimestamp = FieldValue.serverTimestamp;
export const increment = FieldValue.increment;
export const arrayUnion = FieldValue.arrayUnion;
export const arrayRemove = FieldValue.arrayRemove;

/** Default region for all functions */
export const REGION = 'europe-west1';

/** Shared options for onCall callables — disables AppCheck in emulator */
const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';
export const callableOpts = { region: REGION, enforceAppCheck: !isEmulator };

/** Verify that the caller is authenticated */
export function requireAuth(context: { auth?: { uid: string } }): string {
  if (!context.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }
  return context.auth.uid;
}

/** Verify caller owns the child profile */
export async function requireChildOwnership(
  uid: string,
  childId: string,
): Promise<FirebaseFirestore.DocumentSnapshot> {
  const childDoc = await db.doc(`children/${childId}`).get();
  if (!childDoc.exists) {
    throw new HttpsError('not-found', 'Child profile not found');
  }
  const data = childDoc.data();
  if (data?.parentUid !== uid) {
    throw new HttpsError('permission-denied', 'Not authorized to access this child profile');
  }
  return childDoc;
}

/** Calculate XP required for a given level (Fibonacci-like growth) */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level === 2) return 100;
  let prev = 100;
  let curr = 150;
  for (let i = 3; i <= level; i++) {
    const next = Math.floor(prev + curr * 0.5);
    prev = curr;
    curr = next;
  }
  return curr;
}

/** Get today's date string in YYYY-MM-DD format (UTC+3 for Turkey) */
export function getTodayTR(): string {
  const now = new Date();
  const turkeyOffset = 3 * 60 * 60 * 1000;
  const turkeyTime = new Date(now.getTime() + turkeyOffset);
  return turkeyTime.toISOString().split('T')[0];
}
