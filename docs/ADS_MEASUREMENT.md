# NovaLingo — Reklam ölçümü kurulumu (Google Ads Arama testi)

Tarih: 18 Kasım 2026 (onaylı plan). 14 gün, **vergi ve ücretler dahil 3.000 TL** toplam tavan; net medya
%70 Google **Arama** / %30 **Instagram Reels** (Trafik hedefi). YouTube Shorts organik. Net medya payı
gerçek fatura kalemlerinden hesaplanır (%20 KDV yalnız örnek). iOS ve Android yayında.

## Neden bu yöntem?

- Uygulamada analitik bilerek kapalı (`src/services/firebase/app.ts`); çocuk uygulaması olduğu için
  açılmıyor. Uygulamaya hiçbir reklam/ölçüm SDK'sı eklenmez.
- Google, **yalnız çocuklara yönelik** Android uygulamalarda Google Play kurulum/satın alma
  dönüşümlerini kapattı (Nisan 2023; https://support.google.com/google-ads/answer/6255257).
  Bu yüzden Google Ads **uygulama kampanyası** (Bilgoo'daki gibi) burada kör çalışır.
- Çözüm: reklam → **ebeveyn tanıtım sayfası** (`public/tanitim/`, yetişkinlere yönelik web) →
  mağaza butonu. Google Ads dönüşümü = mağaza butonuna tıklama (izinle). İndirme ve abonelik
  mağaza raporlarından ve Firestore'dan **toplu** okunur.

## Ölçüm zinciri

| Adım                          | Kaynak                                                   | Not                                                                                   |
| ----------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Gösterim, tıklama, maliyet    | Google Ads                                               | Kesin                                                                                 |
| Mağaza butonu tıklaması       | Google Ads dönüşümü (sayfadaki etiket)                   | Yalnız çerez iznini kabul edenler sayılır                                             |
| Play mağaza ziyareti / edinme | Play Console → Mağaza girişi edinme raporu, UTM kırılımı | Sayfa `utm_*` parametrelerini Play bağlantısına ekler                                 |
| App Store indirme             | App Store Connect → Analytics → Campaigns                | `pt` girilince `ct=google_<kampanya>` eklenir; 5'in altı gösterilmez, 1–2 gün gecikir |
| Hesap → ders → abonelik       | `scripts/ad-funnel-report.mjs` (Firestore, yalnız okuma) | Kişi bazında eşleşmez; reklamlı/reklamsız dönem karşılaştırılır                       |

## Yayına almadan önce yapılacaklar (sizde)

1. **Google Ads ödeme sorununu** giderin.
2. NovaLingo için **yeni web sitesi dönüşümü** oluşturun (Hedefler → Dönüşümler → Yeni →
   Web sitesi → manuel, kategori "Diğer"/"İndirme"). Bilgoo'nun hesap varsayılanı dönüşümlerini
   NovaLingo kampanyasında **hedef dışı** bırakın.
   - Etiket kimliği `AW-XXXXXXXXXX` ve etiket(ler)i `public/tanitim/index.html` içindeki
     `CONFIG.adsId`, `CONFIG.adsLabelPlay`, `CONFIG.adsLabelAppStore` alanlarına yazın.
     Boş kaldıkça sayfa hiçbir Google betiği yüklemez ve izin kutusu göstermez.
3. **Apple sağlayıcı jetonu:** App Store Connect → Analytics → Acquisition → Campaigns →
   "Generate a Campaign Link" ekranındaki `pt=` değerini `CONFIG.appleProviderToken`'a yazın.
4. **Gizlilik politikası:** teknovagroup.com'daki NovaLingo politikasına `docs/PRIVACY_LANDING_ADDENDUM.md`
   taslağını hukuki incelemeden sonra ekleyin. Google Ads kimliği girilmeden önce yayımlanmış olmalı. Uygulama içi beyanlar (App Privacy, Play Veri Güvenliği) değişmez:
   uygulamada değişiklik yok.
5. **Yayın:** Sayfa `novalingo.teknovagroup.com/tanitim/` adresinde Netlify ile yayınlanır
   (`novalingo` sitesi `main`'e Git ile bağlı; `public/` → `dist/`, statik dosya SPA yönlendirmesinden
   önce gelir). Netlify derlemeleri geçici olarak **durdurulmuştu**: merge sonrası derlemeler açılmadan
   ya da elle bir production deploy yapılmadan sayfa canlıya çıkmaz.
6. **Canlı doğrulama (reklamdan önce):** gizli pencerede `/tanitim/` sayfası açılmalı (yaş ekranı
   değil); iki mağaza butonu doğru mağazaya gitmeli; kimlikler girildiyse izin kutusu görünmeli ve
   "Kabul et" öncesi `googletagmanager.com` isteği olmamalı.

### Service worker notu

Web uygulamasını daha önce açmış tarayıcılarda eski service worker her sayfa gezintisini uygulama
kabuğuyla (`/index.html` → yaş ekranı) yanıtlıyordu; `/tanitim/` da bundan etkileniyordu.
`public/sw.js` artık `/tanitim` ve altını ağa bırakır (test: `src/services/pwa/offlineShell.test.ts`).
Yeni worker yalnız deploy sonrası, ziyaretçinin bir sonraki yüklemesinde devreye girer; reklamdan gelen
yeni ziyaretçilerde service worker bulunmaz.

### Instagram Reels

- Hedef: **Trafik** (uygulama yükleme hedefi Meta SDK ister; çocuk uygulamasında kullanılmaz).
  Meta pikseli eklenmez.
- Bağlantı: `https://novalingo.teknovagroup.com/tanitim/?utm_source=instagram&utm_medium=paid_social&utm_campaign=tr-reels-ebeveyn&utm_content=hook-a`
  (B kreatifi için `hook-b`). Sayfa etiketleri Play UTM ve App Store `ct` bağlantılarına taşır.
- Kreatifler: FINAL A ve FINAL B (gövde kare kare aynı, yalnız ilk 2,6 sn farklı).

## Kampanya ayarları

- Kampanya türü: **Arama**. Ağ: yalnız Google Arama (Görüntülü Reklam Ağı kapalı).
- Konum: Türkiye; dil: Türkçe. Günlük bütçe: 150 TL. Otomatik bütçe artışı yok.
- Teklif: ilk hafta "Tıklamaları en üst düzeye çıkar" + TBM sınırı; mağaza tıklaması dönüşümü
  ≥ 15 olunca "Dönüşümleri en üst düzeye çıkar" düşünülebilir.
- Nihai URL: `https://novalingo.teknovagroup.com/tanitim/`
- **Nihai URL son eki** (kampanya düzeyi):
  `utm_source=google&utm_medium=cpc&utm_campaign=tr-arama-ebeveyn&utm_content={creative}`
- Anahtar kelime örnekleri: "çocuklar için ingilizce uygulama", "çocuklara ingilizce öğretme",
  "çocuk ingilizce oyun", "ingilizce kelime oyunu çocuk". Negatif: "ücretsiz indir apk", "yetişkin",
  "kurs fiyatları", "öğretmen".
- Reklam metni yalnız gerçek özellikleri söyler (reklamsız, Türkçe yönergeler, ücretsiz başlangıç,
  isteğe bağlı Plus). Kişiselleştirilmiş/remarketing hedefleme kullanılmaz.

## Günlük okuma tablosu

| Tarih | Harcama | Tıklama | Mağaza butonu (Ads) | Play edinme (UTM) | App Store indirme (ct) | Yeni hesap | İlk ders | Deneme | Ücretli |
| ----- | ------- | ------- | ------------------- | ----------------- | ---------------------- | ---------- | -------- | ------ | ------- |

- Huni rakamları: `GOOGLE_APPLICATION_CREDENTIALS=… node scripts/ad-funnel-report.mjs --from 2026-11-18 --to 2026-12-01`
  (`--csv` ile tabloya yapıştırılabilir; iç test hesaplarını `--exclude uids.txt` ile dışlayın).
- Karşılaştırma için reklam öncesi 14 günün raporunu da alın.

**Formüller**

- İndirme başı maliyet = harcama ÷ (Play UTM edinme + App Store `ct` indirme).
- Ücretli abone başı maliyet = harcama ÷ reklam dönemindeki yeni ücretli abone artışı.
- Başabaş: abone başı net gelir ≈ 140 TL (yıllık 199 TL, KDV ve mağaza payı sonrası, yaklaşık).
  İndirme başı maliyet ≤ (indirme → ücretli oranı × 140 TL) değilse reklam kendini ödemez.

## Durdurma kuralları

- 3. gün: tıklama → mağaza butonu oranı < %10 → reklam metni veya sayfa değişir.
- 7. gün: indirme başı maliyet > 75 TL → durdur.
- 14. gün: en az 1–2 ücretli abone yoksa bütçe büyütülmez; önce ödeme ekranı/deneme/mağaza sayfası.
- Kreatif kazananı: yeterli örnek birikmeden yorum yapılmaz; yeterli örnek de kesinlik garantisi
  değildir. Oranlar güven aralığıyla raporlanır, aralıklar çakışırsa sonuç "belirsiz" yazılır.

## Sınırlar

- Mağaza butonuna tıklama indirme değildir; indirme mağaza raporlarından okunur.
- Çerez iznini reddedenlerin tıklamaları Google Ads'te görünmez (UTM/`ct` etiketleri yine çalışır).
- Firestore abonelik dokümanı son durumu tutar; rapor anlık görüntüdür. Apple Sandbox ve Google
  test alımları ayrı sayılır.
- Kişi bazında reklam → abone eşleşmesi yoktur ve kurulmamalıdır (çocuk uygulaması).
