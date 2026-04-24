# NovaLingo — Proje Planı

> **Çocuklar için Eğlenceli İngilizce Öğrenme Uygulaması**
> Son güncelleme: 28 Şubat 2026

---

## 1. Vizyon & Misyon

### Vizyon

NovaLingo, 4-12 yaş arası çocukların İngilizce'yi bir oyun oynuyormuş gibi öğrendiği, ebeveynlerin çocuklarının gelişimini güvenle takip ettiği, Türkiye'nin lider çocuk dil öğrenme platformu olmayı hedefler.

### Misyon

- Çocukların dikkat süresine uygun (3-7 dk) mikro-derslerle öğretim
- Oyunlaştırma ile motivasyonu sürekli yüksek tutma
- Güvenli, COPPA/KVKK uyumlu çocuk ortamı
- Ebeveyn kontrolü ve şeffaf ilerleme raporları
- Reklam deneyimini çocuk psikolojisine uygun tasarlama

---

## 2. Hedef Kitle

### 2.1 Birincil (Kullanıcı): Çocuklar

| Yaş Grubu | Kod Adı          | Özellikler                             | İçerik Tipi                              |
| --------- | ---------------- | -------------------------------------- | ---------------------------------------- |
| 4-6 yaş   | **Nova Cubs**    | Okuma öncesi, görsel/işitsel ağırlıklı | Sesli kartlar, eşleştirme, boyama, şarkı |
| 7-9 yaş   | **Nova Stars**   | Okuma başlangıç, basit cümle           | Hikaye, kelime oyunu, konuşma, quiz      |
| 10-12 yaş | **Nova Legends** | Okuma/yazma, gramer temeli             | Diyalog, yazma, gramer, mini-proje       |

### 2.2 İkincil (Karar Verici): Ebeveynler

- 25-45 yaş arası
- Çocuğunun İngilizce eğitimine önem veren
- Uygulama içi harcama yapabilecek ekonomik düzey
- Ekran süresi konusunda bilinçli

### 2.3 Pazar Büyüklüğü (Türkiye)

- 4-12 yaş nüfus: ~10 milyon
- Akıllı telefon/tablet erişimi olan: ~7 milyon
- Dil öğrenme uygulaması kullanan: ~2 milyon
- Hedef penetrasyon (Yıl 1): %2 = 140K aktif kullanıcı

---

## 3. Rekabet Analizi

| Uygulama              | Güçlü Yönler                    | Zayıf Yönler                              | NovaLingo Farkı                           |
| --------------------- | ------------------------------- | ----------------------------------------- | ----------------------------------------- |
| **Duolingo Kids**     | Marka bilinirliği, gamification | Türkçe desteği zayıf, genel amaçlı        | Türk çocuklarına özel, Türkçe açıklamalar |
| **Lingokids**         | Zengin içerik, eğlenceli        | Pahalı abonelik, reklamsız sadece premium | Freemium + ödüllü reklam dengesi          |
| **Khan Academy Kids** | Ücretsiz, akademik              | Sıkıcı UI, oyunlaştırma zayıf             | Eğlence öncelikli, koleksiyon sistemi     |
| **Monkey Junior**     | Okuma odaklı                    | Eski UI, sınırlı etkileşim                | Modern UI, çoklu aktivite tipi            |
| **ABCmouse**          | Kapsamlı müfredat               | Aşırı karmaşık, kafa karıştırıcı          | Sade, odaklı, adım adım ilerleme          |

### NovaLingo'nun Benzersiz Değer Önerisi (UVP)

1. **"Nova" maskot sistemi** — Büyüyen/evrilen sanal arkadaş
2. **Adaptive learning engine** — Çocuğun hızına göre zorluk ayarı
3. **Ebeveyn-çocuk co-play** — Birlikte oynanan aktiviteler
4. **Türk kültürüne uygun içerik** — Bayramlar, yemekler, yerler
5. **Offline mod** — İnternet olmadan da öğrenme

---

## 4. Ürün Kapsamı (Feature Map)

