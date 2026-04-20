# NovaLingo — İçerik Büyüme Yol Haritası

> Son güncelleme: 21 Nisan 2026
> Durum: Production öncesi — MVP içerik denetiminden sonra oluşturuldu

---

## Mevcut Durum (Acımasız Envanter)

| Metrik                 | Mevcut     | Hedef (3 ay)    | Hedef (6 ay) |
| ---------------------- | ---------- | --------------- | ------------ |
| Toplam ders            | 211        | 280             | 350          |
| W1 ders                | 46         | 46 (tamamlandı) | 46           |
| W2 ders                | 40         | 42              | 45           |
| W3 ders                | 45         | 45 (tamamlandı) | 45           |
| W4 ders                | 30         | 45 (tamamlandı) | 45           |
| W5 ders                | 24         | 38              | 45           |
| W6 ders                | 29         | 40              | 45           |
| Konuşma senaryosu      | 80         | 128             | 180          |
| Hikaye                 | 56         | 70              | 90           |
| Benzersiz kelime       | 662        | 850             | 1,100        |
| TTS ses dosyası        | 3,308      | 4,500           | 6,000        |
| Tahmini toplam oynanış | 15-20 saat | 40 saat         | 60+ saat     |

### Rakip Karşılaştırma

|                     | NovaLingo (şimdi) | Lingokids | Khan Academy Kids | Duolingo ABC |
| ------------------- | ----------------- | --------- | ----------------- | ------------ |
| İçerik süresi       | 15-20 saat        | 200+ saat | 100+ saat         | 50+ saat     |
| Konuşma/Dialog      | **80** ✅         | ~20       | ~30               | 0            |
| STT (çocuk konuşur) | ✅                | ❌        | ❌                | ❌           |
| LLM coaching        | ✅                | ❌        | ❌                | ❌           |
| Kelime              | 662               | 3,000+    | 1,500+            | 800+         |

**Avantaj:** Konuşma + STT + LLM coaching → hiçbir rakipte yok.
**Dezavantaj:** Toplam içerik süresi rakiplerin %10-15'i kadar.

---

## Öncelik 1: W3-W6 Dersleri W1 Seviyesine Çıkar 🔴 EN KRİTİK

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

#### Faz 3 — W5 Bilim Adası (24 → 45 ders) — Hafta 5-7

- [ ] En zayıf dünya — 21 ders eklenecek
- [ ] Yeni ünite önerisi: "Bilim Deneyleri" (experiment, measure, observe, predict)
- [ ] Mevcut ünitelere 3-4'er ders eklenmeli
- [ ] Boss/review ders yoğunluğu artırılmalı

#### Faz 4 — W2 & W6 İnce Ayar (Hafta 8-9)

- [ ] W2: 40 → 45 (5 ders ekle — helper verbs, comparisons, questions)
- [ ] W6: 29 → 45 (16 ders — en büyük sıçrama, ileri seviye içerik)

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

## Öncelik 2: Spaced Repetition / Review Döngüsü 🟠 YÜKSEK

### Problem

- Çocuk bir dersi bitiriyor ve bir daha dönmüyor
- Ebbinghaus unutma eğrisi: 24 saat sonra %70 unutulur
- Mevcut: boss/review dersler var ama sistematik tekrar yok

### Hedef

Aynı 280 ders → etkili süre 3x (40 saat → 120 saat hissiyatı)

### Tasarım

