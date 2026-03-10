# NovaLingo — Teknik Mimari

> Detaylı sistem mimarisi, katman yapısı ve veri akışları
> Son güncelleme: 28 Şubat 2026

---

## 1. Mimari Genel Bakış

NovaLingo **Offline-First, Event-Driven, Layered Architecture** prensibiyle tasarlanmıştır.

### Neden bu mimari?
- **Offline-First:** Çocuklar her yerde internet bulamaz. Dersler offline çalışmalı.
- **Event-Driven:** Gamification eventleri (XP, badge, level-up) merkezi event bus ile yönetilir.
- **Layered:** Test edilebilirlik, değiştirilebilirlik, tek sorumluluk.

---

## 2. Katman Mimarisi

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────────┐  │
│  │  Pages   │ │  Layouts │ │Components│ │   Animations      │  │
│  │(screens) │ │          │ │(atoms,   │ │(Framer Motion,    │  │
│  │          │ │          │ │molecules,│ │ Lottie, Spine)    │  │
│  │          │ │          │ │organisms)│ │                   │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────────┬──────────┘  │
│       └─────────────┴────────────┴────────────────┘             │
│                              │                                   │
├──────────────────────────────┼───────────────────────────────────┤
│                        STATE LAYER                               │
│  ┌──────────┐ ┌──────────────┐ ┌───────────────┐               │
│  │ Zustand  │ │ TanStack     │ │ React Context │               │
│  │ (client  │ │ Query        │ │ (theme, i18n, │               │
│  │  state)  │ │ (server      │ │  audio)       │               │
│  │          │ │  state/cache)│ │               │               │
│  └────┬─────┘ └──────┬───────┘ └───────┬───────┘               │
│       └──────────────┬┴────────────────┘                        │
│                      │                                           │
├──────────────────────┼───────────────────────────────────────────┤
│                  SERVICE LAYER                                   │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────────┐   │
│  │ Auth      │ │ Learning  │ │ Gamifi-   │ │ Content       │   │
│  │ Service   │ │ Engine    │ │ cation    │ │ Service       │   │
│  │           │ │           │ │ Engine    │ │               │   │
│  └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └───────┬───────┘   │
│  ┌─────┴─────┐ ┌─────┴─────┐ ┌─────┴─────┐ ┌───────┴───────┐   │
│  │ Audio     │ │ Speech    │ │ Analytics │ │ Ads           │   │
│  │ Service   │ │ Service   │ │ Service   │ │ Service       │   │
│  └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └───────┬───────┘   │
│        └──────────────┴─────────────┴───────────────┘           │
│                              │                                   │
├──────────────────────────────┼───────────────────────────────────┤
│                   DATA LAYER                                     │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────────┐   │
│  │ Firebase  │ │ IndexedDB │ │ Firebase  │ │ Local         │   │
│  │ Firestore │ │ (offline  │ │ Storage   │ │ Storage       │   │
│  │ (remote)  │ │  cache)   │ │ (assets)  │ │ (preferences) │   │
│  └───────────┘ └───────────┘ └───────────┘ └───────────────┘   │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                   NATIVE LAYER (Capacitor)                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ AdMob   │ │ RevCat  │ │ Speech  │ │ Haptics │ │ Push    │  │
│  │ Plugin  │ │ Plugin  │ │ Plugin  │ │ Plugin  │ │ Plugin  │  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Dosya/Klasör Yapısı

