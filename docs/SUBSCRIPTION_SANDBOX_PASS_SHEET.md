# NovaLingo — Sandbox Satın Alma Geçiş Formu (Şablon)

> Her platform için bir kopya doldurulur. İkisi de tamamen ✅ olmadan halka açık
> sürüm yayınlanmaz (bkz. [SUBSCRIPTION_SANDBOX_RUNBOOK.md](SUBSCRIPTION_SANDBOX_RUNBOOK.md)).

## Build bilgisi

| Alan             | Değer                |
| ---------------- | -------------------- |
| Platform         | iOS / Android        |
| Cihaz modeli     |                      |
| OS sürümü        |                      |
| Uygulama sürümü  |                      |
| Build numarası   |                      |
| Firebase projesi | staging / production |
| Test hesabı      |                      |
| Tarih            |                      |

## Senaryolar

| #   | Senaryo           | Mağaza işlemi | Backend entitlement yazımı | UI kilidi açıldı | Telemetri olayları | Sonuç |
| --- | ----------------- | ------------- | -------------------------- | ---------------- | ------------------ | ----- |
| 1   | İlk satın alma    |               |                            |                  |                    | ⬜    |
| 2   | Yenileme          |               |                            |                  |                    | ⬜    |
| 3   | İptal             |               |                            |                  |                    | ⬜    |
| 4   | Geri yükleme      |               |                            |                  |                    | ⬜    |
| 5   | Webhook gecikmesi |               |                            |                  |                    | ⬜    |
| 6   | Cihaz değişimi    |               |                            |                  |                    | ⬜    |

Her satır için zaman damgalarını (satın alma / backend yazımı / UI açılışı) ve
ekran görüntülerini ekleyin.

## Ek kontroller (bu sürümde eklenen davranışlar)

| Kontrol                                                                    | Sonuç |
| -------------------------------------------------------------------------- | ----- |
| Paywall fiyatı mağazadaki yerel fiyatla birebir aynı                       | ⬜    |
| Deneme süresi yoksa CTA "Aboneliği Başlat" diyor, deneme vaat etmiyor      | ⬜    |
| CTA altındaki otomatik yenileme açıklaması doğru fiyat/periyodu gösteriyor | ⬜    |
| Satın alma ekranına ulaşmak için ebeveyn kapısı soruluyor                  | ⬜    |
| Ücretsiz hesapta 4. ders engelleniyor (uygulama paywall'a yönlendiriyor)   | ⬜    |
| Çevrimdışıyken 4. ders kuyruğa alınmıyor (limit çevrimdışı aşılamıyor)     | ⬜    |
| Firestore'da `isPremium` istemciden değiştirilemiyor (rules reddi)         | ⬜    |

## Başarısızlık kuralı

Aşağıdakilerden biri olursa sürüm bloke edilir:

- backend doğrulaması tamamlanmadan premium açılıyorsa
- iki platformdan birinde geri yükleme başarısızsa
- iptal durumu backend projeksiyonuna hiç yansımıyorsa
- ikinci cihaz yetkiyi kurtaramıyorsa
- mağaza metni testte görülmeyen bir davranış vaat ediyorsa
