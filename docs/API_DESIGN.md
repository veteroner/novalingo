# NovaLingo — API Tasarımı (Cloud Functions)

> Firebase Cloud Functions v2 — TypeScript
> Tüm server-side endpoint'ler, trigger'lar ve scheduled job'lar
> Son güncelleme: 28 Şubat 2026

---

## 1. API Genel Mimarisi

```
┌──────────────────────────────────────────────────────────┐
│                    CLIENT (React + Capacitor)             │
└──────────────┬───────────────────────────┬───────────────┘
               │ HTTPS Callable            │ Firestore SDK
               │ (güvenli işlemler)        │ (gerçek zamanlı)
               ▼                           ▼
┌──────────────────────────┐  ┌──────────────────────────────┐
│  Cloud Functions v2      │  │  Firestore (doğrudan erişim)  │
│  (onCall / onRequest)    │  │  Security Rules ile korunur   │
│                          │  │                                │
│  • Auth işlemleri        │  │  • Ders içeriği (read)        │
│  • İlerleme kaydetme     │  │  • Kelime kartları (read)     │
│  • Satın alma doğrulama  │  │  • Kullanıcı profili (r/w)   │
│  • Liderlik hesaplama    │  │  • Koleksiyon (read)          │
│  • Gamification engine   │  │                                │
└──────────────────────────┘  └──────────────────────────────┘
               │
               ▼
┌──────────────────────────┐  ┌──────────────────────────────┐
│  Firestore Triggers      │  │  Scheduled Functions         │
│  (arka plan işlemler)    │  │  (cron job'lar)              │
│                          │  │                                │
│  • onUserCreate          │  │  • Streak kontrolü (günlük)  │
│  • onProgressUpdate      │  │  • Liga reset (haftalık)     │
│  • onPurchaseCreate      │  │  • Analytics (günlük)        │
└──────────────────────────┘  └──────────────────────────────┘
```

---

## 2. Dizin Yapısı

```
functions/
├── src/
│   ├── index.ts                       # Tüm export'lar
│   ├── config/
│   │   ├── firebase.ts                # Admin SDK init
│   │   ├── constants.ts               # Sabitler
│   │   └── env.ts                     # Environment variables
│   ├── callable/                      # Client tarafından çağrılan
│   │   ├── auth/
│   │   │   ├── createChildProfile.ts
│   │   │   ├── updateChildProfile.ts
│   │   │   └── deleteChildProfile.ts
│   │   ├── progress/
│   │   │   ├── submitLessonResult.ts
│   │   │   ├── updateVocabulary.ts
│   │   │   └── syncOfflineProgress.ts
│   │   ├── gamification/
│   │   │   ├── claimQuestReward.ts
│   │   │   ├── spinDailyWheel.ts
│   │   │   ├── purchaseShopItem.ts
│   │   │   └── useStreakFreeze.ts
│   │   ├── social/
│   │   │   └── getLeaderboard.ts
│   │   └── purchase/
│   │       ├── validateReceipt.ts
│   │       └── restorePurchases.ts
│   ├── triggers/                      # Firestore tetikleyiciler
│   │   ├── onUserCreate.ts
│   │   ├── onLessonComplete.ts
│   │   ├── onAchievementUnlock.ts
│   │   ├── onPurchaseCreate.ts
│   │   └── onStreakUpdate.ts
│   ├── scheduled/                     # Zamanlanmış görevler
│   │   ├── dailyStreakCheck.ts
│   │   ├── dailyQuestAssign.ts
│   │   ├── weeklyLeagueReset.ts
│   │   ├── weeklyReport.ts
│   │   └── monthlyCleanup.ts
│   ├── http/                          # HTTP endpoint'ler (webhook'lar)
│   │   ├── revenuecatWebhook.ts
│   │   └── healthCheck.ts
│   ├── services/                      # İş mantığı
│   │   ├── gamificationEngine.ts
│   │   ├── xpCalculator.ts
│   │   ├── streakManager.ts
│   │   ├── questGenerator.ts
│   │   ├── leagueManager.ts
│   │   ├── novaEvolution.ts
│   │   ├── srsEngine.ts
│   │   └── notificationService.ts
│   ├── utils/
│   │   ├── validators.ts
│   │   ├── errors.ts
│   │   └── helpers.ts
│   └── types/
│       ├── request.ts
│       └── response.ts
├── package.json
├── tsconfig.json
└── .env
```

