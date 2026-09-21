# NovaLingo — Mağaza Gönderim Kontrol Listesi

> Uygulamayı App Store ve Google Play'e yüklemek için gereken her adım.
> Kod tarafında biten işler ✅, sizin konsolda/cihazda yapmanız gerekenler ⬜ ile işaretlidir.
> Son güncelleme: 16 Eylül 2026

---

## 1. Yetki ve güvenlik (kod)

- ✅ `users.isPremium` ve `subscription*` alanları istemciden yazılamaz (`firestore.rules`)
- ✅ Doğrulanmış abonelik kayıtları (`users/{uid}/subscriptions/*`) istemciye kapalı
- ✅ Ücretsiz katman günlük ders limiti kurallarda zorlanıyor (`dailyLessonCount`)
- ✅ Kural testleri: `pnpm test:rules`
- ⬜ Kuralları yayına al: `pnpm firebase:deploy:rules --project production`

## 2. Paywall ve ticari doğruluk (kod)

- ✅ Fiyatlar mağazadan okunuyor (sabit fiyat yok)
- ✅ Otomatik yenileme açıklaması (süre, fiyat, iptal) CTA'nın altında
- ✅ Deneme süresi yalnızca mağazada tanımlıysa gösteriliyor
- ✅ Özellik listesi yalnızca gerçekten zorlanan faydaları içeriyor
  (offline erişim / XP boost / Nova evrimleri vaatleri kaldırıldı)
- ✅ Ebeveyn kapısı: `/subscription`, `/parent`, `/parent/settings`
- ⬜ App Store Connect'te abonelik grubu + `com.novalingo.app.monthly` ve
  `com.novalingo.app.yearly` ürünlerini oluştur, fiyatları gir
- ⬜ Play Console'da aynı iki abonelik ürününü oluştur (base plan + varsa teklif)
- ⬜ Deneme süresi istiyorsanız her iki mağazada **introductory offer** tanımlayın
  (tanımlamazsanız uygulama "Aboneliği Başlat" der — bu doğru davranıştır)

## 3. Bildirimler

- ✅ **Uçtan uca doğrulandı (21 Eylül 2026, Android emülatörü, canlı `novalingo-app`):**
  izin penceresi → FCM token → Firestore `users/{uid}.fcmToken` → Admin SDK gönderimi →
  bildirim çekmecesinde "🐾 Nova seni bekliyor!"
- 🔴 **Canlıdaki kritik hata düzeltildi (deploy bekliyor):** 16 Mayıs'ta yayına alınan kural,
  yeni kullanıcı oluştururken `premiumExpiresAt`/`subscription*` alanlarının hiç
  bulunmamasını istiyordu; istemci bunları `null`/`'expired'` olarak gönderdiği için
  **o tarihten beri hiçbir yeni kullanıcının Firestore dokümanı oluşmadı** (token,
  ayarlar, PIN dahil her şey sessizce çalışmıyordu). `useAuth` payload'ı düzeltildi;
  eski payload'ın reddedildiği `pnpm test:rules` ile kanıtlandı. Dokümanı olmayan
  mevcut kullanıcılar yeni sürümü açtığında doküman kendiliğinden oluşur.
- ✅ `useAppInit` döngüsü giderildi (bildirim izni 88+ kez yerine 1 kez isteniyor)
- ✅ İstemci + gönderim mantığı + ebeveyn tercihleri hazır
- ✅ **Zamanlanmış gönderim GitHub Actions cron ile — Blaze GEREKMİYOR**
  (`.github/workflows/scheduled-notifications.yml`; emülatörde dry-run ile doğrulandı)
- ⬜ GitHub secret: `FIREBASE_SERVICE_ACCOUNT` (Firebase service account JSON'ı)
- ✅ Android uygulaması Firebase'e kaydedildi (`novalingo-app` / `com.novalingo.app`,
  App ID `1:876102273243:android:3bb736e5f2d3f46b8464fe`) ve `android/app/google-services.json`
  yerleştirildi — Gradle `processDebugGoogleServices` ile doğrulandı
- ⬜ GitHub secret: `GOOGLE_SERVICES_JSON` (aynı dosyanın içeriği; CI derlemesi bunu yazar)
- ⬜ APNs anahtarını yükle: Firebase → Cloud Messaging → APNs Authentication Key
  (`AuthKey_B97K577RA9.p8`, Team ID `29D6U2Z923`) — dev + prod
- ⬜ Android'de Google ile Giriş için imzalama anahtarının SHA-1'ini Firebase'e ekle
- ⬜ iOS için APNs anahtarı + Firebase Messaging entegrasyonu (bkz. [PUSH_SETUP.md](PUSH_SETUP.md))
- ⬜ Gerçek cihazda test bildirimi al (Actions → Run workflow → `dry_run: false`)

## 3b. Giriş (Google / Apple)

- ✅ Native Google girişi (`@capacitor-firebase/authentication`, popup yerine hesap seçici)
- ✅ Firebase: Google ve **Apple** sağlayıcıları açık; Android uygulamasına debug SHA-1 eklendi,
  güncel `google-services.json` yerleştirildi
- ✅ iOS: `REVERSED_CLIENT_ID` URL şeması, Sign in with Apple yetkisi, `GoogleService-Info.plist` hedefte
- ✅ Apple ile Giriş yalnızca iOS'ta görünür (App Store 4.8)
- ⬜ GitHub secret'larını güncelle: `GOOGLE_SERVICES_JSON` (yeni dosya — OAuth istemcileri eklendi) ve
  yeni `GOOGLE_SERVICE_INFO_PLIST`
