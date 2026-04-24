# NovaLingo — Deployment & DevOps

> CI/CD pipeline, build süreci, ortamlar, App Store dağıtımı
> Son güncelleme: 28 Şubat 2026

---

## 1. Ortam Stratejisi

```
┌──────────────────────────────────────────────────────────┐
│                    ORTAMLAR                                │
├──────────────┬───────────────┬────────────────────────────┤
│ Development  │   Staging     │   Production               │
│              │               │                             │
│ Lokal        │ Firebase      │ Firebase                   │
│ emulator     │ test projesi  │ canlı proje                │
│              │               │                             │
│ Hot reload   │ Gerçek verili │ Canlı kullanıcılar         │
│ Mock data    │ Test IAP      │ Gerçek IAP                 │
│ Debug mode   │ Test ads      │ Gerçek ads                 │
│              │               │                             │
│ Branch: *    │ Branch: dev   │ Branch: main               │
│              │ Auto deploy   │ Manuel approval             │
└──────────────┴───────────────┴────────────────────────────┘
```

---

## 2. Firebase Proje Yapısı

```
Firebase Projeleri:
  ├── novalingo-b0c92      (Staging)
  │   ├── Firestore: test verisi
  │   ├── Auth: test kullanıcılar
  │   ├── Functions: staging deploy
  │   └── Hosting: staging alias
  │
  └── novalingo-app        (Production)
      ├── Firestore: canlı veri
      ├── Auth: gerçek kullanıcılar
      ├── Functions: production deploy
      └── Hosting: production alias

Konfigürasyon:
  .env.development    → novalingo-app kimlik bilgileri
  .env.staging        → novalingo-b0c92 kimlik bilgileri
  .env.production     → novalingo-app kimlik bilgileri
  functions/.env.staging    → staging Functions runtime env
  functions/.env.production → production Functions runtime env
```

### 2.1 Güncel Alias Eşlemesi

```json
{
  "staging": "novalingo-b0c92",
  "production": "novalingo-app"
}
```

Bu eşleşme repo içindeki `.firebaserc` ile uyumludur. `firebase deploy --project staging` ve
`firebase deploy --project production` komutları bu alias'ları kullanır.

---

## 3. Environment Variables

```bash
# .env.production (örnek — gerçek değerler Secret Manager'da)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=novalingo-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=novalingo-prod
VITE_FIREBASE_STORAGE_BUCKET=novalingo-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

VITE_ADMOB_APP_ID_IOS=ca-app-pub-xxx/yyy
VITE_ADMOB_APP_ID_ANDROID=ca-app-pub-xxx/zzz
VITE_REVENUECAT_API_KEY_IOS=appl_xxx
VITE_REVENUECAT_API_KEY_ANDROID=goog_xxx

VITE_APP_ENV=production
VITE_APP_VERSION=$npm_package_version
VITE_SENTRY_DSN=https://xxx@sentry.io/yyy
VITE_BUNDLE_TTS_AUDIO=true
VITE_TTS_AUDIO_BASE_URL=https://novalingo-app-tts.web.app

# Functions runtime env (dotenv)
GEMINI_DEFAULT_MODEL=gemini-3.1-flash-lite
GEMINI_FALLBACK_MODEL=gemini-2.5-flash-lite

# Functions secret (Secret Manager)
GEMINI_API_KEY=AIzaSy... # Secret Manager'da tutulur, repo'ya yazılmaz
```

### 3.3 Pre-recorded TTS Dağıtımı

- Web/Netlify build'lerinde `VITE_BUNDLE_TTS_AUDIO=true` bırakılabilir; MP3'ler `dist/audio/tts` içine girer.
- Native Capacitor build'lerinde varsayılan script'ler artık `VITE_BUNDLE_TTS_AUDIO=false` ile çalışır; böylece 1GB+ TTS paketi uygulama binary'sine gömülmez.
- Native build'de pre-recorded TTS kullanmak için `VITE_TTS_AUDIO_BASE_URL` ile CDN / Firebase Hosting / object storage taban URL'i verilmelidir.
- `VITE_TTS_AUDIO_BASE_URL` yoksa native shell pre-recorded MP3 yerine Web Speech fallback'e düşer; uygulama sessizce kırılmaz ama kalite düşer.

