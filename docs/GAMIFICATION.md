# NovaLingo — Gamification Sistemi

> Oyunlaştırma mekanikleri, formüller, dengeler ve psikoloji
> Son güncelleme: 28 Şubat 2026

---

## 1. Gamification Felsefesi

### Temel Prensipler
1. **Intrinsic > Extrinsic:** Ödüller öğrenme motivasyonunu DESTEKLEMELİ, DEĞİŞTİRMEMELİ
2. **Mastery over performance:** Başarısızlık = öğrenme fırsatı, asla cezalandırma yok
3. **Social comparison lite:** Liderlik tablosu var ama agresif değil, "ilham" odaklı
4. **Predictable + Surprise:** Temel ödüller öngörülebilir, sürpriz ödüller ek motivasyon
5. **No pay-to-win:** Satın alınabilir itemler SADECE kosmetik, öğrenme avantajı yok

---

## 2. XP (Experience Points) Sistemi

### 2.1 XP Kazanma Kaynakları

| Kaynak | XP Miktarı | Koşul |
|--------|-----------|-------|
| Aktivite tamamlama | 5-15 XP | Aktivite tipine göre değişir |
| Ders tamamlama | 20-60 XP | Yıldız sayısına göre (1★=20, 2★=40, 3★=60) |
| İlk deneme bonusu | +20 XP | Dersi ilk kez tamamlama |
| Mükemmel ders | +30 XP | %100 doğruluk |
| Streak bonusu | +streak×2 XP | Günlük streak (max 60 XP bonus) |
| Günlük görev | 10-30 XP | Görev tipine göre |
| Haftalık görev | 50-100 XP | Görev tipine göre |
| Başarım açma | 25-100 XP | Başarım seviyesine göre |
| SRS tekrar (mastered) | +10 XP | Kelimeyi master seviyeye getir |
| Combo bonus | ×1.5 - ×3 XP | Quiz'de ardışık doğru cevap |

### 2.2 XP Hesaplama Formülü

```typescript
function calculateLessonXP(params: {
  activityCount: number;
  correctAnswers: number;
  totalAnswers: number;
  isFirstAttempt: boolean;
  currentStreak: number;
  hasXPBoost: boolean;
}): number {
  const { activityCount, correctAnswers, totalAnswers, isFirstAttempt, currentStreak, hasXPBoost } = params;
  
  // Temel XP
  const baseXP = activityCount * 10;
  
  // Doğruluk oranı
  const accuracy = correctAnswers / totalAnswers;
  const accuracyMultiplier = accuracy >= 0.9 ? 1.5 
                           : accuracy >= 0.7 ? 1.2 
                           : accuracy >= 0.5 ? 1.0 
                           : 0.8; // Minimum %80 XP (motivasyon kırılmasın)
  
  // İlk deneme bonusu
  const firstAttemptBonus = isFirstAttempt ? 20 : 0;
  
  // Mükemmel ders bonusu
  const perfectBonus = accuracy === 1.0 ? 30 : 0;
  
  // Streak bonusu (capped at 30 days)
  const streakBonus = Math.min(currentStreak, 30) * 2;
  
  // XP Boost (premium store item)
  const boostMultiplier = hasXPBoost ? 2 : 1;
  
  // Toplam
  const totalXP = Math.round(
    (baseXP * accuracyMultiplier + firstAttemptBonus + perfectBonus + streakBonus) * boostMultiplier
  );
  
  return totalXP;
}
```

### 2.3 Yıldız Hesaplama

```typescript
function calculateStars(accuracy: number): 1 | 2 | 3 {
  if (accuracy >= 0.90) return 3;
  if (accuracy >= 0.70) return 2;
  return 1; // Minimum 1 yıldız (asla 0 değil)
}
```

---

## 3. Seviye (Level) Sistemi

### 3.1 Seviye-XP Tablosu

