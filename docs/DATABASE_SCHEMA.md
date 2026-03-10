# NovaLingo — Firestore Veritabanı Şeması

> Detaylı collection yapısı, document modelleri, indexler ve güvenlik kuralları
> Son güncelleme: 28 Şubat 2026

---

## 1. Şema Genel Bakış

```
firestore/
├── parents/                       # Ebeveyn hesapları
│   └── {parentId}/
│       ├── children/              # Çocuk profilleri (subcollection)
│       │   └── {childId}/
│       └── settings/              # Ebeveyn ayarları (subcollection)
│
├── progress/                      # Öğrenme ilerlemesi
│   └── {childId}/
│       ├── lessons/               # Ders bazlı ilerleme
│       │   └── {lessonId}/
│       ├── vocabulary/            # Kelime bazlı SRS verisi
│       │   └── {wordId}/
│       └── stats/                 # İstatistikler
│           └── {period}/          # daily, weekly, monthly, allTime
│
├── gamification/                  # Oyunlaştırma verisi
│   └── {childId}/
│       ├── achievements/          # Kazanılan rozetler
│       │   └── {achievementId}/
│       ├── collection/            # Koleksiyon itemleri
│       │   └── {itemId}/
│       ├── quests/                # Aktif görevler
│       │   └── {questId}/
│       └── nova/                  # Nova maskot durumu
│
├── content/                       # İçerik (admin tarafından yönetilir)
│   ├── worlds/
│   │   └── {worldId}/
│   │       └── units/
│   │           └── {unitId}/
│   │               └── lessons/
│   │                   └── {lessonId}/
│   │                       └── activities/
│   │                           └── {activityId}/
│   ├── vocabulary/                # Kelime veritabanı
│   │   └── {wordId}/
│   ├── stories/                   # Hikaye içerikleri
│   │   └── {storyId}/
│   └── achievements/              # Rozet tanımları
│       └── {achievementId}/
│
├── leaderboards/                  # Liderlik tabloları
│   ├── weekly/
│   │   └── {weekId}/
│   │       └── entries/
│   │           └── {childId}/
│   └── allTime/
│       └── entries/
│           └── {childId}/
│
├── shop/                          # Mağaza itemleri
│   └── {itemId}/
│
└── config/                        # Uygulama konfigürasyonu
    ├── appConfig/                 # Genel ayarlar
    ├── adsConfig/                 # Reklam ayarları
    └── seasonalEvents/            # Sezonluk etkinlikler
```

---

## 2. Document Modelleri (TypeScript Interfaces)

### 2.1 Parent (Ebeveyn)

```typescript
// Collection: parents/{parentId}
interface ParentDocument {
  // Kimlik
  uid: string;                      // Firebase Auth UID
  email: string;                    // Email adresi
  displayName: string;              // Görünen ad
  authProvider: 'email' | 'google' | 'apple';
  
  // Çocuk referansları
  childIds: string[];               // Max 4 çocuk
  activeChildId: string;            // Son aktif çocuk
  
  // Ayarlar
  language: 'tr' | 'en';           // UI dili
  notificationsEnabled: boolean;
  
  // Abonelik
  subscription: {
    status: 'free' | 'premium' | 'trial';
    plan: 'monthly' | 'yearly' | null;
    expiresAt: Timestamp | null;
    revenueCatId: string | null;
    platform: 'ios' | 'android' | 'web' | null;
  };
  
  // Meta
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
  appVersion: string;
  platform: 'ios' | 'android' | 'web';
}
```

### 2.2 Child (Çocuk Profili)

