/**
 * Sets or updates the parent's PIN code for the parental gate.
 * PIN is hashed with SHA-256 + random salt before storage.
 */

import { createHash, randomBytes } from 'crypto';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { callableOpts, db, requireAuth, serverTimestamp } from '../utils/admin';
import { checkRateLimit, RATE_LIMITS } from '../utils/rateLimit';

function hashPin(pin: string, salt: string): string {
  return createHash('sha256')
    .update(salt + pin)
    .digest('hex');
}

export const setParentPin = onCall(callableOpts, async (request) => {
  const uid = requireAuth(request);
  await checkRateLimit(uid, 'setParentPin', RATE_LIMITS.sensitive);
  const { pin, currentPin } = request.data as { pin: string; currentPin?: string };

  // Validate new PIN: exactly 4 digits
  if (typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
    throw new HttpsError('invalid-argument', 'PIN must be exactly 4 digits');
  }

  const userRef = db.doc(`users/${uid}`);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw new HttpsError('not-found', 'User not found');
  }

  const userData = userDoc.data()!;
  const existingPin = userData.settings?.parentPinHash as string | undefined;
  const existingSalt = userData.settings?.parentPinSalt as string | undefined;

  // If PIN already set, require current PIN to change it
  if (existingPin && existingSalt) {
    if (!currentPin || typeof currentPin !== 'string') {
      throw new HttpsError('permission-denied', 'Current PIN required to change PIN');
    }
    const currentHash = hashPin(currentPin, existingSalt);
    if (currentHash !== existingPin) {
      throw new HttpsError('permission-denied', 'Current PIN is incorrect');
    }
  }

  // Generate new salt and hash
  const salt = randomBytes(16).toString('hex');
  const pinHash = hashPin(pin, salt);

  await userRef.update({
    'settings.parentPinHash': pinHash,
    'settings.parentPinSalt': salt,
    'settings.parentPin': pin.replace(/./g, '*'), // Store masked version for UI reference
    updatedAt: serverTimestamp(),
  });

  return { success: true };
});
