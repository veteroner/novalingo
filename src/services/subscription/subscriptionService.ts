/**
 * Subscription Service
 *
 * Native App Store / Google Play billing via cordova-plugin-purchase v13.
 *
 * PURCHASE FLOW:
 *  1. App calls initializeStore() on launch (via useAppInit).
 *  2. User taps "Satın Al" → purchaseSubscription() opens the native payment sheet.
 *  3. User completes payment in the OS sheet.
 *  4. cordova-plugin-purchase calls: approved() → finish() → finished().
 *  5. finished() grants isPremium in Firestore immediately for instant UI feedback.
 *  6. Apple/Google server also sends a webhook (→ appleNotification / googleNotification
 *     Firebase Functions) which handles renewals, expirations and cancellations.
 *
 * LINKING USERS TO WEBHOOKS:
 *  We pass the Firebase UID as `applicationUsername` when ordering.
 *  iOS stores this as `appAccountToken`; Android as `obfuscatedExternalAccountId`.
 *  This allows the backend webhook to find the correct Firestore user document.
 *
 * VALIDATOR:
 *  We skip server-side receipt validation for MVP — StoreKit / Play Billing
 *  validate the receipt on the device. Add a validator URL to store.validator
 *  when you need cross-device receipt checks.
 */

import { IAP_PRODUCTS, type IAPProductId } from '@/config/constants';
import { Capacitor } from '@capacitor/core';
import { auth, db, functions } from '@services/firebase/app';
import 'cordova-plugin-purchase'; // injects CdvPurchase global namespace + types
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

export type PurchaseResult =
  | { status: 'success' }
  | { status: 'cancelled' }
  | { status: 'error'; message: string }
  | { status: 'store_redirect' }; // native sheet is open; completion via Firestore listener

let storeInitialized = false;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Write isPremium: true to Firestore after a confirmed purchase. */
async function grantPremiumLocally(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  await updateDoc(doc(db, 'users', uid), { isPremium: true });
}

/** Read Firestore to check premium state (fallback for restore flow). */
async function readPremiumFromFirestore(): Promise<PurchaseResult> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const uid = auth.currentUser?.uid;
  if (!uid) return { status: 'error', message: 'Giriş yapmanız gerekiyor.' };
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const snap = await getDoc(doc(db, 'users', uid));
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (snap.exists() && (snap.data()?.isPremium as boolean) === true) {
      return { status: 'success' };
    }
    return { status: 'error', message: 'Aktif abonelik bulunamadı.' };
  } catch {
    return { status: 'error', message: 'Bağlantı hatası. Lütfen tekrar deneyin.' };
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Initialize the store. Called once on app start via useAppInit.
 * No-op on web.
 */
export function initializeStore(): void {
  const platform = Capacitor.getPlatform();
  if (platform !== 'ios' && platform !== 'android') return;
  if (storeInitialized) return;

  const { store, Platform, ProductType, LogLevel } = CdvPurchase;

  store.verbosity = import.meta.env.PROD ? LogLevel.WARNING : LogLevel.DEBUG;

  // Register products declared in App Store Connect / Google Play Console.
  const storePlatform = platform === 'ios' ? Platform.APPLE_APPSTORE : Platform.GOOGLE_PLAY;

  store.register([
    { id: IAP_PRODUCTS.MONTHLY, type: ProductType.PAID_SUBSCRIPTION, platform: storePlatform },
    { id: IAP_PRODUCTS.YEARLY, type: ProductType.PAID_SUBSCRIPTION, platform: storePlatform },
  ]);

  // Skip server validator for MVP — finish approved transactions directly.
  store.when().approved((transaction) => {
    void transaction.finish();
  });

  // After a transaction is fully finished, grant premium immediately.
  // The backend webhook will also fire and can set premiumExpiresAt.
  store.when().finished((transaction) => {
    void grantPremiumLocally();

    // Android: register the purchaseToken → UID mapping in Firestore so that the
    // googleNotification webhook can resolve which user to update on renewals/cancellations.
    if (Capacitor.getPlatform() === 'android') {
      const productId = transaction.products[0]?.id ?? '';
      // parentReceipt is CdvPurchase.GooglePlay.Receipt on Android — cast to access purchaseToken
      const purchaseToken = (transaction.parentReceipt as CdvPurchase.GooglePlay.Receipt)
        ?.purchaseToken;
      if (purchaseToken && productId) {
        const registerFn = httpsCallable(functions, 'registerAndroidPurchase');
        void registerFn({ purchaseToken, productId });
      }
    }
  });

  void store.initialize([storePlatform]);
  storeInitialized = true;
}

/**
 * Open the native subscription purchase sheet for the given product.
 *
 * Returns:
 * - `store_redirect` — native sheet is open; purchase completion fires
 *   grantPremiumLocally() via the finished() callback → Firestore listener
 *   updates the UI automatically.
 * - `cancelled` — user tapped Cancel in the payment sheet.
 * - `error` — product not loaded or unrecoverable store error.
 */
export function purchaseSubscription(productId: IAPProductId): Promise<PurchaseResult> {
  const platform = Capacitor.getPlatform();

  if (platform !== 'ios' && platform !== 'android') {
    return Promise.resolve({ status: 'store_redirect' });
  }

  return new Promise((resolve) => {
    const { store, ErrorCode } = CdvPurchase;

    const product = store.get(productId);
    const offer = product?.getOffer();

    if (!offer) {
      resolve({
        status: 'error',
        message: 'Ürün yüklenemedi. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.',
      });
      return;
    }

    // Pass Firebase UID so Apple/Google can include it in server-side webhooks,
    // allowing our backend functions to match the notification to a Firestore user.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const uid = auth.currentUser?.uid as string | undefined;
    const additionalData: CdvPurchase.AdditionalData = uid ? { applicationUsername: uid } : {};

    void store.order(offer, additionalData).then((error) => {
      if (!error) {
        // Native sheet presented. Purchase result arrives via finished() → Firestore listener.
        resolve({ status: 'store_redirect' });
      } else if (error.code === ErrorCode.PAYMENT_CANCELLED) {
        resolve({ status: 'cancelled' });
      } else {
        resolve({ status: 'error', message: error.message });
      }
    });
  });
}

/**
 * Restore previously purchased subscriptions via the native store.
 * Falls back to reading Firestore if the native restore finds nothing new.
 */
export async function restorePurchases(): Promise<PurchaseResult> {
  const platform = Capacitor.getPlatform();

  if (platform !== 'ios' && platform !== 'android') {
    return { status: 'error', message: "Geri yükleme yalnızca iOS ve Android'de kullanılabilir." };
  }

  const { store } = CdvPurchase;
  const error = await store.restorePurchases();

  if (error) {
    // Native restore failed — fall back to Firestore (webhook may have already granted premium)
    return readPremiumFromFirestore();
  }

  // Restored transactions will fire the approved → finished callbacks above,
  // which update Firestore. Re-read to return a definitive result.
  return readPremiumFromFirestore();
}

/** Dev-only: grant premium manually for testing without a real transaction. */
export async function devGrantPremium(): Promise<void> {
  if (import.meta.env.PROD) return;
  await grantPremiumLocally();
}
