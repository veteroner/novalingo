# Nova v2 — 3D üretim brifi

> 24 Ekim 2026 güncel durum: [Tamamlananlar ve kalan işler](2026-10-24-visual-completion-audit.md). Bu belge kendi tarihindeki kapsamı/testleri kaydeder; tüm yol haritasının tamamlandığı anlamına gelmez.

Durum: öneri. Bu brif bir GLB dosyası veya sipariş değildir. Görsel referans: [konsept panosu](nova-v2-direction.png). Panodaki arayüzleri/çevreyi modele dahil etme.

## Kimlik ve model

- Özgün, arkadaş canlısı stilize baykuş. Büyük ama yassı/yuvarlak baş, iki net krem yüz diski, kısa amber gaga, büyük koyu gözler, iki belirgin kulak tüyü.
- Indigo/gece mavisi gövde, krem göğüs, sınırlı mint tüy vurgusu. Yumuşak mat malzeme; gerçekçi kürk ve tek tek binlerce tüy yok.
- Kanatlar, gaga, gözler ve ayaklar ayrıştırılabilir. Kanatlar gövdeye kaynamamalı; ayaklar birbirinden ayrı; ön/yan/arka siluet tutarlı.
- Başlangıç pozu: simetrik, nötr yüz, ayaklar yerde, kanatlar gövdeden biraz açık. Baykuşa insan parmakları veya insan kolları ekleme.
- Tek karakter, düz arka plan. Ön, yan, arka ve üç çeyrek referanslar aynı oranları göstermeli. Meshy'ye sahne/telefon/başlık içeren bütün panoyu yükleme.
- Kep normal modelin zorunlu parçası değil; ayrı aksesuar. Evrim için göz/yüz kimliğini değiştirme; aksesuar ve sınırlı oran değişimi kullan.

## Başlangıç üretim istemi

```text
One original stylized owl mascot for a children's English learning app. Full body, centered, neutral symmetrical standing pose, feet separated, wings slightly away from body. Broad rounded owl head with two distinct warm ivory facial discs, large expressive dark blue eyes, small curved amber beak, two modest swept feather tufts. Compact midnight-blue and indigo body, cream belly, a few layered sculpted wing feathers, very subtle mint feather accents, small amber talons. Soft matte animated-film materials, simple clean shapes readable at small screen size. Separate eyelids, eyeballs, upper/lower beak and wings suitable for character animation. No human arms or hands, no clothing, no graduation cap, no props, no base, no environment, no text, no fur simulation. Preserve supplied character reference proportions and colors. Plain background, clear silhouette, evenly lit.
```

Bu istem, tutarlı tek karakter referansı hazırlandıktan sonra kullanılmalı; metin tek başına kimlik garantisi vermez.

## Teslim kapsamı

- Düzenlenebilir kaynak dosyası ve malzemeler; uygulama için GLB.
- Göz kapakları, bakış, gaga açılması, boyun/baş, gövde nefesi, sağ/sol kanat ve ayaklar için kontroller.
- Klipler: `idle`, `listen`, `think`, `speak`, `celebrate`, `encourage`, `wave`. Nötr poza temiz dönüş.
- Konuşma için gaga hareketini TTS'ye bağlayabilecek kontrol; rastgele sonsuz döngü tek başına yeterli değil.
- Aynı modelden önceden hazırlanmış pozlar ve kısa animasyonlar; yüz/renk kimliği çıktılar arasında aynı.
- Düşük hareket tercihi için statik ifade alternatifleri; görsel yüklenemezse hafif bir yedek.

## Teknik kabul ve ölçüm

- İlk prototip bütçesi olarak yaklaşık 8–15 bin üçgen, tek 1K doku atlası, az sayıda malzeme denenebilir. Bunlar zorunlu sınır veya ölçülmüş gereksinim değil; hedef cihaz sonuçlarına göre ayarlanacak önerilerdir.
- İhracatta birim/ölçek, ileri eksen, zemin seviyesi ve merkez noktası tutarlı olmalı. Döngü sonunda zıplama/kayma ve ayakların yüzmesi olmamalı.
- Draco/Meshopt ve doku sıkıştırması ancak seçilen renderer ve loader desteği doğrulandıktan sonra uygulanmalı.
- WebGL bağlamı kaybolması, arka plana alma, ekran geçişi, düşük bellek ve çevrimdışı kullanım kontrol edilmeli.
- Meshy'nin Smart Rig çıktısına hazır animasyon uygulanabildiği varsayılmamalı. [Resmi kısıt](https://help.meshy.ai/en/articles/16231707-how-to-create-3d-animation-with-auto-rigging): Smart Rig modelleri hazır animasyon kütüphanesinde henüz desteklenmiyor.
- Kullanılan planın model kullanım/lisans şartları [resmi sayfadan](https://docs.meshy.ai/en/webapp/image-to-3d) seçilen çıktı için kontrol edilmeli.

## Uygulamaya bağlama

Ortak `NovaCharacter({ mood, stage, size, motionEnabled })` arayüzü raster sürüm için uygulandı. GLB renderer ve rig/klip desteği uygulanmadı; modelin hesapta kalması kararı geçerlidir.

İlk sürüm: ana sayfa ve sohbet için aynı modelden hazırlanmış hafif varlıklar. Gerçek zamanlı GLB yalnızca karakter ekranında prototip olarak denenir. Performans ve etkileşim değeri ölçüldükten sonra kullanım alanı genişletilir.