---

## 3. Callable Functions (Client → Server)

### 3.1 Auth Functions

#### `createChildProfile`
```typescript
// Yeni çocuk profili oluştur
// Trigger: Ebeveyn "Çocuk Ekle" butonuna tıkladığında

interface CreateChildProfileRequest {
  name: string;              // max 30 karakter
  birthYear: number;         // 2014-2022 arası
  avatar: string;            // avatar ID
  nativeLanguage: 'tr';      // şimdilik sadece Türkçe
}

interface CreateChildProfileResponse {
  childId: string;
  profile: ChildProfile;
  initialData: {
    nova: NovaState;         // Egg aşaması
    quests: Quest[];         // İlk günlük görevler
    unlockedWorld: string;   // İlk dünya ID
  };
}

// Validasyon:
// - Ebeveyn max 4 çocuk ekleyebilir
// - İsim boş olamaz, max 30 karakter
// - Yaş 4-12 aralığında olmalı
// - Rate limit: 5 istek/dakika

export const createChildProfile = onCall(
  { 
    region: 'europe-west1',
    enforceAppCheck: true,
  },
  async (request) => {
    // 1. Auth kontrolü
    if (!request.auth) throw new HttpsError('unauthenticated', 'Login required');
    
    // 2. Validasyon
    const data = validateCreateChildRequest(request.data);
    
    // 3. Çocuk sayısı kontrolü
    const childCount = await getChildCount(request.auth.uid);
    if (childCount >= 4) throw new HttpsError('resource-exhausted', 'Max 4 children');
    
    // 4. Yaş grubu hesapla
    const ageGroup = calculateAgeGroup(data.birthYear);
    
    // 5. Firestore'a yaz (batch)
    const batch = db.batch();
    const childRef = db.collection(`parents/${request.auth.uid}/children`).doc();
    
    batch.set(childRef, {
      name: data.name,
      birthYear: data.birthYear,
      ageGroup,
      avatar: data.avatar,
      nativeLanguage: data.nativeLanguage,
      createdAt: FieldValue.serverTimestamp(),
      settings: DEFAULT_CHILD_SETTINGS,
    });
    
    // İlerleme dokümanı
    batch.set(db.doc(`progress/${childRef.id}`), {
      childId: childRef.id,
      parentId: request.auth.uid,
      totalXP: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      totalLessons: 0,
      totalWords: 0,
    });
    
    // Gamification dokümanı
    batch.set(db.doc(`gamification/${childRef.id}`), {
      nova: { stage: 'egg', xp: 0, happiness: 100 },
      currency: { stars: 0, gems: 0 },
      streakFreezes: ageGroup === 'cubs' ? 2 : 1,
    });
    
    await batch.commit();
    
    // 6. İlk görevleri ata
    const quests = await assignInitialQuests(childRef.id, ageGroup);
    
    return { childId: childRef.id, profile: { ... }, initialData: { ... } };
  }
);
```

---

### 3.2 Progress Functions

