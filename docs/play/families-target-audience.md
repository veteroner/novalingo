# Play Console — Hedef kitle ve Families

**Öneri: 4–12 yaş.** Son seçim ürün sahibine aittir. [Play Console yaş grupları](https://support.google.com/googleplay/android-developer/answer/9867159?hl=en) tam yaş aralığı yerine hazır gruplar kullanır.

| Ürün hedefi | Neye dayanıyor? | Play Console seçimi |
| --- | --- | --- |
| **4–12 yaş (öneri)** | Uygulama 4–6, 7–9 ve 10–12 ders grupları sunuyor. Resim ve sesli etkinlikler küçük yaşlara; kademeli kelime ve cümle çalışmaları daha büyük çocuklara hitap ediyor. Kaynak: [profil ekranı](../../src/features/auth/screens/CreateProfileScreen.tsx), [TR yaş etiketleri](../../src/i18n/locales/tr/auth.json), [müfredat](../../src/features/learning/data/curriculum.ts). | **5 yaş ve altı**, **6–8**, **9–12**. 4 yaş ilk, 12 yaş son grupta. |
| **4–9 yaş (eski kontrol listesi)** | Okul öncesine ve erken ilkokula odaklanır; ancak 10–12 için uygulamada ayrı ders grubu var. Kaynak: [eski kontrol listesi](../STORE_SUBMISSION_CHECKLIST.md), [yaş etiketleri](../../src/i18n/locales/tr/auth.json). | 9 yaş dahilse yine aynı üç kutu gerekir; Play’de yalnızca 9 yaşı ayıran bir kutu yok. 9–12 kutusunu çıkarmak, 9 yaşını da beyan dışında bırakır. |

**DOĞRULANMALI:** Ürün sahibi hedefi seçsin; son Android sürümünde her seçilen grubun (özellikle okumaya yeni başlayan 4–5 ve üst seviye 10–12) derslerini, sesli yönergelerini ve gezinmesini kontrol edin. Ebeveynlerin destek, ayar ve abonelik ekranlarını kullanması tek başına 18+ grubunu seçme nedeni değildir. Reklam beyanı: **Hayır**. Kullanıcılar birbiriyle iletişim kurabilir mi: **Hayır**.

## Families için kanıt ve yayın kontrolleri

| Konu | Taslak cevap ve kanıt |
| --- | --- |
| Ebeveyn kapısı | [Router.tsx](../../src/app/Router.tsx), `/parent`, `/parent/settings` ve `/subscription` rotalarını [matematik sorulu ebeveyn kapısına](../../src/components/organisms/ParentalGate/ParentalGate.tsx) alır. Kurulumdaki [yaş ekranı](../../src/features/auth/screens/AgeScreenGate.tsx) ayrı bir kontroldür; [doğum tarihi cihazda değerlendirilir](../../src/services/ageScreen/ageScreenPolicy.ts). **DOĞRULANMALI:** Son Android sürümünde doğrudan rota, dış bağlantı, satın alma/kod kullanma, geri dönme ve süresi dolmuş oturum yollarını deneyin. Matematik sorusunun, gerekli olduğu yerlerde Play’in yetişkin işlemi ve ebeveyn onayı şartlarını karşıladığı varsayılmamalı; özellikle çocuk profili ve mikrofon akışı incelenmeli. |
| Reklam | Ücretsiz ve Plus katmanlarında reklam yok. [Monetizasyon kaynağı](../MONETIZATION.md); [Android kaynak manifestinde](../../android/app/src/main/AndroidManifest.xml) reklam kimliği izinleri kaldırılıyor. **DOĞRULANMALI:** Son AAB’nin birleşik manifestinde konum ve reklam kimliği izinlerini, SDK bağımlılıklarını ve çocuk/bilinmeyen yaş oturumunda yasaklı kimliklerin aktarılmadığını kontrol edin. |
| Kişisel ve hassas veri | Çocuk profil adı (takma ad), ders grubu ve ilerleme Firebase’e yazılır; yetişkin oturumunda Google hesabı ve izin verilirse bildirim kaydı devreye girer. Konuşma tanıma mikrofonu kullanabilir. Kaynaklar ve açık noktalar [Data safety](data-safety.md) dosyasında. **DOĞRULANMALI:** Firebase, Google giriş, bildirim, konuşma tanıma ve diğer API/SDK’ların bu kullanım biçiminde çocuklara yönelik uygulamalar için uygunluğunu, çocuk verisi aktarımını ve gerekli ebeveyn onayını teyit edin. Analitik ve Sentry’nin kapalı olması bu kontrolün yerine geçmez. |
| Çocuklar arası iletişim ve sıralama | **Hayır.** Mesaj, sohbet ve kullanıcılar arasında serbest içerik paylaşımı yok. [Liderlik tablosu](../../src/components/organisms/Leaderboard/Leaderboard.tsx) diğer çocukları “Kâşif 4821” gibi takma etiketle gösterir. **DOĞRULANMALI:** Play’in herkese açık veri/etkileşim sorusu iletişimden ayrıdır; [Firestore kuralları](../../firestore.rules) oturum açanlara sıra girdilerini okutur. [Data safety’deki](data-safety.md) çocuk kimliği ve skor sınıflandırmasını ayrı ele alın. |

Resmî dayanak: [Google Play Families politikası](https://support.google.com/googleplay/android-developer/answer/9893335?hl=en). Hedef kitle, [IARC içerik derecesinden](content-rating.md) ayrı bir beyandır.
