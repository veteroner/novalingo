# Firestore kuralları ve indekslerinin yayını

Web uygulaması **Netlify'ın Git entegrasyonuyla** yayınlanır: `main` dalına gelen her commit'i Netlify kendisi derleyip yayınlar. CI (`ci-cd.yml`) yalnızca lint, test ve build adımlarını doğrular; deploy yapmaz.

`firestore.rules` ve `firestore.indexes.json` ise otomatik yayınlanmaz. Bunlar için ayrı ve yalnız elle tetiklenen bir workflow var: **Firestore kuralları ve indeksleri (manuel)** (`.github/workflows/firestore-deploy.yml`).

## Ne yapar

- `firebase deploy --only firestore --project novalingo-app` komutunu çalıştırır. Bu komut kuralları ve indeksleri yayınlar; Hosting, Functions ve Storage'a dokunmaz.
- Yalnız `main` dalından çalışır.
- Varsayılan modda `dry_run: true` açıktır: kurallar doğrulanır, hiçbir şey yayınlanmaz.
- Gerçek yayın için `dry_run`'ı kapatmak ve `confirm` alanına tam olarak `novalingo-app` yazmak gerekir.
- `FIREBASE_SERVICE_ACCOUNT_PROD` secret'ı yoksa ilk adımda açık bir hata mesajıyla durur ve Firebase'e hiçbir istek gönderilmez.

## Kullanım

1. GitHub → Actions → **Firestore kuralları ve indeksleri (manuel)** → **Run workflow**, dal: `main`.
2. Önce `dry_run` açıkken çalıştır ve logda kuralların derlendiğini gör.
3. Gerçek yayın için tekrar çalıştır: `dry_run` kapalı, `confirm` = `novalingo-app`.

## Gerekli kimlik bilgisi (şu an tanımlı değil)

- `FIREBASE_SERVICE_ACCOUNT_PROD`: `novalingo-app` projesine ait bir servis hesabının JSON anahtarı. En az yetki ilkesine göre "Firebase Rules Admin" ve indeksler için "Cloud Datastore Index Admin" rolleri yeterli olmalı.
- Bu secret repo sahibi tarafından bilinçli olarak eklenmelidir. Bu PR secret oluşturmaz.

## Staging hakkında

`.firebaserc`'de `staging` takma adı `novalingo-b0c92` projesine işaret ediyor. Eski CI ise "staging" adıyla `develop` dalından kuralları doğrudan **üretim** projesine (`novalingo-app`) gönderiyordu. Bu yol kaldırıldı. `novalingo-b0c92`'nin gerçekten staging projesi olduğu doğrulanana kadar workflow staging hedefi sunmaz.
