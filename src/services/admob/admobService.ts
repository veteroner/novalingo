/**
 * AdMob Service
 *
 * COPPA-uyumlu reklam yönetimi.
 * Yalnızca Rewarded ve Interstitial — Banner yok (çocuk UX).
 */

import { getPlatform } from '@/utils/platform';
// Capacitor AdMob — dinamik import (sadece native'de)
import type { AdMob as AdMobPlugin } from '@capacitor-community/admob';
let AdMob: typeof AdMobPlugin | null = null;

// Reklam gösterim kuralları
const AD_RULES = {
  minLessonsBetweenInterstitial: 3,
  maxInterstitialsPerHour: 2,
  minSessionMinutesBeforeFirstAd: 5,
  rewardedCooldownMinutes: 10,
  quietHoursStart: 21, // 21:00
  quietHoursEnd: 7, // 07:00
} as const;

interface AdState {
  lessonsCompleted: number;
  interstitialsShownThisHour: number;
  lastInterstitialAt: number;
  lastRewardedAt: number;
  sessionStartedAt: number;
  initialized: boolean;
}

const state: AdState = {
  lessonsCompleted: 0,
  interstitialsShownThisHour: 0,
  lastInterstitialAt: 0,
  lastRewardedAt: 0,
  sessionStartedAt: Date.now(),
  initialized: false,
};

/**
 * AdMob'u başlat (Capacitor native ortamında)
 */
export async function initializeAdMob(): Promise<void> {
  try {
    const module = await import('@capacitor-community/admob');
    AdMob = module.AdMob;

    await AdMob.initialize({
      initializeForTesting: import.meta.env.VITE_APP_ENV !== 'production',
      tagForChildDirectedTreatment: true,
      maxAdContentRating: 'G' as never,
    });

    state.initialized = true;
  } catch {
    // Web ortamında veya AdMob yoksa sessizce geç
    console.warn('AdMob not available on this platform');
  }
}

/**
 * Interstitial reklam gösterilmeli mi?
 */
export function canShowInterstitial(): boolean {
  if (!state.initialized) return false;

  const now = Date.now();
  const hour = new Date().getHours();

  // Sessiz saatler
  if (hour >= AD_RULES.quietHoursStart || hour < AD_RULES.quietHoursEnd) return false;

  // Minimum ders sayısı
  if (state.lessonsCompleted < AD_RULES.minLessonsBetweenInterstitial) return false;

  // Saatlik limit
  if (state.interstitialsShownThisHour >= AD_RULES.maxInterstitialsPerHour) return false;

  // Session minimum süresi
  const sessionMinutes = (now - state.sessionStartedAt) / 60000;
  if (sessionMinutes < AD_RULES.minSessionMinutesBeforeFirstAd) return false;

  return true;
}

/**
 * Interstitial reklam göster
 */
export async function showInterstitial(): Promise<boolean> {
  if (!AdMob || !canShowInterstitial()) return false;

  try {
    await AdMob.prepareInterstitial({ adId: getInterstitialAdId() });
    await AdMob.showInterstitial();

    state.lessonsCompleted = 0;
    state.interstitialsShownThisHour++;
    state.lastInterstitialAt = Date.now();

    return true;
  } catch {
    return false;
  }
}

/**
 * Rewarded reklam göster
 * @returns Ödül verildi mi?
 */
export async function showRewarded(): Promise<boolean> {
  if (!AdMob || !state.initialized) return false;

  const now = Date.now();
  const cooldownMs = AD_RULES.rewardedCooldownMinutes * 60000;
  if (now - state.lastRewardedAt < cooldownMs) return false;

  try {
    await AdMob.prepareRewardVideoAd({ adId: getRewardedAdId() });

    const adMob = AdMob;
    return await new Promise((resolve) => {
      void adMob.addListener('rewarded' as never, () => {
        state.lastRewardedAt = Date.now();
        resolve(true);
      });

      void adMob.addListener('adClosed' as never, () => {
        resolve(false);
      });

      void adMob.showRewardVideoAd();
    });
  } catch {
    return false;
  }
}

/**
 * Ders tamamlandığında sayacı artır
 */
export function onLessonCompleted(): void {
  state.lessonsCompleted++;
}

// ===== Ad ID Helpers =====

/** Google test ad IDs — safe for development */
const TEST_AD_IDS = {
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
} as const;

/**
 * Production ad IDs — set via environment variables.
 * VITE_ADMOB_INTERSTITIAL_IOS, VITE_ADMOB_INTERSTITIAL_ANDROID
 * VITE_ADMOB_REWARDED_IOS, VITE_ADMOB_REWARDED_ANDROID
 */
function isProduction(): boolean {
  return import.meta.env.VITE_APP_ENV === 'production';
}

function getInterstitialAdId(): string {
  if (!isProduction()) return TEST_AD_IDS.interstitial;
  const platform = getPlatform();
  if (platform === 'ios')
    return import.meta.env.VITE_ADMOB_INTERSTITIAL_IOS || TEST_AD_IDS.interstitial;
  if (platform === 'android')
    return import.meta.env.VITE_ADMOB_INTERSTITIAL_ANDROID || TEST_AD_IDS.interstitial;
  return TEST_AD_IDS.interstitial;
}

function getRewardedAdId(): string {
  if (!isProduction()) return TEST_AD_IDS.rewarded;
  const platform = getPlatform();
  if (platform === 'ios') return import.meta.env.VITE_ADMOB_REWARDED_IOS || TEST_AD_IDS.rewarded;
  if (platform === 'android')
    return import.meta.env.VITE_ADMOB_REWARDED_ANDROID || TEST_AD_IDS.rewarded;
  return TEST_AD_IDS.rewarded;
}
