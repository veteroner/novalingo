# NovaLingo — Geliştirme Yol Haritası

> Sprint planlaması, milestone'lar, release takvimi
> Son güncelleme: 23 Mart 2026

---

## 0. Güncel Durum ve Yön Değişikliği

> **23 Mart 2026 — Ürün denetimi sonrası stratejik güncelleme**

Faz 0-2 büyük ölçüde tamamlandı. Altyapı, 10 aktivite tipi, ses motoru, oyunlaştırma ve temel müfredat (6 dünya, 33 ünite, 209 ders, 578 kelime) mevcuttur. Ancak yapılan derinlemesine ürün denetimi şu sonuçları ortaya koydu:

- İçerik nicelik olarak güçlü; nitelik olarak tutarsız
- Öğrenme sonucu ölçülemiyor ve ebeveyne gösterilemiyor
- Hikaye ve medya katmanı çocuk ürünü standardında değil
- Konuşma pratiği üründe merkezi konumda değil

Bu nedenle **orijinal Faz 3 (Polish & Launch)** ertelendi. Öncelik, **90 günlük ürün toparlama planına** kaydı.

### Detaylı Plan Dokümanları

| Doküman                                                              | Kapsam                                                                      |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [PRODUCT_RECOVERY_90_DAYS.md](PRODUCT_RECOVERY_90_DAYS.md)           | 6 sprint × 2 hafta toparlama planı, başarı kapıları, sayısal hedefler       |
| [CURRICULUM_ENRICHMENT_BACKLOG.md](CURRICULUM_ENRICHMENT_BACKLOG.md) | Dünya dünya içerik zenginleştirme, altın standart ders tanımı, yazım sırası |

### Yeni Çalışma Akışı

```
Mevcut yapı (tamamlanmış)        90 Günlük Toparlama             Orijinal Faz 3
  ┌─────────┬─────────┐    ┌───────────────────────────────┐    ┌─────────┐
  │ Faz 0   │ Faz 1-2 │    │ Recovery Sprint 1-6           │    │ Launch  │
  │ Altyapı │ Core +  │ →  │ İçerik kalitesi + Öğrenme     │ →  │ Prep    │
  │ ✅ Bitti│ Özellik │    │ sonucu + Medya + Ebeveyn      │    │         │
  │         │ ✅ Bitti│    │ 📍 Şu an buradayız            │    │         │
  └─────────┴─────────┘    └───────────────────────────────┘    └─────────┘
```

---

## 1. Genel Bakış (Orijinal Plan)

> **Not:** Aşağıdaki orijinal plan referans olarak korunuyor. Aktif çalışma 90 günlük toparlama planını takip ediyor.

```
Toplam Süre: 7 ay (28 hafta)
Metodoloji: 2 haftalık Sprint'ler (14 sprint)
Ekip: 2-3 kişi (Full-stack + Mobile + Design)

Fazlar:
  ┌─────────┬─────────┬─────────┬─────────┐
  │ Faz 0   │ Faz 1   │ Faz 2   │ Faz 3   │
  │ Temel   │ Core    │ Gelişmiş│ Polish  │
  │ Altyapı │ Öğrenme │ Özellik │ & Launch│
  │ 4 hafta │ 8 hafta │ 8 hafta │ 8 hafta │
  │ ✅      │ ✅      │ ✅      │ ⏸️      │
  └─────────┴─────────┴─────────┴─────────┘
```

---

## 2. Faz 0: Temel Altyapı (Hafta 1-4)

### Sprint 1 (Hafta 1-2): Proje İskeleti

| #   | Task                                         | Durum | Puan |
| --- | -------------------------------------------- | ----- | ---- |
| 1   | Vite + React + TypeScript proje kurulumu     | ⬜    | 3    |
| 2   | Tailwind CSS + Tasarım token'ları            | ⬜    | 2    |
| 3   | ESLint + Prettier + Husky yapılandırması     | ⬜    | 2    |
| 4   | Firebase SDK entegrasyonu (Auth + Firestore) | ⬜    | 5    |
| 5   | Zustand store'ları (auth, ui)                | ⬜    | 3    |
| 6   | TanStack Query setup                         | ⬜    | 2    |
| 7   | React Router yapılandırması                  | ⬜    | 3    |
| 8   | Capacitor ekleme (iOS + Android)             | ⬜    | 3    |
| 9   | CI/CD pipeline (GitHub Actions)              | ⬜    | 5    |
| 10  | Firebase Emulator kurulumu                   | ⬜    | 2    |

