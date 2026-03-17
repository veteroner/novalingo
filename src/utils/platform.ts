/**
 * Platform Detection Utility
 *
 * Capacitor API kullanarak güvenilir platform tespiti.
 * UA sniffing yerine native bridge üzerinden kontrol eder.
 */

import { Capacitor } from '@capacitor/core';

export type Platform = 'web' | 'ios' | 'android';

/** True if running inside a native Capacitor shell (not browser) */
export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/** Returns the current platform using Capacitor's native bridge */
export function getPlatform(): Platform {
  if (!Capacitor.isNativePlatform()) return 'web';
  const p = Capacitor.getPlatform();
  if (p === 'ios') return 'ios';
  if (p === 'android') return 'android';
  return 'web';
}

/** True if running on iOS (native or mobile browser) */
export function isIOS(): boolean {
  if (Capacitor.isNativePlatform()) return Capacitor.getPlatform() === 'ios';
  // Fallback for mobile browser detection (not in Capacitor shell)
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/** True if running on Android (native or mobile browser) */
export function isAndroid(): boolean {
  if (Capacitor.isNativePlatform()) return Capacitor.getPlatform() === 'android';
  return /android/i.test(navigator.userAgent);
}

/** True if on a mobile device (native or mobile browser) */
export function isMobile(): boolean {
  if (Capacitor.isNativePlatform()) return true;
  return /iphone|ipad|ipod|android/i.test(navigator.userAgent) || window.innerWidth < 768;
}
