/**
 * RevenueCat Service
 *
 * Cross-platform abonelik ve IAP yönetimi.
 */

// RevenueCat Capacitor plugin — dinamik import
import type { Purchases as PurchasesPlugin } from '@revenuecat/purchases-capacitor';
let Purchases: typeof PurchasesPlugin | null = null;

// Entitlement ID'leri
export const ENTITLEMENTS = {
  PREMIUM: 'premium',
} as const;

// Product ID'leri
export const PRODUCTS = {
  MONTHLY: 'novalingo_premium_monthly',
  YEARLY: 'novalingo_premium_yearly',
  GEM_PACK_SMALL: 'novalingo_gems_100',
  GEM_PACK_MEDIUM: 'novalingo_gems_500',
  GEM_PACK_LARGE: 'novalingo_gems_1200',
  GEM_PACK_MEGA: 'novalingo_gems_3000',
} as const;

interface SubscriptionState {
  initialized: boolean;
  isPremium: boolean;
  expirationDate: string | null;
}

const state: SubscriptionState = {
  initialized: false,
  isPremium: false,
  expirationDate: null,
};

/**
 * RevenueCat'i başlat
 */
export async function initializeRevenueCat(userId: string): Promise<void> {
  try {
    const module = await import('@revenuecat/purchases-capacitor');
    Purchases = module.Purchases;

    // Platform'a göre API key seç
    const apiKey = getPlatformApiKey();
    if (!apiKey) return;

    await Purchases.configure({
      apiKey,
      appUserID: userId,
    });

    state.initialized = true;

    // İlk entitlement kontrolü
    await checkPremiumStatus();
  } catch {
    console.warn('RevenueCat not available on this platform');
  }
}

/**
 * Premium durumunu kontrol et
 */
export async function checkPremiumStatus(): Promise<boolean> {
  if (!Purchases || !state.initialized) return false;

  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    const premium = customerInfo.entitlements.active[ENTITLEMENTS.PREMIUM];

    state.isPremium = !!premium;
    state.expirationDate = premium?.expirationDate ?? null;

    return state.isPremium;
  } catch {
    return false;
  }
}

/**
 * Mevcut teklifleri getir
 */
export async function getOfferings() {
  if (!Purchases || !state.initialized) return null;

  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch {
    return null;
  }
}

/**
 * Satın alma yap
 */
export async function purchasePackage(packageId: string): Promise<boolean> {
  if (!Purchases || !state.initialized) return false;

  try {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages.find(
      (p: { identifier: string }) => p.identifier === packageId,
    );

    if (!pkg) {
      throw new Error(`Package not found: ${packageId}`);
    }

    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
    const premium = customerInfo.entitlements.active[ENTITLEMENTS.PREMIUM];

    state.isPremium = !!premium;
    return state.isPremium;
  } catch {
    return false;
  }
}

/**
 * Satın almaları geri yükle
 */
export async function restorePurchases(): Promise<boolean> {
  if (!Purchases || !state.initialized) return false;

  try {
    const { customerInfo } = await Purchases.restorePurchases();
    const premium = customerInfo.entitlements.active[ENTITLEMENTS.PREMIUM];

    state.isPremium = !!premium;
    return state.isPremium;
  } catch {
    return false;
  }
}

/**
 * Premium mi?
 */
export function isPremium(): boolean {
  return state.isPremium;
}

/**
 * Abonelik bitiş tarihi
 */
export function getExpirationDate(): string | null {
  return state.expirationDate;
}

// ===== Helpers =====
function getPlatformApiKey(): string | null {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('iphone') || ua.includes('ipad')) {
    return import.meta.env.VITE_REVENUECAT_API_KEY_APPLE || null;
  }
  if (ua.includes('android')) {
    return import.meta.env.VITE_REVENUECAT_API_KEY_GOOGLE || null;
  }
  // Web'de IAP yok
  return null;
}
