import { beforeEach, describe, expect, it } from 'vitest';
import {
  isParentGatePassed,
  isProfileConsentPassed,
  markParentGatePassed,
  markProfileConsentPassed,
  PARENT_GATE_TTL_MS,
  resetParentGate,
} from './parentGateSession';

describe('profil onay oturumu', () => {
  const now = 1000000;
  beforeEach(() => {
    resetParentGate();
  });
  it('matematik doğrulaması tek başına profil onayı yerine geçmez', () => {
    markParentGatePassed(now);
    expect(isParentGatePassed(now)).toBe(true);
    expect(isProfileConsentPassed(now)).toBe(false);
  });
  it('onay yalnızca kısa süre geçerlidir ve çıkışta sıfırlanır', () => {
    markProfileConsentPassed(now);
    expect(isProfileConsentPassed(now)).toBe(true);
    expect(isParentGatePassed(now)).toBe(true);
    expect(isProfileConsentPassed(now + PARENT_GATE_TTL_MS)).toBe(false);
    resetParentGate();
    expect(isProfileConsentPassed(now)).toBe(false);
    expect(isParentGatePassed(now)).toBe(false);
  });
});
