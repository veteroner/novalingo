# NovaLingo — Push Bildirim Kurulumu (iOS + Android)

> Günlük hatırlatmalar, seri uyarısı ve haftalık rapor bildirimlerinin gerçek
> cihazlara ulaşması için gereken yapılandırma.
> Son güncelleme: 15 Eylül 2026

## Mevcut Durum

Kod tarafı hazır:

| Parça                              | Durum | Yer                                                               |
| ---------------------------------- | ----- | ----------------------------------------------------------------- |
| İzin isteme + token kaydı          | ✅    | `src/services/notification/notificationService.ts`                |
| Uygulama açılışında başlatma       | ✅    | `src/hooks/useAppInit.ts`                                         |
| Ebeveyn bildirim tercihleri (UI)   | ✅    | `src/features/parent/screens/ParentSettings.tsx`                  |
| Tercih bazlı gönderim              | ✅    | `functions/src/services/notificationService.ts`                   |
| Günlük tekrar hatırlatması (09:00) | ✅    | `.github/scripts/send-scheduled-notifications.mjs` (`JOB=srs`)    |
| Seri tehlikede uyarısı (19:00)     | ✅    | `.github/scripts/send-scheduled-notifications.mjs` (`JOB=streak`) |
| Haftalık rapor (Pazar 10:00)       | ✅    | `.github/scripts/send-scheduled-notifications.mjs` (`JOB=weekly`) |
| Cron tetikleyici                   | ✅    | `.github/workflows/scheduled-notifications.yml`                   |
| iOS push yetkisi (entitlement)     | ✅    | `ios/App/App/App.entitlements`                                    |
| Android bildirim izni (API 33+)    | ✅    | `android/app/src/main/AndroidManifest.xml`                        |

Eksik olan **yalnızca konsol yapılandırmasıdır** — bu adımlar tamamlanmadan
hiçbir bildirim cihaza ulaşmaz.

## 1. Zamanlanmış gönderim — Blaze GEREKMİYOR

FCM gönderimi Spark planında da ücretsizdir; ücretli olan yalnızca Cloud
Functions / Cloud Scheduler'dır. Bu yüzden zamanlanmış bildirimler **GitHub
Actions cron** ile gönderilir:

| Dosya                                              | Görevi                                                              |
| -------------------------------------------------- | ------------------------------------------------------------------- |
| `.github/workflows/scheduled-notifications.yml`    | 09:00 TR (tekrar), 19:00 TR (seri), Pazar 10:00 TR (haftalık rapor) |
| `.github/scripts/send-scheduled-notifications.mjs` | Firestore'u Admin SDK ile okur, FCM'e gönderir                      |

Gereken tek şey bir **secret**: GitHub → Settings → Secrets and variables →
Actions → `FIREBASE_SERVICE_ACCOUNT` (Firebase Console → Project settings →
Service accounts → "Generate new private key" ile inen JSON'ın tamamı).

Test:

- GitHub → Actions → "Scheduled Notifications" → **Run workflow** → iş seç,
  `dry_run: true` bırak (gerçekten göndermez, yalnızca loglar).
- Yerelde emülatörle:
  ```bash
  firebase emulators:exec --project demo-novalingo --only firestore \
    'FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 GCLOUD_PROJECT=demo-novalingo \
     DRY_RUN=true JOB=streak node .github/scripts/send-scheduled-notifications.mjs'
  ```

`functions/src/scheduled/*` içindeki Firebase sürümleri **bilerek duruyor**:
ileride Blaze'e geçilirse oraya dönülebilir. Dedup alanları (`srsReminderSentAt`,
`streakDangerSentAt`) iki tarafta da aynıdır, bu yüzden geçiş çift bildirim üretmez.

> Not: Firebase sürümleri gerçek şemayla uyuşmuyordu (`streak.current`,
> `nextReviewAt` gibi hiç yazılmayan alanları sorguluyorlardı). GitHub Actions
> sürümü gerçek alanları kullanır: `currentStreak`, `lastActivityDate`,
> `nextReviewDate`.

