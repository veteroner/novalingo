# iOS yeniden gönderim: build 20

> Durum (2026-11-10, App Store Connect'ten okundu):
>
> - Açık inceleme gönderimi `14061384-…` hâlâ **Rejected / Unresolved Issues**. Build 9 (1.0) incelendi, 21 Ekim'de Kural 4 ile reddedildi: Apple ile Giriş sonrası ad soruluyor.
> - TestFlight'ta en yeni **build 19**. **Build 20 yüklenmedi.** Build 18'de "Missing Compliance" uyarısı var.
> - Abonelik grubu "NovaLingo Plus"ta **yalnızca yıllık** ürün var. Aylık `com.novalingo.app.monthly` açılmamış.

## Sırayla yapılacaklar (sen)

1. **Xcode:** Product → Archive (build 20) → Distribute App → App Store Connect → Upload.
   - `ITSAppUsesNonExemptEncryption = NO` Info.plist'te var; şifreleme sorusu yeniden çıkmamalı.
2. **Aylık abonelik:** NovaLingo Plus grubunda `com.novalingo.app.monthly` oluştur.
   - Fiyat, görünen ad, açıklama ve **App Review ekran görüntüsü** gir (paywall ekranı).
   - Yıllık ürünün de inceleme ekran görüntüsü olduğundan emin ol.
3. **Sürüm sayfası (1.0):**
   - Build 9'u kaldır, build 20'yi seç.
   - Açıklamayı `docs/APP_STORE_METADATA.md`'den yeniden yapıştır. "9 dünya" ifadesi "12 dünya" olarak düzeltildi.
   - Kullanım Koşulları bağlantısı açıklamada olmalı (3.1.2).
4. **İnceleme gönderimi:**
   - Uygulama sürümü, yıllık abonelik ve aylık abonelik **aynı gönderimde** olmalı (2.1(b) reddi bu yüzden gelmişti).
   - Aşağıdaki cevabı App Review mesajına yaz, sonra "Resubmit to App Review".

## App Review'a cevap (EN)

```text
Hello,

Thank you for the review. We have addressed Guideline 4 – Sign in with Apple in build 20:

- After Sign in with Apple, the app no longer asks for a name or email. The name provided by the
  Authentication Services framework is saved automatically; if Apple does not provide one, a
  default nickname is used and the profile step is skipped.
- The Sign in with Apple button follows the Human Interface Guidelines (black, first, same size
  as the Google button) and is never shown disabled.
- Account deletion is available in Parent Dashboard → Settings → Delete Account.

The submission also includes both NovaLingo Plus subscriptions (monthly and yearly) for review.
Parent-only areas, including purchases, are behind a parental gate (a multiplication question).
No account is required: "Hemen Başla (Kayıtsız)" starts a guest session.

Thank you.
```

## Göndermeden önce kontrol (hafızadaki ret listesi)

- [ ] Her abonelik ürünü sürümle aynı gönderimde ve inceleme ekran görüntüsü var.
- [ ] Paywall, mağaza açıklaması ve kod aynı şeyi söylüyor: 4/12 dünya ücretsiz, günde 3 ders, reklam yok, çoklu profil vaadi yok.
- [ ] Açıklamada Gizlilik ve Kullanım Koşulları bağlantıları var, ikisi de açılıyor (2026-11-10'da kontrol edildi).
- [ ] Hesap silme çalışıyor.
- [ ] Apple ile Giriş: siyah, ilk sırada, Google ile aynı boyutta, hiç pasif görünmüyor. Giriş sonrası ad/e-posta alanı yok.
- [ ] iPad'de dene (Apple incelemeyi iPad Air 11" M3 ile yaptı).
- [ ] App Review notları güncel (`docs/APP_STORE_METADATA.md` → Review Notes).