#### `submitLessonResult`
```typescript
// Ders sonucunu kaydet + XP hesapla + gamification güncelle
// En kritik endpoint — her ders tamamlamada çağrılır

interface SubmitLessonResultRequest {
  childId: string;
  lessonId: string;
  activities: ActivityResult[];
  duration: number;           // Saniye
  offlineTimestamp?: number;  // Offline senkronizasyon
}

interface ActivityResult {
  activityId: string;
  activityType: ActivityType;
  correct: number;
  total: number;
  timeSpent: number;         // Saniye
  attempts: number;
  hintsUsed: number;
  wordsLearned: string[];    // Kelime ID'leri
}

interface SubmitLessonResultResponse {
  xpEarned: number;
  totalXP: number;
  stars: 1 | 2 | 3;
  starsEarned: number;       // Yıldız (currency)
  gemsEarned: number;
  levelUp: boolean;
  newLevel?: number;
  levelUpRewards?: Reward[];
  achievementsUnlocked: Achievement[];
  questProgress: QuestProgress[];
  novaReaction: 'happy' | 'very_happy' | 'dance' | 'proud';
  streakUpdated: boolean;
  newStreak?: number;
  wordsToReview: string[];   // SRS zamanlama
}

export const submitLessonResult = onCall(
  { region: 'europe-west1', enforceAppCheck: true },
  async (request) => {
    // 1. Auth + ownership kontrolü
    const parentId = request.auth!.uid;
    await verifyChildOwnership(parentId, request.data.childId);
    
    // 2. Validasyon
    const data = validateLessonResult(request.data);
    
    // 3. Anti-cheat kontrolü
    await antiCheatCheck(data);
    
    // 4. XP hesapla
    const xpResult = xpCalculator.calculate({
      activities: data.activities,
      streak: currentProgress.currentStreak,
      isFirstAttempt: !previousAttempt,
      hasXPBoost: gamification.activeBoosts.includes('xp_2x'),
    });
    
    // 5. Yıldız hesapla (currency)
    const accuracy = data.activities.reduce((sum, a) => sum + a.correct, 0) /
                     data.activities.reduce((sum, a) => sum + a.total, 0);
    const stars = calculateStars(accuracy);
    const starCurrency = stars === 3 ? 30 : stars === 2 ? 20 : 10;
    
    // 6. Level-up kontrolü
    const newTotalXP = currentProgress.totalXP + xpResult.totalXP;
    const newLevel = calculateLevel(newTotalXP);
    const levelUp = newLevel > currentProgress.level;
    
    // 7. Başarım kontrolü
    const achievements = await checkAchievements(data.childId, {
      totalXP: newTotalXP,
      totalLessons: currentProgress.totalLessons + 1,
      accuracy,
      streak: currentProgress.currentStreak,
      wordsLearned: data.activities.flatMap(a => a.wordsLearned),
    });
    
    // 8. Görev ilerlemesi
    const questProgress = await updateQuestProgress(data.childId, {
      type: 'complete_lesson',
      accuracy,
      activitiesCompleted: data.activities.map(a => a.activityType),
    });
    
    // 9. SRS güncelle
    const wordsToReview = await srsEngine.updateWords(
      data.childId,
      data.activities.flatMap(a => a.wordsLearned),
    );
    
    // 10. Firestore batch write
    const batch = db.batch();
    
    // Progress güncelle
    batch.update(db.doc(`progress/${data.childId}`), {
      totalXP: FieldValue.increment(xpResult.totalXP),
      level: newLevel,
      totalLessons: FieldValue.increment(1),
      totalWords: FieldValue.increment(wordsLearned.length),
      lastLessonAt: FieldValue.serverTimestamp(),
    });
    
    // Ders ilerleme kaydı
    batch.set(db.doc(`progress/${data.childId}/lessons/${data.lessonId}`), {
      stars,
      xpEarned: xpResult.totalXP,
      accuracy,
      duration: data.duration,
      completedAt: FieldValue.serverTimestamp(),
      activities: data.activities,
    });
    
    // Currency güncelle
    batch.update(db.doc(`gamification/${data.childId}`), {
      'currency.stars': FieldValue.increment(starCurrency),
      'currency.gems': FieldValue.increment(gemsEarned),
    });
    
    // Streak güncelle
    await streakManager.updateStreak(data.childId, batch);
    
    await batch.commit();
    
    // 11. Nova reaksiyonu belirle
    const novaReaction = accuracy >= 1 ? 'dance'
                       : accuracy >= 0.9 ? 'very_happy'
                       : accuracy >= 0.7 ? 'happy'
                       : 'proud'; // En kötüsünde bile gurur
    
    return {
      xpEarned: xpResult.totalXP,
      totalXP: newTotalXP,
      stars,
      starsEarned: starCurrency,
      gemsEarned,
      levelUp,
      newLevel: levelUp ? newLevel : undefined,
      levelUpRewards: levelUp ? getLevelUpRewards(newLevel) : undefined,
      achievementsUnlocked: achievements,
      questProgress,
      novaReaction,
      streakUpdated: true,
      newStreak: currentProgress.currentStreak + 1,
      wordsToReview,
    };
  }
);
```

