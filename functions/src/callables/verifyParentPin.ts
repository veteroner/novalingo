/**
 * Verifies the parent PIN for the parental gate.
 * Compares against stored hash — never returns the PIN itself.
 */

import { createHash } from 'crypto';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { callableOpts, db, requireAuth } from '../utils/admin';
import { checkRateLimit, RATE_LIMITS } from '../utils/rateLimit';

export const verifyParentPin = onCall(callableOpts, async (request) => {
  const uid = requireAuth(request);
  await checkRateLimit(uid, 'verifyParentPin', RATE_LIMITS.sensitive);
  const { pin } = request.data as { pin: string };

  if (typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
    throw new HttpsError('invalid-argument', 'PIN must be exactly 4 digits');
  }

  const userDoc = await db.doc(`users/${uid}`).get();

  if (!userDoc.exists) {
    throw new HttpsError('not-found', 'User not found');
  }

  const settings = userDoc.data()?.settings;
  const storedHash = settings?.parentPinHash as string | undefined;
  const storedSalt = settings?.parentPinSalt as string | undefined;

  // If no PIN set, deny access (PIN must be set first)
  if (!storedHash || !storedSalt) {
    throw new HttpsError('failed-precondition', 'No PIN set. Please set a PIN first.');
  }

  const inputHash = createHash('sha256')
    .update(storedSalt + pin)
    .digest('hex');
  const valid = inputHash === storedHash;

  if (!valid) {
    throw new HttpsError('permission-denied', 'Incorrect PIN');
  }

  return { valid: true };
});