```typescript
// Fibonacci-benzeri ilerleme, ilk seviyelere hızlı, sonrası kademeli zor
function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level <= 5) return (level - 1) * 100;                    // 100, 200, 300, 400
  if (level <= 15) return 400 + (level - 5) * 200;              // 600, 800, ... 2400
  if (level <= 30) return 2400 + (level - 15) * 400;            // 2800, 3200, ... 8400
  if (level <= 50) return 8400 + (level - 30) * 600;            // 9000, 9600, ... 20400
  if (level <= 75) return 20400 + (level - 50) * 1000;          // 21400, ... 45400
  return 45400 + (level - 75) * 1500;                            // 46900, ... 
}

// Seviye tablosu (ilk 15)
// Level 1:  0 XP        (başlangıç)
// Level 2:  100 XP      (~2 ders)
// Level 3:  200 XP      (~4 ders)
// Level 4:  300 XP      (~6 ders)
// Level 5:  400 XP      (~8 ders)
// Level 6:  600 XP      (~12 ders)
// Level 7:  800 XP      (~16 ders)
// Level 8:  1000 XP     (~20 ders)
// Level 9:  1200 XP     (~24 ders)
// Level 10: 1400 XP     (~28 ders, ~1 ay aktif kullanım)
// Level 15: 2400 XP     (~2 ay)
// Level 20: 4400 XP     (~3.5 ay)
// Level 30: 8400 XP     (~7 ay)
// Level 50: 20400 XP    (~1.5 yıl)
// Level 100: 120400 XP  (~8+ yıl, efsanevi)
```

### 3.2 Level-Up Ödülleri

| Level | Ödül |
|-------|------|
| 2 | 50 Yıldız + ilk rozet |
| 5 | 100 Yıldız + yeni avatar seçeneği |
| 10 | 200 Yıldız + 20 Elmas + özel çerçeve |
| 15 | 300 Yıldız + yeni dünya açılışı |
| 20 | 500 Yıldız + 50 Elmas + özel aksesuar |
| 25 | Nova → Teen evrimi |
| 30 | 1000 Yıldız + 100 Elmas + özel tema |
| 40 | Nova → Adult evrimi |
| 50 | LEGENDARY milestone + özel animasyon |
| Her 5 level | Streak freeze + 30 Yıldız |

### 3.3 Level-Up Animasyon Sırası

```
1. Ekran kararır (overlay)
2. Level up yazısı girer (scale + glow)
3. Eski level → Yeni level animasyonu (sayı geçişi)
4. Konfeti patlaması
5. Ödül kutusu animasyonu (kutu açılır → ödüller çıkar)
6. Nova kutlama dansı
7. "Harika!" butonu → devam
```

---

## 4. Streak (Seri) Sistemi

### 4.1 Streak Kuralları

```typescript
interface StreakRules {
  // Streak sayılması için minimum aktivite
  minimumLessonsPerDay: 1;           // 1 ders tamamlamak yeterli
  
  // Streak sıfırlanma kuralı
  resetTime: '04:00';               // Her gün saat 04:00'te kontrol (gece yarısı değil!)
  timezone: 'user_local';            // Kullanıcının lokal saati
  
  // Streak freeze
  freezeCount: {
    free: 1,                         // Free: Ayda 1 freeze
    premium: 3,                      // Premium: Ayda 3 freeze
  };
  freezeRefreshDay: 1;               // Her ayın 1'inde reset
  
  // Grace period
  gracePeriodHours: 4;               // 04:00-08:00 arası grace period
  // (gece geç yatan çocuklar için sabah fırsatı)
  
  // Streak milestone ödülleri
  milestones: [3, 7, 14, 30, 50, 100, 365];
}
```

### 4.2 Streak Milestone Ödülleri

| Gün | Mesaj | Ödül |
|-----|-------|------|
| 3 | "3 gün üst üste! Başlangıç!" | 30 ⭐ |
| 7 | "Bir hafta! Muhteşem!" | 100 ⭐ + 10 💎 + Alev rozeti |
| 14 | "2 hafta! Kararlılığın harika!" | 200 ⭐ + 20 💎 + Streak freeze |
| 30 | "Bir ay! OLAĞANÜSTÜ!" | 500 ⭐ + 50 💎 + Özel çerçeve |
| 50 | "50 gün! Efsane oluyorsun!" | 1000 ⭐ + 100 💎 + Özel aksesuar |
| 100 | "100 gün! İNANILMAZ!" | 2000 ⭐ + 200 💎 + Efsanevi rozet |
| 365 | "1 YIL! DÜNYANIN EN İYİSİ!" | 5000 ⭐ + 500 💎 + Efsanevi karakter |

### 4.3 Streak Kaybı Senaryosu

