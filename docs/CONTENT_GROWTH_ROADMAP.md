# NovaLingo — İçerik Büyüme Yol Haritası

> Son güncelleme: 24 Nisan 2026
> Durum: Öncelik 7 büyük ölçüde tamamlandı — FCM SRS + streak-danger + weekly-report + achievement bildirimleri ebeveyn tercihlerine bağlı şekilde çalışıyor; native rating prompt entegre; onboarding COPPA onay akışı + legal linkler aktif; Chain Stories 2 → 6, Picture Stories 2 → 6; Playwright smoke paketi (`route-protection`, `onboarding-legal`, `subscription`) yeşil; 100 hikaye ✅ · 186 senaryo ✅ · 858 kelime ✅; dağıtım adımları ve COPPA/KVKK audit dökümante; kalan iş: gerçek pilot grubu daveti, TestFlight/Play binary upload, Crashlytics canlı doğrulama, store screenshot üretimi

---

## Mevcut Durum (Acımasız Envanter)

| Metrik                 | Mevcut            | Hedef (3 ay)    | Hedef (6 ay) |
| ---------------------- | ----------------- | --------------- | ------------ |
| Toplam ders            | **542** 🟡        | 280             | 420+         |
| W1 ders                | 47 (tamamlandı)   | 47              | 47           |
| W2 ders                | **45** ✅         | 45 (tamamlandı) | 45           |
| W3 ders                | **45** ✅         | 45 (tamamlandı) | 45           |
| W4 ders                | **45** ✅         | 45 (tamamlandı) | 45           |
| W5 ders                | **45** ✅         | 45 (tamamlandı) | 45           |
| W6 ders                | **45** ✅         | 45 (tamamlandı) | 45           |
| W7 ders                | **45** ✅         | 45              | 45           |
| W8 ders                | **45** ✅         | 45              | 45           |
| W9 ders                | **45** ✅         | 45              | 45           |
| W10 ders               | **45** ✅         | 45              | 45           |
| W11 ders               | **45** ✅         | 45              | 45           |
| W12 ders               | **45** ✅         | 45              | 45           |
| Konuşma senaryosu      | **186** ✅        | 128             | 180          |
| Hikaye                 | **96** ✅         | 70              | 90           |
| Benzersiz kelime       | **858** ✅        | 1,300           | 1,500        |
| TTS ses dosyası        | **9,993** ✅      | 5,500           | 7,000        |
| Tahmini toplam oynanış | **55-60 saat** 🟡 | 45 saat         | 60+ saat     |

> Not: W7-W12 için lesson scaffold tamamlandı. W7-W12 için iki batch halinde konuşma senaryosu ve hikâye kapsamı eklendi. W9, W11 ve W12 için vocabDB + TTS senkronizasyonu tamamlandı; activity generator tarafına synthetic vocab/emoji fallback katmanı eklendi, fallback kullanımı için analytics eventi bağlandı, lesson-level fallback KPI summary eventi eklendi, synthetic fallback cümleleri phrase-vs-word ayrımıyla daha doğal EN/TR kalıplara taşındı, story placeholder üretimi `travel/art/health` dahil tema bazlı emoji + renk paletleriyle zenginleştirildi, story/scenario coverage testleri genişletildi ve hedefli QA paketleri yeşil geçti.

### Rakip Karşılaştırma

|                     | NovaLingo (şimdi) | Lingokids | Khan Academy Kids | Duolingo ABC |
| ------------------- | ----------------- | --------- | ----------------- | ------------ |
| İçerik süresi       | **55-60 saat** 🟡 | 200+ saat | 100+ saat         | 50+ saat     |
| Konuşma/Dialog      | **186** ✅        | ~20       | ~30               | 0            |
| STT (çocuk konuşur) | ✅                | ❌        | ❌                | ❌           |
| LLM coaching        | ✅                | ❌        | ❌                | ❌           |
| Kelime              | **858** 🟡        | 3,000+    | 1,500+            | 800+         |

**Avantaj:** Konuşma + STT + LLM coaching → hiçbir rakipte yok.
**Dezavantaj:** İçerik süresi artık taban hedefe yaklaşsa da kelime kapsamı hâlâ Lingokids / Khan seviyesinin gerisinde.

