# NovaLingo — Proje Kurulum Rehberi

> Sıfırdan geliştirme ortamını kurma, adım adım
> Son güncelleme: 28 Şubat 2026

---

## 1. Ön Gereksinimler

### 1.1 Zorunlu Araçlar

| Araç | Minimum Versiyon | Kurulum |
|------|-----------------|---------|
| Node.js | 20.x LTS | `brew install node@20` veya [nvm](https://github.com/nvm-sh/nvm) |
| pnpm | 9.x | `corepack enable && corepack prepare pnpm@latest --activate` |
| Git | 2.40+ | `brew install git` |
| Firebase CLI | 13.x | `pnpm add -g firebase-tools` |
| Java JDK | 17+ | `brew install openjdk@17` (Android için) |
| CocoaPods | 1.14+ | `sudo gem install cocoapods` (iOS için) |

### 1.2 iOS Geliştirme (macOS zorunlu)

| Araç | Versiyon |
|------|---------|
| macOS | Ventura 13.0+ |
| Xcode | 15.0+ |
| Xcode Command Line Tools | `xcode-select --install` |
| Apple Developer Account | Aktif ($99/yıl) |

### 1.3 Android Geliştirme

| Araç | Versiyon |
|------|---------|
| Android Studio | Hedgehog 2023.1+ |
| Android SDK | API 34 (Android 14) |
| Android SDK Build Tools | 34.0.0 |
| Android SDK Platform Tools | 34.0.5+ |

### 1.4 Editör

```
VS Code (önerilen) + Eklentiler:
  ├── ESLint
  ├── Prettier
  ├── Tailwind CSS IntelliSense
  ├── TypeScript Vue Plugin (Volar) → ❌ (React kullanıyoruz)
  ├── ES7+ React/Redux/React-Native snippets
  ├── Firebase Explorer
  ├── GitLens
  ├── Error Lens
  └── Auto Rename Tag
```

---

## 2. Proje Klonlama & Kurulum

### 2.1 Repo Klonlama

```bash
# Repo'yu klonla
git clone https://github.com/novalingo/novalingo-app.git
cd novalingo-app

# Node versiyonunu kontrol et
node --version  # v20.x.x olmalı

# Bağımlılıkları kur
pnpm install

# Functions bağımlılıkları
cd functions && pnpm install && cd ..
```

### 2.2 Environment Dosyaları

```bash
# .env dosyalarını oluştur
cp .env.example .env.development
cp .env.example .env.staging
cp .env.example .env.production

# .env.development içeriğini doldur (Firebase Dev proje bilgileri)
# Diğer ortamlar için ilgili Firebase proje bilgileri
```

### 2.3 Firebase Kurulumu

```bash
# Firebase'e giriş yap
firebase login

# Projeleri listele
firebase projects:list

# Development projesi seç
firebase use novalingo-dev

# Emulator'ları başlat (yerel geliştirme)
firebase emulators:start
```

---

## 3. Firebase Proje Oluşturma (İlk Sefer)

### 3.1 Firebase Console'da

```
1. https://console.firebase.google.com → "Add project"
2. Proje adı: "novalingo-dev" (development için)
3. Google Analytics: Aktifleştir
4. Beklenen bölge: europe-west1

Servisleri Aktifleştir:
  □ Authentication → Email/Password + Google + Apple
  □ Firestore Database → Production mode, europe-west1
  □ Storage → Production mode
  □ Cloud Functions → Blaze planı gerekli
  □ Cloud Messaging → FCM setup
  □ App Check → DeviceCheck (iOS) + Play Integrity (Android)
```

### 3.2 Firebase Config Alma

```bash
# Web app oluştur (Firebase Console → Project Settings → Add app → Web)
# Config'i kopyala → .env.development dosyasına yapıştır

# VEYA CLI ile:
firebase apps:create WEB novalingo-web
firebase apps:sdkconfig WEB
```

### 3.3 Firestore Indexes

```bash
# firestore.indexes.json deploy et
firebase deploy --only firestore:indexes

# Veya Console'dan otomatik oluştur (ilk sorgu çalıştırınca hata verir, 
# hata mesajındaki link ile index oluşturulur)
```

### 3.4 Firestore Security Rules

```bash
# Kuralları deploy et
firebase deploy --only firestore:rules

# Storage kuralları
firebase deploy --only storage:rules
```

---

## 4. Capacitor Kurulumu

### 4.1 İlk Kurulum

```bash
# Web build oluştur
pnpm build

# Capacitor projelerini oluştur
npx cap add android
npx cap add ios

# Sync
npx cap sync
```

### 4.2 Android Yapılandırma

```bash
# Android Studio'da aç
npx cap open android

# Android Studio'da:
# 1. SDK Manager → API 34 indir
# 2. Virtual Device → Pixel 7 API 34 oluştur
# 3. Gradle sync bekle
```

**Android-specific dosyalar:**

```xml
<!-- android/app/src/main/AndroidManifest.xml eklemeleri -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.VIBRATE" />

<!-- Kids app flag -->
<meta-data
  android:name="com.google.android.gms.ads.APPLICATION_ID"
  android:value="ca-app-pub-xxx~yyy" />
```

### 4.3 iOS Yapılandırma

```bash
# Xcode'da aç
npx cap open ios

# CocoaPods yükle
cd ios/App && pod install && cd ../..
```

**iOS-specific dosyalar:**

```xml
<!-- ios/App/App/Info.plist eklemeleri -->
<key>NSMicrophoneUsageDescription</key>
<string>Konuşma alıştırmaları için mikrofon erişimi gereklidir</string>
<key>ITSAppUsesNonExemptEncryption</key>
<false/>
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-xxx~yyy</string>
<key>SKAdNetworkItems</key>
<!-- AdMob SKAdNetwork IDs -->
```

---

## 5. Yerel Geliştirme

### 5.1 Development Sunucusu Başlatma

```bash
# Terminal 1: Firebase emulators
firebase emulators:start

# Terminal 2: Vite dev server
pnpm dev

# Terminal 3 (opsiyonel): Storybook
pnpm storybook
```

### 5.2 Mobile'da Test

```bash
# Web build + sync
pnpm build && npx cap sync

# Android
npx cap run android --target=DEVICE_ID

# iOS
npx cap run ios --target=iPhone-15-Pro

# Live Reload (geliştirme sırasında)
# capacitor.config.ts'de server.url ekle:
# server: { url: 'http://LOCAL_IP:5173', cleartext: true }
```

### 5.3 Seed Data (Test Verisi)

```bash
# Firebase emulator'a seed data yükle
pnpm seed

# Bu komut şunları oluşturur:
# - 3 test ebeveyn hesabı
# - Her ebeveynde 2 çocuk profili
# - İlerleme verileri
# - 2 dünya + 10 ünite + 100 ders
# - 500 kelime kartı
# - Gamification verileri
```

---

## 6. Proje Yapısı Oluşturma

### 6.1 Kaynak Kodu Dizin Yapısı

```
src/
├── app/                          # App entry point
│   ├── App.tsx                   # Root component
│   ├── Router.tsx                # Route definitions
│   └── providers/                # Context providers
│       ├── AuthProvider.tsx
│       ├── ThemeProvider.tsx
│       └── QueryProvider.tsx
│
├── components/                   # Paylaşılan bileşenler
│   ├── atoms/                    # En küçük bileşenler
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   └── index.ts
│   │   ├── Text/
│   │   ├── Icon/
│   │   ├── Badge/
│   │   ├── Avatar/
│   │   ├── ProgressBar/
│   │   └── Spinner/
│   ├── molecules/                # Atom kombinasyonları
│   │   ├── Card/
│   │   ├── ListItem/
│   │   ├── StarRating/
│   │   ├── XPDisplay/
│   │   ├── CurrencyDisplay/
│   │   └── QuestItem/
│   ├── organisms/                # Karmaşık bileşenler
│   │   ├── Navigation/
│   │   ├── LessonCard/
│   │   ├── AchievementPopup/
│   │   ├── NovaCompanion/
│   │   ├── DailyWheel/
│   │   └── Leaderboard/
│   └── templates/                # Sayfa layout'ları
│       ├── AppLayout.tsx
│       ├── LessonLayout.tsx
│       └── ParentLayout.tsx
│
├── features/                     # Feature-based modüller
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── screens/
│   │       ├── LoginScreen.tsx
│   │       ├── RegisterScreen.tsx
│   │       └── OnboardingScreen.tsx
│   ├── home/
│   │   ├── components/
│   │   │   ├── WorldMap.tsx
│   │   │   ├── DailyQuests.tsx
│   │   │   └── StreakDisplay.tsx
│   │   └── screens/
│   │       └── HomeScreen.tsx
│   ├── learning/
│   │   ├── components/
│   │   │   ├── activities/       # 10 aktivite tipi
│   │   │   │   ├── FlashCard.tsx
│   │   │   │   ├── MatchPairs.tsx
│   │   │   │   ├── ListenAndTap.tsx
│   │   │   │   ├── WordBuilder.tsx
│   │   │   │   ├── FillBlank.tsx
│   │   │   │   ├── SpeakIt.tsx
│   │   │   │   ├── StoryTime.tsx
│   │   │   │   ├── MemoryGame.tsx
│   │   │   │   ├── WordSearch.tsx
│   │   │   │   └── QuizBattle.tsx
│   │   │   ├── LessonProgress.tsx
│   │   │   └── CompletionScreen.tsx
│   │   ├── hooks/
│   │   │   ├── useLesson.ts
│   │   │   ├── useActivity.ts
│   │   │   └── useSpeechRecognition.ts
│   │   └── screens/
│   │       ├── WorldScreen.tsx
│   │       ├── UnitScreen.tsx
│   │       └── LessonScreen.tsx
│   ├── gamification/
│   │   ├── components/
│   │   │   ├── NovaAvatar.tsx
│   │   │   ├── AchievementCard.tsx
│   │   │   ├── QuestTracker.tsx
│   │   │   └── LevelUpModal.tsx
│   │   └── screens/
│   │       ├── ProfileScreen.tsx
│   │       ├── AchievementsScreen.tsx
│   │       └── ShopScreen.tsx
│   ├── social/
│   │   └── screens/
│   │       └── LeaderboardScreen.tsx
│   ├── parent/
│   │   ├── components/
│   │   │   ├── ParentalGate.tsx
│   │   │   ├── ChildProgressChart.tsx
│   │   │   └── ScreenTimeControl.tsx
│   │   └── screens/
│   │       ├── ParentDashboard.tsx
│   │       ├── ChildReportScreen.tsx
│   │       └── SettingsScreen.tsx
│   └── subscription/
│       └── screens/
│           └── PaywallScreen.tsx
│
├── services/                     # Dış servis katmanı
│   ├── firebase/
│   │   ├── auth.ts
│   │   ├── firestore.ts
│   │   ├── storage.ts
│   │   ├── functions.ts
│   │   ├── analytics.ts
│   │   └── messaging.ts
│   ├── admob/
│   │   ├── adService.ts
│   │   └── rewardedAd.ts
│   ├── revenuecat/
│   │   ├── purchaseService.ts
│   │   └── entitlements.ts
│   ├── audio/
│   │   ├── audioManager.ts
│   │   └── speechService.ts
│   ├── offline/
│   │   ├── offlineStorage.ts     # Dexie.js
│   │   └── syncManager.ts
│   └── notification/
│       └── pushService.ts
│
├── stores/                       # Zustand stores
│   ├── authStore.ts
│   ├── learningStore.ts
│   ├── gamificationStore.ts
│   ├── audioStore.ts
│   ├── uiStore.ts
│   └── index.ts
│
├── hooks/                        # Paylaşılan custom hooks
│   ├── useAuth.ts
│   ├── useChild.ts
│   ├── useAgeGroup.ts
│   ├── useHaptics.ts
│   ├── useSound.ts
│   ├── useOnline.ts
│   └── useScreenTime.ts
│
├── utils/                        # Yardımcı fonksiyonlar
│   ├── xp.ts
│   ├── level.ts
│   ├── date.ts
│   ├── validation.ts
│   ├── formatters.ts
│   └── constants.ts
│
├── types/                        # TypeScript tip tanımları
│   ├── models.ts                 # Domain modelleri
│   ├── api.ts                    # API request/response
│   ├── navigation.ts             # Route params
│   └── global.d.ts               # Global tip tanımları
│
├── assets/                       # Statik dosyalar
│   ├── images/
│   ├── icons/
│   ├── lottie/                   # Lottie JSON animasyonları
│   ├── sounds/                   # Ses dosyaları
│   │   ├── sfx/                  # Efektler
│   │   ├── bgm/                  # Arka plan müziği
│   │   └── nova/                 # Nova sesleri
│   └── fonts/
│
├── styles/                       # Global stiller
│   ├── global.css
│   ├── animations.css
│   └── themes/
│       ├── cubs.css
│       ├── stars.css
│       └── legends.css
│
├── i18n/                         # Çeviri dosyaları
│   ├── tr/
│   │   ├── common.json
│   │   ├── home.json
│   │   ├── learning.json
│   │   └── gamification.json
│   ├── en/
│   └── i18n.ts                   # i18next config
│
├── config/                       # Yapılandırma
│   ├── firebase.ts
│   ├── sentry.ts
│   ├── capacitor.ts
│   └── constants.ts
│
└── test/                         # Test altyapısı
    ├── setup.ts
    ├── mocks/
    │   ├── firebase.ts
    │   └── handlers.ts
    └── factories/                # Test data factories
        ├── userFactory.ts
        ├── lessonFactory.ts
        └── wordFactory.ts
```

---

## 7. Geliştirme Akışı

### 7.1 Git Workflow

```
Branch Stratejisi: GitHub Flow (basitleştirilmiş)

main          ─── Canlı (production)
  │
  ├── dev     ─── Geliştirme (staging auto-deploy)
  │    │
  │    ├── feature/xyz   ─── Yeni özellik
  │    ├── fix/abc       ─── Bug fix
  │    └── chore/def     ─── Bakım
  
Kurallar:
  - main'e direkt push YOK
  - dev'e direkt push YOK
  - Her değişiklik PR ile
  - PR'da en az 1 approval
  - CI check'ler geçmeli
  - Squash merge tercih
```

### 7.2 Commit Conventions

```
Conventional Commits:
  feat:     Yeni özellik
  fix:      Bug düzeltme
  docs:     Dokümantasyon
  style:    Kod stili (formatting)
  refactor: Refactoring
  perf:     Performans
  test:     Test ekleme/düzeltme
  chore:    Build/araç değişikliği

Örnekler:
  feat(learning): FlashCard aktivite bileşeni eklendi
  fix(auth): Google Sign-In iOS crash düzeltildi
  perf(home): WorldMap lazy loading eklendi
  test(gamification): XP hesaplama unit test'leri
```

### 7.3 Pre-commit Hooks

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

```bash
# Husky kurulumu
pnpm add -D husky lint-staged
npx husky init
echo "npx lint-staged" > .husky/pre-commit
echo "npx commitlint --edit \$1" > .husky/commit-msg
```

---

## 8. Hızlı Başlangıç (Quick Start)

```bash
# 1. Klon
git clone https://github.com/novalingo/novalingo-app.git && cd novalingo-app

# 2. Node (nvm ile)
nvm use 20

# 3. Bağımlılıklar
pnpm install
cd functions && pnpm install && cd ..

# 4. Environment
cp .env.example .env.development

# 5. Firebase emulators
firebase emulators:start &

# 6. Dev server
pnpm dev

# → http://localhost:5173 açılır
# → Firebase Emulator UI: http://localhost:4000

# 7. Seed data (opsiyonel)
pnpm seed

# 8. Storybook (opsiyonel)
pnpm storybook
# → http://localhost:6006
```