```
novalingo/
├── docs/                          # Proje dokümantasyonu
│   ├── PROJECT_PLAN.md
│   ├── ARCHITECTURE.md
│   ├── TECH_STACK.md
│   ├── DATABASE_SCHEMA.md
│   ├── FEATURE_SPEC.md
│   ├── MONETIZATION.md
│   ├── GAMIFICATION.md
│   ├── UI_UX_GUIDELINES.md
│   ├── API_DESIGN.md
│   ├── DEPLOYMENT.md
│   ├── PROJECT_SETUP.md
│   └── ROADMAP.md
│
├── src/
│   ├── app/                       # App bootstrap, routing, providers
│   │   ├── App.tsx                # Root component
│   │   ├── Router.tsx             # Route definitions
│   │   ├── Providers.tsx          # Context providers wrapper
│   │   └── routes/                # Route-based code splitting
│   │       ├── index.ts           # Route lazy imports
│   │       ├── auth.routes.tsx
│   │       ├── learn.routes.tsx
│   │       ├── game.routes.tsx
│   │       └── parent.routes.tsx
│   │
│   ├── assets/                    # Static assets
│   │   ├── animations/            # Lottie JSON files
│   │   │   ├── confetti.json
│   │   │   ├── star-burst.json
│   │   │   ├── level-up.json
│   │   │   └── nova-mascot/       # Nova karakter animasyonları
│   │   │       ├── idle.json
│   │   │       ├── happy.json
│   │   │       ├── sad.json
│   │   │       ├── celebrate.json
│   │   │       └── thinking.json
│   │   ├── audio/                 # Ses dosyaları
│   │   │   ├── sfx/              # Ses efektleri
│   │   │   │   ├── correct.mp3
│   │   │   │   ├── wrong.mp3
│   │   │   │   ├── tap.mp3
│   │   │   │   ├── reward.mp3
│   │   │   │   ├── level-up.mp3
│   │   │   │   ├── streak.mp3
│   │   │   │   └── coin.mp3
│   │   │   ├── music/            # Arka plan müzikleri
│   │   │   │   ├── menu-theme.mp3
│   │   │   │   ├── world-animals.mp3
│   │   │   │   ├── world-food.mp3
│   │   │   │   └── reward-ceremony.mp3
│   │   │   └── voice/            # Seslendirmeler (Firebase Storage'dan lazy load)
│   │   ├── images/               # Resimler
│   │   │   ├── icons/
│   │   │   ├── illustrations/
│   │   │   ├── worlds/
│   │   │   ├── characters/
│   │   │   └── badges/
│   │   └── fonts/                # Custom fontlar
│   │       ├── NovaLingo-Bold.woff2
│   │       ├── NovaLingo-Regular.woff2
│   │       └── NovaLingo-Fun.woff2
│   │
│   ├── components/                # Paylaşılan UI bileşenleri (Atomic Design)
│   │   ├── atoms/                 # En küçük birimler
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   ├── Button.stories.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Icon/
│   │   │   ├── Text/
│   │   │   ├── Avatar/
│   │   │   ├── Badge/
│   │   │   ├── ProgressBar/
│   │   │   ├── StarRating/
│   │   │   ├── Coin/
│   │   │   └── AnimatedNumber/
│   │   │
│   │   ├── molecules/             # Atom kombinasyonları
│   │   │   ├── FlashCard/
│   │   │   ├── WordTile/
│   │   │   ├── OptionButton/
│   │   │   ├── StreakCounter/
│   │   │   ├── XPBar/
│   │   │   ├── LessonCard/
│   │   │   ├── AchievementToast/
│   │   │   ├── AudioPlayer/
│   │   │   └── MascotBubble/     # Nova'nın konuşma balonu
│   │   │
│   │   ├── organisms/             # Karmaşık bileşenler
│   │   │   ├── ActivityRenderer/  # Aktivite tipine göre render
│   │   │   ├── WorldMap/          # Dünya haritası
│   │   │   ├── LessonList/
│   │   │   ├── Leaderboard/
│   │   │   ├── DailyQuests/
│   │   │   ├── ShopGrid/
│   │   │   ├── CollectionGrid/
│   │   │   ├── ParentDashboard/
│   │   │   └── NovaCompanion/    # Nova maskot bileşeni
│   │   │
│   │   └── templates/             # Sayfa şablonları
│   │       ├── ActivityTemplate/
│   │       ├── WorldTemplate/
│   │       └── SettingsTemplate/
│   │
│   ├── config/                    # Konfigürasyon
│   │   ├── firebase.ts            # Firebase init
│   │   ├── capacitor.ts           # Capacitor config helpers
│   │   ├── ads.config.ts          # AdMob unit IDs, frekans kuralları
│   │   ├── analytics.config.ts    # Event tanımları
│   │   ├── audio.config.ts        # Ses kanal ayarları
│   │   ├── theme.config.ts        # Tema ve design token'lar
│   │   ├── i18n.config.ts         # i18next konfigürasyonu
│   │   └── constants.ts           # Sabit değerler
│   │
│   ├── features/                  # Feature-based modüller
│   │   ├── auth/                  # Authentication
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── SignUpForm.tsx
│   │   │   │   ├── ChildProfileCreator.tsx
│   │   │   │   ├── AvatarPicker.tsx
│   │   │   │   └── ParentalGate.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useChildProfile.ts
│   │   │   │   └── useParentalGate.ts
│   │   │   ├── services/
│   │   │   │   └── auth.service.ts
│   │   │   ├── store/
│   │   │   │   └── auth.store.ts
│   │   │   └── types/
│   │   │       └── auth.types.ts
│   │   │
│   │   ├── learning/              # Öğrenme motoru
│   │   │   ├── activities/        # HER aktivite tipi ayrı modül
│   │   │   │   ├── FlashCard/
│   │   │   │   │   ├── FlashCard.tsx
│   │   │   │   │   ├── FlashCard.test.tsx
│   │   │   │   │   ├── useFlashCard.ts
│   │   │   │   │   └── flashcard.types.ts
│   │   │   │   ├── MatchPairs/
│   │   │   │   ├── ListenAndTap/
│   │   │   │   ├── WordBuilder/
│   │   │   │   ├── FillBlank/
│   │   │   │   ├── SpeakIt/
│   │   │   │   ├── StoryTime/
│   │   │   │   ├── MemoryGame/
│   │   │   │   ├── WordSearch/
│   │   │   │   └── QuizBattle/
│   │   │   ├── components/
│   │   │   │   ├── LessonPlayer.tsx      # Ders oynatıcı (aktiviteleri sırayla gösterir)
│   │   │   │   ├── LessonComplete.tsx    # Ders tamamlama ekranı
│   │   │   │   ├── ActivityProgressBar.tsx
│   │   │   │   └── HintSystem.tsx
│   │   │   ├── engine/
│   │   │   │   ├── LearningEngine.ts     # Ana öğrenme motoru
│   │   │   │   ├── AdaptiveDifficulty.ts # Zorluk ayarlama algoritması
│   │   │   │   ├── SpacedRepetition.ts   # SRS (Leitner) implementasyonu
│   │   │   │   ├── ProgressTracker.ts    # İlerleme hesaplama
│   │   │   │   └── ContentSelector.ts    # İçerik seçimi (SRS + adaptif)
│   │   │   ├── hooks/
│   │   │   │   ├── useLesson.ts
│   │   │   │   ├── useActivity.ts
│   │   │   │   ├── useProgress.ts
│   │   │   │   └── useSpeechRecognition.ts
│   │   │   ├── services/
│   │   │   │   ├── learning.service.ts
│   │   │   │   └── content.service.ts
│   │   │   ├── store/
│   │   │   │   ├── learning.store.ts
│   │   │   │   └── progress.store.ts
│   │   │   └── types/
│   │   │       ├── activity.types.ts
│   │   │       ├── lesson.types.ts
│   │   │       └── content.types.ts
│   │   │
│   │   ├── gamification/          # Oyunlaştırma sistemi
│   │   │   ├── components/
│   │   │   │   ├── XPGainAnimation.tsx
│   │   │   │   ├── LevelUpModal.tsx
│   │   │   │   ├── StreakFreezeModal.tsx
│   │   │   │   ├── AchievementUnlock.tsx
│   │   │   │   ├── DailyQuestCard.tsx
│   │   │   │   └── NovaEvolution.tsx
│   │   │   ├── engine/
│   │   │   │   ├── GamificationEngine.ts  # Merkezi oyunlaştırma motoru
│   │   │   │   ├── XPCalculator.ts
│   │   │   │   ├── LevelSystem.ts
│   │   │   │   ├── StreakManager.ts
│   │   │   │   ├── AchievementChecker.ts
│   │   │   │   ├── QuestGenerator.ts
│   │   │   │   ├── CurrencyManager.ts
│   │   │   │   └── NovaEvolutionEngine.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useGamification.ts
│   │   │   │   ├── useStreak.ts
│   │   │   │   ├── useAchievements.ts
│   │   │   │   └── useNova.ts
│   │   │   ├── store/
│   │   │   │   └── gamification.store.ts
│   │   │   └── types/
│   │   │       └── gamification.types.ts
│   │   │
│   │   ├── monetization/          # Monetizasyon
│   │   │   ├── components/
│   │   │   │   ├── RewardedAdButton.tsx
│   │   │   │   ├── PremiumBanner.tsx
│   │   │   │   ├── SubscriptionPage.tsx
│   │   │   │   ├── ShopPage.tsx
│   │   │   │   └── PaywallModal.tsx
│   │   │   ├── services/
│   │   │   │   ├── ads.service.ts
│   │   │   │   ├── subscription.service.ts
│   │   │   │   └── iap.service.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useAds.ts
│   │   │   │   ├── useSubscription.ts
│   │   │   │   └── usePremium.ts
│   │   │   ├── store/
│   │   │   │   └── monetization.store.ts
│   │   │   └── types/
│   │   │       └── monetization.types.ts
│   │   │
│   │   ├── social/                # Sosyal özellikler
│   │   │   ├── components/
│   │   │   │   ├── LeaderboardPage.tsx
│   │   │   │   ├── FriendsList.tsx
│   │   │   │   └── ChallengeCard.tsx
│   │   │   ├── services/
│   │   │   │   └── social.service.ts
│   │   │   └── store/
│   │   │       └── social.store.ts
│   │   │
│   │   └── parent/                # Ebeveyn paneli
│   │       ├── components/
│   │       │   ├── ProgressDashboard.tsx
│   │       │   ├── WordListReport.tsx
│   │       │   ├── ScreenTimeSettings.tsx
│   │       │   ├── SubscriptionManagement.tsx
│   │       │   └── ChildProfileEditor.tsx
│   │       ├── hooks/
│   │       │   ├── useParentDashboard.ts
│   │       │   └── useScreenTime.ts
│   │       ├── services/
│   │       │   └── parent.service.ts
│   │       └── store/
│   │           └── parent.store.ts
│   │
│   ├── hooks/                     # Global custom hooks
│   │   ├── useAudio.ts            # Ses oynatma hook'u
│   │   ├── useHaptics.ts          # Titreşim feedback
│   │   ├── useKeyboard.ts         # Klavye yönetimi
│   │   ├── useOrientation.ts      # Ekran yönü
│   │   ├── usePlatform.ts         # Platform tespiti (web/ios/android)
│   │   ├── useNetworkStatus.ts    # Online/offline durumu
│   │   ├── useAppState.ts         # App foreground/background
│   │   └── useAnimationPreference.ts # Reduced motion tercih
│   │
│   ├── lib/                       # Utility kütüphaneleri
│   │   ├── firebase/              # Firebase abstraction layer
│   │   │   ├── auth.ts
│   │   │   ├── firestore.ts
│   │   │   ├── storage.ts
│   │   │   ├── functions.ts
│   │   │   └── analytics.ts
│   │   ├── capacitor/             # Capacitor plugin wrappers
│   │   │   ├── admob.ts
│   │   │   ├── haptics.ts
│   │   │   ├── speech.ts
│   │   │   ├── push.ts
│   │   │   └── app.ts
│   │   ├── audio/                 # Ses motoru
│   │   │   ├── AudioManager.ts    # Singleton ses yöneticisi
│   │   │   ├── SoundPool.ts       # Ses havuzu (preload)
│   │   │   └── MusicPlayer.ts     # Arka plan müzik yöneticisi
│   │   ├── storage/               # Offline storage
│   │   │   ├── OfflineStore.ts    # IndexedDB wrapper
│   │   │   ├── SyncManager.ts     # Offline→Online senkronizasyon
│   │   │   └── CacheManager.ts    # Asset cache yönetimi
│   │   ├── animation/             # Animasyon utilities
│   │   │   ├── transitions.ts     # Sayfa geçiş animasyonları
│   │   │   ├── celebrations.ts    # Kutlama animasyonları (konfeti, yıldız vs.)
│   │   │   └── lottie-loader.ts   # Lazy lottie yükleme
│   │   └── utils/                 # Genel utility fonksiyonlar
│   │       ├── date.ts
│   │       ├── format.ts
│   │       ├── validation.ts
│   │       ├── random.ts
│   │       └── platform.ts
│   │
│   ├── pages/                     # Sayfa bileşenleri
│   │   ├── SplashScreen.tsx
│   │   ├── OnboardingPage.tsx
│   │   ├── HomePage.tsx           # Ana ekran (dünya haritası)
│   │   ├── WorldPage.tsx          # Dünya detay (ünite listesi)
│   │   ├── LessonPage.tsx         # Ders oynatma
│   │   ├── LessonCompletePage.tsx # Ders sonuç
│   │   ├── ProfilePage.tsx        # Çocuk profili
│   │   ├── CollectionPage.tsx     # Koleksiyon
│   │   ├── ShopPage.tsx           # Mağaza
│   │   ├── LeaderboardPage.tsx    # Sıralama
│   │   ├── SettingsPage.tsx       # Ayarlar
│   │   └── ParentZone/            # Ebeveyn bölgesi sayfaları
│   │       ├── ParentLoginPage.tsx
│   │       ├── DashboardPage.tsx
│   │       ├── ReportsPage.tsx
│   │       └── SettingsPage.tsx
│   │
│   ├── styles/                    # Global stiller
│   │   ├── globals.css            # Tailwind directives + global reset
│   │   ├── animations.css         # CSS-only animasyonlar (performans)
│   │   └── fonts.css              # Font-face tanımları
│   │
│   ├── types/                     # Global TypeScript tipleri
│   │   ├── index.ts               # Barrel export
│   │   ├── user.types.ts
│   │   ├── content.types.ts
│   │   ├── global.d.ts            # Module declarations
│   │   └── env.d.ts               # Env variable types
│   │
│   ├── i18n/                      # Çeviri dosyaları
│   │   ├── tr/
│   │   │   ├── common.json
│   │   │   ├── auth.json
│   │   │   ├── learning.json
│   │   │   ├── gamification.json
│   │   │   └── parent.json
│   │   └── en/
│   │       └── ... (aynı yapı)
│   │
│   ├── main.tsx                   # Entry point
│   └── vite-env.d.ts
│
├── functions/                     # Firebase Cloud Functions
│   ├── src/
│   │   ├── index.ts               # Function exports
│   │   ├── auth/
│   │   │   ├── onUserCreate.ts
│   │   │   └── onUserDelete.ts
│   │   ├── learning/
│   │   │   ├── syncProgress.ts
│   │   │   ├── generateDailyQuests.ts
│   │   │   └── calculateLeaderboard.ts
│   │   ├── gamification/
│   │   │   ├── processXP.ts
│   │   │   ├── checkAchievements.ts
│   │   │   └── updateStreak.ts
│   │   ├── monetization/
│   │   │   ├── validatePurchase.ts
│   │   │   └── webhookHandler.ts
│   │   ├── admin/
│   │   │   ├── contentUpload.ts
│   │   │   └── analytics.ts
│   │   └── scheduled/
│   │       ├── dailyReset.ts
│   │       ├── weeklyLeaderboard.ts
│   │       └── streakReminder.ts
│   ├── package.json
│   └── tsconfig.json
│
├── firestore.rules                # Firestore güvenlik kuralları
├── firestore.indexes.json         # Firestore composite indexes
├── storage.rules                  # Firebase Storage kuralları
├── firebase.json                  # Firebase proje konfigürasyonu
├── .firebaserc                    # Firebase proje aliasları
│
├── ios/                           # Capacitor iOS projesi (auto-generated)
├── android/                       # Capacitor Android projesi (auto-generated)
│
├── public/                        # Static public assets
│   ├── favicon.svg
│   ├── manifest.json              # PWA manifest
│   └── sw.js                      # Service Worker (offline)
│
├── scripts/                       # Build/dev scriptleri
│   ├── seed-content.ts            # İçerik seed script'i
│   ├── generate-icons.ts          # App icon generator
│   ├── optimize-audio.sh          # Ses dosyası optimizasyonu
│   └── deploy.sh                  # Deploy script
│
├── .storybook/                    # Storybook konfigürasyonu
│   ├── main.ts
│   └── preview.ts
│
├── tests/                         # E2E testler
│   ├── e2e/
│   │   ├── onboarding.spec.ts
│   │   ├── lesson-flow.spec.ts
│   │   └── purchase.spec.ts
│   └── fixtures/
│       └── test-content.json
│
├── capacitor.config.ts            # Capacitor konfigürasyonu
├── vite.config.ts                 # Vite build konfigürasyonu
├── tailwind.config.ts             # Tailwind konfigürasyonu
├── tsconfig.json                  # TypeScript konfigürasyonu
├── tsconfig.node.json             # Node TypeScript konfigürasyonu
├── eslint.config.js               # ESLint konfigürasyonu
├── .prettierrc                    # Prettier konfigürasyonu
├── .env.example                   # Env variables template
├── .gitignore
├── package.json
└── README.md
```