#### `syncOfflineProgress`
```typescript
// Offline'da biriken ilerlemeyi senkronize et
// Çocuk internetsiz ders tamamladığında, bağlantı gelince çağrılır

interface SyncOfflineProgressRequest {
  childId: string;
  lessons: OfflineLessonResult[];  // Birden fazla ders olabilir
  vocabulary: OfflineVocabUpdate[];
  timestamp: number;               // Son senkronizasyon zamanı
}

interface OfflineLessonResult extends SubmitLessonResultRequest {
  offlineCompletedAt: number;       // Unix timestamp
  syncVersion: number;              // Conflict resolution
}

// Strateji:
// 1. Her offline ders için submitLessonResult çağır (sıralı)
// 2. Conflict varsa: server-wins (ama kullanıcı XP'si korunur)
// 3. Batch write ile tek seferde güncelle
// 4. Client'a tüm sonuçları döndür
```

#### `updateVocabulary`
```typescript
// SRS (Spaced Repetition) kelime ilerleme güncellemesi

interface UpdateVocabularyRequest {
  childId: string;
  reviews: VocabReview[];
}

interface VocabReview {
  wordId: string;
  rating: 1 | 2 | 3 | 4 | 5;  // 1=Bilmiyorum, 5=Çok kolay
  responseTime: number;          // ms
}

// SM-2 algoritması varyasyonu:
// rating 1-2: Kelimeyi tekrar kuyrukuna al (interval reset)
// rating 3: Intervali koru
// rating 4-5: Intervali artır (×2.5)
// Mastered: 6+ ardışık doğru, interval > 30 gün
```

---

### 3.3 Gamification Functions

#### `claimQuestReward`
```typescript
interface ClaimQuestRewardRequest {
  childId: string;
  questId: string;
}

// Validasyon: Görev gerçekten tamamlanmış mı? (server-side kontrol)
// Anti-cheat: Client quest progress'ini güvenme, server'da tekrar hesapla
```

#### `spinDailyWheel`
```typescript
interface SpinDailyWheelRequest {
  childId: string;
  isAdSpin: boolean;   // Reklam izleyerek ekstra çevirme
}

interface SpinDailyWheelResponse {
  reward: {
    type: 'stars' | 'gems' | 'streak_freeze' | 'cosmetic';
    amount?: number;
    itemId?: string;
  };
  slotIndex: number;              // Çarkın hangi diliminde durduğu (animasyon için)
  nextFreeSpinAt: number;         // Unix timestamp
  adSpinsRemaining: number;
}

// Çark sonucu SERVER'da belirlenir (anti-cheat)
// Weighted random: Olasılık tablosu server-side
// Rate limit: Günde max 2 (1 free + 1 ad)
```

#### `purchaseShopItem`
```typescript
interface PurchaseShopItemRequest {
  childId: string;
  itemId: string;
  currency: 'stars' | 'gems';
}

// Validasyon:
// 1. Item mevcut mu ve satışta mı?
// 2. Yeterli bakiye var mı?
// 3. Zaten sahip mi? (duplicate purchase engeli)
// 4. Yaş grubuna uygun mu?
// Atomic transaction: Bakiye düşür + item ekle (race condition önleme)
```

#### `useStreakFreeze`
```typescript
interface UseStreakFreezeRequest {
  childId: string;
}

// Validasyon:
// 1. Streak freeze hakkı var mı?
// 2. Bugün zaten kullanılmış mı?
// 3. Streak zaten sıfırlanmış mı? (geçmiş güne freeze uygulanamaz)
```

---

### 3.4 Social Functions

#### `getLeaderboard`
```typescript
interface GetLeaderboardRequest {
  childId: string;
  league: League;
  type: 'weekly' | 'allTime';
  limit?: number;   // Default 30
}

interface GetLeaderboardResponse {
  rankings: LeaderboardEntry[];
  myRank: number;
  myScore: number;
  leagueInfo: {
    name: string;
    promotionThreshold: number;  // Top N → promote
    relegationThreshold: number; // Bottom N → relegate
    endsAt: number;              // Unix timestamp
  };
}

interface LeaderboardEntry {
  rank: number;
  childName: string;
  avatar: string;
  score: number;
  level: number;
  // NOT: childId paylaşılMAZ (gizlilik)
}
```

---

### 3.5 Purchase Functions

#### `validateReceipt`
```typescript
interface ValidateReceiptRequest {
  platform: 'ios' | 'android';
  receipt: string;           // Base64 encoded receipt
  productId: string;
}

interface ValidateReceiptResponse {
  valid: boolean;
  entitlements: string[];    // Aktif haklar
  expiresAt?: number;        // Abonelik bitiş tarihi
}

// RevenueCat webhook'u ile de doğrulanır (dual validation)
// Receipt doğrulaması ASLA client-side yapılmaz
```

