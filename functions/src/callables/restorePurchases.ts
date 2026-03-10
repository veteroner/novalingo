/**
 * restorePurchases
 *
 * Restores purchases for a user by querying RevenueCat subscriber info.
 * Used when a user switches devices or reinstalls the app.
 */

import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { callableOpts, db, requireAuth, serverTimestamp } from '../utils/admin';
import { checkRateLimit, RATE_LIMITS } from '../utils/rateLimit';

const REVENUECAT_API_URL = 'https://api.revenuecat.com/v1';

interface RestorePurchasesRequest {
  platform: 'ios' | 'android';
}

export const restorePurchases = onCall(callableOpts, async (request) => {
  const uid = requireAuth(request);
  await checkRateLimit(uid, 'restorePurchases', RATE_LIMITS.monetary);
  const { platform } = request.data as RestorePurchasesRequest;

  if (!platform || !['ios', 'android'].includes(platform)) {
    throw new HttpsError('invalid-argument', 'Invalid platform');
  }

  const apiKey = process.env.REVENUECAT_API_KEY;
  if (!apiKey) {
    console.error('REVENUECAT_API_KEY not configured');
    throw new HttpsError('internal', 'Payment service not configured');
  }

  try {
    // Get subscriber info from RevenueCat
    const response = await fetch(`${REVENUECAT_API_URL}/subscribers/${encodeURIComponent(uid)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        // No subscriber record — user never purchased
        return {
          entitlements: [],
          isPremium: false,
          expiresAt: null,
        };
      }
      console.error('RevenueCat restore failed:', response.status);
      throw new HttpsError('internal', 'Restore failed');
    }

    const data = await response.json();
    const subscriberInfo = data.subscriber;

    // Extract active entitlements
    const activeEntitlements = Object.entries(subscriberInfo?.entitlements ?? {})
      .filter(([, value]) => {
        const ent = value as { expires_date?: string };
        if (!ent.expires_date) return true; // lifetime
        return new Date(ent.expires_date).getTime() > Date.now();
      })
      .map(([key]) => key);

    const isPremium = activeEntitlements.includes('premium');
    const premiumEntitlement = subscriberInfo?.entitlements?.premium;
    const expiresAt = premiumEntitlement?.expires_date
      ? new Date(premiumEntitlement.expires_date).getTime()
      : null;

    // Update Firestore with restored entitlements
    await db.doc(`users/${uid}`).set(
      {
        subscription: {
          isPremium,
          entitlements: activeEntitlements,
          expiresAt,
          restoredAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
      },
      { merge: true },
    );

    return {
      entitlements: activeEntitlements,
      isPremium,
      expiresAt,
    };
  } catch (err) {
    if (err instanceof HttpsError) throw err;
    console.error('Restore purchases error:', err);
    throw new HttpsError('internal', 'Failed to restore purchases');
  }
});
