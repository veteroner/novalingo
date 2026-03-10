# NovaLingo — Geliştirme Yol Haritası

> Sprint planlaması, milestone'lar, release takvimi
> Son güncelleme: 28 Şubat 2026

---

## 1. Genel Bakış

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
  └─────────┴─────────┴─────────┴─────────┘
```

---

## 2. Faz 0: Temel Altyapı (Hafta 1-4)

### Sprint 1 (Hafta 1-2): Proje İskeleti

| # | Task | Durum | Puan |
|---|------|-------|------|
| 1 | Vite + React + TypeScript proje kurulumu | ⬜ | 3 |
| 2 | Tailwind CSS + Tasarım token'ları | ⬜ | 2 |
| 3 | ESLint + Prettier + Husky yapılandırması | ⬜ | 2 |
| 4 | Firebase SDK entegrasyonu (Auth + Firestore) | ⬜ | 5 |
| 5 | Zustand store'ları (auth, ui) | ⬜ | 3 |
| 6 | TanStack Query setup | ⬜ | 2 |
| 7 | React Router yapılandırması | ⬜ | 3 |
| 8 | Capacitor ekleme (iOS + Android) | ⬜ | 3 |
| 9 | CI/CD pipeline (GitHub Actions) | ⬜ | 5 |
| 10 | Firebase Emulator kurulumu | ⬜ | 2 |

**Sprint Hedefi:** App çalışır, Firebase'e bağlanır, CI/CD çalışır
**Sprint Puanı:** 30

### Sprint 2 (Hafta 3-4): Temel Bileşenler + Auth

| # | Task | Durum | Puan |
|---|------|-------|------|
| 1 | Atom bileşenler: Button, Text, Icon, Badge | ⬜ | 5 |
| 2 | Molecule bileşenler: Card, ProgressBar, StarRating | ⬜ | 5 |
| 3 | AppLayout + Navigation (bottom tabs) | ⬜ | 5 |
| 4 | Auth: Email/Password kayıt + giriş ekranları | ⬜ | 5 |
| 5 | Auth: Google Sign-In entegrasyonu | ⬜ | 3 |
| 6 | Auth: Apple Sign-In entegrasyonu | ⬜ | 3 |
| 7 | Onboarding ekranları (3 slide) | ⬜ | 3 |
| 8 | Çocuk profili oluşturma ekranı | ⬜ | 5 |
| 9 | Çocuk seçme ekranı | ⬜ | 3 |
| 10 | Storybook kurulumu + temel bileşen hikayeleri | ⬜ | 3 |

**Sprint Hedefi:** Kullanıcı kayıt olabilir, çocuk oluşturabilir, ana ekrana ulaşır
**Sprint Puanı:** 40

---

## 3. Faz 1: Core Öğrenme (Hafta 5-12)

### Sprint 3 (Hafta 5-6): Ana Ekran + İçerik Altyapısı

| # | Task | Durum | Puan |
|---|------|-------|------|
| 1 | Ana ekran (Home Screen) layout | ⬜ | 5 |
| 2 | Dünya haritası bileşeni (World Map) | ⬜ | 8 |
| 3 | Ünite listesi ekranı | ⬜ | 3 |
| 4 | Ders akışı engine (ActivityRunner) | ⬜ | 8 |
| 5 | İçerik veri modeli + seed data | ⬜ | 5 |
| 6 | Firestore Security Rules (v1) | ⬜ | 3 |
| 7 | Nova maskot - temel idle animasyon | ⬜ | 5 |
| 8 | Ses altyapısı (Howler.js setup) | ⬜ | 3 |

**Sprint Hedefi:** Ana ekran görünür, dünya haritası çalışır, ders akışı başlar
**Sprint Puanı:** 40

### Sprint 4 (Hafta 7-8): İlk 5 Aktivite Tipi

| # | Task | Durum | Puan |
|---|------|-------|------|
| 1 | FlashCard aktivitesi | ⬜ | 5 |
| 2 | MatchPairs aktivitesi (drag & drop) | ⬜ | 8 |
| 3 | ListenAndTap aktivitesi (ses + seçim) | ⬜ | 5 |
| 4 | WordBuilder aktivitesi (harf sürükleme) | ⬜ | 8 |
| 5 | FillBlank aktivitesi | ⬜ | 5 |
| 6 | Doğru/Yanlış geri bildirim sistemi | ⬜ | 3 |
| 7 | Ders tamamlama ekranı (yıldız + XP) | ⬜ | 5 |
| 8 | Unit test'ler (aktiviteler) | ⬜ | 5 |

**Sprint Hedefi:** 5 aktivite tipi çalışır, ders tamamlanabilir
**Sprint Puanı:** 44

### Sprint 5 (Hafta 9-10): Kalan 5 Aktivite + XP Sistemi

| # | Task | Durum | Puan |
|---|------|-------|------|
| 1 | SpeakIt aktivitesi (Speech Recognition) | ⬜ | 8 |
| 2 | StoryTime aktivitesi (interaktif hikaye) | ⬜ | 8 |
| 3 | MemoryGame aktivitesi | ⬜ | 5 |
| 4 | WordSearch aktivitesi (kelime bulmaca) | ⬜ | 8 |
| 5 | QuizBattle aktivitesi (zamanlı quiz) | ⬜ | 5 |
| 6 | XP hesaplama servisi (server-side) | ⬜ | 5 |
| 7 | Level sistemi (client + server) | ⬜ | 3 |
| 8 | Level-up animasyon + ödül | ⬜ | 3 |

**Sprint Hedefi:** 10 aktivite tipi çalışır, XP/Level sistemi aktif
**Sprint Puanı:** 45

### Sprint 6 (Hafta 11-12): Offline + SRS + İlerleme

| # | Task | Durum | Puan |
|---|------|-------|------|
| 1 | Dexie.js offline storage kurulumu | ⬜ | 5 |
| 2 | Firestore offline persistence | ⬜ | 3 |
| 3 | Offline ders tamamlama desteği | ⬜ | 8 |
| 4 | Senkronizasyon yöneticisi (SyncManager) | ⬜ | 8 |
| 5 | SRS (Spaced Repetition) engine | ⬜ | 5 |
| 6 | Kelime tekrar ekranı | ⬜ | 3 |
| 7 | İlerleme kaydetme (submitLessonResult CF) | ⬜ | 5 |
| 8 | İlerleme ekranı (profil sayfası) | ⬜ | 3 |

**Sprint Hedefi:** App offline çalışır, kelime tekrarı yapılır, ilerleme kaydedilir
**Sprint Puanı:** 40

---

## 4. Faz 2: Gelişmiş Özellikler (Hafta 13-20)

### Sprint 7 (Hafta 13-14): Gamification Core

| # | Task | Durum | Puan |
|---|------|-------|------|
| 1 | Streak sistemi (client + server) | ⬜ | 5 |
| 2 | Streak UI (alevli display + animasyon) | ⬜ | 3 |
| 3 | Streak freeze mekanizması | ⬜ | 3 |
| 4 | Başarım sistemi (50 başarım) | ⬜ | 8 |
| 5 | Başarım açma popup (animasyonlu) | ⬜ | 5 |
| 6 | Günlük görev sistemi (quest) | ⬜ | 5 |
| 7 | dailyStreakCheck scheduled function | ⬜ | 3 |
| 8 | dailyQuestAssign scheduled function | ⬜ | 3 |

**Sprint Hedefi:** Streak, başarım ve günlük görevler çalışır
**Sprint Puanı:** 35

### Sprint 8 (Hafta 15-16): Nova + Mağaza + Koleksiyon

| # | Task | Durum | Puan |
|---|------|-------|------|
| 1 | Nova maskot evrim sistemi (6 aşama) | ⬜ | 8 |
| 2 | Nova animasyonları (Lottie entegrasyonu) | ⬜ | 5 |
| 3 | Nova evrim animasyonu (full-screen) | ⬜ | 5 |
| 4 | Mağaza ekranı (cosmetic items) | ⬜ | 5 |
| 5 | Koleksiyon ekranı | ⬜ | 3 |
| 6 | Avatar özelleştirme | ⬜ | 5 |
| 7 | Günlük ödül çarkı | ⬜ | 5 |
| 8 | purchaseShopItem Cloud Function | ⬜ | 3 |

**Sprint Hedefi:** Nova yaşıyor ve evriliyor, mağaza çalışıyor
**Sprint Puanı:** 39

### Sprint 9 (Hafta 17-18): Liderlik + Sosyal

| # | Task | Durum | Puan |
|---|------|-------|------|
| 1 | Liga sistemi (6 liga) | ⬜ | 5 |
| 2 | Haftalık liderlik tablosu UI | ⬜ | 5 |
| 3 | weeklyLeagueReset scheduled function | ⬜ | 5 |
| 4 | Liga yükseltme/düşürme animasyonu | ⬜ | 3 |
| 5 | Haftalık rapor (ebeveye) | ⬜ | 5 |
| 6 | Push notification sistemi | ⬜ | 5 |
| 7 | Streak uyarı bildirimi | ⬜ | 2 |
| 8 | Bildirim tercihleri ekranı | ⬜ | 3 |

**Sprint Hedefi:** Liderlik tablosu çalışır, bildirimler gönderilir
**Sprint Puanı:** 33

### Sprint 10 (Hafta 19-20): Monetizasyon

| # | Task | Durum | Puan |
|---|------|-------|------|
| 1 | AdMob entegrasyonu (Capacitor plugin) | ⬜ | 5 |
| 2 | Ödüllü reklam (rewarded video) akışı | ⬜ | 5 |
| 3 | Interstitial reklam (frekans kurallarıyla) | ⬜ | 5 |
| 4 | RevenueCat SDK entegrasyonu | ⬜ | 5 |
| 5 | Paywall ekranı (subscription) | ⬜ | 5 |
| 6 | Elmas satın alma (IAP) | ⬜ | 5 |
| 7 | revenuecatWebhook Cloud Function | ⬜ | 3 |
| 8 | COPPA ad compliance kontrolleri | ⬜ | 3 |
| 9 | Satın alma restore desteği | ⬜ | 2 |

**Sprint Hedefi:** Reklam, abonelik ve IAP çalışır
**Sprint Puanı:** 38

---

## 5. Faz 3: Polish & Launch (Hafta 21-28)

### Sprint 11 (Hafta 21-22): Ebeveyn Paneli

| # | Task | Durum | Puan |
|---|------|-------|------|
| 1 | Parental Gate (matematik/PIN) | ⬜ | 3 |
| 2 | Ebeveyn dashboard ekranı | ⬜ | 5 |
| 3 | Çocuk ilerleme raporu (grafikler) | ⬜ | 8 |
| 4 | Ekran zamanı kontrolü | ⬜ | 5 |
| 5 | Kelime raporu (öğrenilen kelimeler) | ⬜ | 3 |
| 6 | İçerik filtreleme ayarları | ⬜ | 3 |
| 7 | Hesap ayarları (profil düzenleme, şifre, silme) | ⬜ | 5 |
| 8 | Birden fazla çocuk yönetimi | ⬜ | 3 |

**Sprint Hedefi:** Ebeveynler tam kontrol ve görünürlük sahibi
**Sprint Puanı:** 35

### Sprint 12 (Hafta 23-24): İçerik + Animasyonlar

| # | Task | Durum | Puan |
|---|------|-------|------|
| 1 | Dünya 1: "Orman" (5 ünite, 50 ders) | ⬜ | 8 |
| 2 | Dünya 2: "Okyanus" (5 ünite, 50 ders) | ⬜ | 8 |
| 3 | 500 kelime kartı içerik girişi | ⬜ | 5 |
| 4 | 20 interaktif hikaye | ⬜ | 5 |
| 5 | Kutlama animasyonları (confetti, stars, fireworks) | ⬜ | 5 |
| 6 | Tüm ses efektleri entegrasyonu | ⬜ | 3 |
| 7 | Arka plan müzikleri | ⬜ | 2 |
| 8 | Gece modu (dark theme) | ⬜ | 3 |

**Sprint Hedefi:** 2 dünya hazır, tüm animasyonlar ve sesler tamam
**Sprint Puanı:** 39

### Sprint 13 (Hafta 25-26): Testing + Performans

| # | Task | Durum | Puan |
|---|------|-------|------|
| 1 | Unit test coverage ≥ %80 | ⬜ | 8 |
| 2 | E2E test (Playwright): 20 kritik akış | ⬜ | 8 |
| 3 | Performans optimizasyon (LCP < 2.5s) | ⬜ | 5 |
| 4 | Bundle size optimize (< 250KB gzip) | ⬜ | 3 |
| 5 | Bellek sızıntı kontrolü | ⬜ | 3 |
| 6 | 60fps animasyon doğrulama | ⬜ | 3 |
| 7 | iOS cihaz testi (5 farklı model) | ⬜ | 5 |
| 8 | Android cihaz testi (5 farklı model) | ⬜ | 5 |
| 9 | Accessibility (VoiceOver + TalkBack) | ⬜ | 5 |

**Sprint Hedefi:** Testler geçer, performans bütçesi tutturulur
**Sprint Puanı:** 45

### Sprint 14 (Hafta 27-28): Launch Hazırlık

| # | Task | Durum | Puan |
|---|------|-------|------|
| 1 | App Store metadata (screenshots, açıklama) | ⬜ | 5 |
| 2 | Google Play metadata | ⬜ | 5 |
| 3 | Privacy Policy + Terms of Service sayfaları | ⬜ | 3 |
| 4 | Sentry error monitoring | ⬜ | 2 |
| 5 | Firebase Analytics event'ları doğrula | ⬜ | 3 |
| 6 | Production Firebase projesine geçiş | ⬜ | 3 |
| 7 | Beta test (TestFlight + Internal Testing) | ⬜ | 5 |
| 8 | Bug fix sprint (beta feedback) | ⬜ | 8 |
| 9 | App Store submission (iOS) | ⬜ | 3 |
| 10 | Google Play submission (Android) | ⬜ | 3 |
| 11 | Firebase Hosting production deploy | ⬜ | 2 |

**Sprint Hedefi:** v1.0.0 LAUNCH! 🚀
**Sprint Puanı:** 42

---

## 6. Milestone Kontrol Noktaları

| Milestone | Hafta | Hedef | Çıktı |
|-----------|-------|-------|-------|
| M0: Skeleton | 2 | Proje iskelet çalışır | Auth + Navigation + CI/CD |
| M1: First Lesson | 6 | İlk ders oynanabilir | 1 aktivite + dünya haritası |
| M2: All Activities | 10 | 10 aktivite çalışır | Tam ders akışı + XP |
| M3: Offline Ready | 12 | App offline çalışır | Sync + SRS |
| M4: Gamification | 16 | Oyunlaştırma tamam | Streak + başarım + Nova |
| M5: Monetization | 20 | Gelir modeli aktif | Reklam + IAP + subscription |
| M6: Parent Panel | 22 | Ebeveyn kontrolü tamam | Dashboard + rapor |
| M7: Content Ready | 24 | 2 dünya + 500 kelime | Oynanabilir içerik |
| M8: Quality Gate | 26 | Test + performans ok | %80 coverage + LCP<2.5s |
| M9: LAUNCH | 28 | App Store'da yayında | v1.0.0 🚀 |

---

## 7. Post-Launch Yol Haritası

### v1.1 (Launch + 1 ay)

- Bug fix'ler (launch feedback)
- Performans iyileştirmeleri
- A/B testing başlangıcı
- Dünya 3: "Uzay" ekleme

### v1.2 (Launch + 2 ay)

- Çok oyunculu quiz modu (gerçek zamanlı)
- Haftalık görev sistemi
- Ebeveyn raporlarına grafik ekleme
- İngilizce → Türkçe yön desteği (çift yönlü)

### v1.5 (Launch + 4 ay)

- AR (Augmented Reality) kelime keşfi
- Ders oluşturucu (advanced kullanıcılar için)
- Classroom modu (öğretmen paneli, max 30 öğrenci)
- Dünya 4, 5, 6 ekleme

### v2.0 (Launch + 8 ay)

- Yapay zeka destekli adaptif öğrenme
- Konuşma yapay zekası (sohbet partneri)
- Yeni dil: Almanca / Fransızca
- Tablet-optimized layout
- Widget'lar (iOS + Android)
- Aile planı (5 çocuk)

---

## 8. Risk Takvimi

| Hafta | Risk | Olasılık | Etki | Mitigasyon |
|-------|------|----------|------|------------|
| 4 | Firebase emulator yavaşlık | Orta | Düşük | Docker ile izole |
| 8 | Speech Recognition cross-platform fark | Yüksek | Orta | Azure Speech fallback |
| 10 | Drag & drop performans (düşük cihaz) | Orta | Yüksek | Basit fallback modu |
| 16 | Nova Lottie animasyon boyutları | Orta | Orta | Compress + lazy load |
| 20 | AdMob COPPA rejection | Düşük | Yüksek | Test ads + dökümantasyon |
| 22 | App Store Kids Category rejection | Yüksek | Yüksek | Apple guidelines detaylı okuma |
| 26 | Performans bütçesi aşımı | Orta | Orta | Erken profiling |
| 28 | App Store review gecikme | Orta | Yüksek | 2 hafta buffer |
