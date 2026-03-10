# NovaLingo — Tech Stack Kararları

> Her teknoloji seçiminin gerekçesi, alternatifleri ve trade-off'ları
> Son güncelleme: 28 Şubat 2026

---

## Karar Matrisi Özet

| Katman                | Seçim                         | Alternatif                     | Neden Bu?                                 |
| --------------------- | ----------------------------- | ------------------------------ | ----------------------------------------- |
| UI Framework          | React 19                      | Vue 3, Svelte 5                | Animasyon ekosistemi, topluluk büyüklüğü  |
| Build Tool            | Vite 6                        | Webpack, Turbopack             | Hız, basitlik, ESM-native                 |
| Language              | TypeScript 5.7                | JavaScript                     | Type safety, IDE desteği, refactoring     |
| Styling               | Tailwind CSS 4                | Styled Components, CSS Modules | Utility-first, JIT, design token          |
| Animation (layout)    | Framer Motion 12              | react-spring, GSAP             | Declarative API, layout animations        |
| Animation (complex)   | Lottie (lottie-react)         | Rive, Spine                    | Designer-friendly, After Effects workflow |
| Animation (particles) | CSS + Framer Motion           | canvas-confetti                | Hafif, dep-free efektler                  |
| State (client)        | Zustand 5                     | Redux Toolkit, Jotai           | Minimal boilerplate, middleware desteği   |
| State (server)        | TanStack Query 5              | SWR, Apollo                    | Cache, offline, devtools                  |
| Routing               | React Router 7                | TanStack Router                | Maturity, Capacitor uyumu                 |
| Forms                 | Native React (controlled)     | React Hook Form                | Basit formlar için yeterli                |
| Audio                 | Howler.js 2.2                 | Tone.js, use-sound             | Cross-platform, sprite desteği            |
| i18n                  | i18next + react-i18next       | FormatJS                       | Namespace, lazy loading                   |
| Backend               | Firebase (Blaze)              | Supabase, AWS Amplify          | Firestore offline, Auth, Functions        |
| Database              | Firestore                     | Realtime DB, Supabase          | Offline persistence, query power          |
| Functions             | Cloud Functions v2            | AWS Lambda                     | Firebase entegrasyonu                     |
| Storage               | Firebase Storage              | S3, Cloudflare R2              | Firebase ekosistemine uyum                |
| Auth                  | Firebase Auth                 | Auth0, Clerk                   | Ücretsiz, native SDK                      |
| Offline DB            | Dexie.js (IndexedDB)          | idb, localForage               | Promise API, TypeScript, query            |
| Mobile                | Capacitor 6                   | React Native, Flutter          | Mevcut web kodu kullanımı                 |
| Ads                   | AdMob (capacitor-community)   | Meta Audience, Unity Ads       | Fill rate, çocuk güvenliği                |
| IAP/Subs              | RevenueCat                    | Adapty, Qonversion             | Cross-platform, ücretsiz başlangıç        |
| Analytics             | Firebase Analytics            | Amplitude, Mixpanel            | COPPA-safe, ücretsiz                      |
| Error Tracking        | Sentry                        | Bugsnag, Firebase Crashes      | Source maps, breadcrumbs                  |
| Testing (unit)        | Vitest                        | Jest                           | Vite-native, hızlı                        |
| Testing (component)   | Testing Library + Storybook 8 | Enzyme                         | Kullanıcı odaklı test                     |
| Testing (e2e)         | Playwright                    | Cypress                        | Multi-browser, mobile emulation           |
| CI/CD                 | GitHub Actions                | CircleCI, Bitrise              | GitHub entegrasyonu, ücretsiz             |
| Code Quality          | ESLint 9 + Prettier           | Biome                          | Konfigürasyon esnekliği                   |
| Speech                | Web Speech API + Azure Speech | Google Cloud Speech            | Maliyet, browser fallback                 |

---

## Detaylı Kararlar

### 1. React vs Vue vs Svelte

#### React 19 SEÇİLDİ ✅

**Avantajları:**