---

## Öncelik 1: W3-W6 Dersleri W1 Seviyesine Çıkar ✅ TAMAMLANDI

### Problem

- W1: 46 ders (altın standart)
- W3: 28, W4: 27, W5: 24 → %40-48 daha seyrek
- Çocuk W3'e geldiğinde "içerik bitti" hissi yaşar

### Hedef

Her dünya minimum **42-45 ders**, W1 ile aynı yoğunlukta.

### Aksiyon Planı

#### Faz 1 — W3 Hikaye Ormanı (28 → 45 ders) — ✅ TAMAMLANDI

- [x] U1 (Ev): 3 yeni ders (bathroom items, garden, garage) ✅
- [x] U2 (Doğa): 3 yeni ders (weather, seasons, garden creatures) ✅
- [x] U3 (Giysiler): 3 yeni ders (accessories, patterns, dressing up) ✅
- [x] U4 (Ulaşım): 3 yeni ders (vehicles 2, travel prep, tickets) ✅
- [x] U5: 2 review/boss ders + bonus ✅
- [x] vocabDB + EMOJI_MAP + TTS audio (140+ dosya) ✅
- [x] Commit: 10b288a

#### Faz 2 — W4 Şehir Meydanı (30 → 45 ders) — ✅ TAMAMLANDI

- [x] U1 (Şehirde): 3 yeni ders (more places, giving directions practice, a day in the city)
- [x] U2 (Zaman): 3 yeni ders (seasons, daily routines, my week plan)
- [x] U3 (Meslekler): 3 yeni ders (workplaces, work tools, when I grow up)
- [x] U4 (Okul Malzemeleri): 3 yeni ders (school subjects, my school day, class schedule)
- [x] U5 (Spor & Arkadaşlar): 3 yeni ders (sports equipment, different sports, scoreboard)

#### Faz 3 — W5 Bilim Adası (27 → 45 ders) — ✅ TAMAMLANDI

- [x] U1 (Uzay): 4 yeni ders (Galaxy & Stars, Space Travel, Alien Story, Solar System Master) ✅
- [x] U2 (Teknoloji): 4 yeni ders (Coding Words, Smart Home, Future Technology, Tech Master) ✅
- [x] U3 (Duygular): 4 yeni ders (Express Your Feelings, Body Language, Empathy, Emotion Master) ✅
- [x] U4 (Böcekler): 3 yeni ders (Animal Habitats, Animal Sounds, Animal World Master) ✅
- [x] U5 (Şekiller): 3 yeni ders (3D Shapes, Measurements, Shape Master) ✅
- [x] vocabDB 46 yeni kelime + TTS audio (210 dosya) ✅

#### Faz 4 — W2 & W6 İnce Ayar (Hafta 8-9) ✅

- [x] W2: 42 → 45 (+3 ders eklendi — kettle, trophy, ribbon, compass, diary, postcard)
- [x] W6: 32 → 45 (+13 ders eklendi — polite expressions, past tense, future tense, world food, positions)

### Her Yeni Ders Standardı (Golden Checklist)

```
✅ Lesson objective (1 cümle)
✅ Target vocabulary (3-6 kelime)
✅ Target chunks/patterns (ör: "I see a ___")
✅ canDo statement
✅ introLine (Nova'nın açılış cümlesi)
✅ outroLine (kutlama cümlesi)
✅ Minimum 8 aktivite
✅ En az 1 üretim görevi (speak-it veya conversation)
✅ En az 1 geri çağırma (quiz-battle veya match-pairs)
✅ TTS ses dosyaları üretilmiş
```

### Çıktı

- 194 → ~280 ders
- Tahmini ek süre: +12-15 saat oynanış

---

## Öncelik 2: Spaced Repetition / Review Döngüsü ✅ TAMAMLANDI

### Problem

- Çocuk bir dersi bitiriyor ve bir daha dönmüyor
- Ebbinghaus unutma eğrisi: 24 saat sonra %70 unutulur
- Mevcut: boss/review dersler var ama sistematik tekrar yok