#### `restorePurchases`
```typescript
// Cihaz değiştiren kullanıcılar için
// RevenueCat üzerinden restore
```

---

## 4. Firestore Triggers

### 4.1 `onUserCreate`
```typescript
// Auth → yeni kullanıcı oluşturulduğunda
export const onUserCreate = onDocumentCreated(
  'parents/{parentId}',
  async (event) => {
    const parentId = event.params.parentId;
    
    // 1. Welcome notification ayarla
    // 2. Analytics event: 'user_registered'
    // 3. Default ayarları oluştur
    // 4. Free trial başlat (3 gün premium)
  }
);
```

### 4.2 `onLessonComplete`
```typescript
// Ders tamamlandığında triggered (progress/$childId/lessons/$lessonId)
export const onLessonComplete = onDocumentCreated(
  'progress/{childId}/lessons/{lessonId}',
  async (event) => {
    const childId = event.params.childId;
    const lessonData = event.data!.data();
    
    // 1. Liderlik tablosu puanını güncelle
    await updateLeaderboardScore(childId, lessonData.xpEarned);
    
    // 2. Haftalık rapor verilerini güncelle
    await updateWeeklyStats(childId, lessonData);
    
    // 3. Nova mutluluk güncelle
    await updateNovaHappiness(childId, +5);
    
    // 4. Push notification (ebeveyne)
    if (lessonData.stars === 3) {
      await sendParentNotification(childId, {
        type: 'child_achievement',
        title: '⭐⭐⭐ 3 Yıldız!',
        body: `${childName} dersi mükemmel tamamladı!`,
      });
    }
  }
);
```

### 4.3 `onAchievementUnlock`
```typescript
export const onAchievementUnlock = onDocumentCreated(
  'gamification/{childId}/achievements/{achievementId}',
  async (event) => {
    // 1. Push notification (çocuğa — uygulamada)
    // 2. Ebeveyne bildirim
    // 3. Analytics event
    // 4. Liderlik tablosu bonus puan
  }
);
```

---

## 5. Scheduled Functions (Cron Jobs)

### 5.1 Günlük Streak Kontrolü

```typescript
// Her gün 04:00 (UTC+3) → Streak kontrolü
export const dailyStreakCheck = onSchedule(
  {
    schedule: '0 1 * * *',    // 01:00 UTC = 04:00 TR
    timeZone: 'Europe/Istanbul',
    region: 'europe-west1',
  },
  async () => {
    // 1. Son 24 saatte ders tamamlamamış aktif kullanıcıları bul
    const inactiveChildren = await db.collectionGroup('children')
      .where('lastActiveDate', '<', yesterday)
      .where('settings.streakNotification', '==', true)
      .get();
    
    for (const child of inactiveChildren.docs) {
      const childData = child.data();
      const progressRef = db.doc(`progress/${child.id}`);
      const progress = (await progressRef.get()).data();
      
      if (progress.currentStreak > 0) {
        // Streak freeze kontrolü
        const gamRef = db.doc(`gamification/${child.id}`);
        const gam = (await gamRef.get()).data();
        
        if (gam.streakFreezes > 0 && gam.autoUseFreeze) {
          // Otomatik freeze kullan
          await gamRef.update({
            streakFreezes: FieldValue.increment(-1),
            lastFreezeUsed: FieldValue.serverTimestamp(),
          });
        } else {
          // Streak sıfırla
          await progressRef.update({
            previousStreak: progress.currentStreak,
            currentStreak: 0,
          });
          
          // Nova üzülür
          await gamRef.update({ 'nova.happiness': Math.max(0, gam.nova.happiness - 20) });
        }
      }
    }
    
    // 2. Streak tehlikesi bildirimi (akşam 18:00'de gönderilecek olanları hazırla)
    await prepareStreakWarningNotifications();
  }
);
```

### 5.2 Günlük Görev Atama