```
Streak kaybı → "Streak'in sıfırlandı 😢" → 
  Nova üzgün animasyonu →
  "Ama endişelenme, yeni bir başlangıç yapabiliriz!" →
  IF (freeze available): "Streak Freeze kullan → streak geri gelir!"
  IF (no freeze): "Şimdi bir ders tamamlayarak yeni streak başlat!"
  
  // Asla: "Kaybettin!" veya negatif dil kullanma
  // Her zaman: Pozitif çerçeveleme + aksiyon önerisi
```

---

## 5. Sanal Ekonomi

### 5.1 Çift Para Sistemi

```
┌───────────────────────────────────────────┐
│     ⭐ YILDIZ (Soft Currency)             │
│                                            │
│  Kazanma: Ders, görev, streak, reklam      │
│  Harcama: İpucu, SRS boost, temel item     │
│  Bolca dağıtılır, oyunu döndürür           │
│  Günlük kazanım: ~100-300 yıldız           │
│  Enflasyon kontrolü: Harcama noktaları     │
└───────────────────────────────────────────┘

┌───────────────────────────────────────────┐
│     💎 ELMAS (Hard Currency)              │
│                                            │
│  Kazanma: Level-up, milestone, IAP, nadiren│
│  Harcama: Premium kosmetik, streak freeze  │
│  Kıt tutulur, değerli hissettirilir        │
│  Günlük kazanım: ~2-10 elmas (organik)     │
│  Ana IAP gelir kaynağı                     │
└───────────────────────────────────────────┘
```

### 5.2 Ekonomi Dengesi

```typescript
// Günlük ortalama kazanım (aktif kullanıcı, free)
const DAILY_EARN_FREE = {
  stars: {
    lessons: 100,       // 3 ders × ~33 yıldız
    quests: 50,         // Günlük görevler
    streak: 20,         // Streak bonusu
    rewarded_ad: 50,    // 1 ödüllü reklam
    total: 220,
  },
  gems: {
    lessons: 0,
    quests: 2,          // Nadir görev ödülü
    streak_milestone: 0, // Ara sıra
    level_up: 0,        // Ara sıra
    total: 2,
  },
};

// Günlük ortalama harcama hedefi
const DAILY_SPEND_TARGET = {
  stars: 150,           // İpucu + boost + cosmetic tasarrufu
  gems: 1,             // Nadiren → birikim → büyük satın alma
};

// Denge: Kazanım > Harcama → kullanıcı birikim yapabilir
// Ama premium itemler elmas gerektirdiği için IAP motivasyonu var
```

---

## 6. Başarım (Achievement) Sistemi

### 6.1 Başarım Kategorileri

#### 🎓 Öğrenme Başarımları
| ID | Başarım | Koşul | Ödül |
|----|---------|-------|------|
| learn_01 | İlk Adım | İlk dersi tamamla | 20 ⭐ |
| learn_02 | Kelime Avcısı | 50 kelime öğren | 100 ⭐ + 10 💎 |
| learn_03 | Kelime Ustası | 200 kelime öğren | 300 ⭐ + 30 💎 |
| learn_04 | Sözlük | 500 kelime öğren | 1000 ⭐ + 100 💎 |
| learn_05 | Mükemmel Ders | Bir derste %100 doğruluk | 50 ⭐ |
| learn_06 | Yıldız Toplayıcı | 50 ders ⭐⭐⭐ al | 200 ⭐ + 20 💎 |
| learn_07 | Dünya Kaşifi 1 | İlk dünyayı tamamla | 300 ⭐ + 30 💎 |
| learn_08 | Dünya Fatih | 3 dünya tamamla | 500 ⭐ + 50 💎 |
| learn_09 | Çok Yönlü | Her aktivite tipini en az 1 kez tamamla | 100 ⭐ |
| learn_10 | Hikaye Kurdu | 10 hikaye oku | 100 ⭐ + 10 💎 |

#### 🔥 Streak Başarımları
| ID | Başarım | Koşul | Ödül |
|----|---------|-------|------|
| streak_01 | Ateş Yakmak | 3 günlük streak | 30 ⭐ |
| streak_02 | Hafta Kaplanı | 7 günlük streak | 100 ⭐ + 10 💎 |
| streak_03 | Çelik İrade | 14 günlük streak | 200 ⭐ + 20 💎 |
| streak_04 | Ay Yıldızı | 30 günlük streak | 500 ⭐ + 50 💎 |
| streak_05 | Efsane | 100 günlük streak | 2000 ⭐ + 200 💎 |

