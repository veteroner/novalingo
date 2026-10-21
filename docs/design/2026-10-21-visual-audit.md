# NovaLingo görsel inceleme ve Nova v2 yönü

Tarih: 21 Ekim 2026. Tasarım değerlendirmesi; ürün kodunda veya canlı yayında değişiklik yapılmadı.

## Karar önerisi

Nova yeniden tasarlanmalı. Hedef, ayakları yere basan, bakışları ve yüz ifadeleri olan, kendi siluetiyle tanınabilen bir baykuş. Yalnızca daha ayrıntılı bir model eklemek yeterli değil: karakter, arayüz, hikâye çizimleri, ikonlar ve hareket dili birlikte yenilenmeli.

Önerilen üretim yöntemi: **tek 3D ana model → aynı modelden tutarlı pozlar ve kısa animasyonlar → uygulamada hafif görseller/animasyonlar**. Gerçek zamanlı 3D önce yalnızca Nova'nın kendi ekranında denenmeli; bütün ekranlara sürekli çalışan 3D sahne eklenmemeli. Bu bir mimari öneri; performans ölçümü yapılmadı.

Konsept: [Nova v2 görsel yönü](nova-v2-direction.png). Görsel, ImageGen ile üretilmiş bir tasarım araştırmasıdır. Uygulanmış ekran, kullanılabilir GLB modeli veya tamamlanmış animasyon değildir. Konseptteki ayrıntılı tüyler ve arka planlar, mobil üretim varlıklarında sadeleştirilmeli; okuma/cevap alanları sakin yüzeylerde kalmalı.

## İncelemenin kapsamı ve güven düzeyi

- Canlı üretim kaynağı referansı: `1b4a9b2ca4c988445d0c20e8f0ec9cd5cb8f036f` — PR #18'in birleştiği commit.
- NovaStageAvatar, NovaCompanion, HomeScreen, ConversationActivity, globals.css, Button, theme.ts, ThemeProvider, Navigation, LessonCard, OnboardingScreen, StoryTimeActivity ve WorldMapScreen bu commit üzerinden ayrıca okundu.
- Yerel çalışma alanı üretim commit'inden farklı ve bazı dosyalarda çözülmemiş birleştirme işaretleri var. Mevcut çalışmaya dokunulmadı. Özellikle yereldeki büyük konuşma karakteri/ağız katmanı, üretimdeki kompakt sohbet avatarıyla karıştırılmadı.
- Canlı başlangıçtaki yaş ekranı açıldı. Kullanıcı hesabıyla giriş yapılmadı; korunan bütün ekranların cihaz üzerinde gezildiği iddia edilmiyor.
- Üç hikâye JPG'si görsel olarak incelendi ve canlı sitedeki dosyalarla SHA-256 karşılaştırmasında aynı oldukları doğrulandı. Depoda 217 hikâye JPG'si var; 217'sinin tamamı görsel olarak denetlenmedi.
- Renk kontrastları tanımlı sabit renkler üzerinden hesaplandı. Gerçek cihaz performansı, çocuk kullanılabilirliği ve bütün tema/durum kombinasyonları bu incelemede test edilmedi.

## Öncelikli bulgular

