# Codex görevi: Google Play mağaza paketi (ücretsiz + NovaLingo Plus)

> Bu dosyayı Claude yazdı. Claude ile Codex arasındaki iş bölümünün Codex tarafıdır.
> Codex **yalnızca `docs/play/` altına yazar**. Kod, `package.json`, `android/`, `ios/` ve `src/` Claude'a aittir; onlara dokunma.
> Çalışma dalı: `codex/play-store-listing` (bu klasördeki `claude/play-release` dalından aç).

## Durum

- Paket adı: `com.novalingo.app`. Google Play'de daha önce **139 TL ücretli** olarak yayınlandı ve birkaç alıcısı var.
- Yeni model: **ücretsiz indirme + NovaLingo Plus aboneliği**.
  - Ürün kimlikleri: `com.novalingo.app.monthly` ve `com.novalingo.app.yearly` (`src/config/constants.ts`).
  - Play'de ücretliden ücretsize geçiş tek yönlüdür.
- Eski alıcılara **1 yıl Plus**, Play abonelik promosyon koduyla verilecek; isteyen alıcıya iade yapılacak.
  - Kodun kullanımı: Abonelik → "Hediye kodum var" (bkz. `docs/MONETIZATION.md` → Gift Codes).
  - Promosyon süresi bitince abonelik iptal edilmezse ücretli yenilenir. Bu, metinde açıkça yazmalı.

## Değişmez gerçekler (metinler bunlarla çelişmemeli)

Kaynak: `docs/MONETIZATION.md`, `src/config/constants.ts`.

- Ücretsiz katman: 12 dünyanın **ilk 4'ü**, **günde 3 ders** (aynı dersi tekrar oynamak da sayılır), 1 çocuk profili, temel ebeveyn özeti.
- Plus: tüm dünyalar, sınırsız ders, ayrıntılı haftalık ebeveyn raporu.
- **Uygulamada hiçbir katmanda reklam yok.** "Reklamsız"ı Plus avantajı olarak yazma.
- **Çoklu çocuk profili vaat etme.** Ekleme/geçiş ekranı henüz yok.
- Çevrimdışı erişim, XP boost ve Nova evrimi vaat etme.
- Analytics ve Sentry bu sürümde kapalı.
- Liderlik tablosu anonim ("Kâşif 4821"). Çocuklar arası mesajlaşma yok.
- Fiyat yazma. Fiyatlar mağazadan okunuyor.
- Yasal bağlantılar (yayında olduğu doğrulandı, 2026-11-10):
  - Gizlilik: https://teknovagroup.com/novalingo-gizlilik-politikasi
  - Kullanım Koşulları: https://novalingo.teknovagroup.com/legal/terms
  - Web'den hesap silme: https://novalingo.teknovagroup.com/legal/delete-account

## İstenen dosyalar (`docs/play/` altında)

1. **`listing.tr.md` ve `listing.en.md`**
   - Uygulama adı en çok 30 karakter, kısa açıklama en çok 80, tam açıklama en çok 4000.
   - Her alanın altına karakter sayısını yaz.
   - Tam açıklamanın sonuna abonelik açıklamasını (otomatik yenileme, iptal yeri) ve yasal bağlantıları ekle.
   - Başlangıç metni olarak `docs/APP_STORE_METADATA.md` kullanılabilir. Apple'a özel ifadeleri Play'e uyarla.
2. **`whats-new.md`** (TR + EN, en çok 500 karakter): "NovaLingo artık ücretsiz" duyurusu ve eski alıcılara çağrı:
   "Daha önce satın aldıysanız sipariş numaranızla (`GPA.…`) destek adresine yazın, size 1 yıl Plus kodu gönderelim."
3. **`old-buyer-support.md`**:
   - Eski alıcıya gönderilecek e-posta (TR + EN): kod, kullanım adımları, yenileme uyarısı, iade seçeneği.
   - Sipariş numarası soran destek cevabı şablonu.
   - Destek adresi olarak `bilgi@teknovagroup.com` kullan.
   - Not: hesap silme sayfası `privacy@novalingo.app` diyor, gizlilik politikası `bilgi@teknovagroup.com`. Bu tutarsızlığı dosyanın başına not et; düzeltmeyi sen yapma.
4. **`data-safety.md`**: Play Data Safety formunun her sorusu için cevap ve **kanıt dosyası**.
   - Kanıtlar: `ios/App/App/PrivacyInfo.xcprivacy`, `src/services/firebase/`, gizlilik politikası.
   - Kanıt bulamadığın cevabı "DOĞRULANMALI" diye işaretle.
5. **`families-target-audience.md`**:
   - Hedef yaş grubu önerisi. Uygulama 4–12 yaş için tasarlandı; eski kontrol listesinde 4–9 yazıyor. İkisini gerekçesiyle karşılaştır, kararı kullanıcıya bırak.
   - Families politikası maddeleri: ebeveyn kapısı, reklam yok, kişisel veri.
   - "Kullanıcılar birbiriyle iletişim kurabilir mi: Hayır".
6. **`content-rating.md`**: IARC anketi için soru-cevap taslağı.
7. **`screenshots.md`**:
   - Telefon için en az 4 ekran ve hangi rota olduğu (`src/app/Router.tsx`).
   - 512×512 ikon ve 1024×500 feature graphic için brief.
   - Ekranda Plus kilidi görünüyorsa bunu belirt.

## Bitiş

- Her dosyada uydurma iddia olmasın. Emin olmadığın her şey "DOĞRULANMALI".
- Commit mesajı: `docs(play): mağaza paketi taslağı (Codex)`.
- Push etme. Kullanıcı, Claude'un kontrolünden sonra karar verecek.