```typescript
// Her gün 00:05 (UTC+3) → Yeni günlük görevler
export const dailyQuestAssign = onSchedule(
  {
    schedule: '5 21 * * *',   // 21:05 UTC = 00:05 TR (ertesi gün)
    timeZone: 'Europe/Istanbul',
    region: 'europe-west1',
  },
  async () => {
    // Tüm aktif çocuklar için yeni görevler ata
    // Son 7 günde aktif olanlar
    const activeChildren = await getActiveChildren(7);
    
    // Batch halinde işle (500'er)
    for (const batch of chunk(activeChildren, 500)) {
      await Promise.all(batch.map(child => 
        assignDailyQuests(child.id, child.ageGroup)
      ));
    }
    
    // Push notification: "Yeni günlük görevlerin hazır!"
    await sendBulkNotification(activeChildren, {
      type: 'daily_quests',
      title: '🎯 Yeni Görevler!',
      body: 'Bugünün görevleri seni bekliyor!',
      scheduledFor: '09:00', // Sabah 9'da gönder
    });
  }
);
```

### 5.3 Haftalık Liga Reset

```typescript
// Her Pazartesi 04:00 (UTC+3) → Liga sonuçları + yeni hafta
export const weeklyLeagueReset = onSchedule(
  {
    schedule: '0 1 * * 1',    // Pazartesi 01:00 UTC
    timeZone: 'Europe/Istanbul',
    region: 'europe-west1',
  },
  async () => {
    const leagues = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'legend'];
    
    for (const league of leagues) {
      // 1. Tüm grupları al
      const groups = await db.collection(`leaderboards/${league}/groups`).get();
      
      for (const group of groups.docs) {
        const rankings = group.data().rankings;
        
        // 2. Ödülleri dağıt
        await distributeLeagueRewards(league, rankings);
        
        // 3. Yükseltme/Düşürme
        const topN = getPromotionCount(league);
        const bottomN = getRelegationCount(league);
        
        // Top N → bir üst lige
        for (const entry of rankings.slice(0, topN)) {
          await promoteChild(entry.childId, league);
        }
        
        // Bottom N → bir alt lige (bronz hariç)
        if (league !== 'bronze') {
          for (const entry of rankings.slice(-bottomN)) {
            await relegateChild(entry.childId, league);
          }
        }
      }
      
      // 4. Yeni hafta için grupları oluştur (30'ar kişilik)
      await createNewLeagueGroups(league);
    }
    
    // 5. Bildirimler
    await sendLeagueResultNotifications();
  }
);
```

### 5.4 Haftalık Rapor (Ebeveyne)

