# NovaLingo — Feature Specifications

> Her özelliğin detaylı davranış tanımı, edge case'leri ve kabul kriterleri
> Son güncelleme: 28 Şubat 2026

---

## 1. Onboarding Akışı

### 1.1 Splash Screen

**Süre:** 2 saniye (asset preload süresi)
**Animasyon:** Nova logosu fade-in + maskot karakter wave animasyonu
**Davranış:**

- İlk açılış → Onboarding
- Geri dönen kullanıcı → Profile Selection veya Auto Login (son aktif çocuk)

### 1.2 Onboarding Slides (İlk Açılış)

**Slides (3 adet):**

1. "NovaLingo ile İngilizce öğrenmek çok eğlenceli!" — Nova maskot dans animasyonu
2. "Her gün öğren, ödüller kazan!" — Streak + yıldız animasyonu
3. "Nova seninle birlikte büyüyecek!" — Nova evrim animasyonu (yumurta → yavru)

**Geçiş:** Swipe veya "İleri" butonu + skip butonu (sağ üst)
**Son slide:** "Başla" CTA butonu → Kayıt/Giriş

### 1.3 Ebeveyn Kayıt

**Akış:**

1. "Ebeveyn olarak devam et" (parental gate: basit matematik sorusu "7 × 8 = ?")
2. Kayıt seçenekleri:
   - Google Sign-In (1-tap)
   - Apple Sign-In (iOS)
   - Email + Password
3. KVKK/Gizlilik onayı (zorunlu checkbox)
4. Çocuk güvenliği onayı (zorunlu checkbox)

**Kabul Kriterleri:**

- [x] Parental gate %100 çocuk geçemez (math + consent steps — `src/components/organisms/ParentalGate/ParentalGate.tsx`)
- [x] ~~Email validation (format + duplicate check)~~ → **N/A** (e-posta/şifre girilmiyor; Google/Apple/Anonymous only)
- [x] ~~Şifre min 8 karakter~~ → **N/A** (aynı sebep)
- [x] Google/Apple auth otomatik profil oluşturma (`src/screens/LoginScreen.tsx` → `onAuthStateChanged` provisioning)

### 1.4 Çocuk Profili Oluşturma

**Akış:**

1. "Çocuğunuzun takma adını girin" (text input, max 15 karakter)
2. "Kaç yaşında?" (slider: 4, 5, 6, ... 12 — otomatik ageGroup mapping)
3. "Bir karakter seç!" (6 avatar, yatay scroll, büyük kartlar)
4. "Hazır mısın?" — Nova yumurtası animasyonu → yumurtadan çıkış
5. İlk dünyaya yönlendirme

**Kabul Kriterleri:**

- [x] İsim boş olamaz, sadece harf ve emoji desteklenir (client validation + `createChildProfile` server validator)
- [x] Yaş 4-12 aralığında (`ageGroup` enum — cubs/stars/legends)
- [x] Avatar seçimi zorunlu (`CreateChildProfileScreen` submit guard)
- [x] Profil Firebase'e kaydedilir (`children/{childId}` + `parentUid` index)
- [x] Nova yumurtası animasyonu min 3 saniye (`EggHatchAnimation`)

---

## 2. Ana Ekran (Home)

### 2.1 Dünya Haritası

**Görsel:** Dikey scroll edilebilir harita, her dünya bir ada/bölge
**Dünya Kartları:**

- Aktif dünya: Renkli, hafif bounce animasyonu, parlayan kenar
- Kilidi açılacak dünya: Gri tonlama, kilit ikonu, "Level X'te açılır" etiketi
- Tamamlanmış dünya: Yıldız efekti, tamamlanma oranı rozeti

**Header (sticky):**

- Sol: Çocuk avatar + isim
- Orta: Streak sayacı (alev ikonu + gün sayısı)
- Sağ: Yıldız sayacı + Elmas sayacı (tıklanınca animasyonlu detay)

**Alt Navigasyon:**
| Tab | İkon | Sayfa |
|-----|------|-------|
| Öğren | 🗺️ | Dünya Haritası (Ana) |
| Görevler | ⚔️ | Günlük/Haftalık Görevler |
| Koleksiyon | 🎭 | Karakterler, eşyalar |
| Profil | 👤 | İstatistikler, ayarlar |

