# NovaLingo — İçerik Büyüme Yol Haritası

> Son güncelleme: 20 Nisan 2026
> Durum: Öncelik 1 (Faz 1-4) tamamlandı — tüm dünyalar 45 ders

---

## Mevcut Durum (Acımasız Envanter)

| Metrik                 | Mevcut          | Hedef (3 ay)    | Hedef (6 ay) |
| ---------------------- | --------------- | --------------- | ------------ |
| Toplam ders            | **272** ✅      | 280             | 350          |
| W1 ders                | 47 (tamamlandı) | 47              | 47           |
| W2 ders                | **45** ✅       | 45 (tamamlandı) | 45           |
| W3 ders                | **45** ✅       | 45 (tamamlandı) | 45           |
| W4 ders                | **45** ✅       | 45 (tamamlandı) | 45           |
| W5 ders                | **45** ✅       | 45 (tamamlandı) | 45           |
| W6 ders                | **45** ✅       | 45 (tamamlandı) | 45           |
| Konuşma senaryosu      | 80              | 128             | 180          |
| Hikaye                 | 56              | 70              | 90           |
| Benzersiz kelime       | **1,245** ✅    | 1,300           | 1,500        |
| TTS ses dosyası        | **5,009** ✅    | 5,500           | 7,000        |
| Tahmini toplam oynanış | **25-30 saat**  | 45 saat         | 60+ saat     |

### Rakip Karşılaştırma

|                     | NovaLingo (şimdi) | Lingokids | Khan Academy Kids | Duolingo ABC |
| ------------------- | ----------------- | --------- | ----------------- | ------------ |
| İçerik süresi       | **25-30 saat**    | 200+ saat | 100+ saat         | 50+ saat     |
| Konuşma/Dialog      | **80** ✅         | ~20       | ~30               | 0            |
| STT (çocuk konuşur) | ✅                | ❌        | ❌                | ❌           |
| LLM coaching        | ✅                | ❌        | ❌                | ❌           |
| Kelime              | **1,245** ✅      | 3,000+    | 1,500+            | 800+         |

**Avantaj:** Konuşma + STT + LLM coaching → hiçbir rakipte yok.
**Dezavantaj:** Toplam içerik süresi rakiplerin %10-15'i kadar.

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
- [ ] Push notification: "Nova seni bekliyor! 🐾 5 kelime tekrar zamanı" (Capacitor plugin gerekli)
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
- [ ] **Chain Stories**: Çocuk bir kelime seçer, hikaye o yöne gider (future)
- [ ] **Picture Stories**: Sadece resim göster, çocuk anlatır — speak-it entegrasyonu (future)

### Demo Hikayeler (6 yeni)

| ID | Tip | Açıklama |
|----|-----|----------|
| story-w2-mystery-picnic | tap-reveal | Piknik + gizli kelime keşfi |
| story-w3-missing-words | drag-word | Kayıp kelimeleri sürükle |
| story-w4-two-paths | choice | Şehirde dallanma: park vs market |
| story-w1-night-sounds | ambient | Gece sesleri: cırcır böceği, baykuş |
| story-w2-rhyme-cat-hat | rhyme | Kafiyeli: cat-hat-mat, dog-log-fog |
| story-w5-lab-experiment | combined | Tüm tipler: tap → reveal → drag → choice |

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

### 5C: Seasonal Events

```
Takvim:
├── Ekim: Halloween — "Spooky English" (cadılar bayramı kelimeleri)
├── Aralık: Winter Festival — "Holiday Words" (Noel + kış kelimeleri)
├── Şubat: Valentine — "Friendship Words" (arkadaşlık temaları)
├── Nisan: Spring — "Nature English" (doğa kelimeleri)
├── Haziran: Summer — "Beach & Travel" (yaz kelimeleri)
└── Eylül: Back to School — "Classroom English"
```

- Her event: 1 hafta, 5-7 özel ders, 3 collectible, 1 özel senaryo
- [ ] Event banner ana ekranda
- [ ] Sınırlı süreli collectible → FOMO + retention
- [ ] Yılda 6 event = sürekli taze içerik hissi

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

## Başarı Metrikleri

| KPI                    | Şimdi      | 3 Ay    | 6 Ay     |
| ---------------------- | ---------- | ------- | -------- |
| D1 Retention           | ?          | %60     | %70      |
| D7 Retention           | ?          | %35     | %45      |
| D30 Retention          | ?          | %15     | %25      |
| Ortalama oturum süresi | ?          | 12 dk   | 15 dk    |
| Haftalık aktif gün     | ?          | 3.5     | 4.5      |
| İçerik tüketim süresi  | 15-20 saat | 40 saat | 60+ saat |
| App Store puanı        | -          | 4.2+    | 4.5+     |