- **Animasyon ekosistemi**: Framer Motion, react-spring, Lottie React, react-three-fiber — rakiplerinden 3-5x daha fazla seçenek
- **Component kütüphaneleri:** Radix UI, Headless UI — accessibility built-in
- **Topluluk:** Stack Overflow'da 3x daha fazla cevap, npm'de 10x daha fazla paket
- **İşe alım:** React developer bulmak Svelte'den 10x, Vue'dan 3x kolay
- **React 19 yenilikleri:** use() hook, Server Components (gelecek web dashboard), Actions
- **Capacitor uyumu:** En iyi Capacitor community desteği React'te

**Vue 3 Neden Değil:**

- Animasyon kütüphaneleri daha sınırlı (Motion One var ama Framer Motion kadar güçlü değil)
- Composition API güçlü ama React Hooks ekosistemi daha geniş
- Çocuk oyun bileşenleri için hazır çözümler az

**Svelte 5 Neden Değil:**

- Runes harika ama ekosistem henüz olgunlaşmadı
- Lottie, particle effects, complex gesture handling kütüphaneleri yetersiz
- Capacitor plugin'leri genellikle React/Vue öncelikli
- Takım genişletme zorluğu (developer bulmak zor)

---

### 2. Vite 6 — Build Tool

```
Build Speed:  Vite (ESM) >>> Webpack (bundle)
HMR Speed:    Vite ~50ms  vs  Webpack ~500ms
Config:       Vite 20 satır vs Webpack 200+ satır
```

**Seçilme nedeni:**

- ESM-native: Import analizi yapılandırma gerektirmez
- Dev server anında başlar (no bundling in dev)
- Rollup tabanlı production build → optimized chunks
- Capacitor ile sorunsuz çalışır

---

### 3. Zustand vs Redux Toolkit vs Jotai

#### Zustand 5 SEÇİLDİ ✅

```typescript
// Zustand — 5 satırda store oluştur
const useGameStore = create<GameState>((set) => ({
  xp: 0,
  level: 1,
  addXP: (amount) => set((s) => ({ xp: s.xp + amount })),
}));

// vs Redux Toolkit — slice + actions + selectors + provider
// 30+ satır boilerplate
```

**Neden Zustand:**

- Sıfır boilerplate, sıfır provider
- Zustand middleware ile persist (offline), devtools, immer desteği
- Bundle size: Zustand ~2KB vs RTK ~11KB
- Çocuk uygulamasında karmaşık global state yok, Zustand yeterli
- Slice pattern ile modüler store

**Neden Redux Değil:**

- Çocuk uygulamasında overkill
- Boilerplate çocuk uygulamasının hızlı iterasyonuna engel

**Neden Jotai/Recoil Değil:**

- Atomic state model, oyunlaştırma gibi birbiriyle ilişkili state'ler için uygunsuz
- Zustand'ın middleware ekosistemi (persist, devtools) daha olgun

---

### 4. Framer Motion + Lottie — Animasyon Stratejisi

```
┌───────────────────────────────────────────────────┐
│           ANİMASYON KATMANLARI                     │
├──────────────────┬────────────────────────────────┤
│ Katman           │ Araç        │ Kullanım         │
├──────────────────┼─────────────┼──────────────────┤
│ Micro-interaction│ Framer      │ Buton tıklama,   │
│ (tap, hover)     │ Motion      │ scale, fade      │
├──────────────────┼─────────────┼──────────────────┤
│ Layout Animation │ Framer      │ Liste sıralama,  │
│ (reorder, resize)│ Motion      │ kart geçişi      │
├──────────────────┼─────────────┼──────────────────┤
│ Page Transition  │ Framer      │ Sayfa geçişleri, │
│                  │ Motion      │ slide, fade      │
├──────────────────┼─────────────┼──────────────────┤
│ Character Anim   │ Lottie      │ Nova maskot,     │
│ (complex vector) │             │ hayvan animasyon  │
├──────────────────┼─────────────┼──────────────────┤
│ Celebration      │ tsparticles │ Konfeti, yıldız, │
│ (particles)      │ + Lottie    │ patlamalar       │
├──────────────────┼─────────────┼──────────────────┤
│ CSS Transition   │ Tailwind    │ Color, opacity,  │
│ (simple)         │ transition  │ basit hover      │
└──────────────────┴─────────────┴──────────────────┘
```

**Neden bu üçlü kombinasyon:**