---

## 4. State Management Stratejisi

### 4.1 State Kategorileri

```
┌─────────────────────────────────────────────────────┐
│                    STATE TİPLERİ                     │
├─────────────────┬───────────────────────────────────┤
│ TİP             │ ARAÇ         │ ÖRNEK              │
├─────────────────┼──────────────┼────────────────────┤
│ Server State    │ TanStack     │ Kullanıcı verisi,  │
│ (async, cached) │ Query        │ içerik, ilerleme   │
├─────────────────┼──────────────┼────────────────────┤
│ Client State    │ Zustand      │ Aktif ders durumu,  │
│ (sync, local)   │              │ UI durumu, ses     │
├─────────────────┼──────────────┼────────────────────┤
│ Form State      │ React Hook   │ Login form, profil │
│                 │ Form         │ düzenleme          │
├─────────────────┼──────────────┼────────────────────┤
│ URL State       │ React Router │ Aktif sayfa,       │
│                 │              │ dünya/ünite/ders ID│
├─────────────────┼──────────────┼────────────────────┤
│ Theme/i18n      │ React        │ Tema, dil, ses     │
│                 │ Context      │ tercihleri         │
└─────────────────┴──────────────┴────────────────────┘
```

### 4.2 Zustand Store Yapısı

```typescript
// Öğrenme durumu — Zustand slice
interface LearningState {
  // Aktif ders
  currentLesson: Lesson | null;
  currentActivityIndex: number;
  activityResults: ActivityResult[];
  
  // Session
  sessionXP: number;
  sessionCoins: number;
  sessionStartTime: number;
  
  // Actions
  startLesson: (lessonId: string) => void;
  completeActivity: (result: ActivityResult) => void;
  nextActivity: () => void;
  endLesson: () => LessonSummary;
}

// Gamification durumu — Zustand slice
interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  coins: number;
  gems: number;
  novaStage: NovaEvolutionStage;
  
  // Actions
  addXP: (amount: number, source: string) => void;
  spendCoins: (amount: number) => boolean;
  checkLevelUp: () => LevelUpResult | null;
  evolveNova: () => void;
}

// Audio durumu — Zustand slice
interface AudioState {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  currentTrack: string | null;
  
  // Actions
  toggleMusic: () => void;
  toggleSfx: () => void;
  playTrack: (track: string) => void;
  playSfx: (sfx: SfxType) => void;
}
```

