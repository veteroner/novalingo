# NovaLingo — 90 Günlük Acımasız Toparlama Planı

> Amaç: NovaLingo'yu "güzel görünen bir öğrenme uygulaması" seviyesinden çıkarıp, ölçülebilir öğrenme çıktısı olan ve çocuk için gerçekten geri dönülesi hissettiren bir ürüne çevirmek.
> Son güncelleme: 23 Mart 2026

---

## 1. Kısa Karar

NovaLingo'nun bugünkü durumu:

- Müfredat omurgası var.
- Aktivite motoru var.
- Ses altyapısı güçlü.
- Oyunlaştırma yeterince canlı.
- Ama ürün, şu anda rakip düzeyinde bir "kids entertainment + English mastery" paketi değil.

En sert gerçekler:

- Ürün kelime öğretiyor, fakat sonuç dili zayıf.
- Konuşma pratiği var, ama merkezi ürün vaadi olacak kadar derin değil.
- Hikaye ve medya katmanı ince; dünya hissi zayıf.
- Çocuk için geri dönüş motivasyonu büyük ölçüde ödüle dayanıyor.
- Ebeveyn için kanıtlı gelişim ekranı henüz güçlü değil.

Bu 90 günün hedefi yeni özellik eklemek değil. Mevcut ürünü üç eksende sertleştirmek:

1. Öğrenme sonucu
2. İçerik kalitesi ve yoğunluğu
3. Eğlence ve geri dönüş hissi

---

## 2. 90 Günlük Kuzey Yıldızı

90. gün sonunda NovaLingo şu cümleyi dürüstçe kurabilmeli:

"4-10 yaş arası bir çocuk, ilk 3 dünyayı tamamladığında temel günlük İngilizce kelime ve kalıplarda ölçülebilir ilerleme gösterir; ebeveyn bu ilerlemeyi net şekilde görür; çocuk da sadece ödül için değil karakterler, hikayeler ve sahneler için uygulamaya geri dönmek ister."

Başarı ölçütleri:

- İlk 3 dünya için altın standart içerik paketi tamamlanmış olacak.
- Her ders için açık öğrenme hedefi bulunacak.
- Ebeveyn ekranında kelime, kalıp, tekrar ve konuşma cesareti metrikleri görünecek.
- Çekirdek derslerde boş `imageUrl` ve boş `audioUrl` bırakılmayacak.
- En az 1 dünya tam anlamıyla "çocuk ürünü" gibi hissettirecek medya yoğunluğuna ulaşacak.
- 4 haftalık küçük bir efficacy pilotu çalıştırılabilecek hale gelinecek.

---

## 3. Ne Yapılmayacak

Bu 90 günde aşağıdakiler öncelik dışı:

- Yeni platform açılımları
- AR / multiplayer / sosyal genişleme
- Yeni monetization denemeleri
- Fazla sayıda yeni feature flag
- Tüm dünyaları aynı anda parlatma çabası

Öncelik sırası:

1. Free dünyalar
2. Öğrenme sonucu görünürlüğü
3. Hikaye ve medya katmanı
4. Konuşma pratiği kalitesi
5. Premium genişleme

---

## 4. Ana Problemler

### P0 — Sonuç net değil

- Ders bitiyor, ama çocuk neyi gerçekten öğrendi sorusunun cevabı ürün çapında görünmüyor.
- Müfredat, CEFR/Pre-A1/A1 veya yaş bazlı "can do" diline bağlı değil.

### P0 — Eğlence katmanı zayıf

- Ödül loop'u var, ama bölüm hissi, karakter bağı ve sahne dramatizasyonu zayıf.
- Çok sayıda içerik alanı boş medya ile geliyor.

### P0 — İçerik kalitesi tutarsız

- Çok sayıda ders üretilebiliyor, ama "gold standard" ders örneği sayısı az.
- Tüm dersler aynı duygusal yoğunlukta değil.

### P1 — Konuşma pratiği ürün merkezi değil

- Konuşma aktiviteleri var, ama yoğunluk ve içerik derinliği sınırlı.
- Tek kelime veya kontrollü kısa cevap baskın.

### P1 — Ebeveyn raporu güçlü değil

- Ebeveyn ilerleme görüyor, ama satın alma gerekçesi olacak kadar net gelişim cümlesi almıyor.

---

## 5. Çalışma Modeli

Bu plan 6 adet 2 haftalık sprint olarak kurgulandı.