```typescript
// Subcollection: parents/{parentId}/children/{childId}
interface ChildDocument {
  // Profil
  id: string;                       // Auto-generated
  name: string;                     // Takma ad (gerçek isim değil, COPPA)
  ageGroup: 'cubs' | 'stars' | 'legends'; // 4-6, 7-9, 10-12
  birthYear: number;                // Sadece yıl (minimum PII)
  
  // Avatar
  avatar: {
    characterId: string;            // Seçilen karakter
    accessoryIds: string[];         // Aksesuar itemleri
    frameId: string;                // Profil çerçevesi
    backgroundColor: string;        // Arka plan rengi
  };
  
  // Gamification Snapshot (hızlı erişim için denormalize)
  xp: number;
  level: number;
  streak: {
    current: number;
    longest: number;
    lastActivityDate: string;       // YYYY-MM-DD
    freezesAvailable: number;
    freezeUsedToday: boolean;
  };
  currency: {
    stars: number;                  // Oyun içi para (ücretsiz)
    gems: number;                   // Premium para
  };
  
  // Nova Maskot
  nova: {
    stage: 'egg' | 'baby' | 'child' | 'teen' | 'adult' | 'legendary';
    xpToNextStage: number;
    currentMood: 'happy' | 'neutral' | 'sleepy' | 'excited';
    equippedAccessories: string[];
  };
  
  // Öğrenme İlerlemesi (denormalize snapshot)
  progressSnapshot: {
    totalWordsLearned: number;
    totalLessonsCompleted: number;
    totalTimeSpentMinutes: number;
    currentWorldId: string;
    currentUnitId: string;
    worldProgress: Record<string, number>; // worldId → completion %
  };
  
  // Ebeveyn Kontrolleri
  controls: {
    dailyTimeLimitMinutes: number;  // 0 = sınırsız
    adsEnabled: boolean;            // Ebeveyn reklam kapatabilir (premium)
    speechEnabled: boolean;         // Mikrofon izni
  };
  
  // Meta
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastSessionAt: Timestamp;
}
```

### 2.3 Progress — Lesson (Ders İlerlemesi)

```typescript
// Subcollection: progress/{childId}/lessons/{lessonId}
interface LessonProgressDocument {
  lessonId: string;
  worldId: string;
  unitId: string;
  
  // Durum
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  stars: 0 | 1 | 2 | 3;           // Ders yıldız puanı
  bestScore: number;                // 0-100
  attempts: number;                 // Kaç kez denendi
  
  // Detaylı sonuçlar
  activityResults: {
    activityId: string;
    type: ActivityType;
    score: number;                  // 0-100
    timeSpentSeconds: number;
    mistakes: number;
    hintsUsed: number;
    completedAt: Timestamp;
  }[];
  
  // XP
  xpEarned: number;
  bonusXP: number;                  // streak bonus, first-try bonus
  
  // Zaman
  firstCompletedAt: Timestamp | null;
  lastCompletedAt: Timestamp | null;
  totalTimeSpentSeconds: number;
}
```

### 2.4 Progress — Vocabulary (Kelime SRS)

```typescript
// Subcollection: progress/{childId}/vocabulary/{wordId}
interface VocabularyProgressDocument {
  wordId: string;
  word: string;                     // "apple"
  
  // SRS (Leitner Box System)
  srsBox: 1 | 2 | 3 | 4 | 5;      // Kutu numarası
  nextReviewAt: Timestamp;          // Sonraki tekrar zamanı
  
  // İstatistik
  correctCount: number;
  incorrectCount: number;
  totalAttempts: number;
  lastAttemptScore: number;         // 0-100 (pronunciation dahil)
  
  // Öğrenme durumu
  status: 'new' | 'learning' | 'learned' | 'mastered';
  // new: Henüz gösterilmedi
  // learning: SRS box 1-2
  // learned: SRS box 3-4
  // mastered: SRS box 5
  
  // Zaman
  firstSeenAt: Timestamp;
  lastReviewAt: Timestamp;
  masteredAt: Timestamp | null;
}
```

### 2.5 Progress — Stats (İstatistikler)

```typescript
// Subcollection: progress/{childId}/stats/{period}
// period: "2026-02-28" (daily), "2026-W09" (weekly), "2026-02" (monthly), "allTime"
interface StatsDocument {
  period: string;
  periodType: 'daily' | 'weekly' | 'monthly' | 'allTime';
  
  // Öğrenme
  lessonsCompleted: number;
  activitiesCompleted: number;
  wordsLearned: number;
  wordsMastered: number;
  correctAnswers: number;
  totalAnswers: number;
  accuracyRate: number;             // 0-100
  
  // Zaman
  totalTimeMinutes: number;
  averageSessionMinutes: number;
  sessionsCount: number;
  
  // XP
  xpEarned: number;
  
  // Aktivite tiplerine göre dağılım
  activityBreakdown: Record<ActivityType, {
    completed: number;
    accuracy: number;
    timeMinutes: number;
  }>;
  
  // En çok zorlanılan kelimeler
  difficultWords: {
    wordId: string;
    word: string;
    errorRate: number;
  }[];
  
  // En iyi alanlar
  strongTopics: string[];
  weakTopics: string[];
}
```