| Öncelik | Bulgu ve kanıt | Kullanıcıya etkisi | Tasarım kararı |
|---|---|---|---|
| P1 | NovaStageAvatar ayrı SVG çizimleri, NovaCompanion ayrı Lottie dosyaları, giriş/sohbet ayrı sabit SVG kullanıyor. | Nova'nın yüzü, oranları ve davranışı ekranlar arasında tutarlı yönetilemiyor. | Tek karakter kaynağı; aynı yüz, palet, oran ve ifade sözlüğü. |
| P1 | HomeScreen dış sarmalayıcıda 3 saniyelik yukarı-aşağı hareket var; iç NovaStageAvatar ayrıca 2,5 saniyelik yükselme ve dönme uyguluyor. | Karakter amaçsız biçimde yüzüyor; hareket karakterin eklemlerinden gelmiyor. | Sabit temas noktası ve gölge; küçük nefes, göz kırpma, bakış ve baş hareketi. |
| P1 | `Button.secondary` sarı `#FDCB6E` üzerinde beyaz yazı kullanıyor. | Hesaplanan kontrast 1,51:1; kısa eylem metinleri bile zayıf okunuyor. | Sarı/mint yüzeylerde koyu metin. Beyaz metni yeterince koyu ana eylem rengine ayır. |
| P1 | İncelenen dans, mutluluk ve laboratuvar hikâye görselleri karakter/sahne yerine büyük kelimeler ve altyazı içeren kartlar. | Çocuk, anlatılan olayı resimden takip edemiyor. Görsele gömülü metin küçültülüp kırpılabiliyor. | Metinsiz sahne illüstrasyonları; metin gerçek arayüz metni olarak ayrı gösterilsin. |
| P1 | Tema semantiği sıkça atlanıyor: ana buton `bg-primary` yerine sabit `bg-nova-blue`; gezinme çubuğu beyaz, kartlarda sabit pastel renkler var. | Yaş teması ve koyu mod ekranın bütününü tutarlı değiştiremiyor. | Bileşenleri semantic renk tokenlarına bağla; marka renklerini sınırlı vurgu olarak kullan. |
| P2 | `background-primary`, `text-primary`, `nova-sky` renkleri için kullanım var, ancak globals.css `@theme` içinde karşılıkları yok. Başlıklar `font-heading`, tanım ise `--font-display`. | Bazı sınıflar amaçlanan arka planı/başlık fontunu üretmeyebilir; görünüm miras alınan stillere bağlı kalır. | Token adlarını ve tüketen sınıfları eşleştir; üretilen CSS/hesaplanan stillerle doğrula. |
| P2 | NovaCompanion'da sleeping ve encouraging aynı happy animasyonunu farklı hızlarda kullanıyor. | Hız değişimi gerçek duygu ve niyet oluşturmuyor. | Durum başına ayrı poz/ifade; tek bir hareket durum makinesi. |
| P2 | Üretimde sohbet karakteri 56px resim, 64px kapsayıcı ve renkli parıltıyla sunuluyor. | Sohbet okuması için kompakt yapı iyi; karakter bağı çoğunlukla parıltıya bırakılıyor. | Kompakt sohbet avatarını koru; başlangıç/geri bildirim anlarında daha büyük ifade göster. Büyük karakter metni aşağı itmesin. |
| P2 | Ana ekran, benzer ağırlıkta aksiyon kartları ve birçok emoji kullanıyor; ders devamı bu kartlardan biri. | Bir sonraki yapılacak iş görsel olarak baskın değil. | Bir ana eylem: Derse devam et. Altında en fazla iki ikincil öneri; diğerleri ilgili sekmede. |
| P2 | Dünya haritası ders node'larını sağa/sola kaydırıyor; arada bir rota çizgisi veya sahne katmanı yok. | Öğrenme yolculuğu, dünya hissinden çok tekrarlanan buton listesi gibi kalıyor. | Bölüm bazında küçük illüstrasyonlar, sade rota bağlantıları, belirgin mevcut ders. |
| P2 | Gezinme ve ders türlerinde sistem emojileri kullanılıyor. | iOS/Android arasında farklı biçimler; ikonlar, çizimler ve maskot aynı görsel aileye ait görünmüyor. | Tek ikon sistemi; sık kullanılan ödüller için küçük özgün varlık seti. |

### Kontrast ölçümleri

| Yüzey | Üstündeki yazı | Oran |
|---|---|---:|
| Nova moru `#6C5CE7` | Beyaz | 4,86:1 |
| Nova sarısı `#FDCB6E` | Beyaz | 1,51:1 |
| Cubs success `#6BCB77` | Beyaz | 2,01:1 |
| Stars success `#00B894` | Beyaz | 2,54:1 |

Bunlar renk çiftlerinin ölçümleri; her rengin bütün ekranlarda bu metinle kullanıldığı anlamına gelmez. İlk üç çift ortak Button varyantlarıyla doğrudan ilgili. Yeni sistemde küçük normal metin için en az 4,5:1 tasarım kabul hedefi kullanılmalı.

## Korunacak güçlü taraflar