### 4.3 TanStack Query Stratejisi

```typescript
// İçerik cache stratejisi
const QUERY_KEYS = {
  worlds: ['worlds'] as const,
  world: (id: string) => ['worlds', id] as const,
  units: (worldId: string) => ['worlds', worldId, 'units'] as const,
  lessons: (unitId: string) => ['units', unitId, 'lessons'] as const,
  activities: (lessonId: string) => ['lessons', lessonId, 'activities'] as const,
  progress: (childId: string) => ['progress', childId] as const,
  leaderboard: (type: string) => ['leaderboard', type] as const,
};

// Aggressive caching (içerik nadiren değişir)
const contentQueryOptions = {
  staleTime: 24 * 60 * 60 * 1000,  // 24 saat
  gcTime: 7 * 24 * 60 * 60 * 1000,  // 7 gün
  refetchOnWindowFocus: false,
};

// Progress realtime (sık güncellenir)
const progressQueryOptions = {
  staleTime: 5 * 60 * 1000,  // 5 dakika
  refetchOnMount: true,
};
```

---

## 5. Offline-First Stratejisi

### 5.1 Katmanlı Cache Yapısı

```
┌──────────────────────────────────────┐
│         CACHE HİYERARŞİSİ           │
├──────────────────────────────────────┤
│                                      │
│  L1: React State (Zustand)           │
│  ├── Aktif oturum verisi             │
│  ├── Hızlı erişim, RAM'de           │
│  └── App kapatılınca kaybolur        │
│                                      │
│  L2: TanStack Query Cache            │
│  ├── Server verisi cache             │
│  ├── Stale-while-revalidate          │
│  └── Persist to IndexedDB            │
│                                      │
│  L3: IndexedDB (Dexie.js)            │
│  ├── Offline content (dersler)       │
│  ├── Progress queue (sync bekleyen)  │
│  ├── Asset cache (ses, resim)        │
│  └── Kalıcı, 50MB+ kapasite         │
│                                      │
│  L4: Firebase Firestore              │
│  ├── Persistent cache (default)      │
│  ├── Offline reads otomatik          │
│  └── Write queue (online olunca sync)│
│                                      │
│  L5: Service Worker Cache            │
│  ├── App shell (HTML, CSS, JS)       │
│  ├── Static assets                   │
│  └── API response cache              │
│                                      │
└──────────────────────────────────────┘
```