### Hedef

Aynı 280 ders → etkili süre 3x (40 saat → 120 saat hissiyatı)

### Tasarım

```
┌─────────────────────────────────────────────┐
│  SPACED REPETITION ENGINE (SM-2)             │
│                                              │
│  Ders bittiğinde → kelimeler "öğrenildi"     │
│  24 saat sonra → Mini Quiz (3 soru, 60 sn)  │
│  3 gün sonra → Flash Review (5 kelime)       │
│  7 gün sonra → Boss Challenge (mixed)        │
│  30 gün sonra → Mastery Check                │
│                                              │
│  Yanlış cevap → intervali sıfırla            │
│  3x doğru → "Mastered" rozeti               │
└─────────────────────────────────────────────┘
```

### Aksiyon Planı

- [x] `src/services/srs/srsEngine.ts` — SM-2 algoritması (calculateNextReview, getReviewQueue, calculateSRSStats) ✅
- [x] Firestore'da kullanıcı bazlı kelime kartları: `children/{childId}/vocabulary/{wordId}` ✅
  - `{ word, lastReviewed, interval, easeFactor, nextReviewAt, repetitions, quality }`
- [x] Ana ekranda "Günlük Tekrar" butonu (review kartı varsa badge göster) ✅
- [x] Mini quiz aktivite tipi: `generateReviewLesson` in learningEngine ✅
- [x] Push notification: "Nova seni bekliyor! 🐾 5 kelime tekrar zamanı" — `functions/src/scheduled/srsReviewReminder.ts` (günlük 09:00 TR, collectionGroup query, ebeveyn dedup) ✅
- [x] Streak entegrasyonu — günlük review tamamlama streak'e sayılıyor ✅

### Mevcut Dosyalar

- `src/services/srs/srsEngine.ts` — SM-2 motor
- `src/services/srs/adaptiveDifficulty.ts` — Zorluk ayarı
- `src/services/learning/learningEngine.ts` — prepareLesson (SRS inject), generateReviewLesson
- `src/features/learning/screens/ReviewScreen.tsx` — Tam fonksiyonel review ekranı
- `src/features/home/screens/HomeScreen.tsx` — "Günlük Tekrar" CTA (due badge ile)

### Etki

- Mevcut içerik 3x daha uzun sürer
- Retention +40-60% (bilimsel veri)
- Ebeveyn "çocuğum gerçekten öğreniyor" hissi

---

## Öncelik 3: Haftalık Yeni Senaryo (80 → 126) ✅ TAMAMLANDI

> **3-ay hedefine ulaşıldı:** 82 → 126 senaryo (+44 yeni senaryo eklendi)

### Mevcut Durum (Tamamlanmış)

| Faz        | Başlangıç | Şimdi   | Eklenen |
| ---------- | --------- | ------- | ------- |
| Phase 1    | 23        | 30      | +7      |
| Phase 2    | 12        | 22      | +10     |
| Phase 3    | 12        | 20      | +8      |
| Phase 4    | 16        | 26      | +10     |
| Phase 5    | 16        | 28      | +12     |
| **Toplam** | **82**    | **126** | **+44** |

### Kalan Hedef (6 ay)

- 6 ayda 126 → 180 senaryo
- Haftada 4 yeni senaryo

### Haftalık Senaryo Üretim Pipeline'ı

```
Pazartesi  → 2 yeni senaryo yazımı (brief + node tree)
Salı       → Review + düzeltme
Çarşamba   → TTS ses üretimi + test
Perşembe   → 2 yeni senaryo yazımı
Cuma       → Tümünü test + commit + deploy
```

### 6 Ay Hedef Dağılımı

| Faz     | Şimdi | 6 ay hedef | Öncelik konular                       |
| ------- | ----- | ---------- | ------------------------------------- |
| Phase 1 | 30    | 35         | Routine, playground, birthday         |
| Phase 2 | 22    | 30         | Cooking, shopping, helping            |
| Phase 3 | 20    | 35         | Weather talk, picnic, camping         |
| Phase 4 | 26    | 40         | Doctor visit, restaurant, museum      |
| Phase 5 | 28    | 40         | Science experiment, book club, travel |

