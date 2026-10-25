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

## iOS görsel kontrolü

Mac kilidi açıldıktan sonra iPhone 18 Pro Max / iOS 27 üzerinde gerçek WKWebView okuyucusunda örnek profil ile doğrulandı:

- Dans hikâyesinin **beş sayfası**, 5→4 geri geçişi, kütüphane dönüşü ve kütüphaneden okyanus hikâyesi açılışı.
- Yeni atlas resimleri: okyanusun ilk sayfası; son dünya `story-w12-picture-space-window` ilk iki sayfası. Uzun etkileşim sayfasında dokunmatik kaydırma ile alttaki gezinme düğmelerine erişildi.
- Seçimli `story-w1-chain-nova-adventure` ilk üç sayfası; bu testte `{WORD}` belirtecinin seçilen kelimeyle doldurulmadığı mevcut okuyucu hatası bulundu ve düzeltildi (aşağıda).

Bu örneklem görsel kontroldür; bütün 412 sayfanın simülatörde tek tek açıldığı iddia edilmez. Tüm kataloğun dosya/dekoder ve eşleme kontrolleri ayrıca geçti. QA uygulaması `com.novalingo.visualqa` yalnız yerel geliştirme önizlemesini ve örnek profili kullanır; sunucu yazımları engellenir. Üretim uygulamasının yasal kabul veya hesap oluşturma ekranı otomatik kabul edilmez.

[Ekran kanıtları](screenshots/): `nova-catalog-ios-dance-1.png` … `dance-5.png`, `nova-catalog-ios-ocean-1.png`, `nova-catalog-ios-space-1.png`, `nova-catalog-ios-space-2.png`.

## Simülatörde bulunan seçim devamı hatası

Seçimli sayfadan ileri giderken kelime durumu siliniyordu. Sonraki cümle `Nova went to the {WORD}` gösteriyor, ses ve resim de seçimi izlemiyordu. Seçimler artık sayfa bazında korunur; önceki seçim sayfasına göre cümle ve ilgili sahne çözülür. `{WORD}` içeren cümleler seçilen kelimeyle cihazda seslendirilir; şablonun eski sabit kaydı oynatılmaz. Geri dönüp bir seçimi değiştirmek sonraki tur seçimlerini temizler. İki seçim turu birbirini ezmez.

Altı hikâyedeki iki tur için **36 ayrı seçim sahnesi** `public/story/choices-v1/` altında eklendi. Bunlar mevcut 412 sayfanın alternatifleridir, yeni hikâye sayfası değildir. Ek medya 1.756.852 bayt; toplam iç görsel dosyaları 31.099.426 bayt (29,66 MiB). Her atlas yerleşik ImageGen ile üretildi ve kontrol edildi. [Seçim sahneleri prompt kaydı](2026-10-25-story-choice-prompts.json).

Yeni regresyonlar altı hikâyenin her iki turunda seçim→metin→resim→ses, geri geçiş, seçim değiştirme ve sonraki seçimin sıfırlanmasını denetler.

Seçim düzeltmesinin doğrulaması: yeni 7 regresyon ve mevcut katalog/çiftlik regresyonları (11 test) geçti; tam proje lint, `tsc -b` ve kaynak Prettier kontrolleri geçti. Üretim Vite + Capacitor sync ve Xcode simülatör derlemesi yeniden başarılı; güncel uygulama veriler silinmeden simülatöre yüklendi. 36 ek dosyanın kaynak/web/iOS/native paket SHA-256 değerleri eşleşti. Mac tekrar kilitlendiğinden düzeltme sonrası son seçim ekranı henüz yeniden görüntülenemedi; kullanıcıdan kilidi yeniden açması istendi. Önceki ekran kanıtları bu sınırlamayla değerlendirilmelidir.