### 5.2 Sync Stratejisi

```
┌──────────┐    Offline Action    ┌───────────────┐
│  User    │ ──────────────────▶  │  IndexedDB    │
│  Action  │                      │  Queue        │
└──────────┘                      └───────┬───────┘
                                          │
                               ┌──────────┴──────────┐
                               │  Online?             │
                               ├──────────┬───────────┤
                               │  YES     │    NO     │
                               ▼          │    (wait) │
                        ┌──────────┐      │           │
                        │ Firebase │◀─────┘           │
                        │ Sync     │  NetworkListener  │
                        └──────────┘  triggers sync    │
```

**Sync kuralları:**
1. Progress data → **Eventual consistency** (5 dk'da 1 veya app background'a geçince)
2. Purchase data → **Immediate sync** (online olur olmaz)
3. Content data → **Pull-based** (app açılışında, günde 1 kez)
4. Leaderboard → **Pull-based** (sayfa açılışında)

---

## 6. Event Bus Mimarisi

Gamification eventleri merkezi bir Event Bus üzerinden yönetilir:

```typescript
// Event Bus tipleri
type NovaEvent = 
  | { type: 'ACTIVITY_COMPLETED'; data: { activityId: string; score: number; time: number } }
  | { type: 'LESSON_COMPLETED'; data: { lessonId: string; xpEarned: number; stars: number } }
  | { type: 'STREAK_UPDATED'; data: { newStreak: number } }
  | { type: 'LEVEL_UP'; data: { oldLevel: number; newLevel: number } }
  | { type: 'ACHIEVEMENT_UNLOCKED'; data: { achievementId: string } }
  | { type: 'NOVA_EVOLVED'; data: { newStage: NovaEvolutionStage } }
  | { type: 'COINS_EARNED'; data: { amount: number; source: string } }
  | { type: 'ITEM_PURCHASED'; data: { itemId: string; cost: number } }
  | { type: 'AD_WATCHED'; data: { adType: 'rewarded' | 'interstitial'; reward?: number } }
  | { type: 'SCREEN_TIME_WARNING'; data: { minutesUsed: number; limit: number } };

// Event flow (örnek: ders tamamlama)
ACTIVITY_COMPLETED 
  → XPCalculator (XP hesapla)
  → StreakManager (streak güncelle)
  → AchievementChecker (rozet kontrol)
  → NovaEvolutionEngine (Nova kontrol)
  → AnalyticsService (event logla)
  → OfflineStore (kaydet)
  → UI animations (konfeti, XP animasyonu)
```