### Senaryo Kalite Kontrol Checklist

```
✅ Minimum 8 dialog node
✅ 4+ target word
✅ 2+ target pattern/chunk
✅ Open-ended veya semi-open mode
✅ Nova coaching repair stratejisi
✅ Success criteria: minAcceptedTurns ≥ 6
✅ Hint text tüm node'larda
✅ TTS sesleri üretilmiş
✅ 4-9 yaş dili (kısa cümleler, somut konular)
```

---

## Öncelik 4: Hikaye Derinliği ✅ TAMAMLANDI

### Problem

- 56 hikaye × 4-5 sayfa = güzel sayı
- AMA: statik resim + text + tap-word → 2026'da "worksheet" hissi
- Rakip (Khan Academy Kids): animasyonlu, interaktif, 8-15 sayfa

### Minimum Viable Upgrade (Animasyon gerektirmez)

#### Parallax Scroll Hikayeleri

- [x] Sayfa geçişinde parallax efekt (arka plan yavaş, ön plan hızlı kayar) ✅
- [x] CSS transform + will-change ile performanslı (framer-motion scale/x) ✅
- [x] Mevcut 217 görsel kullanılır, ek asset gerekmez ✅

#### Interaktif Elementler

- [x] Tap-to-reveal: Cümledeki boşluğa dokunarak kelime açma ✅
- [x] Drag-the-word: Doğru kelimeyi doğru yere sürükleme ✅
- [x] Sound effect: Sayfa bazlı ambientSound URL desteği ✅
- [x] Choice branch: "Nova should go left or right?" → çocuk seçer, hikaye dallanır ✅

#### Yeni Hikaye Tipleri

- [x] **Rhyme Stories**: Kafiyeli kısa şiirler — variant='rhyme' + rhymeWords ✅
- [x] **Chain Stories**: Çocuk bir kelime seçer, hikaye o yöne gider — `word-select` interaction tipi + 2 örnek hikaye ✅
- [x] **Picture Stories**: Sadece resim göster, çocuk anlatır — `speak-it` entegrasyonu + 2 örnek hikaye ✅

### Demo Hikayeler (6 yeni)

| ID                      | Tip        | Açıklama                                 |
| ----------------------- | ---------- | ---------------------------------------- |
| story-w2-mystery-picnic | tap-reveal | Piknik + gizli kelime keşfi              |
| story-w3-missing-words  | drag-word  | Kayıp kelimeleri sürükle                 |
| story-w4-two-paths      | choice     | Şehirde dallanma: park vs market         |
| story-w1-night-sounds   | ambient    | Gece sesleri: cırcır böceği, baykuş      |
| story-w2-rhyme-cat-hat  | rhyme      | Kafiyeli: cat-hat-mat, dog-log-fog       |
| story-w5-lab-experiment | combined   | Tüm tipler: tap → reveal → drag → choice |

### Etki

- Aynı 56+ hikaye 2x daha engaging
- Yeni tiplerde haftalık 1 hikaye ekleme kolaylaşır
- Next button artık etkileşim tamamlanana kadar disabled

---

## Öncelik 5: Gamification — Collectible + Streak + Seasonal 🟣 YÜKSEK

### Problem

- XP, yıldız, seviye var — temel gamification mevcut
- Collectible infrastructure var, streak tam, seasonal event yok
- Retention'ın %60'ı gamification'dan gelir

### 5A: Streak Sistemi ✅ TAMAMLANDI

```
┌──────────────────────────────────┐
│  🔥 STREAK                       │
│                                  │
│  Gün 1:  1 ders = streak başlar  │
│  Gün 2:  streak +1               │
│  Gün 3:  streak +1, bronz rozet  │
│  Gün 7:  gümüş rozet + bonus XP  │
│  Gün 14: altın rozet              │
│  Gün 30: elmas rozet + özel item  │
│  Kaçırma: streak freeze (1 hak)   │
│                                  │
│  Ana ekranda büyük 🔥 sayacı      │
│  Push: "Streak'ini kaybetme!"     │
└──────────────────────────────────┘
```