**Sprint Hedefi:** App çalışır, Firebase'e bağlanır, CI/CD çalışır
**Sprint Puanı:** 30

### Sprint 2 (Hafta 3-4): Temel Bileşenler + Auth

| #   | Task                                               | Durum | Puan |
| --- | -------------------------------------------------- | ----- | ---- |
| 1   | Atom bileşenler: Button, Text, Icon, Badge         | ⬜    | 5    |
| 2   | Molecule bileşenler: Card, ProgressBar, StarRating | ⬜    | 5    |
| 3   | AppLayout + Navigation (bottom tabs)               | ⬜    | 5    |
| 4   | Auth: Email/Password kayıt + giriş ekranları       | ⬜    | 5    |
| 5   | Auth: Google Sign-In entegrasyonu                  | ⬜    | 3    |
| 6   | Auth: Apple Sign-In entegrasyonu                   | ⬜    | 3    |
| 7   | Onboarding ekranları (3 slide)                     | ⬜    | 3    |
| 8   | Çocuk profili oluşturma ekranı                     | ⬜    | 5    |
| 9   | Çocuk seçme ekranı                                 | ⬜    | 3    |
| 10  | Storybook kurulumu + temel bileşen hikayeleri      | ⬜    | 3    |

**Sprint Hedefi:** Kullanıcı kayıt olabilir, çocuk oluşturabilir, ana ekrana ulaşır
**Sprint Puanı:** 40

---

## 3. Faz 1: Core Öğrenme (Hafta 5-12)

### Sprint 3 (Hafta 5-6): Ana Ekran + İçerik Altyapısı

| #   | Task                                | Durum | Puan |
| --- | ----------------------------------- | ----- | ---- |
| 1   | Ana ekran (Home Screen) layout      | ⬜    | 5    |
| 2   | Dünya haritası bileşeni (World Map) | ⬜    | 8    |
| 3   | Ünite listesi ekranı                | ⬜    | 3    |
| 4   | Ders akışı engine (ActivityRunner)  | ⬜    | 8    |
| 5   | İçerik veri modeli + seed data      | ⬜    | 5    |
| 6   | Firestore Security Rules (v1)       | ⬜    | 3    |
| 7   | Nova maskot - temel idle animasyon  | ⬜    | 5    |
| 8   | Ses altyapısı (Howler.js setup)     | ⬜    | 3    |

**Sprint Hedefi:** Ana ekran görünür, dünya haritası çalışır, ders akışı başlar
**Sprint Puanı:** 40

### Sprint 4 (Hafta 7-8): İlk 5 Aktivite Tipi

| #   | Task                                    | Durum | Puan |
| --- | --------------------------------------- | ----- | ---- |
| 1   | FlashCard aktivitesi                    | ⬜    | 5    |
| 2   | MatchPairs aktivitesi (drag & drop)     | ⬜    | 8    |
| 3   | ListenAndTap aktivitesi (ses + seçim)   | ⬜    | 5    |
| 4   | WordBuilder aktivitesi (harf sürükleme) | ⬜    | 8    |
| 5   | FillBlank aktivitesi                    | ⬜    | 5    |
| 6   | Doğru/Yanlış geri bildirim sistemi      | ⬜    | 3    |
| 7   | Ders tamamlama ekranı (yıldız + XP)     | ⬜    | 5    |
| 8   | Unit test'ler (aktiviteler)             | ⬜    | 5    |

**Sprint Hedefi:** 5 aktivite tipi çalışır, ders tamamlanabilir
**Sprint Puanı:** 44

### Sprint 5 (Hafta 9-10): Kalan 5 Aktivite + XP Sistemi

| #   | Task                                     | Durum | Puan |
| --- | ---------------------------------------- | ----- | ---- |
| 1   | SpeakIt aktivitesi (Speech Recognition)  | ⬜    | 8    |
| 2   | StoryTime aktivitesi (interaktif hikaye) | ⬜    | 8    |
| 3   | MemoryGame aktivitesi                    | ⬜    | 5    |
| 4   | WordSearch aktivitesi (kelime bulmaca)   | ⬜    | 8    |
| 5   | QuizBattle aktivitesi (zamanlı quiz)     | ⬜    | 5    |
| 6   | XP hesaplama servisi (server-side)       | ⬜    | 5    |
| 7   | Level sistemi (client + server)          | ⬜    | 3    |
| 8   | Level-up animasyon + ödül                | ⬜    | 3    |

