# NovaLingo — Monetizasyon Stratejisi

> Gelir modeli, reklam politikası, abonelik yapısı ve çocuk güvenliği kuralları
> Son güncelleme: 28 Şubat 2026

---

## 1. Gelir Modeli Özeti

```
┌──────────────────────────────────────────────────────────┐
│                  GELİR KAYNAKLARI                         │
├────────────────────┬─────────────────────────────────────┤
│ Kaynak             │ Tahmini Gelir Payı (Yıl 1)         │
├────────────────────┼─────────────────────────────────────┤
│ Premium Abonelik   │ 55% (ana gelir kaynağı)              │
│ Rewarded Ads       │ 25% (ödüllü video reklamlar)         │
│ Interstitial Ads   │ 10% (geçiş reklamları)               │
│ In-App Purchase    │ 10% (elmas, kosmetik, boost)          │
└────────────────────┴─────────────────────────────────────┘
```

---

## 2. Freemium Model Detayı

### 2.1 Ücretsiz Katman (Free)

| Özellik | Sınır |
|---------|-------|
| Dünyalar | İlk 2 dünya (Animal Kingdom + Yummy Food) |
| Dersler | Sınırsız tekrar |
| Aktivite tipleri | 10/10 (tümü erişilebilir) |
| Günlük ders limiti | 5 ders/gün |
| Nova evrimi | İlk 3 aşama (yumurta → yavru → çocuk) |
| Reklamlar | Rewarded + Interstitial |
| Ebeveyn raporu | Temel (günlük özet) |
| Offline mod | ❌ Yok |
| SRS tekrar | Temel (günlük 10 kelime) |
| Koleksiyon | Temel itemler |
| Leaderboard | Görüntüleme |
| XP boost | ❌ Yok |

### 2.2 Premium Katman (NovaLingo Plus)

| Özellik | Erişim |
|---------|--------|
| Dünyalar | Tüm dünyalar (6+ dünya, yeni eklenenler dahil) |
| Günlük ders limiti | Sınırsız |
| Nova evrimi | Tüm aşamalar (yetişkin + efsanevi) |
| Reklamlar | SIFIR reklam |
| Ebeveyn raporu | Detaylı (haftalık/aylık, güçlü/zayıf alan, kelime raporu) |
| Offline mod | ✅ Ders indirme |
| SRS tekrar | Sınırsız, gelişmiş algoritma |
| Koleksiyon | Premium + özel sezonluk itemler |
| XP boost | Günde 1 saat 2x XP |
| Streak freeze | Ayda 3 freeze (ücretsizde 1) |
| Öncelikli içerik | Yeni ünitelere erken erişim |
| Ebeveyn-çocuk co-play | ✅ (v1.5) |
| AI pronunciation | ✅ (v2.0) |

### 2.3 Fiyatlandırma

| Plan | Fiyat (TRY) | Fiyat (USD) | Tasarruf |
|------|-------------|-------------|----------|
| Aylık | ₺149.99 | $4.99 | - |
| Yıllık | ₺899.99 | $29.99 | %50 tasarruf |
| Aile (4 çocuk) | ₺1,299.99 | $44.99 | %64 tasarruf |

**Deneme Süresi:** 7 gün ücretsiz trial (tüm premium özellikler)

**Fiyat Stratejisi:**
- Türkiye fiyatı: Bölgesel fiyatlandırma (%60 indirimli vs ABD)
- Yıllık plan vurgulanır (ana CTA)
- Trial sonrası soft paywall (hard paywall değil, dünya kilitleme)
- Seasonal discounts: Okul dönemi, yılbaşı, 23 Nisan

---

## 3. Reklam Stratejisi

### 3.1 Reklam Tipleri