### 2.2 Dünya Detay

**Tıklama:** Dünya kartına tıklayınca açılır
**İçerik:** Ünite listesi (dikey, kartlar halinde)
**Ünite Kartı:**

- Ünite adı + ikon + "X/5 ders tamamlandı"
- Progress bar (tamamlanma oranı)
- Kilit durumu (önceki ünite tamamlanmadan kilitli)
- Tamamlanınca 3 yıldız gösterimi

### 2.3 Ünite Detay

**Ders Listesi:** 5 ders, path/yol görünümü (Duolingo benzeri)
**Ders Düğümleri:**

- Aktif: Renkli, büyük, pulse animasyonu
- Tamamlanmış: Yıldız gösterimi (1-3)
- Kilitli: Gri, kilit ikonu
- Her düğüm arası: Kesikli çizgi bağlantı

---

## 3. Ders Akışı (Lesson Flow)

### 3.1 Ders Başlangıç

```
Düğüme tıkla → Ders tanıtım ekranı (2s) → İlk aktivite
```

**Ders Tanıtım Ekranı:**

- Ders adı
- Öğrenilecek kelimeler listesi (küçük resimlerle)
- "Başla!" butonu (animasyonlu, bounce)
- Tahmini süre: "~5 dakika"

### 3.2 Aktivite Oynatma

**Progress Bar:** Üstte, aktiviteler boyunca ilerler (segment animasyonu)
**Navigation:**

- Geri: Önceki aktivitenin sonucunu göster (tekrar yapamaz)
- İleri: Otomatik (doğru cevap veya timeout sonrası)

**Her Aktivite Sonrası:**

- ✅ Doğru: Yeşil flash + "correct.mp3" + Nova happy animasyonu + XP pop-up
- ❌ Yanlış: Kırmızı flash + "wrong.mp3" + doğru cevap gösterimi (2s) + Nova sad
- ⏰ Timeout: "Süre doldu!" + doğru cevap gösterimi

### 3.3 Ders Tamamlama Ekranı

**Animasyon Sırası (3 saniye):**

1. "Ders Tamamlandı!" yazısı (scale-in)
2. Yıldız animasyonu (1-2-3 yıldız, sırayla parlama)
3. XP kazanma animasyonu (sayı yukarı doğru sayar)
4. Yıldız kazanma animasyonu
5. Streak güncelleme (varsa)

**Yıldız Hesaplama:**

- ⭐ 1 Yıldız: %50-69 doğruluk
- ⭐⭐ 2 Yıldız: %70-89 doğruluk
- ⭐⭐⭐ 3 Yıldız: %90-100 doğruluk
- 0 Yıldız yok — minimum 1 yıldız (motivasyon)

**XP Hesaplama:**

```
baseXP = aktiviteSayısı × 10
accuracyBonus = doğrulukOranı × 0.5 × baseXP
streakBonus = streak > 3 ? baseXP × 0.1 × min(streak, 30) : 0
firstTryBonus = ilkDeneme ? 20 : 0
totalXP = baseXP + accuracyBonus + streakBonus + firstTryBonus
```

**Butonlar:**

- "Devam Et" → Sonraki derse git
- "Tekrar Oyna" → Aynı dersi tekrar
- "Ana Sayfa" → Home

### 3.4 Interstitial Ad Gösterimi

**Kural:** Her 3 tamamlanan derste 1 interstitial reklam
**Zamanlama:** Ders tamamlama ekranından sonra, navigasyon öncesi
**Çocuk güvenliği:**

- Reklam öncesi 3sn countdown ("Reklam 3... 2... 1...")
- "Bu bir reklamdır" etiketi görünür
- Close butonu 5sn sonra aktif
- Premium kullanıcılarda reklam YOK

---

## 4. Aktivite Detay Spesifikasyonları

### 4.1 FlashCard

**Amaç:** Yeni kelimeleri tanıtma
**Mekanik:**