- [x] `children/{childId}` profilinde currentStreak, longestStreak alanları ✅
- [x] Ana ekranda streak badge (🔥 sayaç + "Gün Seri") ✅
- [x] Streak freeze: `useStreakFreezeAction` + modal UI ✅
- [x] Streak milestone ödülleri: `functions/src/triggers/onStreakUpdate.ts` (3,7,14,30 gün) ✅
- [x] Streak-lost modal: otomatik gösterim (HomeScreen) ✅
- [x] Backend: `functions/src/scheduled/streakCheck.ts` (günlük reset) ✅

### 5B: Collectible Sistemi ✅ TAMAMLANDI

```
Kategoriler (7 adet, toplam 50 item):
├── 🐾 Hayvanlar (8 item)
├── 🏳️ Bayraklar (7 item)
├── 🎨 Stickers (7 item)
├── 👤 Karakterler (7 item)
├── 🏛️ Landmarks (7 item)
├── 🍕 Yiyecekler (7 item)
└── 🚗 Araçlar (7 item)
```

- [x] 50 item'lık collectible kataloğu: `src/data/collectibleCatalog.ts` ✅
- [x] Firestore seed script: `scripts/seedCollectibles.ts` ✅
- [x] Boss ders → guaranteed rare+ collectible drop (client-side) ✅
- [x] Her 10 ders → random collectible (client-side) ✅
- [x] Streak milestone → özel collectible: `onStreakUpdate.ts` (7,30,100,365 gün) ✅
- [x] Koleksiyon ekranı mevcut: `CollectionScreen.tsx` ✅
- [x] Ders sonuç ekranında collectible kazanım kartı ✅
- [x] Rarity sistemi: common/uncommon/rare/epic/legendary ✅

### 5C: Seasonal Events ✅ TAMAMLANDI

```
Takvim:
├── Ekim: Halloween — "Spooky English" (cadılar bayramı kelimeleri)
├── Aralık: Winter Festival — "Holiday Words" (Noel + kış kelimeleri)
├── Şubat: Valentine — "Friendship Words" (arkadaşlık temaları)
├── Nisan: Spring — "Nature English" (doğa kelimeleri)
├── Haziran: Summer — "Beach & Travel" (yaz kelimeleri)
└── Eylül: Back to School — "Classroom English"
```

| Dosya                                                          | Açıklama                                                                              |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `src/types/gamification.ts`                                    | `SeasonalEvent`, `SeasonalLesson`, `SeasonalCollectible`, `UserEventProgress` tipleri |
| `src/features/gamification/data/seasonalEvents.ts`             | 6 event (Halloween→Back-to-School), 5-6 ders + 3 collectible her event                |
| `src/hooks/useSeasonalEvent.ts`                                | TanStack Query hook — aktif event, ilerleme, kalan gün                                |
| `src/services/firebase/firestore.ts`                           | `childEventProgress` Firestore koleksiyonu eklendi                                    |
| `src/features/gamification/components/SeasonalEventBanner.tsx` | Ana ekranda gradient banner (aktif/yaklaşan)                                          |
| `src/features/gamification/screens/SeasonalEventScreen.tsx`    | Event detay ekranı: ders listesi, collectible grid, vocab chips                       |
| `src/features/home/screens/HomeScreen.tsx`                     | Banner wired — streak/XP satırı altına eklendi                                        |
| `src/app/Router.tsx`                                           | `/event/:eventId` route eklendi                                                       |

- [x] Event banner ana ekranda ✅
- [x] Sınırlı süreli collectible → FOMO + retention ✅
- [x] Yılda 6 event = sürekli taze içerik hissi ✅

### Etki

- Streak: DAU +30-50%
- Collectible: session uzunluğu +20%
- Seasonal: churn azalması %25-40

---

## Zaman Çizelgesi