#### A. Rewarded Video Ads (Ödüllü Reklam)
**Yerleşim:**
1. **Mağaza:** "Reklam izle, 50 Yıldız kazan!" butonu
2. **Ders sonrası:** "Bonus XP kazan! Reklam izle → 2x XP" butonu
3. **Streak freeze:** "Streak'ini koru! Reklam izle" (freeze yoksa)
4. **İpucu:** "Bir ipucu al! Reklam izle" (yıldız yetersizse)
5. **Günlük bonus:** "Günlük ödülünü al! Reklam izle" (spin wheel)

**Kurallar:**
- Reklam izleme TAMAMıYLA kullanıcı inisiyatifi (forced değil)
- Günde max 5 rewarded ad (çocuk sömürüsünü önle)
- Her rewarded ad arası minimum 5 dakika
- Reklam öncesi net açıklama: "Bir reklam izleyerek X kazanabilirsin"
- Reklam izleme sırasında skip butonu yok (30sn full izleme)

**Ödül Tablosu:**
| Yerleşim | Ödül | eCPM Tahmini |
|----------|------|-------------|
| Mağaza | 50 Yıldız | $8-15 |
| Ders sonrası 2x XP | XP × 2 | $10-20 |
| Streak freeze | 1 Freeze | $12-25 |
| İpucu | 1 İpucu | $6-12 |
| Günlük bonus | Spin wheel ödülü | $8-15 |

#### B. Interstitial Ads (Geçiş Reklamı)
**Yerleşim:** Ders tamamlama sonrası, navigasyon öncesi

**Frekans Kuralları:**
```
KURAL 1: Her 3 tamamlanan derste MAX 1 interstitial
KURAL 2: Ardışık 2 interstitial arası MIN 5 dakika
KURAL 3: İlk oturumdaki ilk 2 ders: Reklam YOK (yeni kullanıcı deneyimi)
KURAL 4: Günde MAX 6 interstitial
KURAL 5: Oturum başı MAX 2 interstitial (15dk oturum varsayımı)
KURAL 6: Premium kullanıcılar: 0 reklam
```

**Gösterim Akışı:**
1. Ders tamamlama ekranı gösterilir
2. "Devam Et" butonuna tıklanır
3. Countdown: "Reklam 3... 2... 1..." (çocuk hazırlıklı olsun)
4. Interstitial gösterilir
5. Close butonu 5 saniye sonra aktif
6. Reklam kapanır → navigasyon devam eder

#### C. Banner Ads
**KULLANILMAYACAK** — Banner reklamlar çocuk uygulamalarında:
- Kazara tıklama riski çok yüksek
- App Store Kids politikalarına uyumsuz olabilir
- UX bozar, kullanılabilir alan küçülür
- eCPM çok düşük ($0.5-2)

### 3.2 AdMob Konfigürasyonu

```typescript
// config/ads.config.ts
export const ADS_CONFIG = {
  // Platform-specific Ad Unit IDs
  ios: {
    rewarded: 'ca-app-pub-XXXXX/YYYYY',
    interstitial: 'ca-app-pub-XXXXX/ZZZZZ',
  },
  android: {
    rewarded: 'ca-app-pub-XXXXX/AAAAA',
    interstitial: 'ca-app-pub-XXXXX/BBBBB',
  },
  
  // Test IDs (development)
  test: {
    rewarded: 'ca-app-pub-3940256099942544/5224354917',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
  },
  
  // Frekans kuralları
  frequency: {
    interstitial: {
      lessonsPerAd: 3,              // Her 3 derste 1
      minIntervalMinutes: 5,        // Aradaki minimum süre
      maxPerSession: 2,             // Oturum başı max
      maxPerDay: 6,                 // Günlük max
      skipFirstLessons: 2,          // İlk 2 ders reklamsız
    },
    rewarded: {
      maxPerDay: 5,                 // Günlük max
      minIntervalMinutes: 5,        // Aradaki minimum süre
      cooldownAfterPurchase: 24,    // Satın alma sonrası 24 saat reklam teklif etme
    },
  },
  
  // Çocuk güvenliği
  childSafety: {
    tagForChildDirectedTreatment: true,  // COPPA compliance
    tagForUnderAgeOfConsent: true,        // GDPR compliance
    maxAdContentRating: 'G',              // General audience only
    testDeviceIds: ['YOUR_TEST_DEVICE_ID'],
  },
};
```

