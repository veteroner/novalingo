/**
 * Updates an existing child profile's editable fields (name, avatarId).
 */

import { HttpsError, onCall } from 'firebase-functions/v2/https';
import {
  callableOpts,
  db,
  requireAuth,
  requireChildOwnership,
  serverTimestamp,
} from '../utils/admin';
import { validateId, validateString } from '../utils/validators';

interface UpdateChildRequest {
  childId: string;
  name?: string;
  avatarId?: string;
}

export const updateChildProfile = onCall(callableOpts, async (request) => {
  const uid = requireAuth(request);
  const { childId, name, avatarId } = request.data as UpdateChildRequest;

  const validChildId = validateId(childId, 'childId');
  await requireChildOwnership(uid, validChildId);

  const updates: Record<string, unknown> = { updatedAt: serverTimestamp() };

  if (name !== undefined) {
    updates.name = validateString(name, 'name', 2, 20);
  }

  if (avatarId !== undefined) {
    if (typeof avatarId !== 'string' || avatarId.trim().length === 0) {
      throw new HttpsError('invalid-argument', 'avatarId must be a non-empty string');
    }
    updates.avatarId = avatarId.trim();
  }

  // At least one field must be provided
  if (Object.keys(updates).length <= 1) {
    throw new HttpsError('invalid-argument', 'No fields to update');
  }

  await db.doc(`children/${validChildId}`).update(updates);

  return { childId: validChildId, updated: updates };
});