---

## 7. Güvenlik Mimarisi

### 7.1 Authentication Akışı

```
┌──────────┐         ┌──────────────┐        ┌──────────┐
│ Parent   │ signup  │  Firebase    │  token  │ App      │
│ (email/  │────────▶│  Auth        │────────▶│ (child   │
│  google/ │         │              │         │  profiles │
│  apple)  │         └──────────────┘         │  linked)  │
└──────────┘                                  └──────────┘
                                                    │
                                           ┌────────┴────────┐
                                           │ Parental Gate    │
                                           │ (PIN, math quiz) │
                                           │ for:             │
                                           │ - Settings       │
                                           │ - Purchases      │
                                           │ - Profile edit   │
                                           │ - Parent zone    │
                                           └─────────────────┘
```

### 7.2 Firestore Güvenlik Kuralları (Özet)

```javascript
// Temel prensipler:
// 1. Çocuk kendi verisini OKUYABILIR ama doğrudan YAZAMAZ
// 2. Tüm yazma işlemleri Cloud Functions üzerinden
// 3. Ebeveyn sadece kendi çocuklarının verisine erişir
// 4. Admin API'leri server-side auth gerektirir
// 5. Rate limiting Cloud Functions'da implement edilir

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Ebeveyn profili — sadece kendi verisi
    match /parents/{parentId} {
      allow read, write: if request.auth.uid == parentId;
      
      // Çocuk profilleri — ebeveyn kontrolünde
      match /children/{childId} {
        allow read: if request.auth.uid == parentId;
        allow write: if request.auth.uid == parentId;
      }
    }
    
    // Progress — Cloud Functions yazıyor
    match /progress/{childId} {
      allow read: if isParentOfChild(childId) || isChild(childId);
      allow write: if false; // Sadece Cloud Functions
    }
    
    // İçerik — herkes okuyabilir
    match /content/{document=**} {
      allow read: if request.auth != null;
      allow write: if false; // Sadece admin
    }
  }
}
```