```
        Ay 1              Ay 2              Ay 3
  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
  │ W3 dersler   │   │ W5 dersler   │   │ Spaced Rep   │
  │ W4 dersler   │   │ W2/W6 ince   │   │ Streak       │
  │ 16 senaryo   │   │ 16 senaryo   │   │ 16 senaryo   │
  │              │   │ Parallax     │   │ Collectible  │
  └─────────────┘   └─────────────┘   └─────────────┘

        Ay 4              Ay 5              Ay 6
  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
  │ Hikaye tipler│   │ Seasonal #1  │   │ Review +     │
  │ 16 senaryo   │   │ 16 senaryo   │   │ Polish       │
  │ Choice branch│   │ Collectible  │   │ 16 senaryo   │
  │              │   │ +50 item     │   │ KPI analiz   │
  └─────────────┘   └─────────────┘   └─────────────┘
```

---

## ❌ Matematik Eklenmeyecek — Karar Notu

### Neden Hayır

1. **Odak kaybı**: Çekirdek İngilizce içerik henüz rakip seviyesinde değil
2. **Rakip uçurum**: Khan Academy Kids (ücretsiz), Prodigy Math (50M kullanıcı), Duolingo Math (700+ mühendis)
3. **Duolingo matematiği ne zaman ekledi**: 500M+ indirme, $4B değerleme, 700 mühendis sonrası
4. **NovaLingo'nun gerçek avantajı**: Konuşma + STT + LLM coaching — buna odaklan
5. **Feature creep**: İki konuda vasat olmak > bir konuda iyi olmaktan kötü

### Alternatif (İleride)

İngilizce ÜZERİNDEN matematik kelime problemleri:

- "If Nova has 3 apples and gives 2 to her friend, how many does she have?"
- Bu hem İngilizce hem mantık öğretir
- Yeni aktivite tipi: `math-word-problem`
- **Zamanı**: İngilizce içerik 60+ saat olduğunda (Ay 6 sonrası)

---

## Öncelik 6: W7-W12 — İçerik Derinliği ✅ TAMAMLANDI

> **Hedef:** 272 → 420+ ders, 25-30 saat → 60+ saat oynanış
> Rakip Duolingo ABC'nin %30'una ulaşmak için minimum eşik.

### Güncel Durum

- [x] `src/features/learning/data/curriculum.ts` içinde W7-W12 için **6 yeni dünya / 30 ünite / 270 ders** eklendi
- [x] `src/features/learning/data/wordEmojiMap.ts` yeni dünyaların yüksek frekanslı kelimeleri için genişletildi
- [x] SRS entegrasyonu lesson düzeyinde otomatik olarak yeni dünyalara da yayılmış durumda
- [x] W7, W8 ve W10 için hedefli vocabDB sync ve genişletilmiş TTS üretimi tamamlandı
- [x] W7, W8 ve W10 için ünite başına minimum 2 konuşma senaryosu eklendi (30 yeni senaryo)
- [x] W7, W8 ve W10 için ünite başına minimum 1 interaktif hikaye eklendi (15 yeni hikâye)
- [x] W9, W11 ve W12 için ünite başına minimum 2 konuşma senaryosu eklendi (30 yeni senaryo)
- [x] W9, W11 ve W12 için ünite başına minimum 1 interaktif hikaye eklendi (15 yeni hikâye)
- [x] W9, W11 ve W12 için vocabDB ve TTS üretimi yeni kelimelerle senkronize edildi
- [x] W7-W12 story/scenario coverage testleri genişletildi; hedefli QA paketi yeşil geçti
- [x] W7-W12 conversation selector, worldTag'li senaryoları önceliyecek şekilde sıkılaştırıldı ve regression testleri eklendi
- [x] W7-W12 coverage pass tamamlandı: activity generator fallback'leri ham `This is ...` cümlelerinden çıkarıldı ve expansion vocabulary için emoji coverage guard'ları eklendi
- [x] Telemetry baseline: synthetic vocab fallback kullanımı lesson bazında dedupe edilerek analytics'e bağlandı ve focused test eklendi
- [x] Telemetry follow-up: per-word fallback event'ine ek olarak lesson-level summary eventi eklendi; `fallback_word_count` ve `fallback_with_emoji_count` alanlarıyla dashboard/KPI okuması kolaylaştırıldı
- [x] Runtime fallback copy polish: synthetic fallback cümleleri tek tip `ifadesini çalışalım` kalıbından çıkarıldı; phrase'ler için `birlikte söyleyelim`, tek kelimeler için `kelimesini öğrenelim` varyantları ve focused testler eklendi
- [x] Story placeholder polish: W7-W12 theme placeholder'ları tema bazlı emoji/gradient paletleriyle iyileştirildi; `travel`, `art` ve `health` artık generik `📖` yerine ayırt edilebilir görsel fallback üretiyor