Firebase Hosting tabanlı kurulum bu repo içinde hazırlandı:

- Production TTS site: `https://novalingo-app-tts.web.app`
- Staging TTS site: `https://novalingo-b0c92-tts.web.app`
- Firebase target: `hosting:tts`
- Asset hazırlama: `pnpm run tts:prepare`
- Staging deploy: `pnpm run firebase:deploy:tts:staging`
- Production deploy: `pnpm run firebase:deploy:tts:prod`

Native env önerisi:

- Staging: `VITE_TTS_AUDIO_BASE_URL=https://novalingo-b0c92-tts.web.app`
- Production: `VITE_TTS_AUDIO_BASE_URL=https://novalingo-app-tts.web.app`

Staging build'ini bu origin'e zorlamak için local çalışma kopyasında `.env.staging` şu override'ları içermelidir:

```bash
VITE_APP_ENV=staging
VITE_BUNDLE_TTS_AUDIO=false
VITE_TTS_AUDIO_BASE_URL=https://novalingo-b0c92-tts.web.app
```

Repo script'leri:

- `pnpm run build:staging`
- `pnpm run cap:build:android:staging`
- `pnpm run cap:build:ios:staging`
- `pnpm run smoke:cap:staging`

Gerçek cihaz / Capacitor smoke test komutları:

```bash
# 1) Staging native web bundle doğrulaması
pnpm run smoke:cap:staging

# 2) Android için staging web bundle + native sync
pnpm run cap:build:android:staging

# 3) Android debug APK üret
cd android && ./gradlew assembleDebug

# 4) Bağlı cihaza yükle
adb devices
adb install -r app/build/outputs/apk/debug/app-debug.apk

# 5) Uygulamayı aç ve logları izle
adb shell am start -n com.novalingo.app/.MainActivity
adb logcat | grep -i "capacitor\|chromium\|audio\|howler\|tts"

# 6) iOS için staging web bundle + native sync
pnpm run cap:build:ios:staging

# 7) Bağlı iOS cihazını listele ve Xcode projesini aç
xcrun xctrace list devices
pnpm run cap:ios
```

Manuel kontrol checklist'i:

- açılışta uygulama crash etmemeli
- bir kelime/lesson ekranında pre-recorded TTS çalmalı
- `dist/audio/tts` native bundle içine geri dönmemeli
- staging origin dışına (`novalingo-app-tts.web.app`) istek gitmemeli

### 3.1 Gemini Evaluator İçin Functions Env Dosyaları

Repo içinde şu dosyalar oluşturulmuştur:

```bash
functions/.env.staging
functions/.env.production
```

İçerik:

```bash
GEMINI_DEFAULT_MODEL=gemini-3.1-flash-lite
GEMINI_FALLBACK_MODEL=gemini-2.5-flash-lite
```

Bu iki değişken deploy sırasında Firebase CLI tarafından ilgili alias için yüklenir.

### 3.2 Gemini API Secret Durumu

`GEMINI_API_KEY` artık code tarafında `defineSecret('GEMINI_API_KEY')` ile bekleniyor.

Ancak mevcut iki proje de şu anda Spark planında olduğu için Firebase CLI `functions:secrets:set`
ve `functions:secrets:get` komutlarını çalıştırmıyor. Secret Manager ancak Blaze planında aktif
edilebiliyor.

Blaze'e geçildiğinde secret şu komutlarla eklenmeli:

```bash
firebase functions:secrets:set GEMINI_API_KEY --project staging
firebase functions:secrets:set GEMINI_API_KEY --project production
```

Doğrulama:

```bash
firebase functions:secrets:get GEMINI_API_KEY --project staging
firebase functions:secrets:get GEMINI_API_KEY --project production
```

---

## 4. CI/CD Pipeline (GitHub Actions)

### 4.1 Ana Pipeline Dosyası

