/**
 * Ebeveyn kapısı oturum durumu.
 *
 * Ebeveyn panelini ve satın alma ekranını çocuğun yanlışlıkla açmasını engeller
 * (Apple "Kids" kılavuzu + COPPA). Doğrulama yalnızca bellek içinde ve kısa
 * süreli tutulur: uygulama yeniden başladığında ya da süre dolduğunda kapı
 * yeniden sorulur.
 */

/** Doğrulamanın geçerli kalma süresi. */
export const PARENT_GATE_TTL_MS = 15 * 60 * 1000;

let passedAtMs = 0;
let profileConsentAtMs = 0;

/** Kapı yakın zamanda geçildi mi? */
export function isParentGatePassed(nowMs: number = Date.now()): boolean {
  return passedAtMs > 0 && nowMs - passedAtMs < PARENT_GATE_TTL_MS;
}

/** Kapı başarıyla geçildi olarak işaretle. */
export function markParentGatePassed(nowMs: number = Date.now()): void {
  passedAtMs = nowMs;
}

/** Doğrulamayı sıfırla (çıkış yapıldığında veya testlerde). */
export function resetParentGate(): void {
  passedAtMs = 0;
  profileConsentAtMs = 0;
}

/** Profile setup also requires the two consent checkboxes, beyond the math gate. */
export function isProfileConsentPassed(nowMs: number = Date.now()): boolean {
  return profileConsentAtMs > 0 && nowMs - profileConsentAtMs < PARENT_GATE_TTL_MS;
}

export function markProfileConsentPassed(nowMs: number = Date.now()): void {
  profileConsentAtMs = nowMs;
  markParentGatePassed(nowMs);
}
