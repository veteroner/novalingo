# Nova ile Konuş İçerik Planı

> Amaç: "Nova ile Konuş" deneyimini kısa ve tek kullanımlık senaryolardan çıkarıp, çocuk için tekrar oynanabilir, seviye bazlı, güvenli, ölçülebilir ve yüksek çeşitliliğe sahip bir konuşma ürününe dönüştürmek.
> Durum: Çalışma planı
> Tarih: 22 Mart 2026

---

## 1. Ürün Vizyonu

"Nova ile Konuş", çocukların İngilizceyi sadece kelime ezberleyerek değil, bağlam içinde kullanarak öğrendiği özel bir konuşma alanı olmalı.

Bu modun farkı şu olmalı:

- Çocuk burada sadece cevap vermez, mini bir dünya içinde rol yapar.
- Nova sadece soru soran bot gibi davranmaz, ilişki kuran bir öğrenme partneri olur.
- Her oturum çocuğa konuşma cesareti, kelime pekiştirme, cümle kalıbı ve dinleme pratiği birlikte verir.
- Aynı kelime listesi bile farklı bağlamlarda yeniden kullanılabildiği için tekrar sıkıcı hissettirmez.

Uzun vadede bu alan NovaLingo’nun en ayırt edici özelliği olmalı. Kullanıcı "bir ders daha" diye değil, "Nova ile biraz daha konuşayım" diye geri dönmeli.

---

## 2. Mevcut Durum Özeti

Bugünkü sistemin güçlü tarafları:

- Serbest metin girişi ve mikrofon altyapısı var.
- Şablon bazlı konuşma akışı var.
- Kelime listesine göre tema seçebilen template mantığı var.
- Nova tarafı TTS ile konuşabiliyor.

Bugünkü sistemin zayıf tarafları:

- Senaryolar çok kısa; 3 tur civarında bitiyor.
- İçerik derinliği düşük; bir sahnenin varyasyonu az.
- Duygusal bağ ve karakter ilişkisi zayıf.
- Konuşma hedefi net tanımlanmıyor: kelime mi, yapı mı, özgüven mi, dinleme mi?
- Yaş/level farkı içerikte yeterince görünmüyor.
- Başarı ölçümü şu an daha çok doğru eşleme mantığında kalıyor.
- Çocuk yanlış veya eksik konuştuğunda toparlayıcı, öğretici, yönlendirici cevap çeşitliliği az.

Bu planın ana hedefi, konuşma deneyimini "aktivite" olmaktan çıkarıp "ürün sütunu" haline getirmek.

---

## 3. Başarı Tanımı

"Nova ile Konuş" başarılı sayılmalıysa şu çıktıları üretmeli:

- Çocuk günde tekrar tekrar bu moda girmek istemeli.
- Aynı oturum hissi vermemeli; içerik varyasyonu yüksek olmalı.
- Her konuşma sonunda çocuk en az bir yeni kalıp veya kelimeyi kullanmış olmalı.
- Düşük seviyedeki çocuk korkmadan cevap verebilmeli.
- Daha ileri seviyedeki çocuk tek kelimeden tam cümleye taşınmalı.
- Ebeveyn tarafında "çocuğum gerçekten konuşma pratiği yapıyor" hissi oluşmalı.

Temel başarı metrikleri:

- Günlük konuşma modu başlatma sayısı
- Konuşma tamamlama oranı
- Ortalama oturum süresi
- Oturum başına çocuk tarafından üretilen cevap sayısı
- Mikrofon kullanım oranı
- Tekrar giriş oranı (aynı gün, aynı hafta)
- Hedef kelime kullanım oranı
- Yardım kartı gösterildikten sonra başarı oranı
- İlk cevapta doğru anlaşılma oranı
- Çocuk başına haftalık benzersiz konuşma senaryosu sayısı

---

## 4. Tasarım İlkeleri

İçerik üretiminde aşağıdaki kurallar sabit olmalı:

