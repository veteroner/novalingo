# CLAUDE.md

NovaLingo — Türkçe konuşan çocuklar için İngilizce öğrenme oyunu.
React 19 + TypeScript + Vite + Firebase + Capacitor (iOS/Android). UI dili Türkçe, öğretilen dil İngilizce.

## Kalite Kapıları (commit'ten önce HEPSİ geçmeli)

```bash
pnpm type-check                      # tsc --noEmit — 0 hata
pnpm lint                            # eslint --max-warnings 0 — uyarı bile FAIL sayılır
pnpm test                            # vitest run — tümü yeşil (~4760 test)
pnpm validate:conversation-registry  # konuşma senaryosu şeması doğrulaması
```

`prebuild` ve `pretest`, `validate:conversation-registry`'yi otomatik çalıştırır. `build` = `tsc -b && vite build`.

> Not: ESLint `strictTypeChecked` profili kullanır. `no-unnecessary-condition`, `no-non-null-assertion`,
> `no-floating-promises`, `no-misused-promises` ve `react-hooks/*` HATA seviyesindedir. Test dosyaları
> (`*.test.*`, `__tests__/`, `src/test/`) için bu kuralların bir kısmı `eslint.config.js`'de gevşetilmiştir.

## Komutlar

| Amaç              | Komut                                           |
| ----------------- | ----------------------------------------------- |
| Geliştirme        | `pnpm dev`                                      |
| Tek test dosyası  | `pnpm vitest run <path>`                        |
| Lint düzelt       | `pnpm lint:fix`                                 |
| Storybook         | `pnpm storybook`                                |
| Android/iOS build | `pnpm cap:build:android` / `pnpm cap:build:ios` |
| Firebase emülatör | `pnpm firebase:emulators`                       |

## Mimari

- `src/features/<alan>/{screens,components,data,services}` — özellik bazlı (auth, home, learning, conversation, gamification, social, parent, legal).
- `src/components/{atoms,molecules,organisms,templates}` — paylaşılan UI (atomic design).
- `src/services/` — firebase, speech, audio, subscription, gamification, srs, offline, analytics, notification.
- `src/stores/` — Zustand (`authStore`, `childStore`, `lessonStore`, `conversationStore`, `uiStore`).
- `src/hooks/queries/` — TanStack Query sarmalayıcıları (sunucu durumu buradan).
- `functions/` (Firebase) ve `netlify/functions/` — backend; **ikisi de lint kapsamı dışındadır**.
- Rotalar: `src/app/Router.tsx` (lazy + `ProtectedRoute`/`PublicRoute`).

Yol alias'ları (`tsconfig.json`): `@/`, `@components`, `@features`, `@services`, `@stores`, `@hooks`, `@utils`, `@types`, `@assets`, `@config`, `@i18n`.

## İçerik Yazım Kuralları (ÖNEMLİ — testler zorlar)

`src/features/learning/data/__tests__/contentCoverage.test.ts` şunları zorunlu kılar:

1. **Her sözlük kelimesinin gerçek bir emoji'si olmalı.** `curriculum.ts`'e yeni `vocabulary` kelimesi
   eklersen, emoji'sini `activityGenerator.ts` içindeki `EMOJI_MAP` veya `EMOJI_FALLBACK_ALIASES`'a ekle.
   `getVocab(word).emoji` `'📝'` (fallback) dönerse test KIRILIR. (FlashCard/SpeakIt gibi aktiviteler ayrıca
   `wordEmojiMap.ts`'deki `WORD_EMOJI_MAP`'i kullanır — tutarlılık için oraya da ekle.)
2. Her dünya için ≥5 hikâye (`storyBank.ts`).
3. Sözlük cümleleri ham fallback (`This is ${word}.`) olmamalı.

Konuşma senaryoları `conversations/registry/` altında; ekledikten sonra `validate:conversation-registry` çalıştır.

## Konuşma Tanıma (STT) — dikkat

STT yalnızca Web Speech API (`webkitSpeechRecognition`) ile yapılır
([SpeakItActivity](src/features/learning/components/activities/SpeakItActivity.tsx),
[ConversationActivity](src/features/learning/components/activities/ConversationActivity.tsx)).
**Bu API iOS WKWebView'de yoktur, Android System WebView'de güvenilmezdir** — yani native Capacitor
build'lerinde "konuş" özelliği çalışmayabilir. Native plugin/bulut STT eklenmeden cihazda doğrulanmalı.
Serbest konuşma değerlendirmesi backend'de **Gemini** ile yapılır (`evaluateOpenEndedConversation`).

## Abonelik / Premium

Yetki otoritesi **sunucudur** (`users/{uid}/subscriptions/*`); `users.isPremium` bir projeksiyondur.
İstemci kontrolleri `src/services/subscription/premiumAccess.ts`. Ücretsiz katman günde 3 ders ile sınırlıdır,
ancak bu limit şu an yalnızca istemci tarafında zorlanır (sunucu kontrolü yok).

## i18n

`src/i18n/locales/{en,tr}` namespace bazlı, `react-i18next` + `LanguageDetector` (`localStorage`
anahtarı `novalingo_lang`), `fallbackLng: 'tr'`. Namespace'ler (`src/i18n/index.ts`'te kayıtlı):
`common, auth, home, lesson, shop, profile, gamification, parent`.

Tüm kullanıcıya dönük ekranlar i18n'e taşındı (tr+en eşitlenmiş). **Referans örnek:
[HomeScreen](src/features/home/screens/HomeScreen.tsx)** (`useTranslation('home')` + `t('key', { interpolation })`).
Konvansiyonlar:

- Yeni metin için: ilgili namespace JSON'una **tr ve en** ekle, `t()` ile kullan. Modül-seviyesi diziler
  (kategori/avatar/stage vb.) için etiketi değil **id**'yi sakla, etiketi `t(\`ns.${id}\`)` ile çöz.
- Link içeren cümlelerde `<Trans i18nKey=... components={{...}} />` kullan.
- Mesaj-içeriğine göre stil verme (`msg.includes('başarı')` gibi); ayrı bir `success` boolean tut.
- **Tek istisna:** `LegalScreen` içindeki yasal metin gövdeleri (PrivacyPolicy/TermsOfService) bilinçli
  olarak Türkçe; profesyonel/hukuki çeviri gerektirir. Ekran çerçevesi i18n'lidir.
- Testlerde `react-i18next` mock'lanmıştır (`t` anahtarı döndürür, interpolation'ı yok sayar —
  `src/test/setup.ts`); metin assert'i yapan testler **anahtar** bekler (örn. `getByText('review.start')`).
- Dil değiştirici: hızlı ayarlar modalında (Profil → ⚙️) TR/EN; `i18n.changeLanguage` çağırır,
  `LanguageDetector` `novalingo_lang` (localStorage) ile kalıcılaştırır.

## Konvansiyonlar

- UI metinleri ve JSDoc yorumları **Türkçe**.
- `react-router` v7 `navigate()` bir Promise döndürür — fire-and-forget ise `void navigate(...)` kullan.
- Hook'lar her zaman erken `return`'lerden **önce** çağrılmalı (Rules of Hooks).
- Phosphor ikonları: deprecated adlar yerine `*Icon` export'larını kullan (`import { GiftIcon as Gift }`).