### 7.3 Veri Gizliliği (COPPA/KVKK)

| Veri Tipi | Toplama | Saklama | Paylaşım |
|-----------|---------|---------|----------|
| Ebeveyn email | Zorunlu | Süresiz | Yok |
| Çocuk adı (takma ad) | İsteğe bağlı | Hesap süresince | Yok |
| Çocuk yaşı | Zorunlu (içerik) | Hesap süresince | Yok |
| Öğrenme ilerlemesi | Otomatik | Hesap süresince | Yok |
| Ses kaydı (SpeakIt) | Geçici | İşlem sonrası sil | Yok |
| Cihaz ID | Otomatik | Anonim | Analytics |
| Konum | TOPLANMAZ | - | - |
| Fotoğraf | TOPLANMAZ | - | - |

---

## 8. Performance Bütçesi

### 8.1 Yükleme Performansı

| Metrik | Hedef | Strateji |
|--------|-------|----------|
| First Contentful Paint | <1.5s | Critical CSS inline, font preload |
| Largest Contentful Paint | <2.5s | Image lazy load, WebP |
| Time to Interactive | <3s | Code splitting, tree shaking |
| Total Bundle Size (initial) | <200KB gz | Dynamic import, lazy routes |
| First Lesson Start | <5s | Preload next lesson assets |