### 4.1 Çocuk Merkezli

- Her konuşma 4-12 yaş arası çocuğun bilişsel seviyesine uygun olmalı.
- Kısa cümle, temiz hedef, tek seferde tek görev mantığı korunmalı.
- Çocuk başarısız hissetmemeli; yanlış cevaplar öğrenme fırsatına çevrilmeli.

### 4.2 Konuşma Hissi Gerçek Olmalı

- Sadece soru-cevap değil, tepki, duygu, şaşırma, kutlama, seçim, öneri, karar verme gibi akışlar olmalı.
- Nova her zaman aynı tonda konuşmamalı; sahneye göre enerji seviyesi değişmeli.

### 4.3 Seviye Katmanlılık

- Aynı tema için en az 3 zorluk katmanı olmalı.
- Kolay: tek kelime veya kısa kalıp
- Orta: tam cümle + seçim + neden
- İleri: mini sohbet + iki adımlı cevap + kişisel tercih

### 4.4 Tekrar Oynanabilirlik

- Aynı tema içinde farklı amaçlar olmalı.
- Aynı kelimeler farklı rollerle tekrar kullanılmalı.
- Aynı sahnenin en az 3 varyantı olmalı.

### 4.5 Ölçülebilirlik

- Her senaryoda hedef kelimeler, hedef kalıplar, beklenen cevap tipleri ve başarı kriterleri ayrı tanımlanmalı.

### 4.6 Güvenlik

- Açık uçluluk kontrollü olmalı.
- Nova çocukla konuşurken güvenli, sakin, destekleyici ve yaşa uygun kalmalı.
- Hassas, korkutucu, romantik, uygunsuz, manipülatif veya yoğun duygusal bağımlılık üreten içerik olmamalı.

---

## 5. Pedagojik Çerçeve

Bu mod dört öğrenme hedefini birlikte taşımalı:

### 5.1 Vocabulary Recall

Çocuk gördüğü kelimeyi bağlam içinde kullanır.

Örnek:

- "dog" kelimesini sadece tanımaz, "I want a dog" veya "It is a big dog" şeklinde üretir.

### 5.2 Sentence Pattern Acquisition

Kalıp öğrenimi doğal akış içinde verilir.

Temel kalıplar:

- I want...
- I like...
- It is...
- I see...
- Can I have...?
- My favorite is...
- I am...
- I can...
- Let’s...
- Where is...?

### 5.3 Listening Comprehension

Nova’nın söylediğini anlamak, sadece kelime duymaktan daha önemli.

Bu yüzden içerikte:

- Basit yönerge
- Tek sorulu yanıt
- İki parçalı soru
- Duygu veya tercih sorusu
- Mini görev sorusu

kademeli ilerlemeli.

### 5.4 Speaking Confidence

Çocuk mükemmel telaffuz baskısı yaşamamalı. Sistem şu sırada teşvik etmeli:

- önce dene
- anlaşılırsa kabul et
- eksikse ipucu ver
- yanlışsa öğretici biçimde düzelt
- tekrar söylemeye cesaret ver

---

## 6. Hedef Kullanıcı Segmentleri

### 6.1 4-6 Yaş

İhtiyaçlar:

- Çok kısa tur
- Tek hedef
- Fazla seçim yok
- Duygusal ve oyunlu ton
- Görsel ve emoji desteği güçlü

İçerik yapısı:

- 2-4 tur
- Tek kelime veya kısa kalıp
- Bir sahnede tek görev

### 6.2 7-9 Yaş

İhtiyaçlar:

- Küçük hikaye akışları
- Seçim yapma ve karar verme
- Basit neden-sonuç
- Rol yapma

İçerik yapısı:

- 4-6 tur
- 1-2 hedef kalıp
- Mini problem çözme

### 6.3 10-12 Yaş

İhtiyaçlar:

- Daha gerçekçi sohbet
- Karşılaştırma, tercih, açıklama
- Daha fazla varyasyon
- Görev bazlı konuşma

İçerik yapısı:

- 5-8 tur
- Çok adımlı hedef
- Neden, nasıl, hangisi gibi sorular

---

## 7. İçerik Omurgası

"Nova ile Konuş" içeriği 5 ana sütunda kurgulanmalı:

### 7.1 Günlük Hayat Sohbetleri

Amaç: temel iletişim kalıpları

Örnek temalar:

- Tanışma
- Nasılsın?
- Sabah rutini
- Yemek seçimi
- Oyun zamanı
- Hava durumu
- Kıyafet seçimi
- Okul çantası hazırlama

### 7.2 Rol Yapma Senaryoları

Amaç: konuşmayı görev bazlı hale getirmek

Örnek temalar:

- Pet shop
- Market
- Restaurant
- Oyuncak dükkanı
- Doğum günü partisi
- Doktor ziyareti
- Uzay gemisi görevi
- Hayvanat bahçesi gezisi

### 7.3 Duygu ve Kendini İfade

Amaç: çocuk kendi tercih ve duygusunu söyleyebilsin

Örnek temalar:

- I am happy/sad/excited
- My favorite animal is...
- I like blue because...
- I want to play...
- Today I feel...

### 7.4 Mini Görevli Sohbetler

Amaç: sadece cevap değil, hedefe giden konuşma akışı kurmak

Örnek temalar:

- Kayıp eşyayı bul
- Çantayı hazırla
- Nova’ya doğum günü hediyesi seç
- Piknik sepetini doldur
- Evcil hayvana isim seç
- Renkli parçaları topla

### 7.5 Hikaye Tabanlı Konuşmalar

Amaç: devam eden ilişki ve merak yaratmak

Örnek temalar:

- Nova’nın ilk pikniği
- Nova yağmurda ne yapacak?
- Nova yeni arkadaş arıyor
- Nova küçük bir görevde yardım istiyor
- Nova uzaya gidiyor

---

## 8. İçerik Katmanları

Her konuşma içeriği tek dosya gibi düşünülmemeli. Aşağıdaki katmanlarla tanımlanmalı:

### 8.1 Tema

Örnek: market

### 8.2 Senaryo Amacı

Örnek: meyve seçme

### 8.3 Dil Hedefi

Örnek:

- I want...
- apple, banana, orange
- please / thank you

### 8.4 Etkileşim Tipi

Örnek:

- seçim yapma
- onay verme
- tarif etme
- soru sorma
- yönlendirme izleme

### 8.5 Duygu Tonu

Örnek:

- neşeli
- sakin
- meraklı
- kutlayıcı

### 8.6 Zorluk Düzeyi

Örnek:

- starter
- core
- stretch

### 8.7 Varyant

Aynı akışın en az üç sürümü olmalı:

- kısa sürüm
- oyunlu sürüm
- görevli sürüm

---

## 9. İçerik Formatları

Tek tip konuşma hızla bayatlayacağı için en az 8 format birlikte çalışmalı:

### 9.1 Choice Conversation

Nova iki veya üç olasılık sunar, çocuk konuşarak seçer.

### 9.2 Guided Free Speech

Nova kalıp verir, çocuk doldurur.

Örnek:

- "Say: I like apples."
- sonrasında Nova varyasyon ister

### 9.3 Role Switch

Bir tur Nova müşteri, sonraki tur çocuk müşteri olur.

### 9.4 Repair Conversation

Nova çocuğun eksik cevabını nazikçe onarır.

Örnek:

- Çocuk: "dog"
- Nova: "Great. Say: I want a dog."

### 9.5 Emotion Conversation

Nova bir duygu sorar, çocuk sebebiyle cevap verir.

### 9.6 Mission Conversation

Konuşma sonunda küçük bir görev tamamlanır.

### 9.7 Collection Conversation

