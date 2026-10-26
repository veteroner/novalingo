> 26 Ekim güncellemesi: [Ücretsiz detaylı 3D Nova ve gerçek kalan sınırlar](2026-10-26-free-3d-rebuild/BUILD_NOTES.md). Bu belge önceki denemenin tarihsel kaydıdır.

# Nova v2 görsel pilotu

> 24 Ekim 2026 güncel durum: [Tamamlananlar ve kalan işler](2026-10-24-visual-completion-audit.md). Bu belge kendi tarihindeki kapsamı/testleri kaydeder; tüm yol haritasının tamamlandığı anlamına gelmez.

21 Ekim 2026. Uygulanan kapsam: ortak Nova karakteri, ana ekran, sohbet, ortak tema/buton/kart/navigasyon sistemi ve `story-w2-nova-is-happy` hikâyesinin dört sayfası.

## Çalışan değişiklikler

- `NovaCharacter`: bekleme, dinleme ve kutlama pozları. Giriş, yükleme, profil/evrim, sohbet ve sonuç ekranları aynı karakter kaynağını kullanır. Yumurta aşaması korunur; diğer aşamalar aynı yüzü korur ve ölçek/işaretlerle ayrılır.
- Sürekli yukarı-aşağı/dönme animasyonları kaldırıldı. Kutlama, olay anında kısa bir hareket verir; sistemin hareketi azalt tercihi ve `motionEnabled` desteklenir. Bu sürümde üç raster poz vardır; göz kırpma, gerçek gaga senkronizasyonu ve iskelet animasyonu uygulanmış değildir.
- Ana ekranda orman sahnesi, Nova, mevcut dünya ve tek belirgin “Derse devam et” eylemi. Eski yüzen köşe maskotu ve yinelenen devam kartı kaldırıldı. Diğer işlevlere erişim korunur.
- Yaş temalarında ortak indigo kimliği. Sarı eylemlerde koyu yazı; başarı/hata butonlarında beyaz yazıya uygun koyu renkler. Başlık fontu ve eksik renk tokenları düzeltildi. Koyu mod uygulamanın `data-mode` seçimine bağlıdır.
- Sohbet metni odakta kalır; büyük karakter yalnızca başlatma ekranındadır. Kayıt/TTS/düşünme durumları mevcut akıştan ortak karaktere iletilir. Yeni kayıt, değerlendirme veya satın alma servisi eklenmedi.
- “Nova Mutlu!” için güneşli Nova, kendisini tanıtan Nova, sarı/mavi kuşlar ve robot Bolt ile arkadaşlık sahneleri. İngilizce metin, ses dosyaları ve etkileşim yapısı korunur; Türkçe metindeki HARİKA yazım hatası düzeltildi. Hikâye resimleri kırpılmadan 3:2 alanda gösterilir.
- 8 görsel, boyutları ve saydamlık korunarak WebP olarak kodlandı; toplam **1.544.468 bayt** (yaklaşık 1,5 MB). Metinler resimlere gömülmedi. Görsel üretimi: yerleşik ImageGen; kodlama: sharp/WebP.

## Gerçek 3D modelin durumu

Kullanıcının onayıyla Chrome'daki **veteroner** Meshy hesabına geçildi ve referans Nova görseli kullanılarak renkli 3D model üretildi. Smart Topology / Meshy T2.5, hedef 15.000 poligon, doku açık. Sonuç ekranı **15.964 yüz** gösteriyor.

Model Meshy hesabında mevcut; [ekran görüntüsü](nova-meshy-model.png). GLB seçilip indirme denendiğinde Meshy **“İndirmek için abone olun”** ekranı gösterdi: [kanıt](nova-meshy-export-block.png). Yeni abonelik veya ödeme yapılmadı. **GLB dosyası indirilmedi, uygulamaya gerçek zamanlı 3D eklenmedi.** İndirme yetkisi açıldıktan sonra modelin GLB doğrulaması, lisans/atıf, rig ve gerçek cihaz performans kontrolü gerekiyor. Mevcut raster varlıklar Meshy modelinden render alınmış çıktılar değildir; aynı referansla ImageGen'de üretilmiştir.

## Önizleme

```sh
pnpm exec vite --host 127.0.0.1 --port 3002
```

`http://127.0.0.1:3002/visual-preview.html`

Yerel fixture gerçek HomeScreen, WorldMapScreen, ConversationScreen, StoryTimeActivity ve ortak bileşenleri örnek çocuk verisiyle açar. Oturum açmaz, profil oluşturmaz. Hikâye bağlantısı dört sayfalık pilotu açar; Nova bağlantısı üç pozu gösterir. Üst şeritten açık/koyu tema ve TR/EN seçilebilir. Fixture üretim rotası değildir: Vite üretimde yalnızca `index.html` girişini derler; fixture `DEV` kontrolüyle korunur.

## Doğrulama

- TypeScript ve sıfır uyarı lint.
- **4.880 test / 51 dosya başarılı.** Tüm mevcut testler; yeni karakter için durum değişimi, görsel yükleme hatası yedeği ve erişilebilirlik testleri.
- 3 yaş grubu × 2 mod için ortak buton ve gövde metni kontrastını en az 4,5:1 sınayan 36 kontrol.
- Üretim derlemesi; mevcut büyük JS parçaları için Vite uyarıları sürüyor.
- Tarayıcıda 320 ve 393 piksel genişlikte kontrol; görsel yüklenmesi, sayfa geçişi ve açık/koyu tema.

Canlıya dağıtım veya App Store/Google Play ikili paket yüklemesi bu pilotta yapılmadı. Yerel ana klasördeki yarım rebase'e dokunulmadı; değişiklikler ayrı çalışma alanında tutuldu.

## Ekran görüntüleri

- [Ana ekran — açık tema](screenshots/nova-home-mobile.png)
- [Ana ekran — koyu tema](screenshots/nova-home-dark.png)
- [Hikâye — son sayfa](screenshots/nova-story-mobile.png)

Görseller, yerel fixture içinde gerçek uygulama bileşenlerinden alınmıştır; tasarım maketi değildir.