### 4.1 Core Features (Must Have — v1.0)

#### A. Kullanıcı Yönetimi

- [x] Ebeveyn hesabı oluşturma (Google, Apple, Anonymous Sign-In — `src/screens/LoginScreen.tsx`, e-posta/şifre COPPA/4+ politikası gereği devre dışı)
- [x] Çocuk profili oluşturma (isim, yaş, avatar seçimi — `createChildProfile` callable + `src/screens/CreateChildProfileScreen.tsx`)
- [x] Çoklu çocuk profili (1 ebeveyn → max 4 çocuk — `children/{childId}` + profil seçim ekranı)
- [x] Yaş bazlı içerik filtreleme (`ageGroup: 'cubs'|'stars'|'legends'` → `activityGenerator`/`curriculum` varyantları)
- [x] Ebeveyn PIN koruması (`setParentPin`/`verifyParentPin` callables + ParentDashboard gate + ParentSettings akışı)
- [x] Profil arası geçiş (`/profile-select` ekranı + `useChildStore`)
- [x] Oturum yönetimi (Firebase Auth persistence + auto-login, `onAuthStateChanged`)

#### B. Öğrenme Sistemi

- [x] Müfredat yapısı: Dünya → Ünite → Ders → Aktivite (`src/features/learning/data/curriculum.ts`)
- [x] 6 Dünya (Hayvanlar/Yiyecekler/Aile/Okul/Doğa/Şehir temaları)
- [x] Her dünyada 8 ünite
- [x] Her ünitede 5 ders (expansion ile 9'a kadar çıkan review/boss versiyonu)
- [x] Her derste 4-6 aktivite
- [x] Toplam: ~1,440 aktivite (v1.0) — curriculum + activityGenerator
- [x] Spaced Repetition System (SRS) — Leitner kutuları (`src/services/srs/srsEngine.ts`)
- [x] Adaptif zorluk algoritması (`src/services/learningEngine.ts` — accuracy-based difficulty)
- [x] Ders tekrarı ve güçlendirme modu (review/mastery lesson'ları + SRS review ekranı)

#### C. Aktivite Tipleri (v1.0)

1. **FlashCard** — Sesli kelime kartları (görsel + ses + yazı)
2. **MatchPairs** — Kelime-resim eşleştirme (sürükle-bırak)
3. **ListenAndTap** — Sesi dinle, doğru resmi seç
4. **WordBuilder** — Harf karolarıyla kelime oluştur
5. **FillBlank** — Cümlede boşluk doldur
6. **SpeakIt** — Kelimeyi söyle (speech recognition)
7. **StoryTime** — Etkileşimli hikaye okuma
8. **MemoryGame** — Hafıza kartı oyunu
9. **WordSearch** — Kelime bulmaca
10. **QuizBattle** — Çoktan seçmeli quiz

#### D. Gamification

- [x] XP (Experience Points) sistemi (`@utils/xp` + `children/{id}.totalXP`)
- [x] Seviye sistemi (Level 1-100 — `calculateLevel`)
- [x] Günlük seri (streak) ve streak koruması (`children/{id}.currentStreak` + `streakFreezes` + `useStreakFreeze` callable)
- [x] Başarım rozetleri (`src/services/gamification/achievements.ts`, `onAchievementUnlocked` trigger)
- [x] Sanal para: Yıldız ⭐ + Elmas 💎 (`children/{id}.stars` / `gems` + shop)
- [x] Koleksiyon sistemi (`src/features/collectibles/` + `UserCollectible`)
- [x] Günlük görevler (`resetDailyQuests` scheduled + `claimQuestReward` callable)
- [x] Haftalık turnuva/liderlik (`updateLeaderboards` scheduled + `getLeaderboard` callable)
- [x] Nova maskot evrimi (`novaStage` — egg → baby → teen → adult → legend)

#### E. Ses & Görsel

- [x] İngilizce seslendirme — ElevenLabs/Google TTS + cihaz Web Speech fallback (`src/services/speech/`)  
       _Not: Native speaker studio kaydı v1.1 plan — pilot TTS ile başlıyor._
- [x] Türkçe yönlendirme sesleri (TTS tr-TR)
- [x] Arka plan müzikleri (Howler.js + `public/audio/`)  
       _Not: Tema başına ayrı müzik v1.1'de genişletilecek._
- [x] Ses efektleri (doğru/yanlış/ödül/level-up — `src/services/sfx.ts`)
- [x] Lottie animasyonları (konfeti + star burst — `src/components/atoms/Lottie*`)
- [x] Karakter animasyonları (Nova — Framer Motion + Lottie)
- [x] Haptic feedback (Capacitor Haptics plugin — `src/utils/haptic.ts`)

#### F. Ebeveyn Paneli

- [x] Çocuk ilerleme özeti (günlük/haftalık/aylık — `ParentDashboard`)
- [x] Öğrenilen kelimeler listesi (`children/{id}/vocabulary` + ParentVocabulary ekranı)
- [x] Güçlü/zayıf alan analizi (outcome tag-based breakdown — `ParentDashboard` → outcomes bölümü)
- [x] Ekran süresi ayarları (`settings.notifications.dailyGoalMinutes` + weekday limit UI)
- [x] Bildirim tercihleri (`users/{uid}.settings.notifications.*` — ParentSettings)
- [x] Abonelik yönetimi (`/parent/subscription` — `subscriptionService.ts`)
- [x] Çocuk profili düzenleme (`updateChildProfile` + `deleteChildProfile` callables)

#### G. Monetizasyon

- [x] ~~Rewarded Video Ads~~ → **N/A** (COPPA/4+ stance: çocuklara reklam yok; AdMob tamamen kaldırıldı)
- [x] ~~Interstitial Ads~~ → **N/A** (aynı gerekçe)
- [x] Premium abonelik aylık/yıllık (`subscriptionService.ts` + `cordova-plugin-purchase` + `validateReceipt` callable)
- [x] In-App Purchase (`purchaseShopItem` callable + shop ekranı; özel karakter/elmas paketleri premium içerikle entegre)

### 4.2 Enhanced Features (v1.5)

- [ ] AR Kelime Avı (kamera ile gerçek dünyada kelime bul)
- [ ] Ebeveyn-çocuk co-play modu
- [ ] Arkadaş ekleme ve meydan okuma
- [ ] Sesli sohbet botu (basit İngilizce konuşma pratiği)
- [ ] Çıkartma defteri (sticker book)
- [ ] Tema mağazası (UI temaları)
- [ ] Sezonluk etkinlikler (Halloween, Christmas, 23 Nisan)

### 4.3 Advanced Features (v2.0)

- [ ] AI-powered konuşma değerlendirme (pronunciation scoring)
- [ ] Kişiselleştirilmiş öğrenme yolu (ML-based)
- [ ] Video dersler (animasyonlu)
- [ ] Okul/sınıf modu (öğretmen paneli)
- [ ] Ebeveyn topluluğu (forum/chat)
- [ ] Çoklu dil desteği (Almanca, Fransızca, İspanyolca)

---

## 5. Teknik Mimari Özet

### Tech Stack

| Katman        | Teknoloji                                      | Gerekçe                                        |
| ------------- | ---------------------------------------------- | ---------------------------------------------- |
| **Frontend**  | React 19 + TypeScript + Vite                   | En zengin animasyon/oyun ekosistemi            |
| **Styling**   | Tailwind CSS 4 + Custom Design Tokens          | Hızlı, tutarlı, tema desteği                   |
| **Animasyon** | Framer Motion + Lottie + react-spring          | Katmanlı animasyon stratejisi                  |
| **Ses**       | Howler.js + Web Audio API                      | Cross-platform ses yönetimi                    |
| **State**     | Zustand + TanStack Query                       | Minimal boilerplate, cache yönetimi            |
| **Backend**   | Firebase (Auth, Firestore, Functions, Storage) | Serverless, ölçeklenebilir, ücretsiz başlangıç |
| **Mobile**    | Capacitor 6                                    | Native iOS/Android bridge                      |
| **Ads**       | AdMob (Capacitor plugin)                       | Google ekosistemi, yüksek fill rate            |
| **IAP**       | RevenueCat                                     | Cross-platform abonelik yönetimi               |
| **Analytics** | Firebase Analytics                             | Event tracking, COPPA-safe                     |
| **Testing**   | Vitest + Playwright + Storybook                | Unit + E2E + Visual testing                    |
| **CI/CD**     | GitHub Actions                                 | Otomatik build/deploy pipeline                 |
| **Speech**    | Web Speech API + Azure Speech Services         | Konuşma tanıma (fallback stratejisi)           |

### Mimari Diyagram (Üst Düzey)

```
┌─────────────────────────────────────────────────────────┐
│                    NovaLingo Client                      │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │ React   │ │ Framer   │ │ Howler   │ │ Capacitor  │  │
│  │ + Zustand│ │ Motion   │ │ .js      │ │ Plugins    │  │
│  └────┬────┘ └────┬─────┘ └────┬─────┘ └─────┬──────┘  │
│       └───────────┬┴───────────┘              │         │
│              ┌────┴────┐              ┌───────┴──────┐  │
│              │ Service │              │   Native     │  │
│              │ Layer   │              │   Bridge     │  │
│              └────┬────┘              └───────┬──────┘  │
└───────────────────┼───────────────────────────┼─────────┘
                    │                           │
        ┌───────────┼───────────────────────────┤
        ▼           ▼                           ▼
┌──────────┐ ┌─────────────┐          ┌──────────────┐
│ Firebase │ │  Firebase   │          │  Native APIs │
│ Auth     │ │  Firestore  │          │  (AdMob,     │
│          │ │  + Storage  │          │   RevenueCat,│
│          │ │  + Functions│          │   Speech,    │
│          │ │             │          │   Haptics)   │
└──────────┘ └─────────────┘          └──────────────┘
```

---

## 6. İçerik Stratejisi

### 6.1 Müfredat Yapısı

#### Dünya 1: Animal Kingdom (Hayvanlar Krallığı)

| Ünite | Tema           | Kelime Sayısı | Örnek Kelimeler                      |
| ----- | -------------- | ------------- | ------------------------------------ |
| 1.1   | Farm Animals   | 15            | cow, chicken, horse, pig, sheep      |
| 1.2   | Wild Animals   | 15            | lion, elephant, tiger, monkey, bear  |
| 1.3   | Sea Creatures  | 15            | fish, whale, dolphin, shark, octopus |
| 1.4   | Insects & Bugs | 12            | butterfly, bee, ant, spider, ladybug |
| 1.5   | Birds          | 12            | eagle, parrot, penguin, owl, duck    |
| 1.6   | Pets           | 12            | dog, cat, hamster, rabbit, goldfish  |
| 1.7   | Animal Actions | 15            | run, fly, swim, jump, climb          |
| 1.8   | Animal Sounds  | 12            | roar, bark, meow, moo, quack         |

#### Dünya 2: Yummy Food (Lezzetli Yemekler)

| Ünite | Tema              | Kelime Sayısı |
| ----- | ----------------- | ------------- |
| 2.1   | Fruits            | 15            |
| 2.2   | Vegetables        | 15            |
| 2.3   | Drinks            | 12            |
| 2.4   | Meals             | 15            |
| 2.5   | Snacks & Desserts | 12            |
| 2.6   | Kitchen Items     | 12            |
| 2.7   | Cooking Actions   | 12            |
| 2.8   | Table Manners     | 10            |

#### Dünya 3: My Family (Ailem)

| Ünite | Tema                | Kelime Sayısı |
| ----- | ------------------- | ------------- |
| 3.1   | Family Members      | 15            |
| 3.2   | Body Parts          | 15            |
| 3.3   | Clothes             | 15            |
| 3.4   | Colors & Shapes     | 15            |
| 3.5   | Numbers 1-20        | 20            |
| 3.6   | Feelings & Emotions | 12            |
| 3.7   | Daily Routines      | 12            |
| 3.8   | My House            | 15            |

#### Dünya 4: School Days (Okul Günleri)

#### Dünya 5: Nature World (Doğa Dünyası)

#### Dünya 6: City Life (Şehir Hayatı)

> **Toplam v1.0 kelime hedefi: 600+ unique kelime, 1500+ cümle kalıbı**

### 6.2 İçerik Üretim Pipeline

```
İçerik Tasarımı → Metin Yazımı → Görsel Üretim → Seslendirme → Entegrasyon → QA → Yayın
     (1 hafta)      (3 gün)       (1 hafta)      (3 gün)      (2 gün)    (2 gün)  (1 gün)
```

### 6.3 Ses Gereksinimleri

- **İngilizce seslendirme:** Native American English, kadın (çocuk dostu ton)
- **Türkçe yönlendirme:** Profesyonel Türkçe seslendirme, kadın
- **Ses efektleri:** Minimum 50 unique SFX (doğru, yanlış, ödül, tıklama, vs.)
- **Müzik:** 6 dünya teması + ana menü + ödül müziği = min 8 loop track

---

## 7. Proje Zaman Çizelgesi

### Faz 0: Hazırlık (2 hafta)

- [x] Proje planı oluşturma
- [x] Tech stack kurulumu ve boilerplate (Vite + React + TS + Capacitor 6)
- [x] Design system (atoms/molecules/organisms — `src/components/`; Figma dış)
- [x] Firebase projesi kurulumu (Auth/Firestore/Functions/Storage/Analytics/Crashlytics)
- [x] CI/CD pipeline kurulumu (GitHub Actions — lint + test + build; Netlify deploy hook)
- [x] Capacitor konfigürasyonu (iOS + Android — `capacitor.config.ts` + `android/`, `ios/`)

### Faz 1: Temel Altyapı (4 hafta)

- [x] Authentication sistemi (ebeveyn + çocuk profil — Google/Apple/Anonymous)
- [x] Firestore veri modeli ve güvenlik kuralları (`firestore.rules` — tüm koleksiyonlar kaplı)
- [x] Navigasyon sistemi (React Router + Framer Motion geçişleri)
- [x] Ses motoru (Howler.js — `src/services/speech/` + `src/services/sfx.ts`)
- [x] Temel UI component kütüphanesi (atoms/molecules/organisms)
- [x] Offline storage layer (IndexedDB + `syncOfflineProgress` callable)

### Faz 2: Öğrenme Motoru (6 hafta)

- [x] Müfredat veri yapısı ve içerik yükleme (`curriculum.ts` — 6 dünya)
- [x] 10 aktivite tipinin implementasyonu (`src/features/learning/activities/*`)
- [x] Spaced Repetition System (SRS) (`src/services/srs/srsEngine.ts`)
- [x] Adaptif zorluk algoritması (`src/services/learningEngine.ts`)
- [x] Ders ilerleme ve kaydetme sistemi (`submitLessonResult` callable + `lessonStore`)
- [x] Ses tanIma entegrasyonu (SpeakIt + Nova ile Konuş — Web Speech API + iOS/Android native)

### Faz 3: Gamification (4 hafta)

- [x] XP ve seviye sistemi
- [x] Streak sistemi ve streak koruması
- [x] Başarım rozet sistemi
- [x] Sanal para ekonomisi (Yıldız + Elmas)
- [x] Koleksiyon ve karakter sistemi
- [x] Günlük görevler ve haftalık turnuva
- [x] Nova maskot evrimi

### Faz 4: Monetizasyon (3 hafta)

- [x] ~~AdMob entegrasyonu~~ → **N/A** (COPPA: çocuklara reklam yok)
- [x] Native IAP (`cordova-plugin-purchase` + `validateReceipt` callable — RevenueCat yerine native store validation)
- [x] IAP mağaza sayfası (`/parent/subscription` + `/shop`)
- [x] Premium içerik kilitleme/açma sistemi (`useIsPremium` + route guards)
- [x] ~~Reklam frekans yönetimi~~ → **N/A**
- [x] ~~Çocuk güvenliği reklam filtreleri~~ → **N/A**

### Faz 5: Ebeveyn Paneli (2 hafta)

- [x] İlerleme dashboard'u (`ParentDashboard`)
- [x] Kelime listesi ve başarı raporları (`ParentVocabulary`, `ParentProgressDetail`)
- [x] Ekran süresi kontrolleri (daily goal + weekday limit)
- [x] Bildirim ve abonelik yönetimi (`ParentSettings` + `/parent/subscription`)

### Faz 6: Polish & QA (4 hafta)

- [x] Animasyon polish (geçişler, kutlamalar, Nova maskot — Framer Motion + Lottie)
- [x] Ses polish (müzik + efekt + seslendirme senkron)
- [x] Performance optimizasyonu (7+ chunk bundle split, lazy loading)
- [x] Accessibility (a11y) temelleri (semantic HTML + ARIA + focus management)  
      _Not: Tam screen-reader testi pilot/post-launch iş kalemi._
- [x] Platformlar arası test altyapısı (Vitest unit + Playwright E2E — Chromium + Mobile Safari)
- [x] Güvenlik audit (App Check + rate limiting + Sentry + Crashlytics + Firestore rules)  
      _Not: Üçüncü taraf pen-test launch-sonrası planlı._
- [x] Beta test altyapısı (`docs/APP_STORE_METADATA.md` TestFlight + Internal Testing dökümanı) — _gerceği binary upload dış adım_

### Faz 7: Lansman (2 hafta)

- [ ] App Store / Google Play listing hazırlığı
- [ ] ASO (App Store Optimization)
- [ ] Landing page (novalingo.app)
- [ ] Soft launch (500 kullanıcı)
- [ ] Full launch

**Toplam Minimum Süre: ~27 hafta (~7 ay)**

---

## 8. Ekip İhtiyacı

### Minimum Ekip (Lean)

| Rol                            | Kişi          | Sorumluluk                             |
| ------------------------------ | ------------- | -------------------------------------- |
| **Fullstack Developer (Lead)** | 1             | React, Firebase, Capacitor, CI/CD      |
| **Mobile Developer**           | 1             | iOS/Android native, Capacitor plugins  |
| **UI/UX Designer**             | 1             | Figma, animasyon tasarım, illüstrasyon |
| **İçerik Uzmanı**              | 1             | Müfredat, kelime listeleri, hikayeler  |
| **Seslendirme**                | Freelance     | İngilizce + Türkçe ses kayıtları       |
| **QA Tester**                  | 1 (part-time) | Cross-platform test                    |

### İdeal Ekip

Yukarıdakilere ek olarak:

- Backend Developer (Cloud Functions, güvenlik)
- Illustrator / Animator (Lottie, karakter animasyonları)
- Growth Hacker / Marketing
- Eğitim danışmanı (pedagoji)

---

## 9. KPI'lar ve Başarı Metrikleri

### Kullanıcı Metrikleri

| Metrik                        | Hedef (Yıl 1) |
| ----------------------------- | ------------- |
| Toplam İndirme                | 500K          |
| MAU (Monthly Active Users)    | 140K          |
| DAU/MAU Oranı                 | >25%          |
| Günlük Ortalama Oturum Süresi | 12 dakika     |
| D1 Retention                  | >50%          |
| D7 Retention                  | >30%          |
| D30 Retention                 | >15%          |
| Streak Ortalaması             | 5+ gün        |

### Gelir Metrikleri

| Metrik                          | Hedef (Yıl 1) |
| ------------------------------- | ------------- |
| Premium Dönüşüm                 | %5            |
| ARPU (Average Revenue Per User) | $0.50/ay      |
| Reklam Geliri / Kullanıcı       | $0.15/ay      |
| LTV (Lifetime Value)            | $8            |
| MRR (Month 12)                  | $70K          |

### Öğrenme Metrikleri

| Metrik                  | Hedef           |
| ----------------------- | --------------- |
| Kelime öğrenme hızı     | 10 kelime/hafta |
| Ders tamamlama oranı    | >80%            |
| Aktivite doğruluk oranı | >70%            |
| SRS retention (30 gün)  | >60%            |

---

## 10. Risk Analizi

| Risk                       | Olasılık | Etki   | Azaltma Stratejisi                                    |
| -------------------------- | -------- | ------ | ----------------------------------------------------- |
| Çocuk güvenliği ihlali     | Düşük    | Kritik | COPPA/KVKK uyumu, ebeveyn onayı, veri minimizasyonu   |
| App Store ret              | Orta     | Yüksek | Apple/Google Kids politikalarına tam uyum, pre-review |
| Düşük retention            | Yüksek   | Yüksek | Güçlü gamification, A/B testing, push notification    |
| İçerik yetersizliği        | Orta     | Orta   | Content pipeline otomasyonu, UGC planı                |
| Firebase maliyet artışı    | Orta     | Orta   | Offline-first, aggressive caching, read optimizasyonu |
| Rekabet (Duolingo Kids TR) | Orta     | Yüksek | Diferansiyasyon: Türk kültürü, co-play, Nova maskot   |
| Reklam geliri düşüklüğü    | Orta     | Orta   | Premium odaklı monetizasyon, IAP çeşitlendirme        |

---

## 11. Yasal & Uyumluluk

### COPPA (Children's Online Privacy Protection Act)

- 13 yaş altı kullanıcılardan PII toplamama
- Ebeveyn onayı (verifiable parental consent)
- Veri minimizasyonu
- Üçüncü taraf veri paylaşımı sınırlama

### KVKK (Kişisel Verilerin Korunması Kanunu)

- Açık rıza metni
- Veri işleme envanteri
- Kişisel veri silme hakkı
- Çocuk verisi ek koruma

### App Store Gereksinimleri

- **Apple:** Kids Category kuralları, reklam kısıtlamaları, subscription kuralları
- **Google:** Families Policy, Teacher Approved program uyumu, ads compliance

### Reklam Kısıtlamaları (Çocuk Uygulaması)

- Kişiselleştirilmiş reklam YASAK
- Contextual reklam SERBEST
- Reklam içeriği çocuğa uygun olmalı
- "Reklam" etiketi zorunlu
- Reklam-içerik sınırı net olmalı

---

## 12. Bütçe Tahmini (İlk 12 Ay)

| Kalem                         | Aylık           | Yıllık      |
| ----------------------------- | --------------- | ----------- |
| Firebase (Blaze plan)         | $100-500        | $3,000      |
| Seslendirme (freelance)       | $500 (ilk 3 ay) | $1,500      |
| İllüstrasyon/Animasyon        | $300            | $3,600      |
| Apple Developer Account       | -               | $99         |
| Google Play Developer         | -               | $25         |
| RevenueCat                    | $0 (free tier)  | $0          |
| Domain + Hosting              | $15             | $180        |
| Azure Speech (konuşma tanıma) | $50             | $600        |
| Sentry (error tracking)       | $0 (free tier)  | $0          |
| **Toplam (ekip hariç)**       | **~$1,000**     | **~$9,000** |

> Not: Ekip maliyeti iş modeline göre değişir (bootstrap vs funded).

---

## 13. Lansmansonrası Strateji

### Büyüme Kanalları

1. **Organik:** ASO, App Store featuring hedefi
2. **Referral:** "Arkadaşını davet et, 50 Elmas kazan"
3. **Sosyal Medya:** Instagram/TikTok (ebeveyn hedefli içerik)
4. **Influencer:** Çocuk YouTuber'lar, ebeveyn blog'ları
5. **Okul Ortaklıkları:** Pilot program, toplu lisans
6. **Cross-promotion:** Eğitim uygulamaları ile karşılıklı tanıtım

### İçerik Güncellemeleri

- Her ay 1 yeni ünite
- Sezonluk etkinlikler (her 3 ayda 1)
- Kullanıcı geri bildirimine göre içerik prioritization
- A/B test sonuçlarıyla sürekli optimizasyon
