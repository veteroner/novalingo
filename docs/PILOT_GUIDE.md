# NovaLingo — Çocuk Pilotu Hazırlık Kılavuzu

## Pilot Amacı

3-5 çocukla (4-12 yaş arası, ideal: her yaş grubundan birer çocuk) günlük 15-20 dakikalık oturumlarla 2 hafta boyunca ürünü test etmek.

### Ölçülecek Temel Metrikler

- **Tamamlama oranı**: Çocuk dersi sonuna kadar yapıyor mu?
- **Tekrar ziyaret**: Ertesi gün kendi isteğiyle uygulamayı açıyor mu?
- **Dil çıktısı**: 2 hafta sonunda W1 kelimelerini sesli söyleyebiliyor mu?
- **Ebeveyn algısı**: "Çocuğum İngilizce öğreniyor" hissi oluşuyor mu?

---

## Pilot Öncesi Kontrol Listesi

### Teknik Hazırlık

- [ ] Web versiyonunu deploy et (`pnpm build && netlify deploy --prod`)
- [ ] PWA installability kontrol et (manifest.json, service worker)
- [ ] Pilot çocuklar için test hesapları oluştur (Firebase Auth)
- [ ] Her hesaba farklı yaş grubu ata: cubs (4-6), stars (7-9), legends (10-12)
- [ ] Ses çalma testi: TTS Chrome/Safari'de çalışıyor mu?
- [ ] Mobile responsive test: Telefon/tablette doğru görünüyor mu?

### İçerik Hazırlığı

- [x] World 1 — 7 ünite, 47 ders, tüm enrichment alanları dolu
- [x] W1'de story-time 3+ derste aktif
- [x] W1'de conversation 1+ derste aktif
- [x] Tüm dersler quiz-battle, flash-card, listen-and-tap, match-pairs içeriyor
- [x] Emoji placeholder görseller tüm kelimelere atanmış
- [x] Hikaye sayfaları tema bazlı görsel placeholder içeriyor
- [x] Yaş grubu pedagoji filtresi çalışıyor (cubs: no grammar/sentence-builder)

### Ebeveyn Dashboard

- [x] PIN koruması aktif
- [x] Haftalık ilerleme, zayıf konular, öğrenme istatistikleri görünür
- [x] Etkinlik göstergeleri: kalıcılık trendi, üretken dil puanı, konuşma ilerlemesi
- [x] Beceri dağılımı (dinleme/konuşma/okuma/yazma) bar grafikleri
- [x] Tutarlılık skoru (son 28 gün)
- [x] Başlangıç → Şimdi karşılaştırması (ilk 5 vs son 5 ders)

---

## Pilot Süreci

### Gün 1-3: Onboarding

1. Çocuğa uygulamayı tanıt: "Nova adında bir arkadaşın var, sana İngilizce öğretecek"
2. İlk dersi birlikte yap (ebeveyn yanında)
3. Flash-card ve listen-and-tap'in kolay olduğunu doğrula
4. İlk 3 dersi tamamlatarak seriye başla

### Gün 4-7: Bağımsız Kullanım

1. Çocuğun kendi başına oturmasına izin ver
2. Günlük hatırlatma kur (ideal: saat 17-18 arası)
3. Ebeveyn dashboard'dan progress takip et
4. Zayıf konuları not al

### Gün 8-14: Derinleştirme

1. Conversation aktivitelerinin açılıp açılmadığını kontrol et
2. Story-time ders memnuniyetini sor
3. Boss derslerini tamamlayıp tamamlamadığını kontrol et
4. 2. hafta sonunda basit sözlü test yap (10 kelime sor)

---

## Gözlem Formu

Her gün doldurun:

| Alan                    | Gün 1 | Gün 2 | ... | Gün 14 |
| ----------------------- | ----- | ----- | --- | ------ |
| Oturum süresi (dk)      |       |       |     |        |
| Tamamlanan ders sayısı  |       |       |     |        |
| Kendi açtı mı? (E/H)    |       |       |     |        |
| Yardım istedi mi? (E/H) |       |       |     |        |
| Eğlendi mi? (1-5)       |       |       |     |        |
| Karşılaşılan sorun      |       |       |     |        |

---

## 2 Hafta Sonu Değerlendirme

### Çocuk Mülakat Soruları (Basit)

1. Nova ile oynamayı seviyor musun?
2. En çok hangi oyunu beğendin? (flash-card, match, memory, story, konuşma)
3. Bana bir hayvan adı söyler misin İngilizce? (dog, cat, lion...)
4. Bir renk söyler misin? (red, blue, green...)
5. Bir sayı sayar mısın? (one, two, three...)

### Ebeveyn Mülakat Soruları

1. Çocuğunuzun uygulamaya ilgisi nasıldı? (1-10)
2. Kendi başına kullanabildi mi? (Evet/Kısmen/Hayır)
3. İngilizce kelimeleri günlük hayatta kullanmaya başladı mı?
4. Dashboard'daki bilgiler yeterli mi?
5. Uygulamayı devam ettirmek ister misiniz? (Evet/Hayır)
6. Ne kadar ödeme yapmayı düşünürsünüz? (Aylık ₺XX)

### Teknik Metrikler (Dashboard'dan)

- Toplam ders tamamlama sayısı
- Ortalama doğruluk oranı (%)
- Aktif kelime sayısı
- Konuşma aktivitesi tamamlama sayısı
- Tutarlılık skoru (%)
- Beceri dağılımı oranları

---

## Bilinen Kısıtlamalar (Pilot İçin Kabul Edilebilir)

| Kısıt                          | Durumu                                                 |
| ------------------------------ | ------------------------------------------------------ |
| Görseller emoji-based SVG      | Pilot için OK, v2'de gerçek illüstrasyon gelecek       |
| Ses Web Speech API (TTS)       | Çoğu modern tarayıcıda çalışır, Safari kontrol gerekli |
| Abonelik sistemi "yakında"     | Pilot kullanıcılar zaten ücretsiz erişimde             |
| Mağaza satın alma gerçek değil | Pilot için sanal para ile feedback                     |
| Gerçek sunucu yok              | Firebase Firestore + Functions yeterli                 |

---

## Başarı Kriterleri

| Metrik                             | Hedef  | Kritik Eşik |
| ---------------------------------- | ------ | ----------- |
| 14 günde ortalama ders/gün         | ≥2     | ≥1          |
| Günlük tekrar ziyaret oranı        | ≥70%   | ≥50%        |
| W1 kelime hatırlama (2 hafta sonu) | ≥15/25 | ≥10/25      |
| Ebeveyn "devam isterim" oranı      | ≥80%   | ≥50%        |
| Çocuk eğlence puanı (1-5)          | ≥4     | ≥3          |

Bu hedeflere ulaşılırsa → **Ürün hazır**, gerçek kullanıcıya açılabilir. Ulaşılamazsa → Sorun alanlarını tespit edip 2. pilot yapılmalı.