**Sprint Hedefi:** 10 aktivite tipi çalışır, XP/Level sistemi aktif
**Sprint Puanı:** 45

### Sprint 6 (Hafta 11-12): Offline + SRS + İlerleme

| #   | Task                                      | Durum | Puan |
| --- | ----------------------------------------- | ----- | ---- |
| 1   | Dexie.js offline storage kurulumu         | ⬜    | 5    |
| 2   | Firestore offline persistence             | ⬜    | 3    |
| 3   | Offline ders tamamlama desteği            | ⬜    | 8    |
| 4   | Senkronizasyon yöneticisi (SyncManager)   | ⬜    | 8    |
| 5   | SRS (Spaced Repetition) engine            | ⬜    | 5    |
| 6   | Kelime tekrar ekranı                      | ⬜    | 3    |
| 7   | İlerleme kaydetme (submitLessonResult CF) | ⬜    | 5    |
| 8   | İlerleme ekranı (profil sayfası)          | ⬜    | 3    |

**Sprint Hedefi:** App offline çalışır, kelime tekrarı yapılır, ilerleme kaydedilir
**Sprint Puanı:** 40

---

## 4. Faz 2: Gelişmiş Özellikler (Hafta 13-20)

### Sprint 7 (Hafta 13-14): Gamification Core

| #   | Task                                   | Durum | Puan |
| --- | -------------------------------------- | ----- | ---- |
| 1   | Streak sistemi (client + server)       | ⬜    | 5    |
| 2   | Streak UI (alevli display + animasyon) | ⬜    | 3    |
| 3   | Streak freeze mekanizması              | ⬜    | 3    |
| 4   | Başarım sistemi (50 başarım)           | ⬜    | 8    |
| 5   | Başarım açma popup (animasyonlu)       | ⬜    | 5    |
| 6   | Günlük görev sistemi (quest)           | ⬜    | 5    |
| 7   | dailyStreakCheck scheduled function    | ⬜    | 3    |
| 8   | dailyQuestAssign scheduled function    | ⬜    | 3    |

**Sprint Hedefi:** Streak, başarım ve günlük görevler çalışır
**Sprint Puanı:** 35

### Sprint 8 (Hafta 15-16): Nova + Mağaza + Koleksiyon

| #   | Task                                     | Durum | Puan |
| --- | ---------------------------------------- | ----- | ---- |
| 1   | Nova maskot evrim sistemi (6 aşama)      | ⬜    | 8    |
| 2   | Nova animasyonları (Lottie entegrasyonu) | ⬜    | 5    |
| 3   | Nova evrim animasyonu (full-screen)      | ⬜    | 5    |
| 4   | Mağaza ekranı (cosmetic items)           | ⬜    | 5    |
| 5   | Koleksiyon ekranı                        | ⬜    | 3    |
| 6   | Avatar özelleştirme                      | ⬜    | 5    |
| 7   | Günlük ödül çarkı                        | ⬜    | 5    |
| 8   | purchaseShopItem Cloud Function          | ⬜    | 3    |

**Sprint Hedefi:** Nova yaşıyor ve evriliyor, mağaza çalışıyor
**Sprint Puanı:** 39

### Sprint 9 (Hafta 17-18): Liderlik + Sosyal

| #   | Task                                 | Durum | Puan |
| --- | ------------------------------------ | ----- | ---- |
| 1   | Liga sistemi (6 liga)                | ⬜    | 5    |
| 2   | Haftalık liderlik tablosu UI         | ⬜    | 5    |
| 3   | weeklyLeagueReset scheduled function | ⬜    | 5    |
| 4   | Liga yükseltme/düşürme animasyonu    | ⬜    | 3    |
| 5   | Haftalık rapor (ebeveye)             | ⬜    | 5    |
| 6   | Push notification sistemi            | ⬜    | 5    |
| 7   | Streak uyarı bildirimi               | ⬜    | 2    |
| 8   | Bildirim tercihleri ekranı           | ⬜    | 3    |