#### ⚔️ Oyun Başarımları
| ID | Başarım | Koşul | Ödül |
|----|---------|-------|------|
| game_01 | Hafıza Şampiyonu | Memory game'de mükemmel skor | 50 ⭐ |
| game_02 | Hızlı Parmak | Quiz'de 5 ardışık doğru (5 combo) | 50 ⭐ |
| game_03 | Bulmaca Ustası | 10 word search tamamla | 100 ⭐ |
| game_04 | Konuşkan | 50 SpeakIt aktivitesi tamamla | 100 ⭐ + 10 💎 |
| game_05 | Mimar | 100 WordBuilder tamamla | 100 ⭐ + 10 💎 |

#### 🎭 Koleksiyon Başarımları
| ID | Başarım | Koşul | Ödül |
|----|---------|-------|------|
| col_01 | Koleksiyoner | 5 item topla | 50 ⭐ |
| col_02 | Moda Tutkusu | Avatar'a 3 aksesuar tak | 30 ⭐ |
| col_03 | Nova Bakıcısı | Nova'yı child aşamaya evir | 100 ⭐ |
| col_04 | Nova Legends | Nova'yı legendary aşamaya evir | 1000 ⭐ + 100 💎 |

#### 🗓️ Özel Başarımlar (Gizli)
| ID | Başarım | Koşul | Ödül |
|----|---------|-------|------|
| special_01 | Gece Kuşu | Gece 22:00'den sonra ders tamamla | 50 ⭐ |
| special_02 | Erken Kuş | Sabah 07:00'den önce ders tamamla | 50 ⭐ |
| special_03 | Hafta Sonu Savaşçısı | Cumartesi + Pazar ders tamamla | 50 ⭐ |
| special_04 | Yıldız Yağmuru | Bir günde 500 yıldız kazan | 100 ⭐ |

> **Toplam: 50+ başarım (v1.0), her güncellemeyle yenileri eklenir**

### 6.2 Başarım Açma Animasyonu

```
1. Ekranın ortasında rozet görünür (scale: 0 → 1, rotation)
2. Altın parçacıklar etrafında döner
3. Rozet ismi ve açıklama fade-in
4. "Kazandın!" ses efekti
5. Ödül gösterimi (yıldız/elmas animasyonu)
6. "Harika!" butonu
7. Koleksiyona eklendi bildirimi
```

---

## 7. Günlük Görev (Daily Quest) Sistemi

### 7.1 Görev Havuzu

```typescript
const QUEST_POOL = {
  daily: [
    { type: 'complete_lessons', target: 3, reward: { stars: 50, xp: 20 } },
    { type: 'learn_words', target: 10, reward: { stars: 40, xp: 15 } },
    { type: 'perfect_activity', target: 1, reward: { stars: 30, xp: 10 } },
    { type: 'play_minutes', target: 10, reward: { stars: 30, xp: 10 } },
    { type: 'complete_memory', target: 2, reward: { stars: 40, xp: 15 } },
    { type: 'complete_quiz', target: 1, reward: { stars: 50, xp: 20 } },
    { type: 'review_words', target: 5, reward: { stars: 30, xp: 10 } },
    { type: 'speak_words', target: 3, reward: { stars: 40, xp: 15 } },
    { type: 'read_story', target: 1, reward: { stars: 50, xp: 20 } },
    { type: 'combo_5', target: 1, reward: { stars: 60, xp: 25 } },
  ],
  
  weekly: [
    { type: 'complete_lessons', target: 15, reward: { stars: 200, xp: 100, gems: 10 } },
    { type: 'learn_words', target: 50, reward: { stars: 300, xp: 150, gems: 15 } },
    { type: 'streak_days', target: 7, reward: { stars: 500, xp: 200, gems: 20 } },
    { type: 'perfect_lessons', target: 5, reward: { stars: 400, xp: 150, gems: 15 } },
    { type: 'all_activity_types', target: 10, reward: { stars: 300, xp: 100, gems: 10 } },
  ],
};
```

### 7.2 Görev Atama Algoritması

