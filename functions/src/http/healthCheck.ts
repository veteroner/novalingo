/**
 * Simple health check endpoint.
 * Returns service status and timestamp.
 */

import { onRequest } from 'firebase-functions/v2/https';
import { db, REGION } from '../utils/admin';

export const healthCheck = onRequest({ region: REGION }, async (_req, res) => {
  let firestoreOk = false;
  try {
    // Quick Firestore connectivity test
    await db.doc('_health/ping').get();
    firestoreOk = true;
  } catch {
    firestoreOk = false;
  }

  const status = firestoreOk ? 'ok' : 'degraded';
  const code = firestoreOk ? 200 : 503;

  res.status(code).json({
    status,
    timestamp: Date.now(),
    services: {
      firestore: firestoreOk ? 'ok' : 'error',
    },
  });
});