```typescript
// Her Pazar 10:00 → Ebeveyne haftalık özet
export const weeklyReport = onSchedule(
  {
    schedule: '0 7 * * 0',    // Pazar 07:00 UTC = 10:00 TR
    timeZone: 'Europe/Istanbul',
    region: 'europe-west1',
  },
  async () => {
    const parents = await getParentsWithActiveChildren();
    
    for (const parent of parents) {
      const children = await getChildren(parent.id);
      
      for (const child of children) {
        const report = await generateWeeklyReport(child.id);
        
        // Push notification
        await sendParentNotification(parent.id, {
          type: 'weekly_report',
          title: `📊 ${child.name}'in Haftalık Raporu`,
          body: `${report.lessonsCompleted} ders, ${report.wordsLearned} kelime öğrendi!`,
          data: { report },
        });
      }
    }
  }
);
```

### 5.5 Aylık Temizlik

```typescript
// Her ayın 1'i 03:00 → Eski verileri temizle
export const monthlyCleanup = onSchedule(
  {
    schedule: '0 0 1 * *',    // Ayın 1'i 00:00 UTC
    timeZone: 'Europe/Istanbul',
    region: 'europe-west1',
  },
  async () => {
    // 1. 90 günden eski analitik loglar → sil
    // 2. Streak freeze haklarını resetle
    // 3. Pasif kullanıcıları (90 gün) işaretle
    // 4. Firestore storage optimizasyonu
    // 5. Expired subscription'ları temizle
  }
);
```

---

## 6. HTTP Endpoints (Webhook'lar)

### 6.1 RevenueCat Webhook

```typescript
// RevenueCat satın alma olaylarını dinler
export const revenuecatWebhook = onRequest(
  { region: 'europe-west1' },
  async (req, res) => {
    // 1. Webhook signature doğrula
    const isValid = verifyRevenueCatSignature(req);
    if (!isValid) {
      res.status(401).send('Invalid signature');
      return;
    }
    
    const event = req.body;
    
    switch (event.type) {
      case 'INITIAL_PURCHASE':
        await handleNewSubscription(event);
        break;
      case 'RENEWAL':
        await handleRenewal(event);
        break;
      case 'CANCELLATION':
        await handleCancellation(event);
        break;
      case 'EXPIRATION':
        await handleExpiration(event);
        break;
      case 'NON_RENEWING_PURCHASE':
        await handleOneTimePurchase(event);
        break;
    }
    
    res.status(200).send('OK');
  }
);
```

### 6.2 Health Check

```typescript
export const healthCheck = onRequest(
  { region: 'europe-west1' },
  async (req, res) => {
    const health = {
      status: 'ok',
      timestamp: Date.now(),
      version: process.env.APP_VERSION,
      services: {
        firestore: await checkFirestore(),
        auth: await checkAuth(),
        storage: await checkStorage(),
      },
    };
    
    res.status(200).json(health);
  }
);
```

---

## 7. Anti-Cheat Sistemi

### 7.1 Server-Side Doğrulama

```typescript
async function antiCheatCheck(data: SubmitLessonResultRequest): Promise<void> {
  // 1. Zaman kontrolü: Ders süresi makul mü?
  const minDuration = data.activities.length * 10; // En az 10sn/aktivite
  const maxDuration = data.activities.length * 300; // En fazla 5dk/aktivite
  
  if (data.duration < minDuration) {
    throw new HttpsError('invalid-argument', 'Lesson completed too quickly');
  }
  
  if (data.duration > maxDuration) {
    // Muhtemelen uygulamayı açık bırakmış, sadece süreyi cap'le
    data.duration = maxDuration;
  }
  
  // 2. XP rate kontrolü: Saatte max 300 XP
  const recentXP = await getXPInLastHour(data.childId);
  if (recentXP > 500) {
    logger.warn(`Anti-cheat: High XP rate for ${data.childId}`);
    // XP'yi yarıya düşür (ban yerine soft penalty)
  }
  
  // 3. İmkansız skor kontrolü
  // %100 doğruluk + minimum süre → şüpheli
  const accuracy = data.activities.reduce((s, a) => s + a.correct, 0) /
                   data.activities.reduce((s, a) => s + a.total, 0);
  
  if (accuracy === 1 && data.duration < minDuration * 2) {
    logger.warn(`Anti-cheat: Suspicious perfect score for ${data.childId}`);
  }
  
  // 4. Duplicate submission kontrolü (idempotency)
  const existingLesson = await db.doc(
    `progress/${data.childId}/lessons/${data.lessonId}`
  ).get();
  
  if (existingLesson.exists) {
    throw new HttpsError('already-exists', 'Lesson already submitted');
  }
}
```

---

## 8. Rate Limiting

```typescript
// Firebase App Check + Custom rate limiting

const RATE_LIMITS = {
  'submitLessonResult': { windowMs: 60_000, max: 10 },    // 10/dk
  'createChildProfile': { windowMs: 60_000, max: 5 },     // 5/dk
  'spinDailyWheel': { windowMs: 86_400_000, max: 2 },     // 2/gün
  'purchaseShopItem': { windowMs: 60_000, max: 20 },      // 20/dk
  'getLeaderboard': { windowMs: 60_000, max: 30 },        // 30/dk
  'syncOfflineProgress': { windowMs: 60_000, max: 5 },    // 5/dk
};

// Implementation: Firestore counter document per user per endpoint
// TTL: Firestore TTL policy ile otomatik temizlenir
```

---

## 9. Error Handling

```typescript
// Standart hata türleri
enum AppErrorCode {
  INVALID_INPUT = 'invalid-argument',
  NOT_FOUND = 'not-found',
  PERMISSION_DENIED = 'permission-denied',
  RATE_LIMITED = 'resource-exhausted',
  INTERNAL = 'internal',
  UNAUTHENTICATED = 'unauthenticated',
  ALREADY_EXISTS = 'already-exists',
  INSUFFICIENT_FUNDS = 'failed-precondition', // Yeterli yıldız/elmas yok
}

// Hata response formatı
interface AppError {
  code: AppErrorCode;
  message: string;        // Kullanıcıya gösterilebilir
  details?: unknown;      // Debug bilgi (only in dev)
}

