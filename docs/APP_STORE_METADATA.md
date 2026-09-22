# NovaLingo — App Store and Google Play Metadata

> Launch copy aligned with what the app actually enforces (see `docs/MONETIZATION.md`).
> Last updated: 22 September 2026. Character counts were checked against each store's limits.

## Product Positioning

- Category: Education
- Audience: Turkish-speaking children ages 4–12 and their parents
- Commercial model: Ad-free freemium with an optional NovaLingo Plus subscription
- Free: first 4 of 9 worlds, 3 lessons per day
- Plus: all 9 worlds, unlimited lessons, detailed parent report

### Claims we must NOT make

| Claim                       | Why                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------- |
| "No ads" as a Plus benefit  | The app has no ads on any tier. "Ad-free" is fine; selling it as an upgrade is not.                     |
| "Up to 5 child profiles"    | The limit exists in code, but there is no UI to add or switch profiles yet.                             |
| "Checks your pronunciation" | STT uses the Web Speech API: missing in iOS WKWebView, unreliable in Android WebView.                   |
| Free trial                  | Only mention one if the store has an introductory offer configured (the paywall follows the same rule). |
| Offline premium access      | Not implemented.                                                                                        |

## ASO keywords

Primary TR intent: _çocuklar için ingilizce_, _ingilizce öğren_, _ingilizce kelime oyunu_,
_okul öncesi ingilizce_, _ilkokul ingilizce_. The title carries the strongest term
("Çocuklara İngilizce"); the subtitle, short description and first description line repeat
the secondary terms naturally. No keyword stuffing, no competitor names.

## App Store Connect

| Field         | TR                                                                                                | EN                               |
| ------------- | ------------------------------------------------------------------------------------------------- | -------------------------------- |
| Name (30)     | NovaLingo: Çocuklara İngilizce (30)                                                               | NovaLingo: English for Kids (27) |
| Subtitle (30) | Oyunla kelime ve konuşma (24)                                                                     | Learn words through play (24)    |
| Category      | Education (secondary: Games → Educational)                                                        | same                             |
| Age rating    | 4+                                                                                                | 4+                               |
| Kids Category | **No** — guideline 1.3 restricts third-party analytics; the app ships Firebase Analytics + Sentry | same                             |

