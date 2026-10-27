# Nova yüz animasyonu — 26 Ekim 2026

Durum: kapaklar, ses saati entegrasyonu, bütün ses kayıtları ve yerel web/iOS/Android doğrulamaları tamamlandı. CI sonucu mevcut PR üzerinde kontrol edilir. Canlı/mağaza yayını yapılmadı.

## Kapaklar ve gaga

Detaylı MakerLab modeli korundu. Gözleri veya iris dokusunu sıkıştırmak yerine iki gözün yüzeyine oturan ayrı kapaklar eklendi. Dört ara şekil ve kapanış çizgisi standart glTF morph target olarak dışa aktarılıyor. Hızlı kapanış / daha yumuşak açılış, uzun açık aralıklar ve seyrek çift kırpma var. Uyku kapakları tamamen kapatır; hareket azaltma açıkken otomatik kırpma ve gaga hareketi durur. Uyku artık büyük Nova alanlarında gerçek 3D'dir. Sık sayaç/üst bileşen güncellemeleri ve callback değişimleri animasyon saatini yeniden başlatmaz; bu durum için regresyon testi vardır.

Alt gaga ana yüz yüzeyinden ayrıldı, alt tarafı yerel olarak kapatıldı ve karanlık iç duvar eklendi. Yüz derisini çekmez. Açılma, daralma ve yayılma kontrolleri vardır. Bunlar baykuş gagasına uygun ses şekilleridir; insana ait dudak veya dil animasyonu iddiası değildir.

Son paket: `asset-validation.json`. 86.579 üçgen, beş eklem, yedi çizim, 16 şekil kontrolü, beş eski klip; 6.081.119 bayt glTF/buffer/yerel JPEG. Büyük alanlarda 30 fps ve 1,5 DPR üst sınırı; aynı anda iki grafik bağlamı; görünmez/arka planda kaynak bırakma ve resim yedeği korunur.

`contact-sheet.jpg` açık, dört kapanma durumu ve açık gagayı gösterir. Kapak ve gaga kontrolleri dışa aktarılan modelde bulunur; Blender'a özgü handler veya çalışma anında Python gerekmez.

## Ses saati

Önceki rastgele sinüs gagası kaldırıldı. Rhubarb Lip Sync 1.14.0'ın ücretsiz yerel fonetik çözümlemesi her kayıttan A–H/X ağız şekilleri ve milisaniye sınırları çıkarır. Ham sesler bir hizmete yüklenmez. Dokuz durum arasında sessizlik ve P/B/M kapanışı, dar/açık/yuvarlak/yayılmış biçimler ayrı tutulur.

6.859 kayıt için 138.175 zamanlı ağız durumu çıkarıldı; çizelgeler toplam 2.991.508 bayt.

Her çizim gerçek `HTMLAudioElement.currentTime` üzerinden örneklenir. Uygulamanın animasyon saati veya konuşma etiketinin varlığı yeterli değildir. Başlangıç sessizliği, kayıt içindeki duraklar ve bitiş kapanır; bekleme, duraklatma, ileri/geri alma, engellenen ses, hata, iptal ve başka bir kayıt başlaması eski hareketi sonlandırır. Kayıt süresi yerel çizelgeden farklıysa gaga güvenli kapalı kalır. Dosyası/eşleştirmesi olmayan satır için hareket uydurulmaz.

Çizelgeler 256 küçük kovada `/speech-sync/` altında yerel pakettedir. MP3'ler mevcut CDN'den de gelse çizelgeler uygulama içinden okunur; Web Audio/CORS erişimi veya mikrofon izni gerekmez. Ön yükleme sesin `play()` çağrısını bekletmez; iOS kullanıcı hareketi korunur. Sonradan gelen veya iptal edilmiş bir isteğin çizelgesi yeni sese uygulanmaz.

Bu, sesin oynatma saatine bağlı otomatik fonetik eşleştirmedir. Her kaydın her fonemi insan tarafından tek tek düzeltilmiş değildir. Görünür güncelleme, 30 fps ve cihazın medya saati çözünürlüğüyle sınırlıdır. Yanlış çözümlenen bir sesin zamanları ayrıca düzeltilebilir; “bütün fonemler kusursuz” iddiası yapılmaz.

## Yeniden üretim