### Müfredat İskeleti (Tamamlandı)

| Dünya | Tema                 | Ünite | Ders | Durum                 |
| ----- | -------------------- | ----- | ---- | --------------------- |
| W7    | 🏖️ Tatil & Seyahat   | 5     | 45   | Curriculum eklendi ✅ |
| W8    | 🍕 Yemek & Mutfak    | 5     | 45   | Curriculum eklendi ✅ |
| W9    | 🎨 Sanat & Müzik     | 5     | 45   | Curriculum eklendi ✅ |
| W10   | 🏥 Sağlık & Vücut    | 5     | 45   | Curriculum eklendi ✅ |
| W11   | 🌍 Çevre & Doğa      | 5     | 45   | Curriculum eklendi ✅ |
| W12   | 🔢 Sayılar & Zaman 2 | 5     | 45   | Curriculum eklendi ✅ |

### Senaryo ve Hikâye Genişlemesi

| Dünya Grubu    | Konuşma Senaryosu | Hikâye | Durum      |
| -------------- | ----------------- | ------ | ---------- |
| W7 + W8 + W10  | +30               | +15    | Eklendi ✅ |
| W9 + W11 + W12 | +30               | +15    | Eklendi ✅ |

### Yeni Dünyalar

| Dünya | Tema                 | Ünite Sayısı | Hedef Ders | Odak Kelimeler           |
| ----- | -------------------- | ------------ | ---------- | ------------------------ |
| W7    | 🏖️ Tatil & Seyahat   | 5            | 45         | airport, hotel, beach    |
| W8    | 🍕 Yemek & Mutfak    | 5            | 45         | cook, recipe, ingredient |
| W9    | 🎨 Sanat & Müzik     | 5            | 45         | draw, paint, sing, play  |
| W10   | 🏥 Sağlık & Vücut    | 5            | 45         | doctor, body, feel, hurt |
| W11   | 🌍 Çevre & Doğa      | 5            | 45         | recycle, tree, water     |
| W12   | 🔢 Sayılar & Zaman 2 | 5            | 45         | hundred, calendar, clock |

### Üretim Pipeline (W7-W12)

```
Her dünya için:
  ✅ 5 ünite × 9 ders = 45 ders
  ✅ 45 ders × 4-6 hedef kelime = ~200 yeni kelime
  ✅ TTS ses üretimi (generate-audio.py)
  ✅ SRS entegrasyonu (otomatik — mevcut engine)
  🟡 En az 2 konuşma senaryosu per ünite
  🟡 1 interaktif hikaye per ünite
```

### Öncelik Sırası

- Öncelik 6 backlog'u kapandı. **Öncelik 7 aktif** — aşağıya bakınız.

---

## Öncelik 7: Pilot → App Store — Kullanıcı Kalitesi 🟣 AKTİF

> **Hedef:** İlk 100 pilot kullanıcı, D7 retention ≥ %35, App Store hazırlığı

### 7A: Pilot Program (W1-W2)

- [ ] 20-50 çocuk pilot davet (Türkiye, 4-9 yaş) _(dış adım — ops yürütme)_
- [x] Firebase Analytics dashboard spesifikasyonu + KPI tanımları (`docs/ANALYTICS_KPI_DASHBOARD.md`) ✅ _(konsol tarafı widget kurulumu dış adım)_
- [x] Pilot kohort segmentasyonu altyapısı: `users/{uid}.pilotCohort` (`src/types/user.ts`) + `pilot_cohort` user property (`setAnalyticsUserProperties` — `src/services/analytics/analyticsService.ts`) ✅
- [x] KPI baseline tablosu: hedef değerler + formüller (`docs/ANALYTICS_KPI_DASHBOARD.md` §6) ✅ _(gerçek sayılar pilot sonrası girilir)_
- [x] Pilot feedback ebeveyn anketi: 5 soru, 2 dk (`docs/PILOT_PARENT_SURVEY.md`) ✅