### 2.6 Gamification — Achievement

```typescript
// Subcollection: gamification/{childId}/achievements/{achievementId}
interface AchievementProgressDocument {
  achievementId: string;
  status: 'locked' | 'in_progress' | 'unlocked';
  
  // İlerleme
  currentValue: number;             // Ör: 45 kelime öğrenildi
  targetValue: number;              // Ör: 50 kelime hedef
  progressPercent: number;
  
  // Ödül
  rewardClaimed: boolean;
  rewardStars: number;
  rewardGems: number;
  rewardItemId: string | null;
  
  // Zaman
  unlockedAt: Timestamp | null;
  claimedAt: Timestamp | null;
}
```

### 2.7 Gamification — Quest (Görev)

```typescript
// Subcollection: gamification/{childId}/quests/{questId}
interface QuestDocument {
  id: string;
  type: 'daily' | 'weekly' | 'special';
  
  // Tanım
  title_tr: string;                 // "3 ders tamamla"
  title_en: string;                 // "Complete 3 lessons"
  icon: string;
  
  // İlerleme
  target: number;
  current: number;
  status: 'active' | 'completed' | 'claimed' | 'expired';
  
  // Ödül
  reward: {
    stars: number;
    gems: number;
    xp: number;
    itemId?: string;
  };
  
  // Zaman
  assignedAt: Timestamp;
  expiresAt: Timestamp;
  completedAt: Timestamp | null;
}
```

### 2.8 Content — World

```typescript
// Collection: content/worlds/{worldId}
interface WorldDocument {
  id: string;                       // "animal-kingdom"
  order: number;                    // Sıralama
  
  // Bilgi
  name_tr: string;                  // "Hayvanlar Krallığı"
  name_en: string;                  // "Animal Kingdom"
  description_tr: string;
  description_en: string;
  
  // Görsel
  iconUrl: string;
  backgroundUrl: string;
  mapImageUrl: string;              // Dünya haritası görsel
  themeColor: string;               // "#FF6B35"
  musicTrack: string;               // "world-animals.mp3"
  
  // Gereksinimler
  requiredLevel: number;            // Açılma seviyesi
  requiredWorldCompletion: string | null; // Önceki dünya ID
  isPremium: boolean;
  
  // İçerik bilgisi
  unitCount: number;
  totalLessons: number;
  totalVocabulary: number;
  
  // Durum
  status: 'active' | 'coming_soon' | 'disabled';
}
```

### 2.9 Content — Activity