**Sprint Hedefi:** Liderlik tablosu çalışır, bildirimler gönderilir
**Sprint Puanı:** 33

### Sprint 10 (Hafta 19-20): Monetizasyon

| #   | Task                                       | Durum | Puan |
| --- | ------------------------------------------ | ----- | ---- |
| 1   | AdMob entegrasyonu (Capacitor plugin)      | ⬜    | 5    |
| 2   | Ödüllü reklam (rewarded video) akışı       | ⬜    | 5    |
| 3   | Interstitial reklam (frekans kurallarıyla) | ⬜    | 5    |
| 4   | RevenueCat SDK entegrasyonu                | ⬜    | 5    |
| 5   | Paywall ekranı (subscription)              | ⬜    | 5    |
| 6   | Elmas satın alma (IAP)                     | ⬜    | 5    |
| 7   | revenuecatWebhook Cloud Function           | ⬜    | 3    |
| 8   | COPPA ad compliance kontrolleri            | ⬜    | 3    |
| 9   | Satın alma restore desteği                 | ⬜    | 2    |

**Sprint Hedefi:** Reklam, abonelik ve IAP çalışır
**Sprint Puanı:** 38

---

## 5. Faz 3: Polish & Launch (Hafta 21-28)

### Sprint 11 (Hafta 21-22): Ebeveyn Paneli

| #   | Task                                            | Durum | Puan |
| --- | ----------------------------------------------- | ----- | ---- |
| 1   | Parental Gate (matematik/PIN)                   | ⬜    | 3    |
| 2   | Ebeveyn dashboard ekranı                        | ⬜    | 5    |
| 3   | Çocuk ilerleme raporu (grafikler)               | ⬜    | 8    |
| 4   | Ekran zamanı kontrolü                           | ⬜    | 5    |
| 5   | Kelime raporu (öğrenilen kelimeler)             | ⬜    | 3    |
| 6   | İçerik filtreleme ayarları                      | ⬜    | 3    |
| 7   | Hesap ayarları (profil düzenleme, şifre, silme) | ⬜    | 5    |
| 8   | Birden fazla çocuk yönetimi                     | ⬜    | 3    |

**Sprint Hedefi:** Ebeveynler tam kontrol ve görünürlük sahibi
**Sprint Puanı:** 35

### Sprint 12 (Hafta 23-24): İçerik + Animasyonlar

| #   | Task                                               | Durum | Puan |
| --- | -------------------------------------------------- | ----- | ---- |
| 1   | Dünya 1: "Orman" (5 ünite, 50 ders)                | ⬜    | 8    |
| 2   | Dünya 2: "Okyanus" (5 ünite, 50 ders)              | ⬜    | 8    |
| 3   | 500 kelime kartı içerik girişi                     | ⬜    | 5    |
| 4   | 20 interaktif hikaye                               | ⬜    | 5    |
| 5   | Kutlama animasyonları (confetti, stars, fireworks) | ⬜    | 5    |
| 6   | Tüm ses efektleri entegrasyonu                     | ⬜    | 3    |
| 7   | Arka plan müzikleri                                | ⬜    | 2    |
| 8   | Gece modu (dark theme)                             | ⬜    | 3    |

**Sprint Hedefi:** 2 dünya hazır, tüm animasyonlar ve sesler tamam
**Sprint Puanı:** 39

### Sprint 13 (Hafta 25-26): Testing + Performans

| #   | Task                                  | Durum | Puan |
| --- | ------------------------------------- | ----- | ---- |
| 1   | Unit test coverage ≥ %80              | ⬜    | 8    |
| 2   | E2E test (Playwright): 20 kritik akış | ⬜    | 8    |
| 3   | Performans optimizasyon (LCP < 2.5s)  | ⬜    | 5    |
| 4   | Bundle size optimize (< 250KB gzip)   | ⬜    | 3    |
| 5   | Bellek sızıntı kontrolü               | ⬜    | 3    |
| 6   | 60fps animasyon doğrulama             | ⬜    | 3    |
| 7   | iOS cihaz testi (5 farklı model)      | ⬜    | 5    |
| 8   | Android cihaz testi (5 farklı model)  | ⬜    | 5    |
| 9   | Accessibility (VoiceOver + TalkBack)  | ⬜    | 5    |