### 3.3 Reklam Gelir Tahmini (100K MAU)

| Metrik | Değer |
|--------|-------|
| DAU (MAU'nun %25'i) | 25,000 |
| Free kullanıcı (DAU'nun %90'ı) | 22,500 |
| Rewarded ad izleme oranı | %30 (6,750 kullanıcı/gün) |
| Ortalama izleme/kullanıcı/gün | 2.5 |
| Toplam rewarded impression/gün | 16,875 |
| Rewarded eCPM | $12 |
| Rewarded gelir/gün | $202 |
| Rewarded gelir/ay | **$6,070** |
| | |
| Interstitial gösterim/kullanıcı/gün | 1.2 |
| Toplam interstitial impression/gün | 27,000 |
| Interstitial eCPM | $5 |
| Interstitial gelir/gün | $135 |
| Interstitial gelir/ay | **$4,050** |
| | |
| **Toplam reklam geliri/ay** | **$10,120** |

---

## 4. In-App Purchase (IAP)

### 4.1 Elmas Paketleri

| Paket | Elmas | Fiyat (TRY) | Fiyat (USD) | Bonus |
|-------|-------|-------------|-------------|-------|
| Küçük Kutu | 100 💎 | ₺34.99 | $0.99 | - |
| Orta Kutu | 500 💎 | ₺139.99 | $4.99 | %10 bonus (550) |
| Büyük Kutu | 1200 💎 | ₺279.99 | $9.99 | %20 bonus (1440) |
| Mega Kutu | 3000 💎 | ₺549.99 | $19.99 | %30 bonus (3900) |

### 4.2 Elmas Harcama Yerleri

| Item | Fiyat (💎) | Kategori |
|------|----------|----------|
| Premium Avatar | 200 | Kosmetik |
| Aksesuar (şapka, gözlük) | 50-150 | Kosmetik |
| Profil çerçevesi | 100 | Kosmetik |
| Tema | 300 | Kosmetik |
| Nova outfit | 200 | Kosmetik |
| Streak Freeze (1x) | 100 | Utility |
| İpucu paketi (10x) | 80 | Utility |
| 2x XP Boost (1 saat) | 150 | Utility |
| Sınırsız kalpler (1 gün) | 200 | Utility |

### 4.3 Satın Alma Güvenliği