1. Kart ekranın ortasında, büyük resim
2. Resmin altında kelime (İngilizce, büyük font)
3. Otomatik ses çalma (native speaker)
4. Kullanıcı karta tıklayınca:
   - Kart flip animasyonu (3D)
   - Arka yüz: Türkçe çeviri + örnek cümle
5. "Sonraki" butonu veya sağa swipe

**Etkileşim:**

- Ses ikonu: Tekrar dinle
- Yavaş ses ikonu: Yavaş telaffuz dinle
- Resim tıklama: Zoom animasyonu

**Kabul Kriterleri:**

- [x] 3D flip animasyonu 300ms, interruptible (Framer Motion `animate` cancel)
- [x] Ses otomatik çalma (AudioContext policy'ye uyumlu — `unlockAudioPlayback` user gesture)
- [x] Tüm kartlar görüldükten sonra aktivite tamamlanır
- [x] Offline modda cache'den ses çalma (Howler + `audioManifest` precache)

### 4.2 MatchPairs (Eşleştirme)

**Amaç:** Kelime-resim bağlantısı güçlendirme
**Mekanik:**

- Sol sütun: 4 kelime/ses butonu
- Sağ sütun: 4 resim (karışık sırada)
- Sürükle-bırak VEYA sırayla seç (tap-tap)

**Davranış:**

- Doğru eşleşme: Yeşil highlight + "correct.mp3" + pair çekilir
- Yanlış eşleşme: Kırmızı flash + shake animasyonu + "wrong.mp3"
- Tüm eşleşmeler tamamlanınca: Kutlama animasyonu

**Zorluk Skaları:**

- Easy (Cubs): 3 pair, sadece resim-kelime
- Medium (Stars): 4 pair, kelime-çeviri veya ses-resim
- Hard (Legends): 5 pair, ses-kelime, süre limiti

### 4.3 ListenAndTap

**Amaç:** Dinleme becerisi geliştirme
**Mekanik:**

1. Ses otomatik çalınır
2. 4 resim seçeneği gösterilir (grid 2x2)
3. Doğru resme tıkla
4. Tekrar dinle butonu (max 3 kez)

**Feedback:**

- Doğru: Resim büyüme animasyonu + üstüne kelime yazılır
- Yanlış: Tıklanan resim shake + doğru resim highlight

### 4.4 WordBuilder (Kelime Oluşturucu)

**Amaç:** Spelling/yazım becerisi
**Mekanik:**

1. Resim + ses gösterilir (hedef kelime)
2. Altında karışık harfler (tile'lar)
3. Harf tile'larını sürükleyerek kelimeyi oluştur
4. Distractor harfler var (kullanılmayanlar)

**Feedback:**

- Her doğru harf: Yeşile döner + "tap.mp3"
- Yanlış harf: Kırmızı flash + orijinal yerine geri kayar
- Kelime tamamlandığında: Kelime glow efekti + ses çalma

**İpucu Sistemi:**

- İpucu 1: İlk harfi göster (5 yıldız)
- İpucu 2: Distractor harfleri kaldır (10 yıldız)
- İpucu 3: Tüm harfleri sırala (kelimenin XP'si %50 düşer)

### 4.5 FillBlank (Boşluk Doldur)

**Amaç:** Cümle içinde kelime kullanımı
**Mekanik:**

1. Cümle gösterilir: "The \_\_\_ is red."
2. Resim ipucu (opsiyonel)
3. 4 kelime seçeneği (butonlar)
4. Doğru seçeneğe tıkla

**Davranış:**

- Seçim sonrası: Kelime cümledeki boşluğa animate olur
- Doğru: Cümle full audio çalınır
- Yanlış: Doğru cevap highlight + audio

### 4.6 SpeakIt (Konuşma)

**Amaç:** Telaffuz pratiği
**Mekanik:**

1. Kelime + resim gösterilir
2. Native speaker ses çalınır (2 kez)
3. Mikrofon butonu: "Şimdi sen söyle!"
4. 3 saniye kayıt (progress bar)
5. Speech recognition ile karşılaştırma

**Skor:**

- ✅ Tanındı ve doğru → %100 skor, yeşil, kutlama
- ⚠️ Tanındı ama farklı kelime → "Tekrar dene!" + doğru telaffuz çal
- ❌ Tanınmadı → "Duyamadım, tekrar dene!" (max 3 deneme)
- 3 deneme sonrası: "Harika çaba!" + geç (motivasyon kırılmasın)

**Kabul Kriterleri:**

- [x] Mikrofon izni ilk kullanımda istenir (`speechService.requestMicPermission()`)
- [x] İzin reddedilirse: "Dinle ve Tekrarla" fallback (speakIt activity gracefully degrades)
- [x] Speech recognition desteklenmiyorsa: Skip seçeneği (feature detection + skip CTA)
- [x] "Yanlış" demiyor — destekleyici dil ("Tekrar deneyelim!", "Duyamadım")

### 4.7 StoryTime (Hikaye Zamanı)

**Amaç:** Okuma + dinleme + bağlam içinde kelime
**Mekanik:**

1. Sayfa sayfa hikaye gösterimi (kitap metaforu)
2. Her sayfada: İllüstrasyon + metin + ses
3. Metin satır satır highlight (karaoke efekti)
4. Tıklanabilir kelimeler (tanıtılan kelimeler) → pop-up: çeviri + resim
5. Sayfa sonunda: Mini soru (1-2 kavrama sorusu)

**Etkileşimli Elemanlar:**

- "Tap the animal!" → Resimde hayvana tıkla → animasyon
- "What happens next?" → 2 seçenekli devam butonu
- "Find the word!" → Sayfada kelime bul

**Kabul Kriterleri:**

- [x] Her sayfa auto-play ses + manual "tekrar dinle" butonu
- [x] Kelime tıklama pop-up animasyonu (Framer Motion 200ms)
- [x] Sayfa geçişi kitap çevirme animasyonu
- [x] Hikaye uzunluk aralığı (`storyBank.ts` — 6-12 sayfa arası scenario'lar)

### 4.8 MemoryGame (Hafıza Oyunu)

**Amaç:** Kelime-resim eşleştirme, hafıza güçlendirme
**Mekanik:**

1. Kapalı kartlar grid'i (3x4 veya 4x4)
2. Kart çevirme: Resim veya kelime
3. İki kart eşleşirse: Çift kaybolur + ses + XP
4. Eşleşmezse: 1sn göster → geri çevir
5. Tüm çiftler bulununca: Tamamlandı!

**Skor:** Hamle sayısı bazlı

- ⭐⭐⭐: Minimum hamle × 1.2 veya daha az
- ⭐⭐: Minimum hamle × 1.5 veya daha az
- ⭐: Tamamlandı

### 4.9 WordSearch (Kelime Bulmaca)

**Amaç:** Harf tanıma, kelime görsel hafızası
**Mekanik:**

1. Harf grid'i (6x6 / 8x8)
2. Alt kısımda: Aranacak kelimeler listesi (resim + kelime)
3. Grid'de parmak sürükleyerek kelime seç
4. Doğru kelime: Highlight + checklist'te işaretle
5. Tüm kelimeler bulununca: Tamamlandı!

**Yardım:**

- "Bir kelime göster" butonu (10 yıldız) → Kelimein ilk harfi yanıp söner

### 4.10 QuizBattle (Quiz Savaşı)

**Amaç:** Bilgi pekiştirme, hız testi
**Mekanik:**

1. Ünite içindeki tüm kelimelerden rastgele soru
2. Her soru: 10-15 saniye süre (countdown bar)
3. 4 seçenek (kelime/resim)
4. Doğru: +10 XP, combo sayacı artar
5. Yanlış: Combo sıfırlanır, doğru cevap gösterilir
6. 10 soru sonrası: Sonuç ekranı

**Combo Sistemi:**

- 3 combo: "HAT TRİCK!" + %50 XP bonus
- 5 combo: "ON FIRE!" + %100 XP bonus + alev animasyonu
- 10 combo: "PERFECT!" + %200 XP bonus + konfeti patlaması

---

## 5. Nova Maskot Sistemi

### 5.1 Evrimi

```
Yumurta (0 XP) → Yavru (500 XP) → Çocuk (2000 XP) → Genç (5000 XP) → Yetişkin (15000 XP) → Efsanevi (50000 XP)
```

### 5.2 Davranışlar

| Durum             | Nova Tepkisi                     | Animasyon              |
| ----------------- | -------------------------------- | ---------------------- |
| Uygulama açılışı  | "Merhaba! Bugün ne öğreneceğiz?" | Wave + bounce          |
| Doğru cevap       | "Harika!" veya "Süper!"          | Dans, zıplama          |
| Yanlış cevap      | "Olsun, tekrar deneyelim!"       | Düşünceli, kafa kaşıma |
| Streak devam      | "X gündür birlikte öğreniyoruz!" | Alev animasyonu        |
| Level up          | "İnanamıyorum, büyüyorsun!"      | Kutlama dansı          |
| Uzun süre gelmeme | "Seni özledim!"                  | Üzgün, uyku            |
| Ders tamamlama    | "Bir ders daha tamam!"           | Yıldız toplama         |
| Evrim             | [Full screen animasyon]          | Parlama → dönüşüm      |

### 5.3 Ana Ekranda Nova

- Home ekranının alt-ortasında, floating
- Idle animasyon: Hafif nefes alma, göz kırpma
- Tıklanınca: Rastgele motivasyon cümlesi + animasyon
- Günlük ipucu: "Bugün Hayvanlar dünyasını keşfetmeye ne dersin?"
- Bildirimlerde Nova avatarı kullanılır

---

## 6. Ebeveyn Paneli Detayları

### 6.1 Giriş

- Ebeveyn PIN'i (4-6 haneli) VEYA parental gate (matematik sorusu)
- PIN unutma: Email doğrulama ile reset

### 6.2 Dashboard

**Günün Özeti:**

- Bugün öğrenilen kelimeler
- Bugün tamamlanan ders sayısı
- Bugün harcanan süre
- Doğruluk oranı trend (haftalık grafik)

**Haftalık Rapor:**

- Çubuk grafik: Günlük aktivite süresi
- Pasta grafik: Aktivite tipi dağılımı
- Çizgi grafik: Doğruluk oranı trendi
- Kelime öğrenme hızı (yeni kelime/gün)

### 6.3 Kelime Raporu

- Tüm öğrenilen kelimeler listesi
- Her kelime için: SRS durumu, doğruluk oranı, son görülme
- Filtre: Dünya, durum (yeni/öğreniliyor/öğrenildi/master)
- "Bu kelimeyi tekrar et" butonu → SRS'yi resetle

### 6.4 Ekran Süresi Kontrolü

- Günlük limit: 15dk / 30dk / 45dk / 60dk / Sınırsız
- Uyarı: Limitin %80'inde "5 dakikan kaldı!" (Nova ile)
- Limit aşımı: "Bugünlük başardık! Yarın devam ederiz." → Uygulama kilitleme
- Mola hatırlatması: Her 20 dakikada "Gözlerini dinlendir!" (opsiyonel)

---

## 7. Bildirim Sistemi

### 7.1 Push Notification Tipleri

| Tip               | Zamanlama                              | İçerik                        | Nova Görsel    |
| ----------------- | -------------------------------------- | ----------------------------- | -------------- |
| Streak hatırlatma | Her gün saat 18:00 (streak kırılmadan) | "Streak'ini kaybetme! 🔥"     | Nova endişeli  |
| Günlük davet      | Her gün saat 10:00                     | "Bugün yeni kelimeler var!"   | Nova heyecanlı |
| Haftalık rapor    | Her Pazar 11:00                        | "Bu hafta X kelime öğrendin!" | Nova gururlu   |
| Başarım           | Başarım açıldığında                    | "Yeni rozet kazandın! 🏅"     | Nova kutlama   |
| SRS tekrar        | Kelime tekrar zamanında                | "X kelime tekrar bekliyor"    | Nova düşünceli |

### 7.2 Bildirim Kuralları

- Günde max 2 bildirim
- 20:00 - 08:00 arası bildirim göndermeme
- Ebeveyn tercihi ile kapatılabilir
- İlk 7 gün: Daha sık (onboarding desteği)
- Churn riski yüksekse: Özel "seni özledik" bildirimi (3 gün inaktif)
