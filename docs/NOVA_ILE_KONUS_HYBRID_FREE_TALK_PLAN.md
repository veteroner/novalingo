# Nova ile Konuş Hybrid Free Talk Plan

> Amaç: Mevcut görünmez çoktan seçmeli konuşma akışını, kontrollü ama gerçekten serbest cevap kabul eden hibrit bir konuşma sistemine çevirmek.
> Kapsam: Teknik hedef mimari, ilk iterasyon kapsamı, veri modeli değişiklikleri, runtime davranışı ve test planı.
> Tarih: 5 Nisan 2026

---

## 1. Problem Tanımı

Bugünkü sistem serbest konuşma gibi görünse de teknik olarak çoğu turda şunu yapıyor:

1. Nova bir soru sorar.
2. Arkada birkaç kabul edilmiş cevap tanımlıdır.
3. Çocuğun metni bu cevaplara benzetilir.
4. Eşleşme yoksa sistem dürüstçe aynı soruda kalmak yerine ipucu cevabını zorla seçebilir.

Bu yaklaşımın sonucu:

- çocuk alakalı ama senaryoda yazmayan cevaplar verdiğinde sistem onu anlamamış görünür
- konuşma doğal hissettirmez
- ürün dili ile gerçek davranış çelişir
- testler sadece mutlu yolu doğruladığı için bu kusur üretime sızar

---

## 2. Hedef Davranış

Hibrit modelin hedefi tam serbest chatbot olmak değildir.

Hedef şudur:

- senaryo ve pedagojik hedef korunur
- çocuk ilgili ama senaryoda yazmayan cevaplar verebilir
- sistem bu cevabı yakalayıp kontrollü şekilde akışı sürdürür
- alakasız veya anlamsız cevapta cevap uydurmaz, repair verir
- timeout durumunda çocuğun ağzına cevap koymaz

Özet:

- `guided`: tamamen tanımlı cevaplar
- `semi_open`: tanımlı cevaplar + açık uçlu fallback parse
- `open_ended`: ileride LLM veya rubric tabanlı cevap üretimi

---

## 3. Hedef Mimari

### 3.1 Veri Modeli

Her `nova` prompt node isteğe bağlı bir `openEnded` konfigürasyonu taşıyabilir.

Bu konfigürasyon şunları tanımlar:

- hangi açık uçlu pattern denenecek
- yakalanan değer hangi slot'a yazılacak
- eşleşme olursa hangi node'a gidilecek
- hangi pattern başarı sayılacak
- yakalanan kelime hedef kelime sayımına dahil edilecek mi

### 3.2 Runtime Akışı

Her çocuk cevabında sıra şu olmalı:

1. Önce tanımlı response rules dene.
2. Eşleşme yoksa node'un `openEnded` fallback kuralını dene.
3. Açık uçlu parse başarılıysa:
   - çocuğun ham cevabını koru
   - slot'a yaz
   - generic bridge node'a geç
4. Parse başarısızsa:
   - repair veya hint göster
   - aynı turda kal
   - otomatik cevap seçme

### 3.3 Slot Tabanlı Metin

Bridge node'lar `{{favoriteAnimal}}` gibi placeholder'lar içerebilir.

Runtime bu alanları oturum içi slot değerleri ile doldurur.

Bu sayede her olası hayvan için ayrı branch yazmak gerekmez.

---

## 4. İlk Iterasyon Kapsamı

İlk iterasyon bilinçli olarak dar tutulacaktır.

Kapsam:

- `ConversationNodeV2` ve legacy mapper'a `openEnded` metadata eklemek
- activity runtime içinde açık uçlu fallback parser çalıştırmak
- node metninde placeholder interpolation desteklemek
- timeout'ta ilk seçeneği otomatik seçen davranışı kaldırmak
- `My Favorite Animal` senaryosunda:
  - `snake` gibi ilgili ama yazılmamış hayvan cevaplarını kabul etmek
  - generic acknowledgement ile akışı sürdürmek
  - aynı mantığı ikinci favorite-animal turunda da desteklemek
  - reason turunda sınırlı serbest gerekçe kabul etmek

İlk iterasyon dışı:

- LLM tabanlı konuşma üretimi
- backend conversation memory
- tüm senaryoların toplu migration'ı
- ebeveyn raporlarında open-ended slot analitiği