```yaml
# .github/workflows/ci-cd.yml
name: NovaLingo CI/CD

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '20'
  JAVA_VERSION: '17'

jobs:
  # ─────────────────────────────────────
  # JOB 1: Lint + Type Check + Unit Test
  # ─────────────────────────────────────
  quality:
    name: Code Quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: ESLint
        run: pnpm lint

      - name: TypeScript check
        run: pnpm type-check

      - name: Unit tests
        run: pnpm test:unit -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info

  # ─────────────────────────────────────
  # JOB 2: Build + Bundle Analysis
  # ─────────────────────────────────────
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build (staging)
        if: github.ref == 'refs/heads/dev'
        run: pnpm build:staging

      - name: Build (production)
        if: github.ref == 'refs/heads/main'
        run: pnpm build:production
        env:
          VITE_APP_ENV: production

      - name: Bundle size check
        run: |
          MAX_SIZE=250 # KB
          ACTUAL_SIZE=$(du -sk dist/assets/*.js | awk '{total+=$1} END{print total}')
          echo "Bundle size: ${ACTUAL_SIZE}KB (max: ${MAX_SIZE}KB)"
          if [ "$ACTUAL_SIZE" -gt "$MAX_SIZE" ]; then
            echo "::error::Bundle size ${ACTUAL_SIZE}KB exceeds limit ${MAX_SIZE}KB"
            exit 1
          fi

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: web-build
          path: dist/

  # ─────────────────────────────────────
  # JOB 3: E2E Tests
  # ─────────────────────────────────────
  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright
        run: pnpm exec playwright install --with-deps chromium

      - name: Download build
        uses: actions/download-artifact@v4
        with:
          name: web-build
          path: dist/

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload E2E report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: e2e-report
          path: test-results/

  # ─────────────────────────────────────
  # JOB 4: Deploy Functions
  # ─────────────────────────────────────
  deploy-functions:
    name: Deploy Cloud Functions
    runs-on: ubuntu-latest
    needs: [build, e2e]
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/dev'
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install function dependencies
        run: cd functions && pnpm install --frozen-lockfile

      - name: Build functions
        run: cd functions && pnpm build

      - name: Deploy to staging
        if: github.ref == 'refs/heads/dev'
        run: |
          npx firebase-tools deploy --only functions \
            --project staging \
            --token ${{ secrets.FIREBASE_TOKEN_DEV }}

      - name: Deploy to production
        if: github.ref == 'refs/heads/main'
        run: |
          npx firebase-tools deploy --only functions \
            --project production \
            --token ${{ secrets.FIREBASE_TOKEN_PROD }}

  # ─────────────────────────────────────
  # JOB 5: Deploy Hosting
  # ─────────────────────────────────────
  deploy-hosting:
    name: Deploy Firebase Hosting
    runs-on: ubuntu-latest
    needs: [build, e2e]
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/dev'
    steps:
      - uses: actions/checkout@v4

      - name: Download build
        uses: actions/download-artifact@v4
        with:
          name: web-build
          path: dist/

      - name: Deploy to staging
        if: github.ref == 'refs/heads/dev'
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SA_DEV }}
          projectId: novalingo-dev
          channelId: staging

      - name: Deploy to production
        if: github.ref == 'refs/heads/main'
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SA_PROD }}
          projectId: novalingo-prod
          channelId: live
```

### 4.2 Mobile Build Pipeline