**Ebeveyn Koruması:**
1. Her satın alma öncesi: Parental Gate (matematik sorusu)
2. PIN doğrulama (ebeveyn PIN'i)
3. Apple/Google kendi satın alma onayları (ikinci katman)
4. Günlük satın alma limiti: Max 2 IAP/gün

**Receipt Validation:**
```
Kullanıcı satın alma → App Store/Play Store → Receipt → 
  → RevenueCat server-side validation →
  → Cloud Function → Firestore entitlement update →
  → Client entitlement sync
```

---

## 5. Subscription Paywall Stratejisi

### 5.1 Soft Paywall Noktaları

| Nokta | Tetikleyici | Mesaj | CTA |
|-------|-------------|-------|-----|
| Dünya kilidi | 3. dünyaya erişim | "Bu dünya Premium'da! 7 gün ücretsiz dene" | Trial başlat |
| Günlük limit | 5. ders sonrası | "Bugünlük dersler bitti! Premium ile sınırsız öğren" | Premium ol |
| Offline | Download butonu | "Offline öğrenme Premium özelliği" | Premium ol |
| Detaylı rapor | Ebeveyn panelinde | "Detaylı rapor Premium'da" | Premium ol |
| Nova evrimi | Teen aşamasında | "Nova daha da büyüyebilir! Premium ile devam" | Premium ol |

### 5.2 Paywall UI Tasarımı
```
┌─────────────────────────────────────────┐
│         ⭐ NovaLingo Plus ⭐             │
│                                          │
│  [Nova maskot - excited animasyon]       │
│                                          │
│  ✅ Tüm dünyalara erişim                │
│  ✅ Sınırsız ders                       │
│  ✅ Reklam yok                          │
│  ✅ Offline öğrenme                     │
│  ✅ Detaylı ebeveyn raporu              │
│  ✅ Nova'nın tüm evrimleri              │
│                                          │
│  ┌─────────────┐ ┌──────────────────┐   │
│  │   AYLIK     │ │    YILLIK ⭐     │   │
│  │  ₺149.99/ay │ │  ₺899.99/yıl    │   │
│  │             │ │  ₺74.99/ay       │   │
│  │             │ │  %50 TASARRUF    │   │
│  └─────────────┘ └──────────────────┘   │
│                                          │
│  [  7 GÜN ÜCRETSİZ DENE  ]  ← Ana CTA │
│                                          │
│  İstediğin zaman iptal et               │
│  ─────────────────────────              │
│  Gizlilik | Kullanım Koşulları | Geri   │
│           Yükle                          │
└─────────────────────────────────────────┘
```

### 5.3 Trial-to-Paid Dönüşüm Stratejisi

**Trial Sırasında (7 gün):**
- Gün 1: "Premium deneyimine hoş geldin!" bildirim
- Gün 3: "Nova yeni bir aşamaya ulaştı!" → Premium evrime dikkat çek
- Gün 5: "2 gün kaldı!" + öğrenme istatistikleri (ne kadar öğrendin göster)
- Gün 6: "Son gün yaklaşıyor!" + kaybedeceğin özellikler listesi
- Gün 7: "Trial bitti. Devam etmek ister misin?" + özel indirim (%20)

**Trial Sonrası (convert olmadıysa):**
- Hemen: Downgrade to free (smooth geçiş, veri kaybı yok)
- 1 hafta sonra: "Seni özledik!" + özel fiyat teklifi
- 1 ay sonra: Son şans teklifi
- Sonra: Normal frekans paywall gösterimi

---

## 6. RevenueCat Entegrasyonu

### 6.1 Entitlement Yapısı

```
Products:
├── novalingo_monthly_v1          # Aylık abonelik
├── novalingo_yearly_v1           # Yıllık abonelik
├── novalingo_family_yearly_v1    # Aile yıllık
├── novalingo_gems_100            # 100 Elmas
├── novalingo_gems_500            # 500 Elmas
├── novalingo_gems_1200           # 1200 Elmas
└── novalingo_gems_3000           # 3000 Elmas

Entitlements:
├── premium                       # Premium erişim
│   ├── novalingo_monthly_v1
│   ├── novalingo_yearly_v1
│   └── novalingo_family_yearly_v1
└── (gems are consumable, no entitlement)

Offerings:
├── default                       # Ana paywall
│   ├── monthly: novalingo_monthly_v1
│   └── annual: novalingo_yearly_v1 (highlighted)
├── family                        # Aile paywall
│   └── family_annual: novalingo_family_yearly_v1
├── trial_expired_discount        # Trial sonrası indirim
│   └── annual_discount: novalingo_yearly_v1 (20% off)
└── winback                       # Geri kazanma
    └── annual_winback: novalingo_yearly_v1 (30% off)
```

### 6.2 Webhook → Cloud Function

```typescript
// functions/src/monetization/webhookHandler.ts
// RevenueCat webhook'ları → Firestore güncelleme

export const handleSubscriptionEvent = onRequest(async (req, res) => {
  const event = req.body;
  
  switch (event.type) {
    case 'INITIAL_PURCHASE':
      // Premium aç
      await activatePremium(event.app_user_id, event.product_id);
      break;
      
    case 'RENEWAL':
      // Yenileme
      await renewPremium(event.app_user_id, event.expiration_at_ms);
      break;
      
    case 'CANCELLATION':
      // İptal — bitiş tarihine kadar erişim devam eder
      await markCancellation(event.app_user_id, event.expiration_at_ms);
      break;
      
    case 'EXPIRATION':
      // Süre doldu — premium kapat
      await deactivatePremium(event.app_user_id);
      break;
      
    case 'NON_RENEWING_PURCHASE':
      // Consumable (gems)
      await grantGems(event.app_user_id, event.product_id);
      break;
  }
});
```

---

## 7. Gelir Projeksiyonu (12 Ay)

### Varsayımlar
| Metrik | Değer |
|--------|-------|
| Ay 12 MAU | 140,000 |
| Premium dönüşüm | %5 |
| Ortalama subscription ARPU | $4/ay |
| Ad ARPU (free users) | $0.15/ay |
| IAP ARPU (tüm users) | $0.05/ay |

### Aylık Gelir Projeksiyonu

| Ay | MAU | Premium | Sub Gelir | Ad Gelir | IAP Gelir | Toplam |
|----|-----|---------|-----------|----------|-----------|--------|
| 1 | 5K | 1% (50) | $200 | $675 | $50 | $925 |
| 2 | 12K | 2% (240) | $960 | $1,620 | $120 | $2,700 |
| 3 | 25K | 3% (750) | $3,000 | $3,375 | $250 | $6,625 |
| 4 | 40K | 3.5% | $5,600 | $5,400 | $400 | $11,400 |
| 5 | 55K | 4% | $8,800 | $7,425 | $550 | $16,775 |
| 6 | 70K | 4% | $11,200 | $9,450 | $700 | $21,350 |
| 7 | 82K | 4.5% | $14,760 | $11,070 | $820 | $26,650 |
| 8 | 92K | 4.5% | $16,560 | $12,420 | $920 | $29,900 |
| 9 | 102K | 5% | $20,400 | $13,770 | $1,020 | $35,190 |
| 10 | 112K | 5% | $22,400 | $15,120 | $1,120 | $38,640 |
| 11 | 125K | 5% | $25,000 | $16,875 | $1,250 | $43,125 |
| 12 | 140K | 5% | $28,000 | $18,900 | $1,400 | $48,300 |
| **Yıllık Toplam** | | | **$156,880** | **$116,100** | **$8,600** | **$281,580** |

---

## 8. App Store Uyumluluk Checklist

### Apple App Store (Kids Category)
- [ ] Reklam içeriği çocuğa uygun (G rating)
- [ ] Kişiselleştirilmiş reklam kapalı
- [ ] Behavioral tracking kapalı
- [ ] Third-party analytics çocuk uyumlu
- [ ] Subscription terms açık ve görünür
- [ ] "Restore Purchases" butonu mevcut
- [ ] Privacy Policy linki mevcut
- [ ] Terms of Service linki mevcut
- [ ] Parental gate implement edilmiş
- [ ] Auto-renewable subscription disclaimers mevcut
- [ ] No external links in kid-facing UI

### Google Play (Families Policy)
- [ ] Families Self-Certified Ads SDK (AdMob uyumlu)
- [ ] Age gate veya mixed audience handling
- [ ] Target audience ve content declaration
- [ ] Data Safety section doldurulmuş
- [ ] Teacher Approved criteria gözden geçirilmiş
- [ ] Google's Family Policy gereksinimlerini karşılıyor
- [ ] Ads disclosure visible to children

---

## 9. A/B Test Planı (Monetizasyon)

| Test | Varyant A | Varyant B | Metrik |
|------|-----------|-----------|--------|
| Paywall timing | 3. dünyada | 5 ders sonrası | Trial start rate |
| Paywall design | Feature list | Karşılaştırma tablo | Conversion rate |
| Trial süresi | 7 gün | 14 gün | Trial-to-paid |
| Yıllık fiyat | ₺899 | ₺749 | Revenue per user |
| Rewarded ad placement | Mağaza | Ders sonrası | Ad engagement |
| Rewarded ad reward | 50 yıldız | 30 yıldız + 5 elmas | LTV impact |
| Interstitial frekans | Her 3 ders | Her 4 ders | Retention impact |