```typescript
// Deep subcollection: content/worlds/{wId}/units/{uId}/lessons/{lId}/activities/{aId}
interface ActivityDocument {
  id: string;
  order: number;
  type: ActivityType;
  
  // Ortak Alanlar
  difficulty: 1 | 2 | 3 | 4 | 5;
  xpReward: number;
  timeLimit: number | null;         // Süre limiti (saniye), null = sınırsız
  
  // İpucu
  hint: {
    text_tr: string;
    text_en: string;
    cost: number;                   // İpucu maliyeti (yıldız)
  } | null;
  
  // Tip-spesifik veri (discriminated union)
  data: FlashCardData | MatchPairsData | ListenAndTapData | 
        WordBuilderData | FillBlankData | SpeakItData |
        StoryTimeData | MemoryGameData | WordSearchData | QuizBattleData;
}

// Örnek: FlashCard verisi
interface FlashCardData {
  type: 'flash_card';
  cards: {
    wordId: string;
    word: string;                   // "elephant"
    translation: string;            // "fil"
    imageUrl: string;
    audioUrl: string;
    exampleSentence: string;        // "The elephant is big."
    exampleAudioUrl: string;
  }[];
}

// Örnek: MatchPairs verisi
interface MatchPairsData {
  type: 'match_pairs';
  pairs: {
    wordId: string;
    word: string;
    imageUrl: string;
    audioUrl: string;
  }[];
  distractors: {                    // Yanlış seçenekler
    word: string;
    imageUrl: string;
  }[];
  matchBy: 'word_to_image' | 'word_to_translation' | 'audio_to_image';
}

// Örnek: ListenAndTap verisi
interface ListenAndTapData {
  type: 'listen_and_tap';
  questions: {
    audioUrl: string;
    word: string;
    correctImageUrl: string;
    options: {
      imageUrl: string;
      word: string;
      isCorrect: boolean;
    }[];
  }[];
}

// Örnek: WordBuilder verisi
interface WordBuilderData {
  type: 'word_builder';
  words: {
    wordId: string;
    word: string;                   // "apple"
    imageUrl: string;
    audioUrl: string;
    letters: string[];              // ['a','p','p','l','e'] + distractors
    hint: string;                   // İlk harf göster
  }[];
}

// Örnek: FillBlank verisi
interface FillBlankData {
  type: 'fill_blank';
  sentences: {
    template: string;               // "The ___ is red."
    correctAnswer: string;          // "apple"
    options: string[];              // ["apple", "banana", "grape", "orange"]
    imageUrl: string | null;
    audioUrl: string;
  }[];
}

// Örnek: SpeakIt verisi
interface SpeakItData {
  type: 'speak_it';
  words: {
    wordId: string;
    word: string;
    phonetic: string;               // "/ˈæp.əl/"
    audioUrl: string;               // Native speaker ses
    imageUrl: string;
    acceptableVariations: string[]; // Kabul edilecek telaffuz varyasyonları
    scoreThreshold: number;         // Minimum kabul skoru (0-100)
  }[];
}

// Örnek: StoryTime verisi
interface StoryTimeData {
  type: 'story_time';
  title: string;
  pages: {
    imageUrl: string;
    text_en: string;
    text_tr: string;
    audioUrl: string;
    highlightWords: string[];       // Vurgulanan kelimeler
    interactiveElements: {
      type: 'tap_word' | 'choose_next' | 'drag_item';
      data: Record<string, unknown>;
    }[];
  }[];
}

// Örnek: MemoryGame verisi
interface MemoryGameData {
  type: 'memory_game';
  cardPairs: {
    wordId: string;
    frontImage: string;             // Veya word text
    matchImage: string;             // Eşleşecek kart
    audioUrl: string;
    displayType: 'image_image' | 'word_image' | 'audio_image';
  }[];
  gridSize: '2x3' | '3x4' | '4x4' | '4x5';
  timeLimit: number;
}

// Örnek: WordSearch verisi
interface WordSearchData {
  type: 'word_search';
  grid: string[][];                 // Harf grid'i
  words: {
    wordId: string;
    word: string;
    imageUrl: string;
    audioUrl: string;
    startRow: number;
    startCol: number;
    direction: 'horizontal' | 'vertical' | 'diagonal';
  }[];
  gridSize: number;                 // 6x6, 8x8, 10x10
}

// Örnek: QuizBattle verisi
interface QuizBattleData {
  type: 'quiz_battle';
  questions: {
    question_en: string;
    question_tr: string;
    imageUrl: string | null;
    audioUrl: string | null;
    type: 'multiple_choice' | 'true_false' | 'image_select';
    options: {
      text: string;
      imageUrl?: string;
      isCorrect: boolean;
    }[];
    timeLimit: number;              // Her soru için süre
    xpValue: number;
  }[];
}

// Aktivite tipleri enum
type ActivityType = 
  | 'flash_card'
  | 'match_pairs'
  | 'listen_and_tap'
  | 'word_builder'
  | 'fill_blank'
  | 'speak_it'
  | 'story_time'
  | 'memory_game'
  | 'word_search'
  | 'quiz_battle';
```

### 2.10 Content — Vocabulary