**Sprint Hedefi:** Testler geçer, performans bütçesi tutturulur
**Sprint Puanı:** 45

### Sprint 14 (Hafta 27-28): Launch Hazırlık

| #   | Task                                        | Durum | Puan |
| --- | ------------------------------------------- | ----- | ---- |
| 1   | App Store metadata (screenshots, açıklama)  | ⬜    | 5    |
| 2   | Google Play metadata                        | ⬜    | 5    |
| 3   | Privacy Policy + Terms of Service sayfaları | ⬜    | 3    |
| 4   | Sentry error monitoring                     | ⬜    | 2    |
| 5   | Firebase Analytics event'ları doğrula       | ⬜    | 3    |
| 6   | Production Firebase projesine geçiş         | ⬜    | 3    |
| 7   | Beta test (TestFlight + Internal Testing)   | ⬜    | 5    |
| 8   | Bug fix sprint (beta feedback)              | ⬜    | 8    |
| 9   | App Store submission (iOS)                  | ⬜    | 3    |
| 10  | Google Play submission (Android)            | ⬜    | 3    |
| 11  | Firebase Hosting production deploy          | ⬜    | 2    |

**Sprint Hedefi:** v1.0.0 LAUNCH! 🚀
**Sprint Puanı:** 42

---

## 5.5 Launch Blocker Fazları (Acil — Nisan 2026)

> Production analizinden çıkan gerçek launch engelleri. Sprint 14 planına ek, hemen başlanacak.

### P0 — Bunlar Olmadan Launch Yok (Tahmini: 1-2 hafta)

| #   | Task                                                               | Durum | Not                                                |
| --- | ------------------------------------------------------------------ | ----- | -------------------------------------------------- |
| 1   | Privacy Policy + Terms of Service ekranı (in-app + web URL)        | ✅    | `LegalScreen.tsx` eklendi, Router'a bağlandı       |
| 2   | Firebase prod projesine geçiş (`novalingo-app`)                    | ⬜    | `.env.production` güncelle, App Check key değiştir |
| 3   | App Store metadata: screenshots (6.5", 5.5", iPad), açıklama TR/EN | ⬜    | Figma → Simulator → fastlane deliver               |
| 4   | Google Play: store listing, content rating formu (ESRB/PEGI)       | ⬜    | Play Console → Age 5-8, everyone content rating    |
| 5   | STT feature flag: production'da `speechRecognition: true`          | ✅    | `featureFlags.ts` güncellendi                      |
| 6   | Seasonal events Firestore seed                                     | ✅    | `scripts/seedSeasonalEvents.ts` oluşturuldu        |

### P1 — Launch Haftasında Olmasa Çok Kayıp

| #   | Task                                                         | Durum | Not                                            |
| --- | ------------------------------------------------------------ | ----- | ---------------------------------------------- |
| 1   | Push notifications (Capacitor FCM) — streak hatırlatma       | ⬜    | `@capacitor/push-notifications` plugin gerekli |
| 2   | Firebase Analytics funnel doğrulama (Reg → FirstLesson → D7) | ⬜    | DebugView'de event'ları kontrol et             |
| 3   | Gerçek iOS cihazda E2E: Auth → Lesson → IAP                  | ⬜    | TestFlight build gerekli                       |
| 4   | Gerçek Android cihazda E2E                                   | ⬜    | Internal Testing track                         |

### P2 — 30 Gün İçinde

| #   | Task                                               | Durum | Not                                  |
| --- | -------------------------------------------------- | ----- | ------------------------------------ |
| 1   | İçerik genişletme: W7-W12 (+150 ders)              | ⬜    | CONTENT_GROWTH_ROADMAP.md Öncelik 6  |
| 2   | Fiyatlandırma A/B testi                            | ⬜    | Firebase Remote Config ile           |
| 3   | `console.error` → Sentry `captureException` geçişi | ⬜    | 20 dosyada `console.error` var       |
| 4   | `selectConversationScenario` chunk split (1.1 MB)  | ⬜    | Dynamic import + Rollup manualChunks |

---

## 6. Milestone Kontrol Noktaları

### Orijinal Milestone'lar