### 7B: İçerik Kalite Geçişi (W2-W3)

- [x] Chain Stories: 2 → 6 hikaye (+4, W3 nature, W5 school, W7 city, W11 emotions — `src/features/learning/data/storyBank.ts`) ✅
- [x] Picture Stories: 2 → 6 hikaye (+4, W7 city, W8 food, W10 nature, W12 space — `src/features/learning/data/storyBank.ts`) ✅
- [ ] Zayıf dropout noktası dersler için içerik patch (pilot veriden)
- [ ] SRS review ekranı UX polish (pilot feedback bazlı)

### 7C: App Store Hazırlık (W3-W4)

- [ ] App Store metadata: ekran görüntüleri (6.7", 5.5", iPad), açıklamalar _(dış adım — gerçek build üzerinde çekilir)_
- [x] Privacy Policy + COPPA compliance kontrol (`docs/APP_STORE_METADATA.md` — "COPPA & KVKK Compliance Audit" bölümü) ✅
- [x] TestFlight beta build (iOS) + Internal Testing (Android) adım dökümanı (`docs/APP_STORE_METADATA.md` — dağıtım adımları) ✅ _(gerçek binary upload dış adım)_
- [x] Native/App Store rating prompt entegrasyonu (`src/services/ratingService.ts`, sonuç ekranlarına wired, Capacitor 6 uyumlu plugin ile) ✅
- [ ] Crash-free oranı ≥ %99.5 doğrula (Crashlytics) _(dış adım — gerçek cihaz / canlı trafik)_

> Not: 23 Nisan itibarıyla onboarding/legal/subscription için kritik route smoke testleri Playwright'ta yeşil. Kalan App Store hazırlığı tarafı artık dağıtım, crash oranı ve mağaza materyalleri odaklı.

### 7D: Push Notification Genişletme (W3-W4)

- [x] SRS review hatırlatıcısı: `srsReviewReminder` Cloud Function ✅
- [x] Streak tehlikesi bildirimi: `functions/src/scheduled/streakDangerReminder.ts` (günlük 19:00 TR, `inactivityAlert` tercihine bağlı, ebeveyn dedup) ✅
- [x] Haftalık rapor bildirimi: `weeklyReport` artık `sendToParent` ile FCM gönderiyor (`weeklyReport` kategorisi) ✅
- [x] Bildirim tercihleri: ebeveyn ayarlarındaki toggle'lar Cloud Functions'da da honor ediliyor (`users/{uid}.settings.notifications` + `sendToParent(category)`) ✅

### Başarı Kriteri

```
✅ Pilot grubu D7 retention ≥ %30
✅ Ortalama oturum süresi ≥ 10 dk
✅ App Store review score ≥ 4.0 (beta)
✅ 0 critical crash, ≤ 2 minor bug
```

---

## Başarı Metrikleri

> Not: "Şimdi" sütunu pilot kullanıcı verisi geldikten sonra güncellenecek.
> Firebase Analytics → Engagement → Retention kohort raporu kullan.

| KPI                    | Şimdi                      | 3 Ay    | 6 Ay     |
| ---------------------- | -------------------------- | ------- | -------- |
| D1 Retention           | ⏳ pilot verisi bekleniyor | %60     | %70      |
| D7 Retention           | ⏳ pilot verisi bekleniyor | %35     | %45      |
| D30 Retention          | ⏳ pilot verisi bekleniyor | %15     | %25      |
| Ortalama oturum süresi | ⏳ pilot verisi bekleniyor | 12 dk   | 15 dk    |
| Haftalık aktif gün     | ⏳ pilot verisi bekleniyor | 3.5     | 4.5      |
| İçerik tüketim süresi  | **55-60 saat** ✅          | 40 saat | 60+ saat |
| App Store puanı        | -                          | 4.2+    | 4.5+     |