### 8.2 Runtime Performansı

| Metrik | Hedef | Strateji |
|--------|-------|----------|
| Animation FPS | 60fps | GPU-accelerated transforms, will-change |
| Touch Response | <50ms | Passive listeners, debounce |
| Audio Latency | <100ms | Preloaded SoundPool |
| Memory Usage | <150MB | Asset unloading, WeakRef cache |
| Offline Lesson Load | <1s | IndexedDB preload |

### 8.3 Code Splitting Stratejisi

```typescript
// Route-based splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const WorldPage = lazy(() => import('./pages/WorldPage'));
const LessonPage = lazy(() => import('./pages/LessonPage'));
const ParentZone = lazy(() => import('./pages/ParentZone'));

// Feature-based splitting
const StoryTimeActivity = lazy(() => import('./features/learning/activities/StoryTime'));
const WordSearchActivity = lazy(() => import('./features/learning/activities/WordSearch'));

// Heavy lib splitting  
const LottiePlayer = lazy(() => import('./components/LottiePlayer'));
const SpeechRecognizer = lazy(() => import('./features/learning/activities/SpeakIt'));
```

---

## 9. Monitoring & Observability

### 9.1 Log Seviyeleri

```
ERROR   → Sentry (crash reporting)
WARN    → Firebase Crashlytics
INFO    → Firebase Analytics (custom events)
DEBUG   → Console (dev only)
TRACE   → Disabled in production
```

### 9.2 Temel Analytics Eventleri

```typescript
const ANALYTICS_EVENTS = {
  // Onboarding
  'onboarding_started': {},
  'onboarding_completed': { age_group: string },
  'profile_created': { avatar_type: string },
  
  // Learning
  'lesson_started': { world_id: string, unit_id: string, lesson_id: string },
  'activity_completed': { type: string, score: number, time_spent: number },
  'lesson_completed': { stars: number, xp_earned: number },
  'hint_used': { activity_type: string },
  'speech_attempted': { word: string, success: boolean },
  
  // Gamification
  'level_up': { new_level: number },
  'streak_milestone': { streak_days: number },
  'achievement_unlocked': { achievement_id: string },
  'nova_evolved': { stage: string },
  
  // Monetization
  'rewarded_ad_clicked': { placement: string },
  'rewarded_ad_completed': { reward_type: string, amount: number },
  'interstitial_shown': { placement: string },
  'subscription_page_viewed': {},
  'subscription_started': { plan: string, price: number },
  'iap_purchased': { item_id: string, price: number },
  
  // Engagement
  'app_opened': { day_streak: number },
  'daily_quest_completed': { quest_type: string },
  'screen_time_limit_reached': { minutes: number },
};
```

---

## 10. Test Stratejisi

### 10.1 Test Piramidi

```
          ┌───────────┐
          │  E2E (10%)│  Playwright — kritik akışlar
          │           │  (onboarding, ders tamamlama, satın alma)
          ├───────────┤
          │Integration│  Vitest — feature modül testleri
          │  (20%)    │  (öğrenme motoru, gamification engine)
          ├───────────┤
          │  Unit     │  Vitest — saf fonksiyonlar
          │  (40%)    │  (XP hesaplama, SRS, zorluk ayar)
          ├───────────┤
          │ Component │  Storybook + Testing Library
          │  (20%)    │  (UI bileşenleri, aktivite render)
          ├───────────┤
          │  Visual   │  Chromatic (Storybook)
          │  (10%)    │  (UI regression, tema tutarlılığı)
          └───────────┘
```

### 10.2 Kritik Test Senaryoları
1. **Ders akışı:** Başla → aktiviteler → tamamla → XP kazanma → streak güncelleme
2. **Offline-to-Online:** Offline ders tamamla → online sync → veri tutarlılığı
3. **Satın alma:** Reklam izle → ödül ver / Abonelik satın al → premium aç
4. **Ebeveyn koruma:** PIN doğrulama → ayarlara erişim → çocuk erişemez
5. **SRS:** Kelime öğren → geri dönüş zamanlaması → doğru aralıkta gösterim