```typescript
function assignDailyQuests(child: Child): Quest[] {
  // Her gün 3 günlük görev ata
  const quests: Quest[] = [];
  const pool = [...QUEST_POOL.daily];
  
  // Kural 1: Çocuğun yaş grubuna uygun görevler
  const filteredPool = pool.filter(q => isAgeAppropriate(q, child.ageGroup));
  
  // Kural 2: Dün atananları tekrarlama (fresh feel)
  const yesterday = getYesterdayQuests(child.id);
  const availablePool = filteredPool.filter(q => !yesterday.includes(q.type));
  
  // Kural 3: 1 kolay + 1 orta + 1 zor karışım
  quests.push(pickRandom(availablePool, 'easy'));
  quests.push(pickRandom(availablePool, 'medium'));
  quests.push(pickRandom(availablePool, 'hard'));
  
  // Kural 4: Tüm görevler 1 oturumda (~15dk) tamamlanabilir olmalı
  
  return quests;
}
```

### 7.3 Tüm Günlük Görevler Tamamlama Bonusu

Üç görevin hepsi tamamlandığında:
- **Bonus ödül kutusu** açılır (animasyonlu)
- İçerik: 100 Yıldız + rastgele ödül (5 Elmas VEYA cosmetic item VEYA XP boost)
- Bonus kutusu motivasyonu: "Her gün 3/3 tamamla, bonus kazan!"

---

## 8. Haftalık Turnuva (Leaderboard)

### 8.1 Liga Sistemi

```
┌─────────────────────────┐
│     🏆 LİGA YAPISI      │
├─────────────────────────┤
│ Bronz Lig    (Yeni)     │  → Top 10 → Gümüş'e yükselir
│ Gümüş Lig              │  → Top 10 → Altın'a yükselir
│ Altın Lig              │  → Top 10 → Platin'e yükselir
│ Platin Lig             │  → Top 10 → Elmas'a yükselir
│ Elmas Lig              │  → Top 3 → Efsane'ye yükselir
│ Efsane Lig (En üst)    │  → Top 3 → Hall of Fame
└─────────────────────────┘

Her lig: 30 kişilik gruplar (matchmaking: benzer level + yaş)
Haftalık reset: Her Pazartesi 04:00
```

### 8.2 Sıralama Puanı

```typescript
// Haftalık puan = XP + bonus
function weeklyScore(weeklyXP: number, weeklyLessons: number, weeklyWords: number): number {
  return weeklyXP + (weeklyLessons * 5) + (weeklyWords * 3);
}
```

### 8.3 Liga Ödülleri

| Lig | 1. Sıra | 2. Sıra | 3. Sıra | Top 10 | Herkes |
|-----|---------|---------|---------|--------|--------|
| Bronz | 100 ⭐ | 75 ⭐ | 50 ⭐ | 30 ⭐ | 10 ⭐ |
| Gümüş | 200 ⭐ + 10 💎 | 150 ⭐ | 100 ⭐ | 50 ⭐ | 20 ⭐ |
| Altın | 300 ⭐ + 20 💎 | 200 ⭐ + 10 💎 | 150 ⭐ | 75 ⭐ | 30 ⭐ |
| Platin | 500 ⭐ + 30 💎 | 300 ⭐ + 20 💎 | 200 ⭐ + 10 💎 | 100 ⭐ | 50 ⭐ |
| Elmas | 1000 ⭐ + 50 💎 | 500 ⭐ + 30 💎 | 300 ⭐ + 20 💎 | 150 ⭐ | 75 ⭐ |
| Efsane | 2000 ⭐ + 100 💎 | 1000 ⭐ + 50 💎 | 500 ⭐ + 30 💎 | 200 ⭐ | 100 ⭐ |

---

## 9. Nova Maskot Evrimi

### 9.1 Evrim Aşamaları

```
    🥚 EGG          🐣 BABY         🧒 CHILD        🧑 TEEN         🦸 ADULT        ⚡ LEGENDARY
    (0 XP)         (500 XP)       (2000 XP)       (5000 XP)      (15000 XP)      (50000 XP)
     ___            ___             ___              ___             ___              ___
    /   \          / o \           / o o\           / ^.^ \         / *_* \          / ⚡_⚡\
    | ? |   →     | >< |   →     | :D  |   →     | :D   |  →    | >:D  |  →     | >>>  |
    \___/          \___/          \______/          \_____/         \_____/          \_____/
    
    sallanan       zıplayan        koşan            dans eden       uçan             ışıltılı
    yumurta        yavru           çocuk            genç            yetişkin          efsanevi
```