```yaml
# .github/workflows/mobile-build.yml
name: Mobile Build

on:
  workflow_dispatch:
    inputs:
      platform:
        description: 'Platform'
        required: true
        type: choice
        options: [ios, android, both]
      environment:
        description: 'Environment'
        required: true
        type: choice
        options: [staging, production]

jobs:
  # ─────────────────────────────────────
  # Android Build
  # ─────────────────────────────────────
  android:
    name: Android Build
    runs-on: ubuntu-latest
    if: inputs.platform == 'android' || inputs.platform == 'both'
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: ${{ env.JAVA_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build web
        run: pnpm build:${{ inputs.environment }}

      - name: Capacitor sync
        run: npx cap sync android

      - name: Setup Gradle cache
        uses: actions/cache@v4
        with:
          path: |
            ~/.gradle/caches
            ~/.gradle/wrapper
          key: gradle-${{ hashFiles('**/*.gradle*') }}

      - name: Decode keystore
        if: inputs.environment == 'production'
        run: echo "${{ secrets.ANDROID_KEYSTORE_BASE64 }}" | base64 -d > android/app/release.keystore

      - name: Build APK (staging)
        if: inputs.environment == 'staging'
        run: |
          cd android
          ./gradlew assembleDebug

      - name: Build AAB (production)
        if: inputs.environment == 'production'
        run: |
          cd android
          ./gradlew bundleRelease
        env:
          KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
          KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: android-${{ inputs.environment }}
          path: |
            android/app/build/outputs/apk/debug/*.apk
            android/app/build/outputs/bundle/release/*.aab

  # ─────────────────────────────────────
  # iOS Build
  # ─────────────────────────────────────
  ios:
    name: iOS Build
    runs-on: macos-14
    if: inputs.platform == 'ios' || inputs.platform == 'both'
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build web
        run: pnpm build:${{ inputs.environment }}

      - name: Capacitor sync
        run: npx cap sync ios

      - name: Setup CocoaPods cache
        uses: actions/cache@v4
        with:
          path: ios/App/Pods
          key: pods-${{ hashFiles('ios/App/Podfile.lock') }}

      - name: Install CocoaPods
        run: cd ios/App && pod install

      - name: Install certificates
        uses: apple-actions/import-codesign-certs@v2
        with:
          p12-file-base64: ${{ secrets.IOS_P12_BASE64 }}
          p12-password: ${{ secrets.IOS_P12_PASSWORD }}

      - name: Install provisioning profile
        uses: apple-actions/download-provisioning-profiles@v1
        with:
          bundle-id: 'com.novalingo.app'
          issuer-id: ${{ secrets.APPSTORE_ISSUER_ID }}
          api-key-id: ${{ secrets.APPSTORE_KEY_ID }}
          api-private-key: ${{ secrets.APPSTORE_PRIVATE_KEY }}

      - name: Build IPA
        run: |
          cd ios/App
          xcodebuild -workspace App.xcworkspace \
            -scheme App \
            -configuration ${{ inputs.environment == 'production' && 'Release' || 'Debug' }} \
            -archivePath build/App.xcarchive \
            archive

          xcodebuild -exportArchive \
            -archivePath build/App.xcarchive \
            -exportPath build/export \
            -exportOptionsPlist ExportOptions.plist

      - name: Upload to TestFlight
        if: inputs.environment == 'production'
        uses: apple-actions/upload-testflight-build@v1
        with:
          app-path: ios/App/build/export/App.ipa
          issuer-id: ${{ secrets.APPSTORE_ISSUER_ID }}
          api-key-id: ${{ secrets.APPSTORE_KEY_ID }}
          api-private-key: ${{ secrets.APPSTORE_PRIVATE_KEY }}

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: ios-${{ inputs.environment }}
          path: ios/App/build/export/*.ipa
```

---

## 5. Build Süreci

### 5.1 Web Build

```bash
# package.json scripts
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:staging": "tsc && vite build --mode staging",
    "build:production": "tsc && vite build --mode production",
    "preview": "vite preview",

    "lint": "eslint src/ --ext .ts,.tsx",
    "lint:fix": "eslint src/ --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit",

    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",

    "cap:sync": "cap sync",
    "cap:android": "cap open android",
    "cap:ios": "cap open ios",

    "firebase:emulators": "firebase emulators:start",
    "firebase:deploy:staging": "firebase deploy --project staging",
    "firebase:deploy:prod": "firebase deploy --project production",

    "storybook": "storybook dev -p 6006",
    "storybook:build": "storybook build"
  }
}
```

### 5.2 Vite Yapılandırması

```typescript
// vite.config.ts
import { defineConfig, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig(
  ({ mode }): UserConfig => ({
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/firebasestorage\.googleapis\.com/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'firebase-storage',
                expiration: { maxEntries: 500, maxAgeSeconds: 30 * 24 * 60 * 60 },
              },
            },
          ],
        },
      }),
      mode === 'production' &&
        sentryVitePlugin({
          org: 'novalingo',
          project: 'novalingo-web',
          authToken: process.env.SENTRY_AUTH_TOKEN,
        }),
    ],

    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
        '@features': '/src/features',
        '@services': '/src/services',
        '@stores': '/src/stores',
        '@hooks': '/src/hooks',
        '@utils': '/src/utils',
        '@assets': '/src/assets',
        '@types': '/src/types',
      },
    },

    build: {
      target: 'es2022',
      sourcemap: mode === 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            'vendor-animation': ['framer-motion', 'lottie-react'],
            'vendor-audio': ['howler'],
            'vendor-state': ['zustand', '@tanstack/react-query'],
          },
        },
      },
      chunkSizeWarningLimit: 300,
    },

    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
    },
  }),
);
```