```typescript
// Collection: content/vocabulary/{wordId}
interface VocabularyDocument {
  id: string;                       // Auto-generated
  word: string;                     // "elephant"
  translation: string;              // "fil"
  
  // Fonetik
  phonetic: string;                 // "/ˈel.ɪ.fənt/"
  syllables: string[];              // ["el", "e", "phant"]
  
  // Medya
  imageUrl: string;
  thumbnailUrl: string;
  audioUrl: string;                 // Native speaker
  audioSlowUrl: string;             // Yavaş telaffuz
  
  // Kategorizasyon
  worldId: string;
  unitId: string;
  category: string;                 // "wild_animals"
  tags: string[];                   // ["animal", "big", "gray"]
  
  // Dil bilgisi
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'other';
  plural: string | null;            // "elephants"
  article: 'a' | 'an' | 'the' | null;
  
  // Örnekler
  examples: {
    sentence_en: string;
    sentence_tr: string;
    audioUrl: string;
  }[];
  
  // Zorluk
  difficulty: 1 | 2 | 3 | 4 | 5;
  ageGroup: ('cubs' | 'stars' | 'legends')[];
  frequency: number;                // Kullanım sıklığı (1-100)
  
  // Meta
  status: 'active' | 'draft' | 'disabled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2.11 Shop Item

```typescript
// Collection: shop/{itemId}
interface ShopItemDocument {
  id: string;
  
  // Bilgi
  name_tr: string;
  name_en: string;
  description_tr: string;
  description_en: string;
  
  // Görsel
  imageUrl: string;
  previewUrl: string;               // Mağazada gösterim
  
  // Fiyat
  priceType: 'stars' | 'gems' | 'real_money';
  priceAmount: number;
  originalPrice: number | null;     // İndirimli ise eski fiyat
  
  // Kategori
  category: 'avatar' | 'accessory' | 'frame' | 'theme' | 'streak_freeze' | 'hint_pack' | 'xp_boost';
  
  // İçerik
  contentData: {
    // Avatar için
    characterSpriteUrl?: string;
    // Aksesuar için
    accessoryType?: 'hat' | 'glasses' | 'necklace' | 'wings';
    // Tema için
    themeColors?: Record<string, string>;
    // Streak freeze
    freezeCount?: number;
    // Hint pack
    hintCount?: number;
    // XP boost
    boostMultiplier?: number;
    boostDurationMinutes?: number;
  };
  
  // Erişim
  isPremiumOnly: boolean;
  requiredLevel: number;
  isLimitedEdition: boolean;
  availableUntil: Timestamp | null;
  
  // Meta
  status: 'active' | 'hidden' | 'sold_out';
  sortOrder: number;
  createdAt: Timestamp;
}
```

### 2.12 Leaderboard Entry

```typescript
// Subcollection: leaderboards/weekly/{weekId}/entries/{childId}
interface LeaderboardEntryDocument {
  childId: string;
  childName: string;                // Denormalize (performans)
  avatarCharacterId: string;        // Denormalize
  level: number;                    // Denormalize
  
  // Skor
  xpEarned: number;                // Bu haftaki XP
  lessonsCompleted: number;
  wordsLearned: number;
  
  // Sıralama (Cloud Function hesaplar)
  rank: number;
  previousRank: number | null;
  