| Sprint |   Gün | Tema                                  | Çıktı                                          |
| ------ | ----: | ------------------------------------- | ---------------------------------------------- |
| 1      |  1-14 | Ölçülebilir öğrenme omurgası          | Ders hedefleri, seviye dili, içerik şablonları |
| 2      | 15-28 | Dünya 1 altın standart                | Tam medya destekli bir dünya                   |
| 3      | 29-42 | Dünya 2 altın standart                | Gramer ve kalıp öğretim sertleşmesi            |
| 4      | 43-56 | Dünya 3 hikaye ve okuma               | Story-driven öğrenme akışı                     |
| 5      | 57-70 | Ebeveyn görünürlüğü ve pilot hazırlık | Outcome dashboard + test araçları              |
| 6      | 71-90 | Dünya 4 toparlama + kalite kapısı     | İlk 4 dünyanın release kalitesi                |

---

## 6. Sprint Planı

### Sprint 1 — Gün 1-14

### Tema: Öğrenme omurgasını sertleştir

Hedef:

- İçerik üretimini hızlandırmadan önce ne öğrettiğimizi netleştirmek.

Teslimatlar:

- Tüm dünyalar için yaş bandı ve seviye hedef tablosu
- Her ünite için `can do` cümleleri
- Her ders için hedef yapı şablonu:
  - hedef kelimeler
  - hedef kalıplar
  - beklenen çıktı
  - tekrar noktası
  - konuşma hedefi
- "Gold standard lesson" tanımı
- Parent dashboard için outcome metrik sözlüğü
- İçerik kabul kriterleri

P0 işler:

- Müfredatı `word list` düzeyinden `skill progression` düzeyine çek
- Her dünya için giriş, orta ve çıkış beceri tanımı yaz
- İçerik ekibinin kullanacağı tek tip lesson brief formatını sabitle

Başarı kapısı:

- Yeni yazılan hiçbir ders briefs'siz ilerlemeyecek.
- Dünya 1'deki tüm ünitelerin öğrenme hedefi netleşecek.

### Sprint 2 — Gün 15-28

### Tema: Dünya 1'i gerçekten çocuk ürünü yap

Hedef:

- İlk dünya, ürünün satış demosu olacak kaliteye ulaşmalı.

Teslimatlar:

- Dünya 1 için tüm lesson intro/outro scriptleri
- Dünya 1 için gerçek görsel seti
- Dünya 1 için tüm kritik audio atamaları
- 8-10 mikro hikaye
- 8-10 rehberli konuşma senaryosu
- boss lesson'lar için sahnelenmiş final akışı
- Dünya içi karakter seti ve tekrar eden motifler

P0 işler:

- `imageUrl: ''` ve boş kritik medya alanlarını Dünya 1 için sıfıra indir
- İlk dünya için reward dışında duygusal geri dönüş üret
- Nova ve yan karakterler için kısa tekrar eden replik bankası yaz

Başarı kapısı:

- 1 çocuk testinde Dünya 1 "ders" gibi değil "bölüm" gibi hissedilmeli.

### Sprint 3 — Gün 29-42

### Tema: Dünya 2 ile kalıp öğretimini güçlendir

Hedef:

- Grameri ayrı konu gibi değil, kalıp içinde öğreten dünya oluşturmak.

Teslimatlar:

- Dünya 2 için chunk listesi
- sentence-builder ve grammar-transform için seviye kontrollü içerik
- mini diyalog serileri
- karşılaştırma, soru-cevap, basit yönlendirme ve seçim kalıpları
- Dünya 2 boss review akışları

P0 işler:

- Tek kelime alıştırmalarını kısa cümle kullanımına bağla
- "anlama" ile "üretim" arasında net köprü kur

Başarı kapısı:

- Dünya 2 sonunda çocuk 20-30 temel kalıbı yönlendirmeyle kullanabiliyor olmalı.

### Sprint 4 — Gün 43-56

### Tema: Dünya 3'ü okuma ve hikaye motoruna dönüştür

Hedef:

- Story Forest sadece tema olarak değil, gerçek bir episodic learning yapısı olarak çalışmalı.

Teslimatlar:

- 12-15 bölümden oluşan hikaye omurgası
- story-time ve story-comprehension için bölüm setleri
- tekrar eden karakterler, problem, çözüm ve cliffhanger yapısı
- okuma destek katmanı:
  - highlight word mantığı
  - tekrar dinleme akışı
  - sayfa sonu mini soru

P0 işler:

- Hikayeyi vocabulary taşıyıcısı değil, retention taşıyıcısı yap
- Eğlence hissini sadece oyunlaştırmadan çıkarıp anlatıya bağla

Başarı kapısı:

- Dünya 3'te çocuk "sonra ne olacak" merakı yaşamalı.

### Sprint 5 — Gün 57-70

### Tema: Ebeveyn için sonuç görünürlüğü ve pilot altyapısı

Hedef:

- Ürünü ebeveyne sadece güzel değil, işe yarıyor olarak göstermek.

Teslimatlar:

- Outcome dashboard v1
- metrikler:
  - öğrenilen aktif kelime
  - tekrar bekleyen kelime
  - kullanılan kalıp sayısı
  - konuşma girişim sayısı
  - zorlanılan tema
  - haftalık ilerleme özeti
