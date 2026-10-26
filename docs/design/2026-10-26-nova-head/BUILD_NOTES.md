# Nova'nın öne bakan başı ve dikkat hareketleri — 26 Ekim 2026

Kullanıcı Nova'nın sürekli sol aşağı bakmasını ve başının hareketsiz görünmesini işaret etti. Kaynak modelin yüzü üç çeyrek açıyla ve eğik göz çizgisiyle modellenmişti. Önceki animasyon yalnızca küçük bir baş titreşimi ekliyordu; bu duruşu düzeltmiyordu.

## Değişiklik

- `novaHeadMotion.ts` başın öne bakan temel açısını düzeltir. Kaynakta ölçülen iki göz merkezi arasındaki yaklaşık 14,7° eğiklik, kök kamera açısı dahil hesapta yaklaşık 0,54°'ye iner; gözlerin derinlik farkı da düzelir. Bu, bütün gövdeyi yatırarak yapılmaz; ayaklar yerinde kalır.
- Nova uzun aralıklarla kullanıcıya bakar, kısa süre sağa/sola bakar ve merakla hafifçe eğilir; sonra yeniden karşıya döner. Sabit hızlı bir sallanma yerine yumuşak geçişler ve beklemeler vardır. Baş hareketi her örnekte mutlak olarak hesaplanır, birikmez.
- Gerçek ses çalarken küçük baş tepkileri eklenir. Dinleme/düşünme/cesaretlendirme ifadeleri ve fareye bakış korunur. Uyku ve hareket azaltma durumunda otomatik dikkat hareketleri/ses baş tepkileri kapalıdır; uyku kapakları ve gaga senkronu korunur.
- Daha büyük baş dönüşlerinde üst gaganın gövdeyle karışık eski kemik ağırlıkları alt gagayla hizayı bozuyordu. Kaynak dokudaki gaga bölgesinin 402 köşesi Head eklemine bağlandı. Alt gaga ve üst gaga aynı hareketi takip eder; boyun/tüylerin mevcut yumuşak ağırlıkları korunur. Üretim adımı `author-face.py` içindedir; düzenlenebilir Blender/GLB ve çalışma glTF paketi yenilendi.

## Doğrulama

- Öne bakış, iki yöne dönüş, merkeze dönüş, sürekli geçiş sınırları, sınırlı açılar, yeniden değerlendirme, gerçek ses kapısı, uyku, hareket azaltma ve bozuk pointer/time girdileri için dört anlamlı test eklendi.
- Tam test: 88 dosyada 5.092 test geçti. Tam ESLint, TypeScript ve biçim kontrolü geçti. Üretim web, iOS/Android Capacitor eşitlemesi, Xcode simülatör ve Android assembleDebug derlemeleri geçti.
- Model bütçesi değişmedi: 86.579 üçgen, beş eklem, yedi çizim, 16 morph; 6.081.119 bayt çalışma modeli. Normalize ağırlıklar, koordinatlar ve indeksler doğrulandı. Kaynak/web/iOS/Android/derlenen iOS paketinde 261 dosya birebir eşleşti: `model-validation.json`, `package-validation.json`.
- Gerçek iPhone 18 Pro Max/iOS 27 WKWebView'de öne bakış, kısa dönüşler, eğilme, göz kırpma ve gerçek CDN sesi birlikte denendi. Konuşma sonunda gaga kapandı. `ios-head-demo.mp4` doğal simülatör kaydından alınan 26 saniyelik sessiz görüntüdür. `head-contact-sheet.jpg` aynı kaydın 0/3/7/10/15/20 saniyelerinde aynı alanı gösterir; yüz/gaga/ayak kopması görünmedi. `ios-forward.png` ekranın çevresiyle birlikte son duruşu gösterir.

Bunlar simülatör kontrolleridir; fiziksel cihaz ısınma/performance ölçümü veya her fonemin elle düzeltilmesi iddiası değildir. Önceki yüz/ses kapsamı [yüz raporundadır](../2026-10-26-nova-face/BUILD_NOTES.md). Canlı dağıtım, merge veya ücretli işlem yapılmadı; mevcut PR #24 güncellenir.