```bash
# Blaze'e geçilirse:
pnpm run firebase:deploy:functions:prod
```

## 2. Android — `google-services.json` ✅

Android uygulaması Firebase'e kaydedildi (21 Eylül 2026):

- Paket: `com.novalingo.app` — takma ad "NovaLingo Android"
- App ID: `1:876102273243:android:3bb736e5f2d3f46b8464fe`
- Dosya: `android/app/google-services.json` (yerelde mevcut, `.gitignore`'da)

CI için dosyanın içeriği `GOOGLE_SERVICES_JSON` GitHub secret'ı olarak
eklenmeli; `mobile-build.yml` derlemeden önce onu yazar, yoksa derlemeyi
durdurur.

Dosya yoksa Gradle `google-services` eklentisini uygulamaz ve token hiç
üretilmez (build hatası vermez, sessizce çalışmaz).

## 3. iOS — APNs + FCM

iOS iki adım ister:

1. **APNs anahtarı**: Apple Developer → Keys → yeni key (APNs) →
   Firebase Console → Project settings → Cloud Messaging → APNs Authentication
   Key olarak yükle (Key ID + Team ID ile birlikte).
2. **Xcode**: App hedefinde "Push Notifications" capability'sini ekle
   (entitlements dosyası hazır; Xcode'un capability'yi Developer portal'da da
   etkinleştirmesi gerekir).

### ÖNEMLİ: iOS'ta token tipi

`@capacitor/push-notifications` iOS'ta **APNs cihaz token'ı** döndürür.
Backend ise FCM (`messaging.send({ token })`) ile gönderim yapar; APNs token'ı
FCM'e verilemez. Bu yüzden istemci token ile birlikte `pushProvider` alanını da
yazar ve backend `pushProvider === 'apns'` olduğunda gönderimi **açıkça atlar**
(sessiz hata yerine uyarı loglar).

iOS bildirimlerini çalışır hale getirmek için iki seçenekten biri seçilmeli:

**Seçenek A — Firebase Messaging eklentisi (önerilen)**

```bash
pnpm add @capacitor-firebase/messaging
```

- `ios/App/App/GoogleService-Info.plist` dosyasını Firebase Console'dan indir ve
  Xcode ile App hedefine ekle.
- `notificationService.ts` içinde token alımını bu eklentiye taşı; token artık
  FCM kayıt token'ı olur ve `pushProvider` değeri `'fcm'` olarak yazılmalıdır.

**Seçenek B — Backend'den doğrudan APNs**

- Backend'e APNs HTTP/2 istemcisi eklenir ve `pushProvider === 'apns'` olan
  token'lar oraya yönlendirilir. Daha fazla bakım yükü getirir.

## 4. Doğrulama

Gerçek cihazda:

1. Uygulamayı kur, ebeveyn hesabıyla giriş yap, bildirim iznini kabul et.
2. Firestore'da `users/{uid}` dokümanında `fcmToken` ve `pushProvider` alanlarını
   kontrol et (`pushProvider` iOS'ta Seçenek A sonrası `fcm` olmalı).
3. Firebase Console → Cloud Messaging → "Send test message" ile token'a
   test bildirimi gönder.
4. Zamanlanmış işleri tetikle:
   ```bash
   gcloud scheduler jobs run firebase-schedule-srsReviewReminder-us-central1
   ```
5. Ebeveyn ayarlarında ilgili anahtarı kapat ve bildirimin gelmediğini doğrula.

## 5. Bilinen davranışlar

- Bildirimler **ebeveyne** gider, çocuğa değil (COPPA).
- `dailyReminder`, `weeklyReport`, `achievementAlert` varsayılan **açık**;
  `inactivityAlert` varsayılan **kapalıdır**.
- "Seri tehlikede" bildirimi `dailyReminder` tercihine bağlıdır.
