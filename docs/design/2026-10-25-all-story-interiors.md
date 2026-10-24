# Hikâye iç resimleri — tüm katalog

25 Ekim 2026. Kullanıcının gördüğü renkli kelime kartları eksik sahne çalışmasından kaynaklanıyordu. Kütüphane kapakları ile okuyucunun iç sayfaları ayrı varlıklardı.

## Tamamlanan kapsam

**104 hikâye / 412 sayfanın tamamı ayrı bir sahneye bağlıdır.** 101 hikâye için 398 yeni sahne `public/story/interiors-v3/{storyId}/page-N.webp` altında; çiftlik (5), mutlu Nova (4) ve dans (5) için 14 sahne kendi sürümlü klasörlerinde korunur. Bu değişiklik dansın beş resmini de ekler. Eski JPEG kelime kartları artık katalog okuyucusundan referans almaz; dosyaları tarihçe için silinmedi.

Yerleşik `image_gen.imagegen` kullanıldı. Her hikâye için özgün sayfa eylemleri, İngilizce/Türkçe anlam ve etkileşim bağlamı içeren bir atlas üretildi; atlas hücreleri teknik kırpma ile ayrı WebP dosyalarına kodlandı. Harici API/CLI üretimi kullanılmadı. Kaynak PNG'ler Codex generated_images klasöründe korunur. [Tüm katalog prompt seti](2026-10-25-story-interior-prompts.json), [dans prompt seti](2026-10-25-dance-story-prompts.json).

Bütün atlaslar görsel olarak incelendi. Meyve salatasındaki fazla kanat ve şehir sahnesindeki yanlış yön gösteren kol yeniden üretimle düzeltildi. Sayma/yön/renk/saat sahneleri metinle karşılaştırıldı. Beş sayfalı atlasların altıncı hücresi, üç sayfalıların dördüncü hücresi uygulamaya alınmadı. Sahne içine ders metni gömülmedi; okuyucunun erişilebilir metni ve kelime etkileşimleri korunur.

`storyIllustrations.json` hikâye kimliği ve sayfa sırasını tutar. Ortak zenginleştirme katmanı hem statik hem çalışma anında oluşturulan genişleme hikâyelerine aynı eşlemeyi uygular. Metin, çeviri, ses, öğrenme hedefleri ve dallanma verisi değiştirilmedi.

Toplam 412 resim **29.342.574 bayt (27,98 MiB)**. Yeni 398 sahne 26.517.012 bayt. Sayfalar 768×512, 627×418 veya 626×417; korunan 14 sahne 1536×1024. Tamamı 3:2 oranında, okuyucu kırpmadan gösterir ve yalnız gereken sayfanın resmini yükler.

## Doğrulama

- Tam katalog testi: 104 hikâye, 412 benzersiz yerel WebP; boş/JPEG/veri URI kartına dönüş yok; eşleme sayfa sayıları ve sırası doğru; toplam medya 45 MiB sınırının altında.
- Hikâye katalog/medya/kapak/kütüphane/okuyucu testleri ve zorunlu konuşma kayıt kontrolü: toplam **21 test geçti**; ileri/geri geçiş, ses ve kelime etkileşimleri korundu.
- 412 dosya ayrıca gerçek görüntü dekoderiyle açıldı. Boyut/oran kontrolü ve SHA-256 karşılaştırması geçti: kaynak, `dist` ve Xcode `App/public` kopyaları birebir eşleşir.
- Proje lint, TypeScript (`tsc -b`) ve değişen kaynakların Prettier kontrolü geçti.
- Üretim Vite derlemesi ve `cap sync ios` geçti. Mevcut font çözümleme ve büyük JS parçası uyarıları bu değişiklikten bağımsız sürüyor.
- Yetkili `ios/App/App.xcworkspace` ile iPhone 18 Pro Max / iOS 27 simülatör hedefinde Xcode `BUILD SUCCEEDED`.

## Simülatör durumunun sınırı

Bu katalog genişlemesinden önce dansın ilk dört sayfası ayrı `com.novalingo.visualqa` WKWebView kabuğunda kontrol edilmişti. Katalog tamamlandıktan sonraki görsel simülatör denemesi Mac ekranı kilitli olduğu için henüz yapılamadı; kullanıcıdan kilidi açması istendi. Yeni derleme mevcut simülatöre `com.novalingo.app` olarak veriler silinmeden yüklendi ve başlatıldı (PID 61521). Üretim uygulamasının oturum/yasal kabul ekranı otomatik kabul edilmedi. Bu rapor bütün 412 sayfanın simülatörde tek tek açıldığını iddia etmez.