// Global error handler
function handleError(error: unknown): HttpsError {
  if (error instanceof HttpsError) return error;
  
  logger.error('Unhandled error:', error);
  return new HttpsError('internal', 'Bir şeyler ters gitti. Lütfen tekrar dene.');
}
```

---

## 10. SRS (Spaced Repetition) Engine

```typescript
// Modified SM-2 Algorithm — Çocuklar için basitleştirilmiş

interface SRSCard {
  wordId: string;
  easeFactor: number;      // 1.3 - 2.5
  interval: number;        // Gün cinsinden
  repetitions: number;     // Ardışık doğru tekrar
  nextReviewDate: Date;
  status: 'learning' | 'reviewing' | 'mastered';
}

function calculateNextReview(card: SRSCard, rating: 1 | 2 | 3 | 4 | 5): SRSCard {
  let { easeFactor, interval, repetitions } = card;
  
  if (rating < 3) {
    // Bilmiyorum / Zor → Reset
    repetitions = 0;
    interval = 1; // Yarın tekrar
  } else {
    repetitions += 1;
    
    if (repetitions === 1) {
      interval = 1;         // 1 gün
    } else if (repetitions === 2) {
      interval = 3;         // 3 gün
    } else if (repetitions === 3) {
      interval = 7;         // 1 hafta
    } else {
      interval = Math.round(interval * easeFactor);
    }
    
    // Ease factor güncelle
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02)));
  }
  
  // Mastered: 6+ tekrar, interval > 30 gün
  const status = repetitions >= 6 && interval > 30 ? 'mastered'
               : repetitions > 0 ? 'reviewing'
               : 'learning';
  
  return {
    ...card,
    easeFactor,
    interval,
    repetitions,
    nextReviewDate: addDays(new Date(), interval),
    status,
  };
}

// Günlük review kuyruğu
async function getDailyReviewQueue(childId: string, limit: number = 20): Promise<SRSCard[]> {
  const today = new Date();
  
  return await db.collection(`progress/${childId}/vocabulary`)
    .where('nextReviewDate', '<=', today)
    .where('status', '!=', 'mastered')
    .orderBy('nextReviewDate')
    .limit(limit)
    .get()
    .then(snap => snap.docs.map(doc => doc.data() as SRSCard));
}
```

---

## 11. Notification Service

```typescript
// Firebase Cloud Messaging (FCM)

interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  scheduledFor?: string;     // Zamanlı gönderim
}

type NotificationType =
  | 'streak_warning'        // "Streak'ini kaybetme!"
  | 'daily_quests'          // "Yeni görevler!"
  | 'weekly_report'         // Ebeveyn raporu
  | 'child_achievement'     // Çocuk başarımı (ebeveyne)
  | 'league_result'         // Haftalık liga sonucu
  | 'nova_miss'             // "Nova seni özledi!"
  | 'new_content'           // Yeni içerik
  | 'subscription';          // Abonelik hatırlatma

// Frekans kuralları (COPPA uyumlu)
const NOTIFICATION_RULES = {
  maxPerDay: 3,                // Günde max 3 bildirim
  quietHoursStart: '21:00',   // Sessiz saat başlangıcı
  quietHoursEnd: '08:00',     // Sessiz saat bitişi
  minInterval: 120,            // Bildirimler arası minimum 2 saat
  childNotifications: false,   // Çocuğa push bildirim GÖNDERİLMEZ
  parentOnly: true,            // Sadece ebeveyne
};
```

---

## 12. Security Middleware

```typescript
// Tüm callable function'larda çalışır

async function securityMiddleware(request: CallableRequest): Promise<void> {
  // 1. Authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }
  
  // 2. App Check (cihaz doğrulama)
  if (!request.app) {
    throw new HttpsError('failed-precondition', 'App Check required');
  }
  
  // 3. Rate limiting
  await checkRateLimit(request.auth.uid, request.rawRequest.url);
  
  // 4. Account status (banned/suspended check)
  const parent = await db.doc(`parents/${request.auth.uid}`).get();
  if (parent.data()?.status === 'banned') {
    throw new HttpsError('permission-denied', 'Account suspended');
  }
}

// Child ownership doğrulama
async function verifyChildOwnership(parentId: string, childId: string): Promise<void> {
  const child = await db.doc(`parents/${parentId}/children/${childId}`).get();
  if (!child.exists) {
    throw new HttpsError('permission-denied', 'Not your child');
  }
}
```