Her doğru etkileşim çocuğa bir parça toplatır.

### 9.8 Story Episode Conversation

Birbiriyle bağlantılı küçük bölüm yapısı.

---

## 10. İçerik Aşamaları

İçerik, öğrenme yolculuğunda şu sırayla büyümeli:

### Aşama 1: Tek Kelimeden Kalıba

Hedef:

- Çocuk tek kelime cevaptan 2-4 kelimelik kalıba çıkar.

İçerik örnekleri:

- What is it?
- I see a cat.
- It is red.
- I want juice.

### Aşama 2: Kalıptan Mini Diyaloğa

Hedef:

- 2 turdan 4 tura geçiş

İçerik örnekleri:

- I want a dog.
- Is it big?
- Yes, it is big.
- I like it.

### Aşama 3: Mini Diyalogdan Göreve

Hedef:

- çocuk seçim yapar, açıklama verir, görevi tamamlar

### Aşama 4: Görevden Kişisel İfade’ye

Hedef:

- "Ben ne seviyorum / ne düşünüyorum / ne istiyorum" düzeyine çıkmak

### Aşama 5: Tekrar Oynanabilir Hikaye Yapısı

Hedef:

- Nova ile devam eden dünya ilişkisi kurmak

---

## 11. İçerik Taksonomisi

Tüm konuşma içerikleri aşağıdaki taksonomi ile etiketlenmeli:

- `theme`: animals, food, colors, toys, family, weather, school, home, body, clothes, emotions, places, travel, nature, fantasy, space, holidays
- `goal`: identify, choose, request, describe, compare, answer, ask, guide, react, solve, express_feeling
- `pattern`: i_want, i_like, it_is, can_i_have, where_is, my_favorite, i_can, lets_go, i_feel
- `difficulty`: starter, core, stretch
- `age_band`: 4_6, 7_9, 10_12
- `session_length`: short, medium, long
- `energy`: calm, playful, exciting
- `mode`: guided, semi_open, mission, story
- `repeatability`: low, medium, high
- `reward_hook`: sticker, star, item, praise, unlock

Bu yapı ileride içerik seçimi, öneri motoru ve analitik için kritik olur.

---

## 12. Önerilen İçerik Kümeleri

İlk büyük sürüm için 12 ana içerik kümesi öneriyorum.

### 12.1 Animals & Pets

Alt senaryolar:

- Pet shop seçim
- Hayvanı tarif et
- Evcil hayvan ismi koy
- Hayvanı besle
- Hayvanat bahçesi gezisi

Dil hedefleri:

- I want...
- It is big/small
- It can...
- I like...

### 12.2 Food & Drinks

Alt senaryolar:

- Restaurant sipariş
- Piknik hazırlığı
- Atıştırmalık seçimi
- Sağlıklı/sağlıksız seçim
- Nova’ya yemek hazırla

### 12.3 Colors & Shapes

Alt senaryolar:

- Renkli oyuncak seç
- Odayı boya
- Kayıp renkli nesneyi bul
- Şekil kutusunu doldur

### 12.4 Family & Friends

Alt senaryolar:

- Aile tanıtımı
- Arkadaş seçimi
- Doğum günü daveti
- Kiminle oynayalım?

### 12.5 Clothes & Weather

Alt senaryolar:

- Hava durumuna göre kıyafet seç
- Yağmur günü planı
- Kış gezisi hazırlığı

### 12.6 Home & Daily Routine

Alt senaryolar:

- Oda toplama
- Sabah hazırlığı
- Yatma zamanı
- Çanta hazırlama

### 12.7 School & Learning

Alt senaryolar:

- Sınıf eşyaları
- Öğretmene cevap ver
- Sıra çantası oyunu
- Hangi ders zamanı?

### 12.8 Toys & Play

Alt senaryolar:

- Oyuncak mağazası
- Bir oyun kur
- Takım seç
- Saklambaç görevi

### 12.9 Emotions & Preferences