- Yaşa göre tema yapısı, ortak atom/molekül bileşenleri ve kendinde barındırılan fontlar iyi bir başlangıç.
- Nova'nın evrim aşamaları ürünün karakter bağı kurması için değerli. Kimliğini tamamen değiştiren renk geçişleri yerine aynı yüz/siluet, yeni aksesuarlar ve becerilerle ilerleme öneriliyor.
- İşletim sisteminin hareketi azalt tercihi için CSS ve MotionConfig desteği mevcut. Lottie'nin bağımsız loop/autoplay davranışı ayrıca bu tercihe bağlanmalı.
- Sohbetin üretimdeki metin odaklı düzeni korunmalı. Karakter duyguyu güçlendirmeli, öğrenme içeriğinin yerini almamalı.

## Yeni görsel dil

**Karakter:** gece mavisi/indigo tüyler; krem yüz diskleri ve göğüs; küçük amber gaga ve ayaklar; belirgin iki kulak tüyü; katmanlı ama az sayıda kanat tüyü. Göz kapakları, göz yönü, gaga ve boyun ayrı kontrol edilebilir. Normal durumda kep yok; kep bir kutlama/ödül aksesuarı olabilir. Ayaklar zeminde ya da dalda; temas gölgesi tutarlı.

**Dünya:** sıcak, güven veren keşif ortamı. Orman, kasaba, uzay ve bilim dünyaları aynı ışık, malzeme ve illüstrasyon kurallarını paylaşır. Her ekranda tam sahne kullanmak yerine sahneler giriş, dünya başlığı ve özel karakter anlarında yoğunlaşır.

**Renk rolleri:**

- `#5145C8`: ana eylem ve seçili durum.
- `#48B9A0`: destekleyici vurgu; üzerinde koyu metin/ikon.
- `#F2BC55`: ödül ve yıldız; üzerinde koyu metin.
- `#F8F5EF`: sakin ana zemin.
- `#25314C`: ana metin.

Bunlar konsept paleti; bütün metin boyutları, durumlar ve koyu mod için ayrıca kontrol edilmeden üretim tokenı sayılmaz. Yaş gruplarında marka kimliği sabit kalsın; küçük çocuklarda daha büyük hedefler ve daha az seçenek, büyüklerde daha kısa metin ve daha yoğun içerik kullanılsın.

**Tipografi:** Nunito gövde için korunabilir. Baloo 2 yalnızca başlık ve kısa neşeli ifadelerde. Küçük etiketlerde tümü büyük harf ve 10px yazı azaltılmalı. Başlık fontunun tanımlı tokenla gerçekten uygulanması sağlanmalı.

**Hareket:**

| Durum | Nova davranışı | Tetikleyici / sınır |
|---|---|---|
| Bekleme | Küçük göğüs nefesi, aralıklı göz kırpma; ayaklar sabit | Sürekli tüm gövdeyi sallama yok |
| Dinleme | Hafif baş eğimi, kullanıcıya bakış | Mikrofon gerçekten kayıt yaparken |
| Düşünme | Bakış yukarı/yan tarafa, kısa baş hareketi | Değerlendirme beklerken |
| Konuşma | Sesle uyumlu küçük gaga hareketi | TTS başlar/durur olayları; mümkünse ses zarfı |
| Başarı | Kısa kanat kaldırma ve tek küçük sıçrama | Yaklaşık bir saniye, ardından sakin poz |
| Yeniden deneme | Sıcak ve cesaret veren bakış, küçük baş onayı | Yanlış cevap; utandıran/korkutan tepki yok |
| Evrim | Kısa özel dönüşüm ve ödül gösterimi | Kullanıcı geçebilmeli; ders başlatmayı bloke etmemeli |

## Meshy kararı

Meshy, referans görselden ilk model üretmek için uygun aday. Kimliği kilitlemek için Image to 3D tercih edilmeli; serbest metinden her seferinde farklı baykuş üretmekten kaçınılmalı. Görsel konsept panosunun tamamı Meshy girdisi olmamalı: tek karakter, sade arka plan ve tutarlı ön/yan/arka referanslar hazırlanmalı.

