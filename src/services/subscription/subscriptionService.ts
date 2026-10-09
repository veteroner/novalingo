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
 *  5. iOS: approved() sends the transactionId to the Netlify function
 *     `verifyApplePurchase`, which asks the App Store Server API and writes the
 *     entitlement with the Admin SDK; the transaction is finished afterwards.
 *     Android: finished() registers the purchase token with our backend.
 *  6. Backend verification updates the canonical entitlement record.
 *  7. Apple/Google server notifications keep renewals, expirations and billing issues in sync.
 *
 * LINKING USERS TO WEBHOOKS:
 *  We pass the Firebase UID as `applicationUsername` when ordering.
 *  iOS stores this as `appAccountToken`; Android as `obfuscatedExternalAccountId`.
 *  This allows the backend webhook to find the correct Firestore user document.
 *
 * SPARK PLAN:
 *  Cloud Functions are not deployed, so Apple verification runs as a Netlify
 *  function. Native shells call it by absolute URL (capacitor://localhost has
 *  no /.netlify route).
 */

import { IAP_PRODUCTS, type IAPProductId } from '@/config/constants';
import { Capacitor } from '@capacitor/core';
import { auth, db, functions } from '@services/firebase/app';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

export type PurchaseResult =
  | { status: 'success' }
  | { status: 'cancelled' }
  | { status: 'error'; message: string }
  | { status: 'store_redirect' }; // native sheet is open; completion via Firestore listener

let storeInitialized = false;

type PurchaseStorePlatform = string;
type PurchaseProductType = string;
type PurchaseLogLevel = number;
type PurchaseErrorCode = number;

interface PurchaseAdditionalData {
  applicationUsername?: string;
}

interface PurchasePricingPhase {
  /** Mağazadan gelen yerelleştirilmiş fiyat metni (ör. "₺149,99"). */
  price?: string;
  priceMicros?: number;
  currency?: string;
  /** ISO 8601 periyot (ör. "P1M", "P1Y", "P1W"). */
  billingPeriod?: string;
  /** "FreeTrial" | "PayAsYouGo" | "UpFront" */
  paymentMode?: string;
}

interface PurchaseOffer {
  pricingPhases?: PurchasePricingPhase[];
}

interface PurchaseOrderError {
  code: PurchaseErrorCode;
  message: string;
}

interface PurchaseProduct {
  id: string;
}

interface PurchaseReceipt {
  purchaseToken?: string | null;
}

interface PurchaseTransaction {
  finish(): Promise<void>;
  transactionId?: string;
  products: PurchaseProduct[];
  parentReceipt?: PurchaseReceipt | null;
}

interface PurchaseLoadedProduct {
  getOffer(): PurchaseOffer | undefined;
}

interface PurchaseStoreEvents {
  approved(callback: (transaction: PurchaseTransaction) => void): void;
  finished(callback: (transaction: PurchaseTransaction) => void): void;
  productUpdated(callback: () => void): void;
}

interface PurchaseStore {
  verbosity: PurchaseLogLevel;
  register(
    products: Array<{
      id: IAPProductId;
      type: PurchaseProductType;
      platform: PurchaseStorePlatform;
    }>,
  ): void;
  when(): PurchaseStoreEvents;
  initialize(platforms: PurchaseStorePlatform[]): unknown;
  get(productId: IAPProductId): PurchaseLoadedProduct | undefined;
  order(
    offer: PurchaseOffer,
    additionalData: PurchaseAdditionalData,
  ): Promise<PurchaseOrderError | undefined>;
  restorePurchases(): Promise<PurchaseOrderError | undefined>;
}

interface PurchaseSdk {
  store: PurchaseStore;
  Platform: {
    APPLE_APPSTORE: PurchaseStorePlatform;
    GOOGLE_PLAY: PurchaseStorePlatform;
  };
  ProductType: {
    PAID_SUBSCRIPTION: PurchaseProductType;
  };
  LogLevel: {
    WARNING: PurchaseLogLevel;
    DEBUG: PurchaseLogLevel;
  };
  ErrorCode: {
    PAYMENT_CANCELLED: PurchaseErrorCode;
  };
}

function getPurchaseSdk(): PurchaseSdk | null {
  const runtime = globalThis as typeof globalThis & { CdvPurchase?: PurchaseSdk };
  return runtime.CdvPurchase ?? null;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Dev-only helper for local premium simulation outside production. */
async function grantPremiumLocally(): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  await updateDoc(doc(db, 'users', uid), { isPremium: true });
}