- Framer Motion: Declarative, React-native, gesture + layout animation
- Lottie: After Effects'ten export, designer-developer workflow
- tsparticles: GPU-accelerated, konfigüre edilebilir parçacık efektleri
- Tailwind transitions: Basit durumlar için CSS performansı

---

### 5. Firebase — Backend as a Service

#### Firestore vs Realtime Database

| Özellik             | Firestore           | Realtime DB        |
| ------------------- | ------------------- | ------------------ |
| Offline persistence | ✅ Yerleşik         | ❌ Sınırlı         |
| Query gücü          | ✅ Composite        | ❌ Sığ             |
| Ölçeklenme          | ✅ Otomatik         | ⚠️ Manuel sharding |
| Fiyat               | Okuma/yazma başına  | Bandwidth başına   |
| Veri modeli         | Document/Collection | JSON tree          |

**Firestore SEÇİLDİ** — Offline persistence çocuk uygulaması için kritik.

#### Firebase vs Supabase

| Özellik           | Firebase              | Supabase             |
| ----------------- | --------------------- | -------------------- |
| Offline           | ✅ Native             | ❌ Yok               |
| Auth providers    | ✅ 20+                | ✅ 15+               |
| Realtime          | ✅ Snapshot listeners | ✅ PostgreSQL LISTEN |
| Functions         | ✅ Cloud Functions    | ✅ Edge Functions    |
| Fiyat (başlangıç) | ✅ Generous free tier | ✅ 500MB free        |
| Mobile SDK        | ✅ Official           | ⚠️ Community         |
| Capacitor         | ✅ Official plugin    | ❌ REST only         |

**Firebase SEÇİLDİ** — Offline-first, official Capacitor desteği, ve daha olgun mobil SDK.

---

### 6. Capacitor 6 vs React Native vs Flutter

| Özellik           | Capacitor            | React Native        | Flutter              |
| ----------------- | -------------------- | ------------------- | -------------------- |
| Mevcut web kodu   | ✅ %100 reuse        | ❌ Sıfırdan         | ❌ Sıfırdan          |
| PWA desteği       | ✅ Aynı kod          | ❌ Ayrı proje       | ❌ Web desteği zayıf |
| Native performans | ⚠️ WebView           | ✅ Native render    | ✅ Skia render       |
| Plugin ekosistemi | ✅ İyi               | ✅ Çok iyi          | ✅ İyi               |
| Geliştirme hızı   | ✅ En hızlı          | ⚠️ Bridge sorunları | ⚠️ Dart öğrenme      |
| Animasyon         | ✅ Web animasyonları | ✅ Animated API     | ✅ Implicit anim     |
| Bundle size       | ~3MB                 | ~15MB               | ~10MB                |

**Capacitor SEÇİLDİ** — Tek codebase ile Web + iOS + Android. Çocuk uygulamasında native rendering performans farkı minimal (oyun yok, sadece etkileşimli UI). WebView animasyonları modern cihazlarda 60fps.

> **Dikkat:** Eğer ileride AR, 3D veya ağır oyun mekanikleri eklenecekse React Native'e geçiş değerlendirilmeli.

---

### 7. Howler.js — Ses Motoru

**Neden Howler.js:**

- Cross-platform (Web Audio API + HTML5 Audio fallback)
- Audio sprite desteği (tek dosyada birden fazla ses)
- Ses havuzu (pool) — aynı anda birden fazla ses
- Fade in/out — müzik geçişleri
- Rate/pitch control — eğlenceli ses efektleri
- ~7KB gzipped

```typescript
// Ses sprite örneği — tek dosyada tüm SFX
const sfxSprite = new Howl({
  src: ['sfx-sprite.webm', 'sfx-sprite.mp3'],
  sprite: {
    correct: [0, 500], // 0ms'den 500ms'ye
    wrong: [500, 400], // 500ms'den 900ms'ye
    tap: [1000, 200],
    reward: [1200, 1500],
    levelUp: [2700, 3000],
    coin: [5700, 600],
  },
});

sfxSprite.play('correct'); // Anında çalma, preloaded
```

---

### 8. RevenueCat — Subscription/IAP

**Neden RevenueCat (raw StoreKit/Play Billing yerine):**