Alt senaryolar:

- Nasıl hissediyorsun?
- Favorini seç
- Neden sevdin?
- Bugün ne yapmak istersin?

### 12.10 Nature & Outdoors

Alt senaryolar:

- Piknik
- Park gezisi
- Bahçe keşfi
- Mevsim gözlemi

### 12.11 Fantasy & Adventure

Alt senaryolar:

- Korsan adası
- Uzay görevi
- Dinozor parkı
- Sihirli orman

### 12.12 Social Situations

Alt senaryolar:

- Selamlaşma
- Yardım isteme
- Teşekkür etme
- Özür dileme
- Sıra isteme

---

## 13. Seviye Bazlı İçerik Matrisi

### Level A: Starter Speech

Hedef:

- tek kelime + basit kalıp

İçerik örnekleri:

- I want a cat.
- It is blue.
- I like cake.
- Hello, Nova.

Yapısal kurallar:

- 2-4 tur
- 1 ana hedef kalıp
- en fazla 3 hedef kelime
- Nova daha yavaş ve net konuşur

### Level B: Core Speech

Hedef:

- tercih + nitelik + kısa neden

İçerik örnekleri:

- I want the red ball.
- It is big and fun.
- I like apples because they are sweet.

Yapısal kurallar:

- 4-6 tur
- 2 kalıp
- 3-5 hedef kelime
- bir mini görev

### Level C: Stretch Speech

Hedef:

- iki parçalı yanıt ve esnek konuşma

İçerik örnekleri:

- I want the blue kite because it is beautiful.
- I feel happy because we can play outside.

Yapısal kurallar:

- 5-8 tur
- karar + açıklama + tepki
- 5+ hedef kelime

---

## 14. Oturum Yapı Şablonları

Her konuşma tek formatta olmamalı. Aşağıdaki oturum şablonları sistematik kullanılmalı:

### Şablon 1: Warm-up + Choice + Celebrate

- Nova selam verir
- konu kurar
- çocuk seçim yapar
- Nova kutlar

### Şablon 2: Ask + Describe + Confirm

- Nova sorar
- çocuk nesneyi tarif eder
- Nova doğru anlayıp tekrar eder

### Şablon 3: Mission + Hint + Success

- Nova görev verir
- çocuk cevapta zorlanırsa ipucu gelir
- görev tamamlanır

### Şablon 4: Mistake + Repair + Retry

- çocuk eksik cevap verir
- Nova nazikçe modeli gösterir
- çocuk tekrar dener

### Şablon 5: Roleplay + Switch Roles

- önce Nova müşteri
- sonra çocuk müşteri
- rol değişimi oyunsu his verir

### Şablon 6: Story Beat Conversation

- küçük bir olay olur
- çocuk karar verir
- Nova hikayeyi buna göre sürdürür

---

## 15. İçerik Varyasyon Kuralları

Bir senaryonun farklı hissedebilmesi için şu varyasyonlar planlanmalı:

### 15.1 Dilsel Varyasyon

- I want...
- Can I have...
- I would like...

### 15.2 Duygusal Varyasyon

- heyecanlı Nova
- yardım isteyen Nova
- kutlayan Nova
- şaşıran Nova

### 15.3 Görev Varyasyonu

- seç
- bul
- tarif et
- karşılaştır
- tamamla

### 15.4 Sonuç Varyasyonu

- övgü
- küçük ödül
- koleksiyon parçası
- hikaye ilerlemesi

### 15.5 Giriş Varyasyonu

- direkt soru
- sahne kurma
- sürpriz olay
- kısa görev anonsu

Hedef: Aynı tema altında minimum 6 konuşma varyantı.

---

## 16. Yanıt Değerlendirme Stratejisi

İçerik planı sadece yazılacak cümleleri değil, değerlendirme mantığını da tanımlamalı.

Her tur için şu alanlar içerikte ayrı tutulmalı:

- tam hedef cevap
- kabul edilebilir kısa cevaplar
- kabul edilebilir tek kelime cevaplar
- öğretici düzeltme metni
- başarısızlık sonrası ipucu
- ikinci deneme metni

Örnek:

- hedef: `I want a dog.`
- kısa kabul: `a dog`, `dog`, `want dog`
- düzeltme: `Great choice. Say: I want a dog.`
- ipucu: `Try starting with: I want...`

Bu yapı sayesinde sistem daha doğal ve daha affedici olur.

---

## 17. Nova Karakter Rehberi

Nova’nın ses tonu ve kişiliği içerikte tutarlı olmalı.

Nova:

- sıcak
- sabırlı
- aşırı konuşmayan
- öven ama yapay olmayan
- çocukla yarışmayan
- korkutmayan
- öğretirken küçük adım kullanan

Nova asla:

- utandıran
- suçlayan
- pasif agresif
- fazla karmaşık
- çok uzun açıklama yapan
- yetişkin dili kullanan

Önerilen Nova tepki havuzu:

- `Nice try!`
- `Great job!`
- `Let’s say it together.`
- `Almost! Try this:`
- `You did it!`
- `That was a smart answer.`
- `Let’s do one more.`

---

## 18. İçerik Uzunluğu Standartları

Her oturum için hedef süre belirlenmeli:

- kısa oturum: 45-75 saniye
- orta oturum: 75-120 saniye
- uzun oturum: 2-4 dakika

Her tur için Nova konuşma uzunluğu:

- starter: 3-7 kelime
- core: 5-10 kelime
- stretch: 7-14 kelime

Çocuktan beklenen cevap uzunluğu:

- starter: 1-4 kelime
- core: 3-7 kelime
- stretch: 5-12 kelime

---

## 19. Ödül ve Motivasyon Planı

Konuşma modu kendi iç motivasyon döngüsüne sahip olmalı.

### 19.1 Mikro Ödüller

- her başarılı tur sonrası sıcak geri bildirim
- mini parıltı veya ses efekti
- küçük yıldız parçacığı

### 19.2 Oturum Sonu Ödülleri

- sohbet rozeti
- konuşma zinciri sayacı
- günlük "Nova ile konuştun" tik’i
- tema sticker’ı

### 19.3 Uzun Vadeli Ödüller

- 5 pet konuşması bitir → Pet Friend badge
- 7 gün üst üste konuş → Brave Speaker badge
- 20 görevli sohbet → Mission Helper badge

### 19.4 Koleksiyon Bağlantısı

- konuşma modunda bazı sahneler sticker veya koleksiyon kartı açmalı

---

## 20. Kişiselleştirme Planı

Konuşma modu çocuğa göre uyarlanmalı.

Kişiselleştirme eksenleri:

- yaş
- seviye
- son başarı oranı
- en çok kullandığı temalar
- zorlandığı kalıplar
- favori içerik modu

Örnek davranışlar:

- üst üste başarısızlık varsa daha kısa kalıplara dön
- çocuk mikrofon yerine yazıyorsa daha görünür metin destekleri sun
- hayvan temalarında daha çok zaman geçiriyorsa benzer içerikleri öne çıkar

---

## 21. İçerik Güvenliği ve Moderasyon Çerçevesi

Bu mod çocuk ürünü olduğu için içerik üretimi sıkı kurallarla yapılmalı.

Yasak alanlar:

- korku temalı yoğun sahneler
- kayıp/ölüm gibi ağır duygusal temalar
- romantik imalar
- beden algısı veya utandırma
- rekabetçi aşağılayıcı dil
- yetişkin çatışmaları

Sınır kuralları:

- Nova çocuktan özel kişisel veri istemez
- gerçek dünya konum, iletişim, okul adı gibi bilgi peşine düşmez
- çocuğu yalnızca uygulama içinde güvenli görevlerle yönlendirir

---

## 22. Üretim Pipeline’ı

