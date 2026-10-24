# Nova Dans Ediyor — beş iç sahne

25 Ekim 2026. Kullanıcının simülatörde gördüğü `DANCE` kartı yükleme hatası değildi: `story-w1-nova-dances` hâlâ eski metinli JPEG yer tutucularına bağlıydı. Önceki çizim çalışması iki tam hikâyeyi kapsamıştı; kütüphane kapakları iç sayfaların tamamlandığı anlamına gelmiyordu.

## Değişiklik

Beş sayfa `/story/dance-v2/page-1.webp` … `page-5.webp` dosyalarına bağlandı. Sırasıyla dansa başlama, kanat kaldırma, ayakları yere vurma, baş eğme ve birlikte dansa davet. Aynı Nova yüzü, renkleri, ahşap sahne, turkuaz müzik çalar ve orman ortamı referansla korundu. Görsellere metin gömülmedi. Baykuşa insan eli veya ek uzuv eklenmedi; özgün hikâyenin kolları hareket ettirme cümlesi kanat hareketiyle gösteriliyor.

İngilizce/Türkçe metin, ses URL'leri, vurgulu kelimeler ve etkileşim türleri korunur. Bu ilk aşamadaki kod farkı beş `imageUrl` değeriydi; katalog geneline yayılan eşleme sonraki raporda açıklanır. Mevcut 3:2, kırpılmayan okuyucu kullanılır; yeni okuyucu mantığı eklenmedi. Eski JPEG'ler referans dışı kaldı, silinmedi.

Yerleşik `image_gen.imagegen` ile beş ayrı 1536×1024 PNG üretildi; kaynaklar korunarak WebP kodlandı. Toplam **904.200 bayt** (0,862 MiB). [Tam araç/prompt kaydı](2026-10-25-dance-story-prompts.json). Proje varlıkları `public/story/dance-v2/` altında.

Bu ilk aşama üç tam hikâye / 14 iç sahneydi. Aynı gün devam eden çalışmada kalan 101 hikâye / 398 sayfa da tamamlandı. Güncel durum: [tüm katalog raporu](2026-10-25-all-story-interiors.md).

## Kontroller

- Mevcut hikâye medya/okuyucu regresyonlarından altı test geçti. Beş dosyanın gerçek WebP olması ve değişikliğin yalnız resim yollarıyla sınırlı olduğu ayrıca doğrulandı.
- TypeScript, değişen dosyanın lint/biçim kontrolü ve üretim Vite derlemesi geçti. `cap sync ios` başarılı; beş kaynak ile Xcode `App/public` kopyaları SHA-256 eşleşir. Mevcut büyük JS parçası uyarıları sürer.
- iPhone 18 Pro Max / iOS 27'de ayrı `com.novalingo.visualqa` kabuğunun gerçek WKWebView'ında ilk dört sayfa sırayla açıldı; yeni resimler, metinler ve düğmeler kontrol edildi. Beşinci sayfa ekran kaydı HMR sıfırlaması nedeniyle doğrulanamadı; beşinci görselin paket içinde bulunduğu dosya kontrolüyle doğrulandı. Bu önizleme örnek profildir, sunucu yazımları engellenir.