- Kaynak: `e2e/assets/nova-v4-rig.blend`. Blender 5.2.3 LTS ile `scripts/nova/author-face.py -- <output-dir> --render`; ardından `scripts/nova/package-model.py <output.glb> public/nova/model-v5` ve `node scripts/nova/validate-model.mjs`.
- Sesler: resmi Rhubarb 1.14.0 ve ffmpeg kurulu iken `node scripts/nova/generate-lip-sync.mjs --rhubarb /path/to/rhubarb`. Apple Silicon aracı resmi kaynaktan yerelde derlendi; ücretli API veya Rosetta kurulumu kullanılmadı.
- Üretici `.local-assets/lip-sync-cache` içinde ses baytları/çözümleyici/metin karmasıyla devam edilebilir önbellek tutar. MP3 değişince yeniden çalıştırılmalıdır. Önbellek depoya dahil edilmez; taşınabilir sonuç JSON'ları dahildir. Sonuçlar sesin SHA-256 değerini de içerir; testler baytları karşılaştırır.
- `lipSyncAssets.test.ts` tüm MP3'lerin karşılığını, süreleri ve kesintisiz/zaman sıralı şekilleri kontrol eder. Derlemenin çevrimdışı kabuğu bütün yüz ve zaman çizelgesi dosyalarını içerir.

## Kanıt sınırı

`ios-speech.png` gerçek iPhone 18 Pro Max/iOS 27 simülatörünün WKWebView'inde kayıt tamamlandığında çizilen ağız şekillerini ve kapanan gagayı gösterir. Yerel örnek profil kullanıldı; hesap/ücret/ebeveyn onayı değiştirilmedi. Bu, fiziksel cihaz performans veya tüm kayıtlar için elle fonem incelemesi değildir.

Sesler native paketten çıkarılıyorsa mevcut ses sunucusunun adresi build sırasında zorunludur; aksi halde sessiz bir paket üretimi durdurulur. Bu kontrol, yerel worktree'de eksik ortam dosyasıyla yapılan iPhone derlemelerinde fark edildi. Mevcut üretim/staging sunucusundan alınan örnek sesin SHA-256 değeri yerel kayıtla eşleşti; sunucuya yeni dosya yüklenmedi.

## Son doğrulama

- Tüm kayıt kapsamı, kesintisiz zaman sınırları ve MP3 SHA-256 değerleri geçti. Son tam testte 87 dosyada 5.088 test geçti. Saat düzeltmesi ve dosya kapsamı dahildir; CI'da ayrıca doğrulanır.
- Tam ESLint, TypeScript ve kaynak biçim kontrolü geçti. MP3'ler çıkarıldığında ses sunucusu ayarı eksikse derleme korumasının gerçekten durduğu doğrulandı.
- Son üretim web, Capacitor iOS/Android eşitlemesi, Xcode iOS simülatör derlemesi ve Android assembleDebug geçti. Kaynak/web/iOS/Android için 261 dosya ve 9.073.633 bayt birebir eşleşti; bütün model ve çizelgeler atomik çevrimdışı kabukta. `package-validation.json` ve `speech-validation.json` sonuçları içerir.
- iPhone 18 Pro Max/iOS 27 WKWebView'de gerçek mevcut CDN sesi, manifestten sohbet cümlesi ve doğrudan URL örneği çalındı; çizilen ağız şekilleri değişti, kayıt bitişi ve durdurmada gaga kapandı. Uyku gerçek kapaklarla kapandı. `ios-face-demo.mp4`, `ios-blink.png`, `ios-sleep.png` ve önceki `ios-speech.png` kanıttır.
- Kısa MP4, simülatörün doğal ekran kaydından alınmıştır; ses kanalı içermez. Sessiz video ses kalitesine dair kanıt sayılmaz. Tam kaynak kayıt yerel `.local-assets/qa/` altında korunur. `motion-validation.json` videodan açık/kapalı göz karelerinin değişimini ölçer; tek başına estetik/performans değerlendirmesi değildir.
- Üretim JS parça boyutu, Xcode script çıktısı ve Gradle eski özellik uyarıları mevcut; hata yok. Fiziksel cihaz/ısınma ve her fonemin elle düzeltilmesi bu doğrulamanın kapsamında değildir.

## Sonraki baş duruşu düzeltmesi

Kullanıcının sol aşağı bakış geri bildirimi üzerine baş karşıya kalibre edildi; kısa dikkat hareketleri ve gerçek ses baş tepkileri eklendi. Gaga kemik ağırlıkları daha büyük dönüşlerle hizalandı. [Son durum ve yeni iPhone kanıtları](../2026-10-26-nova-head/BUILD_NOTES.md).