Keywords (100, comma separated, no spaces after commas, don't repeat title words):

```text
TR: ingilizce öğren,kelime,çocuk,oyun,ilkokul,okul öncesi,yabancı dil,dinleme,hikaye,eğitici,ders,kids
EN: english,kids,learn,vocabulary,words,turkish,esl,preschool,games,listening,stories,education,flashcards
```

Promotional text (170):

```text
TR: Nova ile her gün birkaç dakikada İngilizce kelimeler, kısa cümleler ve hikâyeler. Reklamsız, çocuklar için güvenli.
EN: A few minutes a day with Nova: English words, short sentences and stories. Ad-free and safe for kids.
```

Description (TR) — same text as the Play full description below.

### Review Notes

```text
NovaLingo is a children's app. Parent-only areas (subscription, parent dashboard, settings)
are behind a parental gate (a multiplication question).

The app offers optional auto-renewable NovaLingo Plus subscriptions. Premium access is
unlocked only after backend verification of the store transaction. If a sandbox purchase
appears delayed, use Restore Purchases.

Free users get the first 4 worlds with a limit of 3 lessons per day. The detailed parent
report is Plus-only. No account is required: "Hemen Başla (Kayıtsız)" starts a guest session.
```

## Google Play Console

| Field                  | TR                                                                                 | EN                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| App name (30)          | NovaLingo: Çocuklara İngilizce (30)                                                | NovaLingo: English for Kids (27)                                                   |
| Short description (80) | Çocuklar için reklamsız, oyunlu İngilizce. Ücretsiz başla, Plus ile genişlet. (77) | Ad-free English for Turkish-speaking kids. Start free, unlock more with Plus. (77) |

### Full description (TR)

```text
NovaLingo, Türkçe konuşan çocukların İngilizceyi oyun oynayarak öğrendiği, reklamsız bir öğrenme uygulamasıdır. Okul öncesi ve ilkokul çağındaki çocuklar için İngilizce kelime oyunları, dinleme etkinlikleri ve kısa hikâyeler bir arada.

Rehber karakter Nova ile çocuklar renkli dünyaları keşfeder; kelimeleri, kısa cümleleri ve günlük konuşma kalıplarını eşleştirme, dinleme, hikâye ve konuşma pratiği etkinlikleriyle öğrenir.

Neler var?
• 9 tematik dünya: Başlangıç Bahçesi, Gramer Kalesi, Hikâye Ormanı, Şehir Meydanı ve daha fazlası
• Resimli İngilizce kelime kartları, dinle-seç, eşleştirme ve hikâye etkinlikleri
• Nova ile konuşma pratiği
• Akıllı tekrar sistemi: unutulmaya başlayan kelimeler doğru zamanda tekrar gelir
• Yıldızlar, rozetler ve seri takibiyle motive eden ilerleme sistemi
• Ebeveyn paneli: çocuğunuzun ilerlemesini tek ekrandan görün

Ücretsiz planda:
• İlk 4 dünya
• Günde 3 ders

NovaLingo Plus ile:
• 9 dünyanın tamamı
• Sınırsız günlük ders
• Detaylı ebeveyn raporu

Çocuklar için güvenli:
• Reklam yok
• Satın alma ve ebeveyn ayarları ebeveyn doğrulamasının arkasındadır
• Liderlik tablosunda diğer çocukların adları gösterilmez
• Bildirimler ebeveyne gider

NovaLingo ücretsiz indirilir. Plus, uygulama içinden isteğe bağlı otomatik yenilenen abonelik olarak sunulur; mağaza hesabınızdan istediğiniz zaman iptal edebilirsiniz.
```

### Full description (EN)

```text
NovaLingo is an ad-free app where Turkish-speaking children learn English through play. English vocabulary games, listening activities and short stories for preschool and primary school kids.

With Nova as their guide, children explore colourful worlds and learn words, short sentences and everyday phrases through matching, listening, story and speaking-practice activities.

What's inside
• 9 themed worlds: Beginner Garden, Grammar Castle, Story Forest, City Square and more
• Picture flashcards, listen-and-choose, matching and story activities
• Speaking practice with Nova
• Smart review: words come back right before they are forgotten
• Stars, badges and streaks that keep kids motivated
• Parent dashboard: see your child's progress on one screen

Free plan
• First 4 worlds
• 3 lessons per day

NovaLingo Plus
• All 9 worlds
• Unlimited daily lessons
• Detailed parent report

Safe for kids
• No ads
• Purchases and parent settings sit behind a parental gate
• Other children's names are never shown on the leaderboard
• Notifications go to the parent

NovaLingo is free to download. Plus is an optional auto-renewing subscription offered in the app; you can cancel any time from your store account.
```

### Graphics

Generated from the running app (emulator, Turkish UI) with a caption band:
`phone1–5.png` (1080×1920), `feature.png` (1024×500), icon `public/icon-512x512.png`.
Regenerate after visible UI changes so screenshots never show features the build lacks.

### Families and Policy Notes

- No ads, no behavioural advertising
- Digital purchases: subscription only, behind the parental gate
- Social features for children: none (pseudonymous leaderboard, no child-to-child contact)
- Open-ended answers are evaluated on device (`VITE_OPEN_ENDED_EVALUATOR=local`); Gemini API
  is not used because its terms forbid apps directed at under-18s

## Launch Checklist

- Internal testing sandbox purchases completed on iOS and Android
- Restore purchases flow verified on both platforms
- Cancellation and renewal scenarios verified in sandbox
- Store listing copy checked against actual enforced free and Plus limits
- Play App Signing SHA-1 added to Firebase (Google sign-in on Android)