- ⬜ Play Console → App signing → **uygulama imzalama anahtarı SHA-1**'ini Firebase'e ekle
  (yoksa Play'den indirilen sürümde Google girişi çalışmaz)
- ⬜ Xcode'da "Sign in with Apple" capability'sini etkinleştir (Developer portal'a da yazar)

## 4. Android build

- ✅ Capacitor 8.5.2 + AGP 8.13 + Gradle 8.13 + JDK 21 → **targetSdk 36**
  (Play, 31 Ağustos 2026'dan beri yeni uygulamalarda API 36 istiyor)
- ✅ Release imzalama yapılandırması (`android/keystore.properties` veya CI secret'ları)
- ✅ CI artık **AAB** üretiyor (Play APK kabul etmiyor)
- ✅ `POST_NOTIFICATIONS` ve `com.android.vending.BILLING` izinleri
- ⚠️ **exFAT uyarısı:** Depo LaCie (exFAT) sürücüsünde olduğu için macOS her yazılan
  dosya için `._*` ikizleri üretir ve Gradle/R8 `'._MainActivity.class'` hatasıyla
  düşer. Derlemeden önce
  `find android node_modules/@capacitor node_modules/@capacitor-community -name '._*' -delete`
  çalıştırın; build çıktısını APFS'te bir dizine almak (init script ile
  `layout.buildDirectory`) kalıcı çözümdür. Doğrulama derlemesi bu yolla
  `BUILD SUCCESSFUL` verdi (targetSdk 36 doğrulandı).
- ⬜ Upload keystore oluştur ve **yedekle** (`android/keystore.properties.example`)
- ⬜ CI secret'ları: `ANDROID_KEYSTORE` (base64), `ANDROID_KEYSTORE_PASSWORD`,
  `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`
- ⬜ Play Console → App signing (Play App Signing önerilir)

## 5. iOS build

- ✅ Push entitlement dosyası (`ios/App/App/App.entitlements`) ve Xcode hedefine bağlandı
- ✅ Gizlilik bildirimi (`PrivacyInfo.xcprivacy`) pakete dahil
- ✅ ATS artık rastgele http yüklemelere izin vermiyor
- ✅ CI imzalı arşiv + IPA export ediyor (`ios/ExportOptions.plist`)
- ⬜ CI secret'ları: `IOS_DIST_CERT_P12`, `IOS_DIST_CERT_PASSWORD`,
  `IOS_PROVISIONING_PROFILE`, `APPLE_TEAM_ID`
- ⬜ Xcode'da "Push Notifications" capability'sini etkinleştir (Developer portal'a da yazar)
- ✅ **Karar: iPad destekleniyor** (`TARGETED_DEVICE_FAMILY = "1,2"`). Oyun iPad'de de
  oynanacağı için hedef ailede bırakıldı.
- ⬜ iPad ekran görüntüleri (App Store zorunlu) ve iPad'de manuel QA
- ⚠️ Layout `max-w-md` ile ortalanmış tek sütun; iPad'de telefon genişliğinde görünür.
  Çalışır ve kabul edilir, ama ileride iPad'e özel bir yerleşim turu planlanmalı.

## 6. Mağaza varlıkları (henüz yok)

- ⬜ App Store: 6.9" ve 6.5" iPhone ekran görüntüleri (+ iPad, aile destekleniyorsa)
- ⬜ Play: 512×512 ikon, 1024×500 feature graphic, en az 2 telefon ekran görüntüsü
- ⬜ Uygulama açıklamaları: [APP_STORE_METADATA.md](APP_STORE_METADATA.md)
  (⚠️ "günde 3 ders / 1 profil / reklamsız" ifadeleri uygulamadaki davranışla eşleşiyor)
- ⬜ Herkese açık gizlilik politikası URL'i (uygulamadaki `/legal/privacy` rotası canlı domaine deploy edilmeli)
- ⬜ Play için **web tabanlı hesap silme talebi** sayfası (uygulama içi silme var, web URL'i yok)

## 7. Politika beyanları

- ⬜ Play → Target audience & content: 4-9 yaş, Families politikası
- ⬜ Play → Data safety formu (toplanan veriler `PrivacyInfo.xcprivacy` ile eşleşmeli)
- ⬜ Play → Ads: **Hayır** (uygulamada reklam SDK'sı yok)
- ⬜ Play → "Kullanıcılar birbirleriyle iletişim kurabiliyor mu?": **Hayır**
  (liderlik tablosu anonim, mesajlaşma yok)
- ⬜ App Store Connect → App Privacy formu
- ⬜ İçerik derecelendirme anketleri
- ✅ **Karar: liderlik tablosu anonimleştirildi.** Çocuk adı artık ne
  `leaderboards/*/entries/*` içine yazılıyor ne de okunuyor; diğer çocuklar
  "Kâşif 4821" gibi kimlik taşımayan etiketle görünüyor, çocuk yalnızca kendi
  adını görüyor. Böylece "çocuklar arası sosyal özellik yok" beyanı doğru kalır.

## 8. Çıkış öncesi zorunlu testler

- ⬜ [SUBSCRIPTION_SANDBOX_RUNBOOK.md](SUBSCRIPTION_SANDBOX_RUNBOOK.md) — 6 senaryo, iki platform,
  gerçek cihaz (ilk satın alma, yenileme, iptal, geri yükleme, webhook gecikmesi, cihaz değişimi)
- ⬜ Konuşma (STT) davranışını gerçek cihazda doğrula — iOS WKWebView'de Web Speech API yoktur;
  aktiviteler dokunmatik/manuel yedeğe düşer (bkz. CLAUDE.md "Konuşma Tanıma")
- ⬜ TTS sesinin uzaktan yüklendiğini doğrula (paket boyutu ~1.7 GB artmamalı)