---

## 6. Capacitor Yapılandırması

```typescript
// capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.novalingo.app',
  appName: 'NovaLingo',
  webDir: 'dist',

  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor',
  },

  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
      backgroundColor: '#0D8FDB',
    },

    StatusBar: {
      style: 'light',
      backgroundColor: '#0D8FDB',
    },

    Keyboard: {
      resize: 'body',
      style: 'light',
    },

    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },

    // AdMob
    AdMob: {
      // Test ads in non-production
      testingDevices: ['DEVICE_ID_1', 'DEVICE_ID_2'],
      initializeForTesting: process.env.NODE_ENV !== 'production',
    },
  },

  // iOS-specific
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'NovaLingo',
  },

  // Android-specific
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
```

---

## 7. Firebase Yapılandırması

```json
// firebase.json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
      },
      {
        "source": "**/*.@(json|png|jpg|webp|svg|woff2)",
        "headers": [{ "key": "Cache-Control", "value": "public, max-age=86400" }]
      }
    ]
  },

  "functions": {
    "source": "functions",
    "runtime": "nodejs20",
    "predeploy": ["npm --prefix functions run lint", "npm --prefix functions run build"]
  },

  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },

  "storage": {
    "rules": "storage.rules"
  },

  "emulators": {
    "auth": { "port": 9099 },
    "functions": { "port": 5001 },
    "firestore": { "port": 8080 },
    "storage": { "port": 9199 },
    "hosting": { "port": 5000 },
    "ui": { "enabled": true, "port": 4000 }
  }
}
```

---

## 8. App Store Dağıtım

### 8.1 Apple App Store

```
Hazırlık Checklist:
  □ Apple Developer Account ($99/yıl)
  □ App Store Connect kurulumu
  □ Bundle ID: com.novalingo.app
  □ Certificates & Provisioning Profiles
  □ App Icon (1024×1024 + tüm boyutlar)
  □ Screenshots (6.7", 6.5", 5.5", iPad Pro)
  □ App Privacy Details (COPPA uyumlu)
  □ Age Rating: 4+ (Made for Kids)
  □ Kids Category seçimi
  □ Privacy Policy URL
  □ Terms of Service URL
  □ Support URL
  □ Marketing URL

App Store Review Notları:
  - Demo hesap bilgileri (review team için)
  - Parental Gate açıklaması
  - Reklam politikası açıklaması
  - Veri toplama açıklaması (COPPA)
  - Auto-renewable subscription bilgileri

Beklenen Review Süresi: 1-3 gün
İlk submission'da rejection riski: Yüksek (Kids Category strict rules)
```

### 8.2 Google Play Store

```
Hazırlık Checklist:
  □ Google Play Console ($25 tek seferlik)
  □ App signing key oluştur (Play App Signing)
  □ Upload key oluştur (CI/CD için)
  □ Package name: com.novalingo.app
  □ Store Listing (Türkçe + İngilizce)
  □ Feature Graphic (1024×500)
  □ Screenshots (phone + tablet)
  □ Privacy Policy URL
  □ Content Rating (IARC) - Everyone
  □ Families Policy beyanı
  □ Target audience: 4-12
  □ Ads beyanı (contains ads)
  □ Data Safety form
  □ App Access (demo account for review)

Google Play Families Policy:
  - Teacher Approved programına başvur
  - Reklam SDK'lar Google Families Self-Certified olmalı
  - AdMob COPPA flag aktif olmalı
  - Analytics data collection sınırlı olmalı
  - Login akışı çocuk dostu olmalı
```

### 8.3 Versiyon Stratejisi

```
Semantic Versioning: MAJOR.MINOR.PATCH

  MAJOR: Büyük özellik (yeni dünyalar, yeni aktivite tipleri)
  MINOR: Orta özellik (iyileştirmeler, yeni içerik)
  PATCH: Bug fix, küçük düzeltme

Build Number: Her build'de artan sayı
  iOS: CFBundleVersion (integer, her zaman artan)
  Android: versionCode (integer, her zaman artan)

Örnek:
  v1.0.0 (build 1) → İlk release
  v1.0.1 (build 2) → Bug fix
  v1.1.0 (build 3) → Yeni içerik
  v1.2.0 (build 5) → Yeni özellik
  v2.0.0 (build 10) → Büyük güncelleme
```