İçerik üretimini rastgele yapmamak için net pipeline kurulmalı.

### Aşama 1: Tema Tanımı

- tema adı
- yaş bandı
- hedef kelimeler
- hedef kalıplar
- oturum tipi

### Aşama 2: Scenario Brief

- sahne
- hedef davranış
- başarı kriteri
- hata durumları

### Aşama 3: Script Draft

- Nova replikleri
- çocuk hedef cevapları
- varyasyonlar
- ipucu metinleri

### Aşama 4: Pedagojik Review

- yaş uygunluğu
- dil uzunluğu
- kelime seviyesi
- tekrar değeri

### Aşama 5: UX Review

- akış sıkıcı mı?
- çok mu uzun?
- çocuk ne yapacağını anlıyor mu?

### Aşama 6: Data Structuring

- node graph
- accepted variations
- target words
- prompt metadata

### Aşama 7: Playtest

- gerçek çocuk davranışı veya test senaryosu
- mikrofon yanlış algı örnekleri
- yardıma ihtiyaç oranı

---

## 23. İçerik Kalite Rubriği

Her yeni içerik şu 10 maddeyle puanlanmalı:

1. Amaç net mi?
2. Yaş seviyesine uygun mu?
3. Çocuğun üreteceği yanıt gerçekçi mi?
4. Nova doğal mı konuşuyor?
5. En az bir öğretici moment var mı?
6. Hata toparlama akışı var mı?
7. Tekrar oynanabilirlik var mı?
8. Hedef kelime ve kalıp net işleniyor mu?
9. Oturum süresi doğru mu?
10. Eğlence hissi var mı?

8/10 altı içerik üretime alınmamalı.

---

## 24. İlk İçerik Backlog’u

İlk büyük plan için önerilen başlangıç paketi:

### Paket 1: Foundation Pack

20 konuşma

- selamlaşma
- tanışma
- favori renk
- favori hayvan
- ne istersin?
- ne görüyorsun?
- nasılsın?
- hava nasıl?
- hangi oyuncağı seçersin?
- ne yemeyi seversin?

### Paket 2: Daily Life Pack

20 konuşma

- sabah rutini
- kıyafet seçimi
- okul çantası
- odanı toparla
- kahvaltı zamanı

### Paket 3: Roleplay Pack

20 konuşma

- pet shop
- toy shop
- restaurant
- birthday party
- picnic helper

### Paket 4: Mission Pack

20 konuşma

- kayıp nesne bulma
- renk toplama
- eşya hazırlama
- Nova’ya yardım görevi

### Paket 5: Story Pack

12 bölüm

- Nova’nın minik maceraları

Toplam başlangıç hedefi:

- 92 konuşma içeriği
- her biri için en az 2 varyant
- toplam 180+ oynanabilir akış

---

## 25. Faz Planı

### Faz 1: Güçlü Temel

Hedef:

- kısa ama kaliteli 20-30 konuşma
- yüksek başarı oranı
- düzgün hata toparlama

Teslim:

- temel günlük hayat + animals + food + colors

### Faz 2: İçerik Derinliği

Hedef:

- roleplay ve görev bazlı konuşmalar
- yaşa göre varyantlar

### Faz 3: Hikayeleşme

Hedef:

- bağlı bölümler
- Nova ile duygusal bağ ve merak

### Faz 4: Adaptif Motor

Hedef:

- çocuğa göre önerilen konuşmalar
- zorlandığı yapılara dönüş

---

## 26. Teknik İçerik Gereksinimleri

İçerik planı teknik modelle hizalı olmalı. Her konuşma için veri modeli şu bilgileri taşımalı:

- `contentId`
- `theme`
- `subTheme`
- `ageBand`
- `difficulty`
- `sceneEmoji`
- `targetWords`
- `targetPatterns`
- `estimatedDurationSec`
- `completionCriteria`
- `retryStrategy`
- `rewardType`
- `variationSet`
- `nodes`

