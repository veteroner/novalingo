# Google Play — Telefon ekran görüntüleri ve grafik brief’i

Android yayın adayından dikey **1080 × 1920** (9:16) alfa kanalsız 24 bit PNG veya JPEG alın. Üst başlık görselin %20’sini aşmasın. İlk dört kareyi öğrenme akışına ayırın; 5 ve 6 ürün farkını gösteren ek karelerdir. TR ve EN için ayrı set çekin; ekran ve üst başlık aynı dilde olsun. Demo çocuk profili ve örnek ilerleme kullanın; gerçek çocuk adı, e-posta, bildirim veya sipariş bilgisi görünmesin.

| Sıra | Rota ve çekim | Başlık (TR / EN) | Plus kilidi |
| --- | --- | --- | --- |
| 1 | `/home` — Nova ve ilk dünya. İlk bakışta öğrenme yolunu gösterin. | Nova ile İngilizce / English with Nova | Ücretsiz hesapta ileriki dünya kartları görünürse Plus kilidi olabilir. İlk dünyaya odaklanın; kilit görünüyorsa etiketi koruyun. |
| 2 | `/world/w1` — Başlangıç dünyasının ders yolu ve açık ders durağı. | Renkli öğrenme dünyaları / Colourful learning worlds | İlk dünyada Plus kilidi beklenmez. Sırayla açılan ders kilitlerini Plus diye etiketlemeyin; diğer dünya sekmelerini kadrajda kontrol edin. |
| 3 | `/lesson/w1_u1_l1` — Başlangıç ekranı yerine ilk dersin resimli dinleme veya eşleştirme adımını yakalayın. | Dinleme ve eşleştirme / Listening and matching | İlk ücretsiz derste Plus kilidi beklenmez; günlük kota dolmamış bir profil kullanın. |
| 4 | `/stories/story-w1-farm-visit` — Kütüphaneden (`/stories`) açılan resimli hikâyenin iç sayfası. | Resimli İngilizce hikâyeler / Illustrated English stories | Seçilen başlangıç hikâyesinde Plus kilidi beklenmez. |
| 5 | `/parent` — Ebeveyn kapısından sonra ücretsiz özet; kilitli ayrıntılı rapor kartı görünüyorsa kadrajda tutun. | İlerleme bir bakışta / Progress at a glance | **Evet:** ayrıntılı rapor Plus. Temel özet ücretsiz. Alternatif olarak Plus hesapla ayrıntılı rapor çekilirse görseli “NovaLingo Plus” diye etiketleyin. |
| 6 | `/world/w5` — İlerleme şartı tamamlanmış ücretsiz bir profilde Plus erişim çağrısı; ödeme ekranını açmayın. | Plus ile 12 dünyanın tamamı / All 12 worlds with Plus | **Evet:** bu Plus erişim karesi. İlerleme kilidi Plus kartını gölgeliyorsa test profilini ilerletin veya kareyi çıkarın. |

Rota kaynağı: [Router.tsx](../../src/app/Router.tsx); örnek kimlikler: [müfredat](../../src/features/learning/data/curriculum.ts), [hikâye bankası](../../src/features/learning/data/storyBank.ts). Kilit kaynakları: [Home](../../src/features/home/screens/HomeScreen.tsx), [World Map](../../src/features/home/screens/WorldMapScreen.tsx), [Parent Dashboard](../../src/features/parent/screens/ParentDashboard.tsx).

**DOĞRULANMALI:** Son Android sürümünde iki dilde rotaları, görünür kilit ve buton metinlerini, demo hesabın erişimini ve ekran kırpımlarını kontrol edin. İlk dört karede temel kullanım görünsün. Bir görsel ücretli bir özelliği gösteriyorsa Plus etiketini mağaza görselinde okunur bırakın.

## Mağaza ikonu — 512 × 512

Repo adayı: [public/icon-512x512.png](../../public/icon-512x512.png). Onaylı Nova yüzünü ortada, küçük boyutta okunur ve çevresinde boşlukla kullanın. Rozet, fiyat, reklam ibaresi veya ayrı bir Plus kilidi eklemeyin. Önceden köşe yuvarlatmayın veya mağaza gölgesi eklemeyin. Teslim: **512 × 512, alfa kanallı 32 bit PNG, en çok 1024 KB**. **DOĞRULANMALI:** Repo adayı 512 × 512 ama alfa kanalı yok; doğrudan yüklemek yerine alfa kanallı PNG olarak dışa aktarın ve dosya boyutuyla Play önizlemesini kontrol edin.

## Feature graphic — 1024 × 500

Nova’yı ve birkaç tematik öğrenme dünyasını tek sahnede gösterin: ortada Nova, arka planda renkli bir öğrenme yolu ve kitap/kelime kartı gibi küçük ipuçları. Ana öğeleri merkezde bırakın; farklı Play yerleşimlerinde kenarlar kesilebilir. Metin kullanılacaksa yalnızca kısa marka adı veya yerelleştirilmiş öğrenme mesajı; fiyat, promosyon, sıralama veya mağaza rozeti koymayın. Teslim: **1024 × 500, JPEG veya alfa kanalsız 24 bit PNG**.

Resmî teknik şartlar: [Play Console görsel öğeleri](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en).