  // Zaman
  updatedAt: Timestamp;
}
```

---

## 3. Firestore Composite Indexes

```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "vocabulary",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "worldId", "order": "ASCENDING" },
        { "fieldPath": "difficulty", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "vocabulary", 
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "nextReviewAt", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "lessons",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "lastCompletedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "entries",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "xpEarned", "order": "DESCENDING" },
        { "fieldPath": "childId", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "quests",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "expiresAt", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

## 4. Firestore Güvenlik Kuralları (Tam)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ===== HELPER FUNCTIONS =====
    
    // Kimlik doğrulanmış mı?
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Bu ebeveyn mi?
    function isParent(parentId) {
      return isAuthenticated() && request.auth.uid == parentId;
    }
    
    // Bu ebeveynin çocuğu mu?
    function isParentOfChild(childId) {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/parents/$(request.auth.uid)) &&
        childId in get(/databases/$(database)/documents/parents/$(request.auth.uid)).data.childIds;
    }
    
    // Admin mi? (custom claim)
    function isAdmin() {
      return isAuthenticated() && request.auth.token.admin == true;
    }
    
    // Veri boyutu sınırı
    function isValidSize() {
      return request.resource.data.keys().size() <= 50;
    }
    
    // ===== PARENTS =====
    match /parents/{parentId} {
      allow read: if isParent(parentId);
      allow create: if isParent(parentId) && isValidSize();
      allow update: if isParent(parentId) && isValidSize();
      allow delete: if isParent(parentId);
      
      // Çocuk profilleri
      match /children/{childId} {
        allow read: if isParent(parentId);
        allow create: if isParent(parentId) && 
          get(/databases/$(database)/documents/parents/$(parentId)).data.childIds.size() < 4;
        allow update: if isParent(parentId);
        allow delete: if isParent(parentId);
      }
    }
    
    // ===== PROGRESS =====
    match /progress/{childId} {
      allow read: if isParentOfChild(childId);
      allow write: if false; // Sadece Cloud Functions yazabilir
      
      match /{document=**} {
        allow read: if isParentOfChild(childId);
        allow write: if false;
      }
    }
    
    // ===== GAMIFICATION =====
    match /gamification/{childId} {
      allow read: if isParentOfChild(childId);
      allow write: if false; // Sadece Cloud Functions
      
      match /{document=**} {
        allow read: if isParentOfChild(childId);
        allow write: if false;
      }
    }
    
    // ===== CONTENT (Read-only) =====
    match /content/{document=**} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // ===== LEADERBOARDS =====
    match /leaderboards/{document=**} {
      allow read: if isAuthenticated();
      allow write: if false; // Sadece Cloud Functions
    }
    
    // ===== SHOP =====
    match /shop/{itemId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // ===== CONFIG =====
    match /config/{document=**} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

---

## 5. Firebase Storage Yapısı

```
storage/
├── content/
│   ├── vocabulary/
│   │   ├── images/
│   │   │   └── {wordId}.webp          # 400x400, optimized
│   │   ├── thumbnails/
│   │   │   └── {wordId}_thumb.webp     # 100x100
│   │   └── audio/
│   │       ├── {wordId}.mp3            # Normal hız
│   │       └── {wordId}_slow.mp3       # Yavaş
│   ├── worlds/
│   │   ├── {worldId}/
│   │   │   ├── icon.webp
│   │   │   ├── background.webp
│   │   │   └── map.webp
│   ├── stories/
│   │   └── {storyId}/
│   │       ├── page_{n}.webp
│   │       └── page_{n}.mp3
│   └── achievements/
│       └── {achievementId}.webp
│
├── characters/
│   ├── avatars/
│   │   └── {characterId}.webp
│   ├── nova/
│   │   └── {stage}/
│   │       ├── idle.json               # Lottie
│   │       ├── happy.json
│   │       └── celebrate.json
│   └── accessories/
│       └── {accessoryId}.webp
│
├── audio/
│   ├── sfx/
│   │   └── sfx-sprite.webm            # Tüm SFX tek dosya
│   ├── music/
│   │   └── {trackId}.mp3
│   └── voice/
│       ├── en/                         # İngilizce seslendirme
│       │   └── {sentenceHash}.mp3
│       └── tr/                         # Türkçe yönlendirme
│           └── {sentenceHash}.mp3
│
└── user-content/                       # Kullanıcı içeriği (future)
    └── {parentId}/
        └── {childId}/
```

### Storage Kuralları

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Content: herkes okuyabilir, admin yazabilir
    match /content/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true;
    }
    
    // Characters: herkes okuyabilir
    match /characters/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true;
    }
    
    // Audio: herkes okuyabilir
    match /audio/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true;
    }
    
    // User content: sadece kendi verisi
    match /user-content/{parentId}/{childId}/{allPaths=**} {
      allow read: if request.auth.uid == parentId;
      allow write: if request.auth.uid == parentId
        && request.resource.size < 5 * 1024 * 1024; // Max 5MB
    }
  }
}
```

---

## 6. Offline Storage (IndexedDB via Dexie)

```typescript
// lib/storage/OfflineStore.ts
import Dexie, { Table } from 'dexie';

