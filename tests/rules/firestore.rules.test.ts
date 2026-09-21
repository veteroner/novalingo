/**
 * Firestore Güvenlik Kuralları — yetki ve ücretsiz katman testleri.
 *
 * Bu testler mağaza çıkışı için kritik iki kuralı doğrular:
 *  1. İstemci kendisine premium yetkisi VEREMEZ (`users.isPremium` sunucu projeksiyonudur).
 *  2. Ücretsiz katman günlük ders limiti sunucu tarafında zorlanır.
 *
 * Çalıştırma: `pnpm test:rules` (Firestore emülatörünü otomatik başlatır).
 */

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const PARENT_UID = 'parent-1';
const CHILD_ID = 'child-1';

let testEnv: RulesTestEnvironment;

/** TR saatine göre bugünün tarihi — kurallar bunu "güncel" kabul eder. */
function todayTR(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Istanbul' });
}

/** `useAuth` içindeki yeni kullanıcı payload'ı ile birebir aynı olmalı. */
function baseUser(overrides: Record<string, unknown> = {}) {
  return {
    email: 'parent@example.com',
    displayName: 'Ebeveyn',
    photoURL: null,
    provider: 'google',
    isPremium: false,
    activeChildId: null,
    createdAt: new Date(),
    lastLoginAt: new Date(),
    settings: { language: 'tr', soundEnabled: true, parentPin: null },
    ...overrides,
  };
}

function baseChild(overrides: Record<string, unknown> = {}) {
  return {
    parentUid: PARENT_UID,
    name: 'Ali',
    ageGroup: 'cubs',
    avatarId: 'nova_default',
    level: 1,
    totalXP: 0,
    currentLevelXP: 0,
    nextLevelXP: 100,
    stars: 0,
    gems: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: todayTR(),
    streakFreezes: 0,
    novaStage: 'egg',
    novaHappiness: 50,
    novaOutfitId: null,
    leagueId: 'bronze-1',
    leagueTier: 'bronze',
    weeklyXP: 0,
    currentWorldId: 'world1',
    currentUnitId: 'w1_u1',
    completedLessons: 0,
    totalPlayTimeMinutes: 0,
    wordsLearned: 0,
    onboardingCompleted: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/** Ders tamamlama yazımı — istemcinin submitLessonResult'ta yaptığı güncelleme. */
function lessonCompletionUpdate(child: Record<string, unknown>, dailyLessonCount: number) {
  return {
    ...child,
    completedLessons: (child.completedLessons as number) + 1,
    dailyLessonDate: todayTR(),
    dailyLessonCount,
    updatedAt: new Date(),
  };
}

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-novalingo',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

/** Kuralları atlayarak veri hazırla (sunucu yazımını taklit eder). */
async function seed(isPremium: boolean, child: Record<string, unknown> = baseChild()) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await db.doc(`users/${PARENT_UID}`).set(baseUser({ isPremium }));
    await db.doc(`children/${CHILD_ID}`).set(child);
  });
}

describe('users — abonelik yetkisi', () => {
  it('ücretsiz kullanıcı hesabını oluşturabilir', async () => {
    const db = testEnv.authenticatedContext(PARENT_UID).firestore();
    await assertSucceeds(db.doc(`users/${PARENT_UID}`).set(baseUser()));
  });

  it("eski istemci payload'ı (null abonelik alanlarıyla) reddedilir", async () => {
    // 16 Mayıs–21 Eylül 2026 arasında istemci bu payload'ı gönderiyordu ve yayındaki
    // kural reddettiği için hiçbir yeni kullanıcının dokümanı oluşmadı.
    const db = testEnv.authenticatedContext(PARENT_UID).firestore();
    await assertFails(
      db.doc(`users/${PARENT_UID}`).set(
        baseUser({
          premiumExpiresAt: null,
          subscriptionState: 'expired',
          subscriptionPlatform: null,
          subscriptionProductId: null,
        }),
      ),
    );
  });

  it('premium olarak hesap oluşturulamaz', async () => {
    const db = testEnv.authenticatedContext(PARENT_UID).firestore();
    await assertFails(db.doc(`users/${PARENT_UID}`).set(baseUser({ isPremium: true })));
  });

  it('istemci kendine premium veremez', async () => {
    await seed(false);
    const db = testEnv.authenticatedContext(PARENT_UID).firestore();
    await assertFails(db.doc(`users/${PARENT_UID}`).update({ isPremium: true }));
  });

  it('abonelik durumu alanları istemciden değiştirilemez', async () => {
    await seed(false);
    const db = testEnv.authenticatedContext(PARENT_UID).firestore();
    await assertFails(db.doc(`users/${PARENT_UID}`).update({ subscriptionState: 'active' }));
    await assertFails(db.doc(`users/${PARENT_UID}`).update({ premiumExpiresAt: new Date() }));
    await assertFails(db.doc(`users/${PARENT_UID}`).update({ subscriptionExternalId: 'x' }));
  });

  it('normal ayar güncellemesi çalışır', async () => {
    await seed(false);
    const db = testEnv.authenticatedContext(PARENT_UID).firestore();
    await assertSucceeds(
      db.doc(`users/${PARENT_UID}`).update({ 'settings.soundEnabled': false, fcmToken: 'abc' }),
    );
  });

  it("bildirim token'ı kaydı çalışır (notificationService payload'ı)", async () => {
    await seed(false);
    const db = testEnv.authenticatedContext(PARENT_UID).firestore();
    await assertSucceeds(
      db.doc(`users/${PARENT_UID}`).update({
        fcmToken: 'token-123',
        pushProvider: 'fcm',
        pushTokenUpdatedAt: new Date().toISOString(),
      }),
    );
  });

  it('doğrulanmış abonelik kayıtlarına istemci yazamaz', async () => {
    await seed(false);
    const db = testEnv.authenticatedContext(PARENT_UID).firestore();
    await assertFails(db.doc(`users/${PARENT_UID}/subscriptions/apple`).set({ state: 'active' }));
  });

  it('başka kullanıcının dokümanı okunamaz', async () => {
    await seed(false);
    const db = testEnv.authenticatedContext('other-parent').firestore();
    await assertFails(db.doc(`users/${PARENT_UID}`).get());
  });
});