Güncel resmi belgelerde humanoid, quadruped ve Smart Rig (Beta) ayrımı var. **Smart Rig ile iskeletlenen modellerin hazır animasyon kütüphanesiyle şu anda desteklenmediği açıkça yazıyor.** Baykuşu üretince konuşma, göz kırpma ve kanat animasyonlarının kendiliğinden hazır geleceği varsayılmamalı. Kısa uzuvlu baykuş için özel yüz/kanat kontrolleri ve gerekirse Blender'da düzeltme planlanmalı.

Üretim akışı: karakter referansı → Meshy temel model → topoloji/malzeme temizliği → yüz/kanat iskeleti → özel hareketler → GLB ve aynı modelden render çıktıları. Ayrıntılar [Meshy üretim brifinde](nova-v2-meshy-brief.md).

Resmi kaynaklar, 21 Ekim 2026'da kontrol edildi:

- [Meshy Image to 3D](https://docs.meshy.ai/en/webapp/image-to-3d)
- [Meshy Auto Rigging / Smart Rig sınırları](https://help.meshy.ai/en/articles/16231707-how-to-create-3d-animation-with-auto-rigging)
- [Meshy planlar ve dışa aktarma biçimleri](https://www.meshy.ai/pricing/)

Bu incelemede Meshy modeli üretilmedi, satın alınmadı veya kredi kullanılmadı. Mevcut Meshy hesabına erişim ve kalan kredi kontrol edilmedi.

## Uygulama sırası

1. **Karakter prototipi:** aynı Nova'nın nötr, dinleyen, konuşan ve kutlayan halleri. Önce küçük sohbet boyutunda ve büyük karakter görünümünde okunabilirliğini değerlendir.
2. **Ortak tasarım sistemi:** renk/font tokenları, kontrast, buton gölgeleri, yüzeyler ve tek ikon ailesi. Aynı işlev her temada aynı şekilde anlaşılmalı.
3. **Ana ekran + sohbet pilotu:** bir ana eylem; Nova için belirli alan; sohbet metni ve mikrofonun önceliği. Görsel yönü bu iki ekranda test et.
4. **Harita + hikâyeler:** dünya sahneleri ve bağlantılı yol. Önce bir tam hikâyenin bütün sayfalarını tutarlı çiz; sonrasında kalan kataloğa uygula.
5. **Sonuç, profil, evrim ve mağaza:** aynı karakter kaynağından varlıklar. Ebeveyn ekranlarında daha sakin ve bilgi odaklı düzen.
6. **Cihaz doğrulaması:** iOS/Android küçük ekran, düşük donanım, çevrimdışı açılış, hareketi azalt, açık/koyu tema ve okunabilirlik.

Kabul hedefleri: ana içerik 3D yüklenmesini beklemeyecek; karakter kontrolleri örtmeyecek; ekran görünür değilken animasyon duracak; kısa efektler anlamlı olaylardan tetiklenecek; okunabilirlik ölçülecek. Gerçek zamanlı 3D için 30/60fps ve bellek hedefi desteklenen cihazlarda ölçümle belirlenecek. Hazır performans kazancı veya kesin model boyutu vaat edilmiyor.

## Temel kaynak yolları

- `src/components/molecules/NovaStageAvatar/NovaStageAvatar.tsx`
- `src/components/organisms/NovaCompanion/NovaCompanion.tsx`
- `src/features/home/screens/HomeScreen.tsx`
- `src/features/learning/components/activities/ConversationActivity.tsx`
- `src/features/learning/components/activities/StoryTimeActivity.tsx`
- `src/features/home/screens/WorldMapScreen.tsx`
- `src/components/organisms/LessonCard/LessonCard.tsx`
- `src/components/organisms/Navigation/Navigation.tsx`
- `src/components/atoms/Button/Button.tsx`
- `src/components/atoms/Text/Text.tsx`
- `src/config/theme.ts`, `src/styles/globals.css`, `src/app/providers/ThemeProvider.tsx`

Görsel üretim yöntemi: yerleşik ImageGen; üretim istemi [nova-v2-imagegen-prompt.txt](nova-v2-imagegen-prompt.txt). Yukarıdaki kaynak doğrulaması, konsept ekranların gerçek uygulamada çalıştığı anlamına gelmez.