Her node için:

- `speaker`
- `text`
- `textTr`
- `intent`
- `goalType`
- `acceptableVariations`
- `repairPrompt`
- `hintText`
- `successResponseType`
- `nextNodeId`

Bu alanlar olmadan ileri düzey içerik yönetimi zorlaşır.

---

## 27. Analitik Planı

Her oturumdan şu veriler toplanmalı:

- başlatılan senaryo
- bitirilen senaryo
- toplam tur sayısı
- çocuk cevap sayısı
- mikrofon kullanımı
- manuel yazı kullanımı
- ipucu açılma sayısı
- yanlış anlaşılan cevap sayısı
- ilk denemede geçen tur sayısı
- terk edilen node
- en çok zorlanılan kalıp

Bu metrikler sonraki içerik yatırımını yönetecek.

---

## 28. İçerik Yazım Standartları

Script yazan herkes şu standartlara uymalı:

- kısa cümle
- net hedef
- bir turda bir dil yükü
- çocuk ağzına uygun cevap
- zorunlu durumda model cümle
- tekrar eden ama sıkmayan övgü havuzu
- Türkçe çeviriler doğal ve sade

Kaçınılacak şeyler:

- çok yetişkin İngilizcesi
- yapay, robotik övgüler
- aynı kapanış cümlesi her içerikte tekrar etmesi
- çok uzun Nova monoloğu

---

## 29. Örnek İçerik Blueprint’i

### Blueprint: Pet Friend Starter

- tema: animals
- yaş: 4-6
- zorluk: starter
- hedef kelimeler: dog, cat, fish
- hedef kalıp: I want..., It is...
- süre: 60-90 saniye
- tur sayısı: 4
- duygu tonu: playful
- ödül: pet sticker

Akış:

1. Nova pet shop sahnesini kurar
2. çocuk pet seçer
3. Nova petin özelliğini sorar
4. çocuk cevap verir
5. Nova kutlar ve sticker verir

Varyasyonlar:

- aynı akış rabbit/bird ile
- aynı akış size yerine color sorusuyla
- aynı akış görevli sürüm: “Nova için en iyi pet’i seç”

---

## 30. Önceliklendirme Kararı

Kısa vadede en yüksek yatırım getirisi şu sırada:

1. Animals
2. Food
3. Colors
4. Toys
5. Emotions
6. Daily routines
7. Weather + clothes
8. Roleplay packs
9. Story episodes

Sebep:

- mevcut kelime havuzuyla hızlı örtüşür
- çocuklar için anlaşılır ve somut
- mikrofon değerlendirmesi için uygun kısa cevaplar üretir
- ilk wow etkisini hızlı verir

---

## 31. Bu Planın Somut Çıktıları

Bu plan tamamlandığında elimizde şu işler netleşmiş olmalı:

- kaç tema üretilecek
- her temada kaç senaryo olacak
- hangi yaş grubuna nasıl yazılacak
- her senaryoda hangi kalıp öğretilecek
- hangi node’larda ipucu ve repair akışı olacak
- hangi içerik önce üretilecek
- kalite nasıl ölçülecek
- analitik neyi takip edecek

---

## 32. Hemen Sonraki Adımlar

Bu planı uygulamaya geçirmek için sıradaki dokümanlar önerilir:

1. `Nova ile Konuş Content Schema`
2. `Nova ile Konuş Theme Backlog`
3. `Nova ile Konuş Script Writing Guide`
4. `Nova ile Konuş Phase 1 Scenario List`
5. `Nova ile Konuş UX Flow Spec`

İlk uygulama odağı şu olmalı:

- Faz 1 için 20 yüksek kaliteli konuşma belirlemek
- her konuşma için node-level script brief hazırlamak
- mevcut template sistemini kısa vadede bu backlog’a göre genişletmek
- uzun vadede template sisteminden content-pack sistemine geçmek
