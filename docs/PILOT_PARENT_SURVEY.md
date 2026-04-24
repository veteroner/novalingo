# NovaLingo — Pilot Ebeveyn Anketi (2 dk)

> Öncelik 7A kapsamındaki ebeveyn geri-bildirim formu. 5 soru, ~2 dakika.
> Dağıtım: WhatsApp / e-posta / Google Forms link. Sonuçlar pilot kohortu kararlarına girer.

---

## Giriş Metni (form açılış)

> Merhaba! NovaLingo'yu pilot olarak kullandığınız için çok teşekkürler. Aşağıdaki 5 soru 2 dakikanızı alacak. Verdiğiniz yanıtlar çocukların daha iyi öğrenmesi için ürünü şekillendirmemize doğrudan yardımcı olacak.

---

## Sorular

### 1) Çocuğunuz son 2 haftada NovaLingo'yu hangi sıklıkta kullandı?

- [ ] Her gün
- [ ] Haftada 4-6 gün
- [ ] Haftada 1-3 gün
- [ ] Neredeyse hiç
- [ ] Emin değilim

### 2) NovaLingo'yu bir arkadaşınıza tavsiye eder miydiniz? (NPS)

`0 — Kesinlikle hayır · 10 — Kesinlikle evet` (0–10 slider)

### 3) Çocuğunuzun İngilizce konuşma cesaretinde değişiklik gözlemlediniz mi?

- [ ] Evet, belirgin şekilde arttı
- [ ] Biraz arttı
- [ ] Fark etmedim
- [ ] Azaldı

### 4) Uygulamada en büyük sorun ne oldu? (en fazla 2 seç)

- [ ] Çocuk ilgisini çabuk kaybetti
- [ ] Konuşma tanıma hatalı sonuçlar verdi
- [ ] İçerik çok kolay / çok zor geldi
- [ ] Teknik hata (donma, çöküş, ses problemi)
- [ ] Ebeveyn paneli anlaşılmadı
- [ ] Bir sorun yaşamadım
- [ ] Diğer: ******\_\_\_******

### 5) Geliştirmemizi istediğiniz en önemli tek şey nedir? (kısa yazı — 140 karakter)

> _(açık uçlu metin alanı)_

---

## Operasyon Notları

- **Hedef katılım**: pilot grubunun en az %70'i
- **Analiz SLA**: gönderim sonrası 72 saat içinde sonuçları `docs/PILOT_GUIDE.md` altındaki "Son Pilot Özeti" bölümüne işle
- **Eylem eşikleri**:
  - NPS ≤ 6 → retention sorununu kritik olarak ele al, bir sonraki batch'e kadar yeni feature ekleme
  - Soru 4'te "Teknik hata" ≥ %20 → Crashlytics + logları 48 saat içinde incele
  - Soru 3'te "Fark etmedim" ≥ %50 → konuşma modu (Nova ile Konuş) UX'ine odaklan
- **Gizlilik**: form yanıtlarına çocuk adı / ebeveyn e-postası yazılmamalı. Tanımlayıcı olarak `pilotCohort` etiketini kullan.

## Google Forms Alanları (kopyala-yapıştır)

| Soru                         | Tip                         | Gerekli | Alan adı (CSV)      |
| ---------------------------- | --------------------------- | ------- | ------------------- |
| Kullanım sıklığı             | Tek seçim                   | Evet    | `usage_frequency`   |
| NPS                          | Doğrusal ölçek 0-10         | Evet    | `nps`               |
| Konuşma cesareti değişikliği | Tek seçim                   | Evet    | `confidence_change` |
| En büyük sorun               | Çoklu seçim (max 2) + other | Evet    | `top_issue`         |
| Tek istek                    | Kısa cevap (140 char)       | Hayır   | `top_request`       |