### Güncel Durum Notu

Planın sonraki iterasyonlarında şu adımlar da uygulanmıştır:

- local rubric katmanının üstüne provider tabanlı evaluator zinciri eklendi
- `VITE_OPEN_ENDED_EVALUATOR=local|hybrid|remote` ile istemci tarafı evaluator seçimi yapılabilir
- gerçek LLM evaluator Firebase callable üzerinden çalışır
- backend secret olarak `OPENAI_API_KEY` gerekir
- opsiyonel backend model override için `OPENAI_MODEL` kullanılabilir
- explicit `openEnded` olmayan ama tek `nextNodeId` ile ilerleyen `semi_open` promptlar da aynı evaluator omurgasına alınmıştır
- ham çocuk cevapları parent dashboard ve haftalık rapor pipeline'ına taşınmıştır

---

## 5. Veri Modeli Tasarımı

Yeni tip:

```ts
interface ConversationOpenEndedConfig {
  enabled: boolean;
  strategy: 'favorite_thing' | 'because_reason';
  domain: 'animal' | 'descriptor' | 'free_text';
  slotKey: string;
  nextNodeId: string;
  marksPattern?: string[];
  countCapturedValueAsTargetWord?: boolean;
}
```

İlk iterasyonda desteklenecek stratejiler:

- `favorite_thing`
- `because_reason`

İlk iterasyonda desteklenecek domain'ler:

- `animal`
- `descriptor`

---

## 6. Runtime Kuralları

### 6.1 `favorite_thing`

Sistem şu tür cevapları kabul eder:

- `snake`
- `my favorite animal is a snake`
- `i like snakes`

Çıktı:

- slot `favoriteAnimal = snake`
- çocuk bubble'ında ham metin korunur
- bridge node placeholder ile `A snake! Nice choice.` gibi cevap verir

### 6.2 `because_reason`

Sistem şu tür cevapları kabul eder:

- `because it is scary`
- `it is long`
- `scary`

Çıktı:

- slot `favoriteAnimalReason = scary`
- akış generic praise node'una geçer

### 6.3 Timeout

Timeout davranışı artık şu olmalıdır:

- hint görünür
- repair metni okunabilir
- akış bekler
- otomatik seçim yapılmaz

---

## 7. Senaryo Dönüşüm Stratejisi

İlk örnek senaryo: `phase1_animals_my_favorite_animal`

Yapılacaklar:

- `n1` yalnızca `lion/rabbit/bird` branch olmak yerine açık uçlu hayvan kabul edecek
- yeni generic acknowledgement node eklenecek
- `n3` tekrar favorite animal kalıbını açık uçlu kabul edecek
- `n5` reason turu açık uçlu descriptor kabul edecek

Bu senaryo referans implementation olacak.

Sonraki migration adayları:

1. `myFavoriteColorAndAnimal`
2. `healthyOrYummy`
3. `whoIsYourHero`

---

## 8. Test Planı

Eklenmesi gereken testler:

1. Open-ended parser `snake` değerini favorite animal olarak çıkarır.
2. Open-ended parser `because it is scary` içinden `scary` çıkarır.
3. Activity `snake` cevabını kabul edip generic branch'e ilerler.
4. Timeout sonrası ilk seçenek otomatik seçilmez.
5. Ham çocuk cevabı kanonik cevapla overwrite edilmez.

---

## 9. Done Kriterleri

İlk iterasyon tamamlanmış sayılmak için:

- plan dokümanı repoda bulunmalı
- veri modeli open-ended fallback taşımalı
- activity runtime fallback parse çalıştırmalı
- timeout auto-select kaldırılmış olmalı
- `My Favorite Animal` senaryosunda `snake` kabul edilmeli
- ilgili Vitest testleri geçmeli

---

## 10. Sonraki Adım

İlk iterasyon sonrası hedef, bu open-ended omurgayı `open_ended` mode ile LLM veya rubric tabanlı üretime açmaktır.

Bu geçişte korunacak prensip:

- çocuk güvenliği önce gelir
- pedagojik hedef branch'ten daha önemlidir
- konuşma doğal olabilir ama ölçülebilir kalmalıdır
