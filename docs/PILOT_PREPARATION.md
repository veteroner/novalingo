# NovaLingo — Efficacy Pilot Hazırlık Dokümanı

> 4 haftalık küçük ölçekli pilot test planı
> Hedef: Ürünün ölçülebilir öğrenme çıktısı ürettiğini doğrulamak

---

## 1. Pilot Amacı

NovaLingo'nun 4-12 yaş çocuklarda İngilizce kelime, kalıp ve konuşma cesareti üzerinde **ölçülebilir etki** yarattığını göstermek.

### Başarı Kriterleri

| #   | Metrik                                     | Hedef            |
| --- | ------------------------------------------ | ---------------- |
| 1   | Aktif kelime hatırlama oranı (post-test)   | ≥ %60            |
| 2   | Kalıp kullanım denemesi (konuşma pratiği)  | ≥ 3 farklı kalıp |
| 3   | Ebeveyn memnuniyet skoru                   | ≥ 4.0 / 5.0      |
| 4   | Çocuk geri dönüş oranı (günlük aktif oran) | ≥ %50            |
| 5   | Ders tamamlama oranı                       | ≥ %70            |

---

## 2. Kohort Tasarımı

### Katılımcı Profili

- **Toplam:** 15-20 çocuk
- **Yaş dağılımı:** Her yaş grubundan en az 5 kişi
  - Cubs (4-6 yaş): 5-7 çocuk
  - Stars (7-9 yaş): 5-7 çocuk
  - Legends (10-12 yaş): 5-6 çocuk
- **Ön koşul:** Düzenli İngilizce dersi almıyor, A0-Pre A1 seviye
- **Cihaz:** iOS veya Android (ebeveyn cihazı)

### Dışlama Kriterleri

- İki dilli ev ortamı (İngilizce anadil)
- Aktif İngilizce kursu devam eden çocuklar
- Günde 3+ saat ekran süresi olan çocuklar

---

## 3. Pilot Takvimi

| Hafta | Etkinlik      | Detay                                                |
| ----- | ------------- | ---------------------------------------------------- |
| 0     | Hazırlık      | Ebeveyn onboardingi, pre-test, anket                 |
| 1     | Dünya 1 Giriş | Ünite 1-2 (Temel selamlaşma, renkler, sayılar)       |
| 2     | Dünya 1 Orta  | Ünite 3-5 (Hayvanlar, yiyecekler, aile)              |
| 3     | Dünya 1 İleri | Ünite 6-7 (Ev eşyaları, oyuncaklar, günlük kalıplar) |
| 4     | Değerlendirme | Post-test, ebeveyn görüşme, veri analizi             |

### Günlük Kullanım Beklentisi

- **Minimum:** 1 ders/gün (~5-8 dakika)
- **Önerilen:** 2 ders/gün (~10-15 dakika)
- **Maksimum:** 3 ders/gün (zaman sınırı)

---

## 4. Ölçme Araçları

### 4.1 Pre-Test (Hafta 0)

Ebeveyn eşliğinde uygulanan görsel + sesli 20 soruluk test:

**Kelime tanıma (10 soru):**

- Resim göster → "Bu ne?" (Türkçe yönerge, İngilizce yanıt beklentisi)
- Hedef kelimeler: cat, red, one, apple, mom, big, happy, ball, sun, hello
- Puanlama: doğru = 1, yakın = 0.5, yanlış/bilmiyor = 0

**Dinleme anlama (5 soru):**

- Ses çal → "Doğru resmi göster"
- 4 seçenekli görsel

**Kalıp kullanımı (5 soru):**

- Sahne kart → "Bu çocuk ne demeli?" (bağlama uygun İngilizce cümle)
- Hedef kalıplar: "Hello!", "My name is…", "I like…", "This is a…", "Thank you"
- Puanlama: tam = 2, kısmi = 1, yok = 0

**Toplam:** 20 puan

### 4.2 Post-Test (Hafta 4)

Pre-test ile paralel form (aynı yapı, %50 aynı kelime + %50 yeni kelime):

**Kelime tanıma (10 soru):**