- Cross-platform tek API (iOS + Android + Web)
- Server-side receipt validation (güvenlik)
- A/B testing paywall'lar
- Analytics dashboard (MRR, churn, LTV)
- Webhook'lar (subscription events → Cloud Functions)
- Free tier: $2.5K MRR'a kadar bedava
- Entitlement yönetimi (premium kilidi aç/kapat)

---

### 9. Speech Recognition Stratejisi

```
┌──────────────────────────────────────────────────────┐
│           SPEECH RECOGNITION FALLBACK                 │
├──────────────────────────────────────────────────────┤
│                                                       │
│  1. Web Speech API (ücretsiz, browser-native)         │
│     ├── Chrome/Edge: ✅ İyi                           │
│     ├── Safari: ⚠️ Sınırlı                           │
│     └── Capacitor: Plugin ile native API              │
│                                                       │
│  2. Azure Speech Services (fallback)                  │
│     ├── Pronunciation assessment ✅                   │
│     ├── Phoneme-level scoring ✅                      │
│     └── $1/1000 transaction                           │
│                                                       │
│  Strateji:                                            │
│  ├── v1.0: Web Speech API only (ücretsiz başla)       │
│  ├── v1.5: Azure ekle (premium özellik)               │
│  └── v2.0: Pronunciation scoring (premium)            │
│                                                       │
└──────────────────────────────────────────────────────┘
```

---

### 10. Dependency Listesi (package.json preview)

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^5.0.0",
    "framer-motion": "^12.0.0",
    "lottie-react": "^2.4.0",
    "howler": "^2.2.4",
    "i18next": "^24.0.0",
    "react-i18next": "^15.0.0",
    "dexie": "^4.0.0",
    "dexie-react-hooks": "^1.1.0",
    "firebase": "^11.0.0",
    "@capacitor/core": "^6.0.0",
    "@capacitor/app": "^6.0.0",
    "@capacitor/haptics": "^6.0.0",
    "@capacitor/keyboard": "^6.0.0",
    "@capacitor/status-bar": "^6.0.0",
    "@capacitor/splash-screen": "^6.0.0",
    "@capacitor/push-notifications": "^6.0.0",
    "@capacitor-community/admob": "^6.0.0",
    "@capacitor-community/speech-recognition": "^5.0.0",
    "@revenuecat/purchases-capacitor": "^8.0.0",
    "@sentry/react": "^8.0.0",
    "date-fns": "^4.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "vite": "^6.0.0",
    "@vitejs/plugin-react-swc": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "vitest": "^2.1.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "playwright": "^1.48.0",
    "storybook": "^8.4.0",
    "@storybook/react-vite": "^8.4.0",
    "eslint": "^9.15.0",
    "prettier": "^3.4.0",
    "@capacitor/cli": "^6.0.0",
    "firebase-tools": "^13.0.0"
  }
}
```

### Toplam Bundle Size Tahmini (tree-shaken, gzipped)

| Paket                       | Boyut (gzip) |
| --------------------------- | ------------ |
| React + ReactDOM            | ~42KB        |
| React Router                | ~14KB        |
| Framer Motion               | ~32KB        |
| Zustand                     | ~2KB         |
| TanStack Query              | ~13KB        |
| Howler.js                   | ~7KB         |
| Firebase (auth + firestore) | ~60KB        |
| i18next                     | ~8KB         |
| Lottie-react                | ~15KB        |
| Dexie                       | ~12KB        |
| Tailwind (JIT, used only)   | ~8KB         |
| Diğer utilities             | ~15KB        |
| **Toplam (initial)**        | **~228KB**   |

> **Not:** Code splitting ile initial load ~150KB'ye düşürülebilir. Framer Motion ve Lottie lazy load edilir.

---

### 11. Minimum Node/Tool Versiyonları

| Araç           | Minimum Versiyon | Önerilen |
| -------------- | ---------------- | -------- |
| Node.js        | 20 LTS           | 22 LTS   |
| npm            | 10+              | 10+      |
| pnpm (tercih)  | 9+               | 9+       |
| Xcode (iOS)    | 15+              | 16       |
| Android Studio | Hedgehog+        | Ladybug  |
| CocoaPods      | 1.14+            | 1.15+    |
| JDK            | 17               | 21       |
