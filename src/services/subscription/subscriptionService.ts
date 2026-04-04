/**
 * Subscription Service
 *
 * Wraps native App Store / Google Play billing.
 *
 * HOW IT WORKS:
 *  1. User taps "7 Gün Ücretsiz Dene" on SubscriptionScreen.
 *  2. This service calls the platform's native purchase sheet (StoreKit 2 / Play Billing).
 *  3. On successful transaction, the OS sends a server-side webhook to our Firebase Function
 *     → the function marks user.isPremium = true in Firestore.
 *  4. The auth listener in AppProviders picks up the Firestore change and refreshes the UI.
 *
 * NATIVE PLUGIN TODO:
 *  Capacitor 6 does not yet have a stable first-party IAP plugin.
 *  When a plugin becomes available (e.g. @capacitor/purchases or a stable community fork),
 *  replace the TODO stubs below with real plugin calls.
 *  Product IDs are defined in src/config/constants.ts → IAP_PRODUCTS.
 *  The 7-day free trial is configured in App Store Connect / Google Play Console — not in code.
 */

import type { IAPProductId } from '@/config/constants';
import { ANDROID_MANAGE_SUBSCRIPTIONS_URL, IOS_MANAGE_SUBSCRIPTIONS_URL } from '@/config/constants';
import { Capacitor } from '@capacitor/core';
import { auth, db } from '@services/firebase/app';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export type PurchaseResult =
  | { status: 'success' }
  | { status: 'cancelled' }
  | { status: 'error'; message: string }
  | { status: 'store_redirect' }; // web / pending IAP plugin

/**
 * Initiate a subscription purchase for the given product ID.
 *
 * On iOS / Android native: currently opens the store's subscription management
 * page until a Capacitor IAP plugin is integrated (see TODO above).
 *
 * On web: shows how to subscribe via mobile stores.
 */
export function purchaseSubscription(_productId: IAPProductId): Promise<PurchaseResult> {
  const platform = Capacitor.getPlatform();

  if (platform === 'ios') {
    // TODO: Replace with native StoreKit 2 purchase call once IAP plugin is integrated.
    // Example (future): await Purchases.purchasePackage({ aPackage: monthlyPackage })
    window.open(IOS_MANAGE_SUBSCRIPTIONS_URL, '_system');
    return Promise.resolve({ status: 'store_redirect' });
  }

  if (platform === 'android') {
    // TODO: Replace with native Play Billing call once IAP plugin is integrated.
    window.open(ANDROID_MANAGE_SUBSCRIPTIONS_URL, '_system');
    return Promise.resolve({ status: 'store_redirect' });
  }

  // Web browser — can't do native IAP; direct users to the mobile app.
  return Promise.resolve({ status: 'store_redirect' });
}

/**
 * Restore previously purchased subscriptions.
 *
 * On native: delegates to the store's restore flow (StoreKit / Play Billing).
 * As a fallback, re-checks the user's Firestore document for isPremium status
 * (which may already have been set by a server-side webhook).
 */
export async function restorePurchases(): Promise<PurchaseResult> {
  // TODO: Replace with native restore call once IAP plugin is integrated.
  // Example (future): await Purchases.restorePurchases()

  // Fallback: re-read Firestore to pick up server-webhook-granted premium status.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const uid = auth.currentUser?.uid;
  if (!uid) return { status: 'error', message: 'Giriş yapmanız gerekiyor.' };

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const snap = await getDoc(doc(db, 'users', uid));
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (snap.exists() && snap.data()?.isPremium === true) {
      return { status: 'success' };
    }
    return { status: 'error', message: 'Aktif abonelik bulunamadı.' };
  } catch {
    return { status: 'error', message: 'Bağlantı hatası. Lütfen tekrar deneyin.' };
  }
}

/**
 * Dev-only helper: manually grant premium for testing without a real IAP transaction.
 * Never called in production builds.
 */
export async function devGrantPremium(): Promise<void> {
  if (import.meta.env.PROD) return;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  await updateDoc(doc(db, 'users', uid), { isPremium: true });
}