class NovaLingoOfflineDB extends Dexie {
  // Tablolar
  pendingActions!: Table<PendingAction>;
  cachedLessons!: Table<CachedLesson>;
  cachedVocabulary!: Table<CachedVocabulary>;
  cachedAssets!: Table<CachedAsset>;
  localProgress!: Table<LocalProgress>;
  preferences!: Table<Preference>;

  constructor() {
    super('novalingo-offline');
    
    this.version(1).stores({
      // Sync bekleyen aksiyonlar
      pendingActions: '++id, type, createdAt, status',
      
      // Offline erişim için cache'lenmiş dersler
      cachedLessons: 'lessonId, worldId, unitId, cachedAt',
      
      // Kelime cache'i
      cachedVocabulary: 'wordId, worldId, srsBox, nextReviewAt',
      
      // Asset cache (ses, resim URL → blob)
      cachedAssets: 'url, type, cachedAt, size',
      
      // Lokal ilerleme (sync öncesi)
      localProgress: 'id, childId, type, synced',
      
      // Kullanıcı tercihleri
      preferences: 'key',
    });
  }
}

interface PendingAction {
  id?: number;
  type: 'lesson_complete' | 'xp_update' | 'streak_update' | 'purchase';
  payload: Record<string, unknown>;
  createdAt: Date;
  status: 'pending' | 'syncing' | 'failed';
  retryCount: number;
}

interface CachedLesson {
  lessonId: string;
  worldId: string;
  unitId: string;
  data: unknown; // Full lesson data with activities
  cachedAt: Date;
  expiresAt: Date;
}

interface CachedAsset {
  url: string;
  type: 'image' | 'audio' | 'animation';
  blob: Blob;
  cachedAt: Date;
  size: number;
  lastAccessedAt: Date;
}
```

---

## 7. Veri Okuma/Yazma Optimizasyonları

### 7.1 Read Optimizasyonları

| Strateji | Uygulama | Tasarruf |
|----------|----------|---------|
| **Denormalizasyon** | Çocuk profilinde XP, level, streak snapshot | Fazladan okumaları önler |
| **Collection Group Query** | Vocabulary progress cross-child query | Tek sorgu ile multiple child |
| **Pagination** | Leaderboard, kelime listesi | Sınırlı document okuma |
| **Offline Persistence** | Firestore enablePersistence() | Network yokken local cache |
| **Field Mask** | select() ile sadece gerekli alanlar | Transfer boyutu azalır |
| **Composite Index** | Sık kullanılan sorgular için index | Query hızı |

### 7.2 Write Optimizasyonları

| Strateji | Uygulama | Tasarruf |
|----------|----------|---------|
| **Batch Write** | Ders tamamlamada tüm güncellemeler tek batch | Atomik + az yazma |
| **Debounced Sync** | Progress her 5 dk'da bir sync | Gereksiz yazma önlenir |
| **Cloud Functions** | Yazma işlemlerini server-side yap | Güvenlik + batch |
| **increment()** | XP, coin güncelleme | Atomic, conflict-free |
| **arrayUnion/Remove** | Achievement, collection güncellemeri | Atomic array ops |

### 7.3 Maliyet Tahmini (100K MAU)

| İşlem | Aylık Hacim | Fiyat | Aylık Maliyet |
|-------|-------------|-------|---------------|
| Firestore Reads | ~30M | $0.06/100K | $18 |
| Firestore Writes | ~5M | $0.18/100K | $9 |
| Firestore Deletes | ~500K | $0.02/100K | $0.10 |
| Storage (10GB) | 10GB | $0.026/GB | $0.26 |
| Bandwidth | ~50GB | $0.12/GB | $6 |
| Cloud Functions | ~2M invocations | $0.40/1M | $0.80 |
| **Toplam** | | | **~$35/ay** |

> Not: Firestore offline persistence ve aggressive caching ile read sayısı %70 azaltılabilir.
