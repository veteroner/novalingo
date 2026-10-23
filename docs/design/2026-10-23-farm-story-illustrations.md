# Çiftlik hikâyesinin beş sahnesi

23 Ekim 2026.

`story-w1-farm-visit` içindeki metinli yer tutucuların yerine beş ayrı, metinsiz çizim eklendi. Sıra: Nova sabah uyanır; köpekle tanışır; kedi, at ve kuşu görür; şarkı söyleyen kuşu alkışlar; hayvanlarla vedalaşır. Aynı Nova, köpek, kedi, at, kuş ve çiftlik görünümü referans görsellerle korundu. İlk tanışılan hayvanın köpek olması soru verisiyle uyumludur.

Yerleşik `image_gen.imagegen` ile üretilen kaynak PNG'ler korunarak, yeniden boyutlandırmadan WebP kodlandı. Kalıcı dosyalar `public/story/farm-v2/page-1.webp` … `page-5.webp`; her biri 1536×1024, toplam 1.086 MiB. Diğer hikâyelerin iç sayfaları değiştirilmedi. [Tam prompt seti](2026-10-23-farm-story-prompts.json).

İngilizce ve Türkçe metinler, ses dosyaları, vurgulu kelimeler ve soru verisi korundu. `choose-image` sayfalarında İngilizce cümle eski görselin içine gömülüydü; artık diğer okuma sayfalarındaki gibi görselin altındaki metin alanında da gösterilir. Bu değişiklik yeni bir soru arayüzü eklemez. Görseller mevcut 3:2 alana kırpılmadan sığar; mevcut yükleme hatası yedeği korunur.

## Doğrulama

- Yeni iki test ve mevcut dört medya testi geçti: beş gerçek WebP dosyası, sıra/boyut bütçesi, ileri/geri geçiş, ses dosyası ve kelime seslendirme çağrıları, çeviriler ve son İngilizce cümlenin görünürlüğü.
- Tam lint, TypeScript ve biçim kontrolü geçti. Vite üretim derlemesi ve `cap sync ios` başarılı; beş dosya `dist` ve Xcode projesinin `App/public` paketine kopyalandı. Mevcut büyük JS parçası uyarıları sürer.
- iPhone 18 Pro Max / iOS 27 simülatöründe ayrı `com.novalingo.visualqa` uygulamasının gerçek WKWebView'ında, yerel DEV örnek profil kullanıldı. Beş sayfa sırayla açıldı; resim, İngilizce/Türkçe metin ve düğmeler görüldü; ikinci sayfadan ilk sayfaya geri geçiş doğrulandı. Gerçek kullanıcı hesabına yazılmadı. Native kabuk yeniden derlenmedi; mevcut QA kabuğu güncel Vite kaynaklarını yükledi. Fiziksel cihaz testi yapılmadı.

Ekran kanıtları: [1](screenshots/nova-farm-ios-page-1.png), [2](screenshots/nova-farm-ios-page-2.png), [3](screenshots/nova-farm-ios-page-3.png), [4](screenshots/nova-farm-ios-page-4.png), [5](screenshots/nova-farm-ios-page-5.png).