---

## 9. Monitoring & Alerting

### 9.1 Monitoring Stack

```
┌─────────────────────────────────────────────┐
│            MONITORING KATMANI                │
├─────────────────────────────────────────────┤
│                                              │
│  Firebase Crashlytics → Crash raporlama      │
│  Firebase Performance → Web vitals           │
│  Firebase Analytics   → Kullanım metrikleri  │
│  Sentry              → Error tracking        │
│  UptimeRobot         → Uptime monitoring     │
│  Cloud Monitoring    → Function metrikleri   │
│                                              │
└─────────────────────────────────────────────┘
```

### 9.2 Alert Kuralları

| Metrik               | Eşik      | Aksiyon          |
| -------------------- | --------- | ---------------- |
| Error rate           | >1%       | Slack alert      |
| API latency          | >3s (p95) | Slack alert      |
| Cloud Function error | Any       | Email + Slack    |
| Crash rate           | >0.5%     | Pager (critical) |
| Firestore reads      | >500K/day | Email (budget)   |
| Auth failures        | >100/hour | Slack alert      |
| Monthly cost         | >$100     | Email warning    |

### 9.3 Sentry Integration

```typescript
// src/config/sentry.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_APP_ENV,
  release: `novalingo@${import.meta.env.VITE_APP_VERSION}`,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({ maskAllText: true }), // COPPA: mask user text
  ],

  tracesSampleRate: 0.1, // %10 performance tracing
  replaysSessionSampleRate: 0, // No session replay (COPPA)
  replaysOnErrorSampleRate: 0.1, // %10 error replay

  beforeSend(event) {
    // COPPA: Çocuk verisini temizle
    if (event.user) {
      delete event.user.email;
      delete event.user.username;
      delete event.user.ip_address;
    }
    return event;
  },
});
```

---

## 10. Güvenlik Kontrolleri

### 10.1 Pre-deploy Güvenlik

```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  pull_request:
    branches: [main, dev]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run SAST (Semgrep)
        uses: returntocorp/semgrep-action@v1
        with:
          config: auto

      - name: Dependency audit
        run: pnpm audit --audit-level=high

      - name: Check for secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./

      - name: License check
        run: npx license-checker --failOn "GPL-3.0"
```

### 10.2 Secrets Management

```
GitHub Secrets (CI/CD):
  ├── FIREBASE_TOKEN_DEV
  ├── FIREBASE_TOKEN_PROD
  ├── FIREBASE_SA_DEV (Service Account JSON, base64)
  ├── FIREBASE_SA_PROD
  ├── ANDROID_KEYSTORE_BASE64
  ├── ANDROID_KEYSTORE_PASSWORD
  ├── ANDROID_KEY_ALIAS
  ├── ANDROID_KEY_PASSWORD
  ├── APPSTORE_ISSUER_ID
  ├── APPSTORE_KEY_ID
  ├── APPSTORE_PRIVATE_KEY
  ├── IOS_P12_BASE64
  ├── IOS_P12_PASSWORD
  ├── SENTRY_AUTH_TOKEN
  └── CODECOV_TOKEN

Firebase Secret Manager (Runtime):
  ├── REVENUECAT_WEBHOOK_SECRET
  ├── ADMOB_SERVER_KEY
  └── FCM_SERVER_KEY
```

---

## 11. Rollback Stratejisi

```
Web (Firebase Hosting):
  → "firebase hosting:rollback" veya Console'dan önceki versiyona dön
  → Anlık (CDN invalidation: ~30s)

Cloud Functions:
  → Önceki versiyonu tekrar deploy et
  → Veya traffic splitting ile canary

Mobile (App Store):
  → App Store'dan rollback YAPILAMAZ
  → Çözüm: Hızlı hotfix + expedited review
  → Remote Config ile feature flag ile devre dışı bırak
  → Minimum review süresi: iOS ~24h, Android ~2h

Strateji:
  1. Her release öncesi: staging'de 24-48 saat test
  2. Phased rollout: Android %10 → %25 → %50 → %100
  3. iOS: TestFlight → External testers → App Store
  4. Feature flags: Her yeni özellik flag arkasında
  5. Kill switch: Kritik feature'ları anında kapama
```
