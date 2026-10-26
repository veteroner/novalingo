# Ücretsiz 3D Nova — 26 Ekim 2026

Güncel yüz çalışması: [kapaklar, ses saati ve fonetik eşleme](../2026-10-26-nova-face/BUILD_NOTES.md). Aşağıdaki metin ilk v4 teslimini kaydeder.

Durum: detaylı model uygulamaya bağlandı. Web/iOS/Android derlemeleri geçti; PR kontrolü sürüyor. Canlı/mağaza yayını yapılmadı.

## Sonuç

Kullanıcının reddettiği basit, kürelerden oluşan yerel deneme korunarak üretim yolundan çıkarıldı. Bunun yerine kabul edilen Nova görselinden MakerLab'da üretilen Tripo 3.1 Ultra modeli kullanılıyor. Meshy 7.1 4K da ücretsiz üretildi ve karşılaştırıldı; Tripo seçildi. TRELLIS.2 güzel önizleme üretti fakat iki GLB export ve bir düşük çözünürlük üretim denemesi hata verdi, o önizleme kullanılabilir mesh gibi sunulmadı.

MakerLab hesabındaki 2 ücretsiz deneme kullanıldı; üretimler 0 kredi olarak onaylandı, 50 kredi bakiyesi korundu. Ödeme veya abonelik yok. PrintMon Maker kapanmış olsa da kullanıcı tarafından gösterilen MakerLab ana sayfasındaki yeni Image to 3D aracı çalıştı.

## Kullanım izni ve kaynak

Her iki MakerLab çıktısının dışa aktarma ekranı ticari kullanıma açıkça izin veriyor ve şu kaynak satırını istiyor:

Powered by MakerWorld-Image-to-3D (https://makerworld.com/makerlab/imageTo3d)

Ekran kanıtları bu klasörde. Kaynak satırı model metadatasında, `public/nova/model-v4/CREDITS.md` içinde ve ebeveyn ayarlarının altında yer alıyor. Bu çıktı, önceki doğrudan Tripo ücretsiz plan denemesinden farklıdır. Önceki lisansı belirsiz H2.5 denemesi uygulama paketine eklenmedi.

## Gerçek teslim

Ham dosya: 57.337.264 bayt / 1.949.964 üçgen, iskelet/klip yok. Son model: 80.000 üçgen, 67.707 dışa aktarılan köşe, tek malzeme/çizim, bir 2K JPEG; çalışma paketi 5.505.896 bayt. 40 binlik ilk aday daha hafifti ancak tüy kenarlarını fazla sadeleştiriyordu. Düşük maliyet hedefinden bilinçli olarak daha fazla ayrıntı korundu; gerçek düşük seviye Android/ısınma ölçümü yapılmış sayılmaz.

Blender içinde 5 eklemli ağırlıklı iskelet, gaga şekil kontrolü ve Idle / Listen / Think / Encourage / Celebrate klipleri eklendi. Düzenlenebilir `e2e/assets/nova-v4-rig.blend` ve taşınabilir GLB saklandı. Uygulama yüklemesi, WKWebView'de gömülü resim sorunlarından kaçınmak için aynı mesh'in ayrı glTF/buffer/JPEG kopyasını kullanıyor.

Baş, kanatlar ve nefes hareketleri uygulamadaki duruma göre mutlak pozlarla sürülür. Gerçek konuşma servisi çalarken gaga hareket eder. Fonem/ağız sesi eşleştirmesi değildir. Göz kırpma/kapak denemesi kaliteyi bozduğu için çıkarıldı; uyku ifadesi mevcut kapalı gözlü görsele döner. Gözbebekleri bağımsız hareket etmez; bakış tepkisi baştan gelir.

Büyük Nova alanları (lg/xl/hero) ve sohbet başlığı 3D kullanır. Yoğun küçük avatarlar resim kalır. Aynı anda en fazla iki grafik bağlamı, 30fps üst sınırı, 1.5 DPR üst sınırı; ekran dışı ve arka planda kaynak bırakma; hareket azaltmada statik poz; 15 saniye yükleme sınırı ve hata/bağlam kaybında resim yedeği vardır. Model dosyaları atomik çevrimdışı kabuğa dahil edilir.

## Doğrulama

- Geometri/index sınırları, sonlu koordinatlar, normalize kemik ağırlıkları, beş eklem, bir gaga kontrolü, beş klip ve yerel dokular doğrulandı: `asset-validation.json`.
- 98 ilgili test / 15 dosya geçti. Tam ESLint ve TypeScript geçti.
- Gerçek iPhone 18 Pro Max / iOS 27 WKWebView'de 80 bin üçgenli görüntü, kutlama seçimi, uyku görseli ve ana ekran kontrol edildi. Bunlar simülatör kontrolleridir; fiziksel cihaz performans sertifikası değildir.
- Web üretim derlemesi, iOS/Android Capacitor eşitlemesi, Xcode simülatör derlemesi ve Android assembleDebug geçti. Kaynak/web/native varlık hashleri eşleşti; bütün model dosyaları atomik çevrimdışı kabukta. Tam kaynak format kontrolü de geçti. CI sonucu PR üzerinde kontrol ediliyor.

## Düzenleme / yeniden üretim

Blender 5.2.3 LTS resmi Apple Silicon paketi indirildi, SHA256 doğrulandı, kuruldu ve CLI üzerinden gerçek dosya açma/render/export çalıştı. RobLe3/cc-blender-skill paketinden 30 beceri kuruldu. Bu görevde MCP sunucusu kurulmadı; Blender'ın doğrudan yerel CLI'ı kullanıldı.

Düzenlenebilir `.blend` son modeli doğrudan içerir. Ham MakerLab dosyasından baştan üretmek için temiz bir çıktı klasöründe sırasıyla:

1. Blender `scripts/nova/prepare-mobile-model.py -- <raw-source.glb> <static-output>`
2. Blender `scripts/nova/rig-mobile-model.py -- <static-output/nova-mobile-static.blend> <rig-output>`
3. `python3 scripts/nova/package-model.py <rig-output/nova-v4-rig.glb> public/nova/model-v4`
4. `node scripts/nova/validate-model.mjs`

Blender komutları `Blender --background --python <script> -- <arguments>` biçimindedir. Ham dosyalar `e2e/.local-assets/` içinde ignore edilir; sadece seçilen, kaynak belirtilen son model uygulamaya girer.