- Müfredattan öğrenilmesi beklenen 10 kelime (5 tanesi pre-test'tekilerle aynı)

**Dinleme anlama (5 soru):**

- Pre-test'ten farklı kelimeler, aynı zorluk seviyesi

**Kalıp kullanımı (5 soru):**

- Müfredattan beklenen kalıplar: "Hello!", "I see a…", "I have…", "What is this?", "I want…"

**Toplam:** 20 puan

### 4.3 Retention Check (Post-test + 2 hafta)

- Post-test'in 10 soruluk kısa versiyonu (5 kelime + 3 dinleme + 2 kalıp)
- Uygulamayı kullanmaya devam edip etmediğine bakılmaksızın

### 4.4 Uygulama İçi Otomatik Metrikler

Ebeveyn panelinde (`ParentDashboard`) zaten toplanan veriler:

| Metrik                      | Kaynak                        |
| --------------------------- | ----------------------------- |
| Tamamlanan ders sayısı      | `completedLessons`            |
| Doğruluk oranı trendi       | `lessonHistory.accuracy`      |
| Öğrenilen kelime sayısı     | `vocabularyCards (mastered)`  |
| Konuşma denemesi sayısı     | `speakingActivitiesCompleted` |
| Aktif kelime oranı          | `activeVocabularyRatio`       |
| Tutarlılık skoru            | `consistencyScore`            |
| Süre öncesi-sonrası kazanım | `retentionTrend`              |

### 4.5 Ebeveyn Memnuniyet Anketi (Hafta 4)

5'li Likert ölçek (1 = Kesinlikle katılmıyorum → 5 = Kesinlikle katılıyorum):

1. Çocuğum uygulamayı kullanmaktan keyif aldı.
2. Çocuğumun İngilizce kelime bilgisinde gelişme gördüm.
3. Çocuğum İngilizce konuşma denemelerine daha cesur yaklaşıyor.
4. Uygulama çocuğumun yaşına uygundu.
5. İlerleme raporları anlaşılır ve faydalıydı.
6. Günlük kullanım süresi makuldü (çok kısa/çok uzun değildi).
7. Bu uygulamayı başka ebeveynlere öneririsiniz mi? (1-10 NPS)

Açık uçlu:

- "En çok neyi beğendiniz?"
- "En çok neyi değiştirirdiniz?"
- "Çocuğunuz uygulamayı kullanırken sizi şaşırtan bir şey oldu mu?"

---

## 5. Teknik Hazırlık Kontrol Listesi

### Uygulama Durumu

- [x] Dünya 1 müfredatı tamamlanmış (47 ders, 7 ünite)
- [x] Tüm 123 W1 kelimesi vocabDB + wordEmojiMap'te kayıtlı
- [x] Tüm dersler için `objective`, `canDo`, `chunks` tanımlı
- [x] Yaş grubuna göre pedagojik farklılaştırma aktif (cubs/stars/legends)
- [x] Hikaye modu açık (`storyMode: true`)
- [x] Ebeveyn panelinde etkinlik göstergeleri mevcut
- [x] Boş medya alanları için otomatik placeholder sistemi aktif
- [x] Konuşma pratiği ana akışa entegre
- [x] Mağaza sayfası varsayılan içerikle çalışıyor
- [x] /subscription rotası aktif

### Altyapı

- [ ] Firebase production ortamı yapılandırılmış
- [ ] TestFlight / Internal Testing track'e build yüklenmiş
- [ ] Crash reporting aktif (Firebase Crashlytics)
- [ ] Analytics event'leri doğrulanmış
- [ ] Remote Config ile acil müdahale mekanizması test edilmiş

### Veri Toplama

- [ ] Firestore'da pilot kullanıcı kohortu etiketleme alanı (`user.pilotCohort`)
- [ ] Pilot süresi boyunca ekstra loglama (ders süresi, hata oranı, tıklama akışı)
- [ ] Ebeveyn anket formu hazır (Google Forms veya Typeform)
- [ ] Pre-test / post-test materyalleri dijitalleştirilmiş

---

## 6. Operasyonel Protokol

### Hafta 0 — Katılımcı Onboardingi

1. Ebeveynle 15 dakika video görüşme:
   - Pilot amacını açıkla
   - Uygulamayı birlikte kur
   - Çocuk profili oluştur
   - Pre-test uygula
   - Günlük kullanım beklentisini açıkla

2. WhatsApp/Telegram destek grubu oluştur (ebeveynler arası)

3. İletişim:
   - Haftalık kısa durum mesajı ebeveyne
   - Acil teknik sorun için doğrudan iletişim kanalı

### Hafta 1-3 — Aktif Kullanım

- Pazartesi: Haftalık hatırlatma mesajı
- Çarşamba: "Çocuğunuz bu hafta X ders tamamladı" otomatik özeti
- Cuma: Kısa motivasyon notu + "Hafta sonu bonus ders" önerisi
- Teknik sorun bildirimlerine 4 saat içinde yanıt

### Hafta 4 — Değerlendirme

1. Post-test uygula (aynı format, paralel form)
2. Ebeveyn anketini gönder
3. İsteğe bağlı: 10 dakika ebeveyn görüşmesi (açık uçlu geribildirim)
4. Uygulama içi metrikleri dışa aktar

### Hafta 4+2 — Retention Check

1. Retention mini-test uygula
2. Kullanım istatistiklerini son kez çek
3. Pilot kapanış raporu hazırla

---

## 7. Veri Analizi Planı

### Birincil Analiz

| Karşılaştırma                          | Yöntem                               |
| -------------------------------------- | ------------------------------------ |
| Pre-test vs Post-test puan farkı       | Eşleştirilmiş t-testi veya Wilcoxon  |
| Yaş grubu bazlı kazanım farkı          | Gruplar arası ANOVA / Kruskal-Wallis |
| Kullanım süresi vs kazanım korelasyonu | Pearson / Spearman korelasyon        |
| Retention kaybı (post vs retention)    | Eşleştirilmiş t-testi                |

### İkincil Analiz

- Aktivite tipi bazında doğruluk oranları (yaş grubuna göre)
- Konuşma denemesi sayısı vs ebeveyn algısı korelasyonu
- Dropout analizi: hangi ders/ünitede kayıp yoğunlaşıyor
- NPS dağılımı ve açık uçlu yanıt temaları

### Raporlama

- **Dahili rapor:** Tüm metrikler + insight + aksiyon önerileri
- **Ebeveyn özeti:** Çocuk bazlı kısa ilerleme kartı (PDF)
- **Karar notu:** Pilot sonuçlarına göre launch / iterate / pivot kararı

---

## 8. Etik ve Yasal

- Ebeveyn bilgilendirilmiş onam formu (KVKK uyumlu)
- Çocuk verileri anonim ID ile saklanır, isim bilgisi raporda yer almaz
- Pilot çocuklara pilottan sonra 3 ay ücretsiz premium erişim
- İstediği zaman çekilme hakkı (veri silinir)
- 6698 sayılı KVKK kapsamında veri sorumlusu bilgilendirmesi

---

## 9. Başarı/Başarısızlık Senaryoları

### Başarılı Pilot (Launch'a Devam)

- Pre → Post puan artışı istatistiksel olarak anlamlı (p < 0.05)
- Ebeveyn NPS ≥ 40
- Günlük aktif oran ≥ %50
- Ders tamamlama ≥ %70

### Kısmi Başarı (Revize Et, Tekrarla)

- Puan artışı var ama anlamlılık sınırında
- NPS 20-40 arası
- Belirli yaş grubunda düşük performans
- → İlgili yaş grubuna özel içerik/UX düzenlemesi → 2 haftalık mini pilot

### Başarısız Pilot (Pivot Gerekli)

- Puan artışı yok veya negatif
- NPS < 20
- Dropout > %50
- → Kök neden analizi → Ürün stratejisi revizyonu

---

## 10. Sonraki Adımlar

Pilot sonuçlarına bağlı olarak:

1. **Pozitif sonuç:** App Store / Play Store soft launch (Türkiye)
2. **Orta sonuç:** World 1 içerik revizyonu + 2. pilot
3. **Olumsuz sonuç:** Pedagojik danışman ile müfredat revizyonu