describe('children — ücretsiz katman günlük ders limiti', () => {
  it('ücretsiz kullanıcı ilk 3 dersi tamamlayabilir', async () => {
    const child = baseChild();
    await seed(false, child);
    const db = testEnv.authenticatedContext(PARENT_UID).firestore();

    for (let i = 1; i <= 3; i++) {
      const current = baseChild({
        completedLessons: i - 1,
        ...(i > 1 ? { dailyLessonDate: todayTR(), dailyLessonCount: i - 1 } : {}),
      });
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await ctx.firestore().doc(`children/${CHILD_ID}`).set(current);
      });
      await assertSucceeds(db.doc(`children/${CHILD_ID}`).set(lessonCompletionUpdate(current, i)));
    }
  });

  it('ücretsiz kullanıcı 4. dersi tamamlayamaz', async () => {
    const current = baseChild({
      completedLessons: 3,
      dailyLessonDate: todayTR(),
      dailyLessonCount: 3,
    });
    await seed(false, current);
    const db = testEnv.authenticatedContext(PARENT_UID).firestore();
    await assertFails(db.doc(`children/${CHILD_ID}`).set(lessonCompletionUpdate(current, 4)));
  });

  it('premium kullanıcı 4. dersi tamamlayabilir', async () => {
    const current = baseChild({
      completedLessons: 3,
      dailyLessonDate: todayTR(),
      dailyLessonCount: 3,
    });
    await seed(true, current);
    const db = testEnv.authenticatedContext(PARENT_UID).firestore();
    await assertSucceeds(db.doc(`children/${CHILD_ID}`).set(lessonCompletionUpdate(current, 4)));
  });

  it('sayaç artırılmadan ders tamamlanamaz', async () => {
    const current = baseChild({ completedLessons: 0 });
    await seed(false, current);
    const db = testEnv.authenticatedContext(PARENT_UID).firestore();
    await assertFails(
      db.doc(`children/${CHILD_ID}`).set({
        ...current,
        completedLessons: 1,
        updatedAt: new Date(),
      }),
    );
  });

  it('sayaç geçmiş bir tarihe kaydırılarak limit sıfırlanamaz', async () => {
    const current = baseChild({
      completedLessons: 3,
      dailyLessonDate: todayTR(),
      dailyLessonCount: 3,
    });
    await seed(false, current);
    const db = testEnv.authenticatedContext(PARENT_UID).firestore();
    await assertFails(
      db.doc(`children/${CHILD_ID}`).set({
        ...current,
        completedLessons: 4,
        dailyLessonDate: '2020-01-01',
        dailyLessonCount: 1,
        updatedAt: new Date(),
      }),
    );
  });

  it('ders tamamlamayan güncellemeler etkilenmez', async () => {
    const current = baseChild({
      completedLessons: 3,
      dailyLessonCount: 3,
      dailyLessonDate: todayTR(),
    });
    await seed(false, current);
    const db = testEnv.authenticatedContext(PARENT_UID).firestore();
    await assertSucceeds(
      db.doc(`children/${CHILD_ID}`).set({ ...current, stars: 10, updatedAt: new Date() }),
    );
  });

  it('başka ebeveynin çocuğu güncellenemez', async () => {
    await seed(false);
    const db = testEnv.authenticatedContext('other-parent').firestore();
    await assertFails(db.doc(`children/${CHILD_ID}`).update({ stars: 5 }));
  });
});

describe('sanity', () => {
  it('bugünün tarihi YYYY-MM-DD biçimindedir', () => {
    expect(todayTR()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