| Milestone          | Hafta | Hedef                       | Durum                         |
| ------------------ | ----- | --------------------------- | ----------------------------- |
| M0: Skeleton       | 2     | Proje iskelet çalışır       | ✅                            |
| M1: First Lesson   | 6     | İlk ders oynanabilir        | ✅                            |
| M2: All Activities | 10    | 10 aktivite çalışır         | ✅                            |
| M3: Offline Ready  | 12    | App offline çalışır         | ✅                            |
| M4: Gamification   | 16    | Streak + başarım + Nova     | ✅                            |
| M5: Monetization   | 20    | Reklam + IAP + subscription | ✅                            |
| M6: Parent Panel   | 22    | Ebeveyn kontrolü tamam      | ⚠️ Temel var, outcome zayıf   |
| M7: Content Ready  | 24    | 6 dünya + 578 kelime        | ⚠️ Nicelik var, nitelik zayıf |
| M8: Quality Gate   | 26    | Test + performans ok        | ⏸️ Beklemede                  |
| M9: LAUNCH         | 28    | App Store'da yayında        | ⏸️ Beklemede                  |

### 90 Gün Toparlama Milestone'ları

> Detay: [PRODUCT_RECOVERY_90_DAYS.md](PRODUCT_RECOVERY_90_DAYS.md)

| Milestone                   | Gün | Hedef                                        | Durum      |
| --------------------------- | --- | -------------------------------------------- | ---------- |
| R1: Öğrenme Omurgası        | 14  | Ders hedefleri, can-do, lesson brief şablonu | 🔄 Başladı |
| R2: Dünya 1 Altın Standart  | 28  | Tam medya destekli bir dünya                 | ⬜         |
| R3: Dünya 2 Kalıp Öğretimi  | 42  | Chunk bank + gramer pratiği                  | ⬜         |
| R4: Dünya 3 Hikaye Motoru   | 56  | Episodic story learning                      | ⬜         |
| R5: Ebeveyn Görünürlüğü     | 70  | Outcome dashboard + pilot hazırlık           | ⬜         |
| R6: Dünya 4 + Kalite Kapısı | 90  | İlk 4 dünya release kalitesi                 | ⬜         |

---

## 7. Post-Recovery Yol Haritası

> 90 günlük toparlama sonrası hedefler

### v1.0-rc (Toparlama Gün 90 sonrası)

- İlk 4 dünya kalite kapısından geçmiş
- Efficacy pilotu başlatılmış
- Parent outcome dashboard canlı
- App Store / Google Play submission hazırlığı

### v1.0 (Launch)

- 4 dünya altın standart
- Ebeveyn paneli ve outcome metrikleri
- Bug fix (pilot feedback)
- App Store + Google Play yayın

### v1.1 (Launch + 1 ay)

- Pilot efficacy verileri → ürün kararları
- Dünya 5 (Science Island) altın standart içerik
- Konuşma senaryosu genişletme (Phase 2)
- A/B testing başlangıcı

### v1.5 (Launch + 3 ay)

- Dünya 6 (Adventure Galaxy) altın standart içerik
- Classroom modu (öğretmen paneli)
- Adaptif zorluk ayarlama
- Tablet-optimized layout

### v2.0 (Launch + 6 ay)

- AI destekli sohbet partneri
- Yeni dil: Almanca / Fransızca
- Widget'lar (iOS + Android)
- Aile planı (5 çocuk)

---

## 8. Risk Takvimi

| Hafta | Risk                                   | Olasılık | Etki   | Mitigasyon                     |
| ----- | -------------------------------------- | -------- | ------ | ------------------------------ |
| 4     | Firebase emulator yavaşlık             | Orta     | Düşük  | Docker ile izole               |
| 8     | Speech Recognition cross-platform fark | Yüksek   | Orta   | Azure Speech fallback          |
| 10    | Drag & drop performans (düşük cihaz)   | Orta     | Yüksek | Basit fallback modu            |
| 16    | Nova Lottie animasyon boyutları        | Orta     | Orta   | Compress + lazy load           |
| 20    | AdMob COPPA rejection                  | Düşük    | Yüksek | Test ads + dökümantasyon       |
| 22    | App Store Kids Category rejection      | Yüksek   | Yüksek | Apple guidelines detaylı okuma |
| 26    | Performans bütçesi aşımı               | Orta     | Orta   | Erken profiling                |
| 28    | App Store review gecikme               | Orta     | Yüksek | 2 hafta buffer                 |