/** Netlify sitesi; native kabukta göreli /.netlify yolu çalışmaz. */
const NETLIFY_ORIGIN = 'https://novalingo.teknovagroup.com';

type AppleVerifyOutcome = 'verified' | 'rejected' | 'retry';

/**
 * iOS işlemini sunucuda doğrulatır. `retry` (ağ/sunucu hatası) dönerse işlem
 * bitirilmez; StoreKit onu bir sonraki açılışta yeniden teslim eder.
 */
async function verifyAppleTransaction(transactionId: string): Promise<AppleVerifyOutcome> {
  const user = auth.currentUser;
  if (!user) return 'retry';
  try {
    const idToken = await user.getIdToken();
    const response = await fetch(`${NETLIFY_ORIGIN}/.netlify/functions/verifyApplePurchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ transactionId }),
    });
    if (response.ok) return 'verified';
    // 4xx: kalıcı ret (başka hesaba bağlı, imza geçersiz, bulunamadı)
    return response.status >= 400 && response.status < 500 ? 'rejected' : 'retry';
  } catch {
    return 'retry';
  }
}

const ENTITLEMENT_POLL_DELAYS_MS = [750, 1500, 2500, 4000] as const;

/** Read Firestore to check premium state (fallback for restore flow). */
async function readPremiumFromFirestore(): Promise<PurchaseResult> {
  const uid = auth.currentUser?.uid;
  if (!uid) return { status: 'error', message: 'Giriş yapmanız gerekiyor.' };
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (snap.exists() && (snap.data()?.isPremium as boolean)) {
      return { status: 'success' };
    }
    return { status: 'error', message: 'Aktif abonelik bulunamadı.' };
  } catch {
    return { status: 'error', message: 'Bağlantı hatası. Lütfen tekrar deneyin.' };
  }
}

async function waitForVerifiedEntitlement(): Promise<PurchaseResult> {
  for (const delayMs of ENTITLEMENT_POLL_DELAYS_MS) {
    const result = await readPremiumFromFirestore();
    if (result.status === 'success') return result;
    await new Promise((resolve) => window.setTimeout(resolve, delayMs));
  }
  return readPremiumFromFirestore();
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

  const purchaseSdk = getPurchaseSdk();
  if (!purchaseSdk) {
    console.warn('Purchase SDK is unavailable; skipping store initialization.');
    return;
  }

  const { store, Platform, ProductType, LogLevel } = purchaseSdk;

  store.verbosity = import.meta.env.PROD ? LogLevel.WARNING : LogLevel.DEBUG;

  // Register products declared in App Store Connect / Google Play Console.
  const storePlatform = platform === 'ios' ? Platform.APPLE_APPSTORE : Platform.GOOGLE_PLAY;

  store.register([
    { id: IAP_PRODUCTS.MONTHLY, type: ProductType.PAID_SUBSCRIPTION, platform: storePlatform },
    { id: IAP_PRODUCTS.YEARLY, type: ProductType.PAID_SUBSCRIPTION, platform: storePlatform },
  ]);

  // iOS: verify on our server before finishing so a failed call is retried by
  // StoreKit on the next launch. Android keeps its existing token registration.
  store.when().approved((transaction) => {
    const transactionId = transaction.transactionId;
    if (platform !== 'ios' || !transactionId) {
      void transaction.finish();
      return;
    }
    void verifyAppleTransaction(transactionId).then((outcome) => {
      if (outcome !== 'retry') void transaction.finish();
    });
  });

  // After a transaction is fully finished, register it with the backend.
  // Canonical entitlement projection is updated only after server verification.
  store.when().finished((transaction) => {
    // Android: register the purchaseToken → UID mapping in Firestore so that the
    // backend can verify immediately and later resolve renewals/cancellations.
    if (Capacitor.getPlatform() === 'android') {
      const productId = transaction.products[0]?.id ?? '';
      const purchaseToken = transaction.parentReceipt?.purchaseToken ?? undefined;
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
 * - `store_redirect` — native sheet is open; verified entitlement arrives asynchronously
 *   via backend projection → Firestore listener updates the UI automatically.
 * - `cancelled` — user tapped Cancel in the payment sheet.
 * - `error` — product not loaded or unrecoverable store error.
 */
export function purchaseSubscription(productId: IAPProductId): Promise<PurchaseResult> {
  const platform = Capacitor.getPlatform();

  if (platform !== 'ios' && platform !== 'android') {
    return Promise.resolve({ status: 'store_redirect' });
  }

  return new Promise((resolve) => {
    const purchaseSdk = getPurchaseSdk();
    if (!purchaseSdk) {
      resolve({ status: 'error', message: 'Satın alma servisi şu anda kullanılamıyor.' });
      return;
    }

    const { store, ErrorCode } = purchaseSdk;

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

    const uid = auth.currentUser?.uid;
    const additionalData: PurchaseAdditionalData = uid ? { applicationUsername: uid } : {};

    void store.order(offer, additionalData).then((error) => {
      if (!error) {
        // Native sheet presented. Verified entitlement arrives asynchronously.
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

  const purchaseSdk = getPurchaseSdk();
  if (!purchaseSdk) {
    return { status: 'error', message: 'Satın alma servisi şu anda kullanılamıyor.' };
  }

  const { store } = purchaseSdk;
  const error = await store.restorePurchases();

  if (error) {
    // Native restore failed — fall back to Firestore (backend may have already projected premium)
    return readPremiumFromFirestore();
  }

  // Restored transactions can take a moment to reach verified entitlement projection.
  return waitForVerifiedEntitlement();
}

/**
 * Mağazadan gelen ürün fiyatlandırması.
 *
 * App Store Connect / Play Console'da tanımlı gerçek (yerelleştirilmiş) fiyat ve
 * varsa ücretsiz deneme süresi buradan okunur. Paywall'da asla sabit fiyat
 * gösterilmez — Apple 3.1.2 ve Play abonelik politikası bunu şart koşar.
 */
export interface ProductPricing {
  /** Yerelleştirilmiş fiyat metni (ör. "₺149,99"). */
  price: string;
  /** Mikro birim cinsinden fiyat (1.000.000 = 1 birim) — hesaplamalar için. */
  priceMicros: number | null;
  /** ISO 4217 para birimi (ör. "TRY"). */
  currency: string | null;
  /** ISO 8601 fatura periyodu (ör. "P1M", "P1Y"). */
  billingPeriod: string | null;
  /** Mağazada tanımlı ücretsiz deneme gün sayısı; yoksa null. */
  trialDays: number | null;
}

/** "P7D" / "P1W" / "P1M" / "P1Y" → gün sayısı. */
function isoPeriodToDays(period: string | undefined): number | null {
  if (!period) return null;
  const match = /^P(\d+)([DWMY])$/.exec(period);
  if (!match) return null;
  const amount = Number(match[1]);
  switch (match[2]) {
    case 'D':
      return amount;
    case 'W':
      return amount * 7;
    case 'M':
      return amount * 30;
    case 'Y':
      return amount * 365;
    default:
      return null;
  }
}

function isFreePhase(phase: PurchasePricingPhase): boolean {
  return phase.paymentMode === 'FreeTrial' || phase.priceMicros === 0;
}

/**
 * Seçili ürünün mağaza fiyatını döndürür.
 * Ürün henüz yüklenmediyse (veya web'deysek) `null` döner.
 */
export function getProductPricing(productId: IAPProductId): ProductPricing | null {
  const purchaseSdk = getPurchaseSdk();
  if (!purchaseSdk) return null;

  const offer = purchaseSdk.store.get(productId)?.getOffer();
  const phases = offer?.pricingPhases ?? [];
  if (phases.length === 0) return null;

  const trialPhase = phases.find(isFreePhase);
  const paidPhase = phases.find((phase) => !isFreePhase(phase)) ?? phases[phases.length - 1];
  if (!paidPhase?.price) return null;

  return {
    price: paidPhase.price,
    priceMicros: paidPhase.priceMicros ?? null,
    currency: paidPhase.currency ?? null,
    billingPeriod: paidPhase.billingPeriod ?? null,
    trialDays: trialPhase ? isoPeriodToDays(trialPhase.billingPeriod) : null,
  };
}

/**
 * Mağaza ürün bilgisi güncellendiğinde çağrılır (fiyatlar asenkron yüklenir).
 * cordova-plugin-purchase dinleyici kaldırmayı desteklemediği için callback
 * çağıranın kendisi tarafından güvenli (mounted kontrollü) yazılmalıdır.
 */
export function onProductsUpdated(callback: () => void): void {
  const purchaseSdk = getPurchaseSdk();
  if (!purchaseSdk) return;
  purchaseSdk.store.when().productUpdated(callback);
}

/** Dev-only: grant premium manually for testing without a real transaction. */
export async function devGrantPremium(): Promise<void> {
  if (import.meta.env.PROD) return;
  await grantPremiumLocally();
}