```
┌─────────────────────────────────────────────┐
│  SPACED REPETITION ENGINE                    │
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

- [ ] `src/features/learning/services/spacedRepetitionService.ts` oluştur
- [ ] Firestore'da kullanıcı bazlı kelime kartları: `users/{uid}/wordCards/{wordId}`
  - `{ word, lastReviewed, interval, easeFactor, nextReview, streak }`
- [ ] Ana ekranda "Günlük Tekrar" butonu (review kartı varsa badge göster)
- [ ] Mini quiz aktivite tipi: mevcut flash-card + listen-and-tap karışımı
- [ ] Push notification: "Nova seni bekliyor! 🐾 5 kelime tekrar zamanı"
- [ ] Streak entegrasyonu (Öncelik 5 ile birlikte)

### Etki

- Mevcut içerik 3x daha uzun sürer
- Retention +40-60% (bilimsel veri)
- Ebeveyn "çocuğum gerçekten öğreniyor" hissi

---

## Öncelik 3: Haftalık Yeni Senaryo (80 → 180) 🟡 ORTA-YÜKSEK

### Problem

- 80 senaryo güçlü başlangıç ama 2-3 haftada tükenir
- Phase 2-5 daha seyrek (12-16 senaryo vs W1'in 23'ü)

### Hedef

- 6 ayda 80 → 180 senaryo
- Haftada 4 yeni senaryo

### Haftalık Senaryo Üretim Pipeline'ı

```
Pazartesi  → 2 yeni senaryo yazımı (brief + node tree)
Salı       → Review + düzeltme
Çarşamba   → TTS ses üretimi + test
Perşembe   → 2 yeni senaryo yazımı
Cuma       → Tümünü test + commit + deploy
```

### Senaryo Dağılım Planı

| Faz     | Mevcut | 3 ay hedef | 6 ay hedef | Öncelik konular                       |
| ------- | ------ | ---------- | ---------- | ------------------------------------- |
| Phase 1 | 23     | 30         | 35         | Routine, playground, birthday         |
| Phase 2 | 12     | 22         | 30         | Cooking, shopping, helping            |
| Phase 3 | 12     | 22         | 35         | Weather talk, picnic, camping         |
| Phase 4 | 16     | 26         | 40         | Doctor visit, restaurant, museum      |
| Phase 5 | 16     | 28         | 40         | Science experiment, book club, travel |

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

## Öncelik 4: Hikaye Derinliği 🟢 ORTA

### Problem

- 56 hikaye × 4-5 sayfa = güzel sayı
- AMA: statik resim + text + tap-word → 2026'da "worksheet" hissi
- Rakip (Khan Academy Kids): animasyonlu, interaktif, 8-15 sayfa

### Minimum Viable Upgrade (Animasyon gerektirmez)

#### Parallax Scroll Hikayeleri

- [ ] Sayfa geçişinde parallax efekt (arka plan yavaş, ön plan hızlı kayar)
- [ ] CSS transform + will-change ile performanslı
- [ ] Mevcut 217 görsel kullanılır, ek asset gerekmez

#### Interaktif Elementler

- [ ] Tap-to-reveal: Cümledeki boşluğa dokunarak kelime açma
- [ ] Drag-the-word: Doğru kelimeyi doğru yere sürükleme
- [ ] Sound effect: Hayvan hikayesinde hayvan sesi, yemek hikayesinde çıtırtı
- [ ] Choice branch: "Nova should go left or right?" → çocuk seçer, hikaye dallanır

#### Yeni Hikaye Tipleri

- [ ] **Rhyme Stories**: Kafiyeli kısa şiirler (çocuklar bayılır)
- [ ] **Chain Stories**: Çocuk bir kelime seçer, hikaye o yöne gider
- [ ] **Picture Stories**: Sadece resim göster, çocuk anlatır (speak-it entegrasyonu)

### Etki

- Aynı 56 hikaye 2x daha engaging
- Yeni tiplerde haftalık 1 hikaye ekleme kolaylaşır

---

## Öncelik 5: Gamification — Collectible + Streak + Seasonal 🟣 YÜKSEK

### Problem

- XP, yıldız, seviye var — temel gamification mevcut
- AMA: collectible yok, streak yok, seasonal event yok
- Retention'ın %60'ı gamification'dan gelir

### 5A: Streak Sistemi

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

- [ ] `users/{uid}/streak` Firestore dokümanı
- [ ] Ana ekranda streak badge
- [ ] Streak freeze: günlük login olmasa bile 1 gün koruma
- [ ] Streak milestone ödülleri

### 5B: Collectible Sistemi

```
Kategoriler:
├── 🎒 Nova Aksesuarları (şapka, gözlük, pelerin)
├── 🏠 Nova'nın Odası (mobilya, dekorasyon)
├── 🐾 Hayvan Dostları (her dünyadan 1 maskot)
├── 🏆 Rozetler (ders, streak, senaryo başarıları)
└── 🎨 Temalar (uygulama renk temaları)
```

- [ ] Boss ders → guaranteed collectible drop
- [ ] Her 10 ders → random collectible
- [ ] Streak milestone → özel collectible
- [ ] Koleksiyon ekranı: "Nova'nın Dolabı"
- [ ] Toplam: 50 collectible (başlangıç), 6 ayda 100+

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