### 9.2 Evrim Mekanikleri

```typescript
interface NovaEvolution {
  stages: {
    egg: { requiredXP: 0, unlockAnimation: 'hatch', modelAsset: 'nova-egg' },
    baby: { requiredXP: 500, unlockAnimation: 'crack_and_emerge', modelAsset: 'nova-baby' },
    child: { requiredXP: 2000, unlockAnimation: 'grow_light', modelAsset: 'nova-child' },
    teen: { requiredXP: 5000, unlockAnimation: 'sparkle_transform', modelAsset: 'nova-teen' },
    adult: { requiredXP: 15000, unlockAnimation: 'wings_spread', modelAsset: 'nova-adult' },
    legendary: { requiredXP: 50000, unlockAnimation: 'epic_transformation', modelAsset: 'nova-legendary' },
  };
  
  // Her aşamada yeni yetenek
  abilities: {
    egg: [],           // Sadece sallanır
    baby: ['speak'],   // Basit motivasyon cümleleri
    child: ['dance'],  // Doğru cevaplarda dans
    teen: ['hint'],    // Bazen ücretsiz ipucu verir
    adult: ['cheer'],  // Combo'larda özel tezahürat
    legendary: ['fly', 'rainbow'], // Uçma animasyonu, gökkuşağı efekti
  };
}
```

### 9.3 Evrim Animasyonu (Full Screen Event)

```
Evrim tetiklenince:

1. Ekran blur olur + karanlık overlay
2. Nova ortaya gelir (mevcut aşama)
3. Parlak ışık efekti etrafında oluşur
4. Dramatik müzik (crescendo)
5. Nova ışığa bürünür (silüet)
6. 3-2-1 zoom in
7. FLASH! → Yeni form ortaya çıkar
8. Konfeti + yıldız patlaması
9. "Nova evrildi!" yazısı
10. Yeni formun tanıtımı (idle animasyon)
11. Yeni yetenek açıklaması
12. "Devam" butonu

Süre: ~8 saniye (skip edilemez — milestone moment)
```

---

## 10. Koleksiyon Sistemi

### 10.1 Koleksiyon Kategorileri

| Kategori | Item Sayısı | Kazanım |
|----------|-------------|---------|
| Nova Kıyafetleri | 20+ | Mağaza (⭐/💎) |
| Avatar Karakterleri | 15+ | Level-up + Mağaza |
| Profil Çerçeveleri | 12+ | Başarım + Mağaza |
| Aksesvarlar | 25+ | Başarım + Mağaza |
| Rozetler | 50+ | Başarım |
| Dünya Haritası Temaları | 6+ | Dünya tamamlama |
| Özel Efektler | 10+ | Sezonluk etkinlik |

### 10.2 Nadirlik Sistemi

| Nadirlik | Renk | Oran | Örnek |
|----------|------|------|-------|
| Common | ⬜ Gri | %60 | Temel aksesuar, çerçeve |
| Uncommon | 🟩 Yeşil | %25 | İyi aksesuar, avatar |
| Rare | 🟦 Mavi | %10 | Özel kıyafet, efekt |
| Epic | 🟪 Mor | %4 | Sınırlı üretim item |
| Legendary | 🟨 Altın | %1 | Sezonluk efsanevi, ödül |

---

## 11. Günlük Ödül Çarkı (Daily Spin)

### 11.1 Mekanik
- Günde 1 ücretsiz çevirme (veya reklam ile +1 çevirme)
- Çark 8 dilimli

### 11.2 Çark Dilimleri

| Dilim | İçerik | Olasılık |
|-------|--------|----------|
| 1 | 20 Yıldız | %25 |
| 2 | 50 Yıldız | %20 |
| 3 | 100 Yıldız | %15 |
| 4 | 200 Yıldız | %10 |
| 5 | 5 Elmas | %12 |
| 6 | 15 Elmas | %8 |
| 7 | Streak Freeze | %7 |
| 8 | Rastgele Item (cosmetic) | %3 |

### 11.3 Animasyon
- Çark dönerken heyecan verici ses efekti
- Yavaşlama + iğne çark diliminin kenarında durunca "gerilim anı"
- Sonuç: İtem zoom-in + kutlama