- 4 haftalık efficacy pilot planı
- ölçme araçları:
  - pre-test
  - post-test
  - retention check
  - parent confidence survey

P0 işler:

- Ebeveyn panelinde "iyi gidiyor" yerine veri göster
- İçeriğin faydasını dilsel çıktı olarak anlat

Başarı kapısı:

- Ebeveyn, uygulama sonunda 3 somut gelişim cümlesi görebilmeli.

### Sprint 6 — Gün 71-90

### Tema: Dünya 4 toparlama + kalite kapısı

Hedef:

- İlk 4 dünya release adayı kalitesine gelsin. Dünya 5 ve 6 backlog'da dursun.

Teslimatlar:

- Dünya 4 için günlük hayat ve şehir dili içerikleri
- free experience'ta ilk 4 dünya için kalite standardizasyonu
- ses, görsel, hikaye, konuşma ve ebeveyn raporunda son düzeltmeler
- pilot için örnek kullanıcı kohortu
- launch karar notu

P0 işler:

- World 1-4 arasında kalite farkını azalt
- premium dünyalara geçmeden önce free çekirdeği mükemmelleştir

Başarı kapısı:

- İlk 4 dünya için içerik, medya ve sonuç görünürlüğü aynı kalite bandında olacak.

---

## 7. Sayısal Hedefler

90 gün sonunda hedeflenen minimum tablo:

| Alan                                      |   Bugün |        90 Gün Hedefi |
| ----------------------------------------- | ------: | -------------------: |
| Altın standart dünya                      |       0 |                    4 |
| Ölçülebilir `can do` tanımı olan ünite    |   düşük |                 100% |
| Çekirdek derslerde boş kritik medya alanı |  yüksek |                    0 |
| Konuşma senaryosu                         | sınırlı | 60+ kaliteli senaryo |
| Mikro hikaye / bölüm                      | sınırlı |                  40+ |
| Parent outcome metrikleri                 |   zayıf |      canlı dashboard |
| Efficacy pilot hazırlığı                  |     yok |                hazır |

---

## 8. Roller ve Sahiplik

### Ürün

- outcome framework
- öncelik sırası
- sprint acceptance gate

### İçerik

- lesson brief
- hikaye, diyalog, kalıp setleri
- yaşa uygun dil tonu

### Tasarım

- dünya kimliği
- karakter seti
- sahne kartları
- etkileşimli medya kütüphanesi

### Mühendislik

- medya bağlama
- dashboard metriği
- konuşma akışı stabilitesi
- içerik araçları ve QA

### QA / Eğitim danışmanı

- yaşa uygunluk
- dil doğruluğu
- tekrar dengesi
- yanlış pozitif öğrenme riskleri

---

## 9. Riskler

### Risk 1 — Çok içerik, düşük kalite

Karşı önlem:

- Önce 4 dünya altın standart, sonra genişleme

### Risk 2 — İçerik üretimi mühendislikten kopar

Karşı önlem:

- Tek tip lesson brief ve acceptance checklist

### Risk 3 — Eğlence uğruna öğrenme bulanıklaşır

Karşı önlem:

- Her dersin tek bir baskın dil hedefi olacak

### Risk 4 — Öğrenme var ama ebeveyn bunu görmez

Karşı önlem:

- Outcome dashboard sprint 5'e ertelenmeyecek, sprint 1'de tanımlanacak

---

## 10. Ürün Kalite Kapısı

Bir dünya "tamam" sayılmadan önce aşağıdaki maddelerin tamamı sağlanmalı:

- Tüm ünitelerde net öğrenme hedefi var
- Tüm derslerde lesson brief var
- Çekirdek aktivitelerde boş kritik medya yok
- En az 1 hikaye zinciri ve 1 konuşma zinciri tamam
- boss lesson sahnelenmiş
- parent dashboard metriğine veri akıyor
- çocuk testinde sıkılma ve kopma noktaları notlandı
- içerik dili yaşa uygun onay aldı

---

## 11. 90. Gün Sonunda Beklenen Konum

90 gün sonunda hedeflenen yeni konumlandırma:

"NovaLingo, Türk çocuklar için tasarlanmış; temel İngilizce kelime ve kalıpları, hikaye ve karakter desteğiyle öğreten; ebeveyne gelişimi görünür kılan; free çekirdeği çok güçlü bir çocuk dil öğrenme ürünü."

Bu plan tamamlandığında NovaLingo:

- Buddy kadar voice-first olmayabilir
- Lingokids kadar dev entertainment evreni olmayabilir
- Duolingo ABC kadar literacy-science odaklı olmayabilir

Ama şu üç şeyi birlikte söyleyebilir:

- iyi öğretir
- çocuk için sıcak ve geri dönülesidir
- ebeveyne ilerlemeyi kanıtlar

Bu üçlü kurulmadan ölçekleme yapılmamalı.
