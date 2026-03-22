# Nova ile Konuş Template System Technical Design

> Amaç: Mevcut `conversationTemplates.ts` yaklaşımının hangi noktalarda yetersiz kaldığını ve yeni plana göre nasıl evrileceğini tanımlamak
> Kapsam: Mevcut template sistemi, hedef mimari, geçiş planı, dosya yapısı ve çalışma akışı
> Tarih: 22 Mart 2026

---

## 1. Problem Tanımı

Bugünkü konuşma sistemi temelde şu akışla çalışıyor:

1. Ders vocabulary listesi gelir.
2. `findBestTemplate(words)` kelime overlap üzerinden tek bir template seçer.
3. `buildNodes(words, translations, emojis)` node graph üretir.
4. `generateConversation()` bunu `ConversationData` içine koyar.
5. `ConversationActivity` serbest giriş/mikrofon ile bu graph’ı oynatır.

Bu yapı MVP için yeterliydi. Ancak planlanan ürün seviyesi için artık dardır.

---

## 2. Mevcut Sistemin Teknik Sınırları

### 2.1 Tek Dosyada Aşırı Birikim

Tüm konuşma şablonları tek dosyada tutuluyor. Bu yapı büyüdükçe:

- okunabilirlik düşer
- merge conflict artar
- test ve bakım zorlaşır

### 2.2 Template Seçimi Çok Basit

Bugün seçim mantığı yalnızca kelime set overlap’ına dayanıyor.

Eksikler:

- yaş bandı dikkate alınmıyor
- zorluk dikkate alınmıyor
- aynı kullanıcıya aynı şablon tekrar tekrar gelebilir
- görev tipi veya hedef pattern bazlı seçim yok

### 2.3 Senaryo Metadata’sı Yok

Template nesnesi şu alanlarla sınırlı:

- `categories`
- `title`
- `titleTr`
- `sceneEmoji`
- `minWords`
- `buildNodes`

Bu nedenle sistem içerik kalitesini ve pedagojik hedefi veri seviyesinde anlayamıyor.

### 2.4 Node’lar Fazla Legacy Mantıkla Yazılmış

Şu anda template’lerde child echo node’ları bulunuyor.

Sorun:

- UI zaten child bubble üretiyor
- data graph içinde tekrar eden child node’lar gereksiz karmaşıklık yaratıyor
- içerik yazımı uzuyor

### 2.5 Response Matching Çok Yatay

Bugünkü eşleme mantığı büyük ölçüde şuna bakıyor:

- pronunciation similarity
- substring match
- target word contains
- keyword match

Bu iyi bir başlangıç ama içerik bazında deklaratif rule sistemi olmadığı için kontrol dağınık kalıyor.

### 2.6 Analytics ve Validation Entegre Değil

Mevcut template sistemi şu soruları kendi başına cevaplayamıyor:

- Bu turda hangi pattern öğretildi?
- Hangi node en çok başarısızlık üretti?
- Hangi template tekrar açılmamalı?

---

## 3. Hedef Mimari

Yeni sistem `template` merkezli değil, `scenario registry` merkezli olmalı.

Ana fikir:

- Template sadece üretim aracı olsun.
- Asıl birim `scenario` olsun.
- Scenario metadata, response rules, repair logic ve selection policy birlikte taşınsın.

Önerilen katmanlar:

1. `Scenario Registry`
2. `Selector Engine`
3. `Runtime Mapper`
4. `Conversation Activity Runtime`
5. `Validation + Analytics`

---

## 4. Yeni Sistem Bileşenleri

### 4.1 Scenario Registry

Amaç:

- tüm konuşmaları parçalara ayrılmış, dosya bazlı ve metadata-rich yapıda tutmak

Registry sorumlulukları:

- scenario listesi sunmak
- theme/difficulty/ageBand ile filtrelenebilmek
- varyantları tanımlamak

### 4.2 Selector Engine

Amaç:

- o anki kullanıcı, lesson ve bağlama göre en uygun senaryoyu seçmek

Girdiler:

- lesson vocabulary
- child age/level
- recent conversation history
- completed scenarios
- desired difficulty
- optional theme bias

Çıktı:

- tek bir `ConversationScenario`

### 4.3 Runtime Mapper

Amaç:

- yeni senaryo formatını mevcut `ConversationActivity`'nin anlayacağı veri yapısına çevirmek

Bu sayede UI hemen tamamen kırılmadan kademeli geçiş yapılabilir.

### 4.4 Validation Layer

Amaç:

- içerik üretiminde graph hatalarını ve kalite eksiklerini build aşamasında yakalamak

### 4.5 Analytics Hooks

Amaç:

- her turn ve response rule seviyesinde ölçüm sağlamak

---

## 5. Önerilen Dosya Yapısı

```ts
src/features/learning/data/conversations/
  legacy/
    conversationTemplates.ts
  registry/
    scenarioIndex.ts
    phase1/
      animals/
        petShopPick.ts
        myFavoriteAnimal.ts
      food/
        fruitStandOrder.ts
        picnicBasket.ts
      colors/
        colorHunt.ts
  selectors/
    selectConversationScenario.ts
    scoreScenarioFit.ts
  mappers/
    toConversationActivityData.ts
  runtime/
    matchConversationResponse.ts
    conversationScoring.ts
  validators/
    validateConversationScenario.ts
  types/
    conversationScenario.ts
```

Kural:

- `legacy/` kısa vadede korunur
- yeni üretim `registry/` altında yapılır

---

## 6. Selector Engine Tasarımı

Bugünkü `findBestTemplate(words)` yerini aşağıdaki adımlı seçim mantığı almalı.

### Adım 1: Candidate Filtreleme

- senaryonun theme tag’i lesson vocabulary ile uyumlu mu?
- yaş bandı uyuyor mu?
- difficulty uygun mu?

### Adım 2: Fit Scoring

Her senaryoya puan verilir:

- vocabulary overlap
- target pattern relevance
- age fit
- recent repetition penalty
- completion novelty bonus

Örnek skor formülü:

```ts
score =
  overlapScore * 0.4 +
  difficultyFit * 0.2 +
  ageFit * 0.15 +
  noveltyScore * 0.15 +
  themePriority * 0.1;
```

### Adım 3: Variation Selection

- aynı scenario’nun hangi varyantı açılacak seçilir

### Adım 4: Runtime Mapping

- senaryo current UI formatına çevrilir

---

## 7. Template Nedir, Scenario Nedir?

Bu ayrımı netleştirmek gerekir.

### Template

- tekrarlayan iskelet mantığıdır
- örnek: `choice -> describe -> celebrate`
- reusable üretim kalıbıdır

### Scenario

- kullanıcıya görünen gerçek içeriktir
- örnek: `Pet Shop Pick`
- tema, kelime, reward, repair ve metinleri içerir

Karar:

- son kullanıcıya çalışan birim scenario’dur
- template sadece içerik yazım hızlandırıcısıdır

Bu ayrım yapılmazsa template dosyası büyümeye devam eder ve içerik yönetimi zorlaşır.

---

## 8. Child Echo Node Kararı

Bugünkü template’lerde sıkça şu yapı var:

- Nova node
- Child option
- Child echo node
- Nova response node

Yeni tasarımda öneri:

- echo node veri modelinden çıkarılsın
- UI child bubble’ı response rule üzerinden üretsin
- graph daha kısa ve okunur olsun

Legacy uyum için compat mapper geçici olarak echo node üretebilir.

Son hedef:

- data graph içinde sadece gerçek kontrol node’ları kalsın

---

## 9. Response Matching Motoru Değişikliği

Bugünkü matching mantığı `ConversationActivity` içinde gömülü durumda. Bu teknik borç yaratıyor.

Önerilen ayrışma:

- `matchConversationResponse.ts`
- `scoreResponseRule.ts`
- `normalizeUtterance.ts`

Yeni motor aşağıdaki sırayı izlemeli:

1. exact normalized rule match
2. accepted variant match
3. accepted word set match
4. pronunciation similarity
5. fallback repair decision

Bu mantık veri odaklı hale gelmeli; UI bileşeni sadece sonucu işlemeli.

Çıktı tipi örneği:

```ts
interface MatchConversationResponseResult {
  matched: boolean;
  responseRuleId?: string;
  nextNodeId?: string;
  confidence: number;
  usedRepair: boolean;
  targetWordsHit: string[];
  targetPatternsHit: string[];
}
```

---

## 10. Activity Generator Değişikliği

Bugünkü generator:

```ts
const template = findBestTemplate(words);
const nodes = template.buildNodes(selectedWords, translations, emojis);
```

Hedef generator:

```ts
const scenario = selectConversationScenario({
  lesson,
  child,
  vocabularyCards,
  recentConversationHistory,
});

const conversationData = toConversationActivityData(scenario);
```

Yani generator’ın sorumluluğu:

- template seçmek değil
- uygun scenario seçmek ve runtime data üretmek olmalı

---

## 11. ConversationActivity Değişiklikleri

Bugünkü `ConversationActivity` şu alanlara bağımlı:

- `nodes`
- `startNodeId`
- `targetWords`

Yeni teknik ihtiyaçlar:

- response rule id bazlı karar verme
- hint ve repair text’i doğrudan node’dan okuma
- completion criteria’yı scenario-level metadata’dan alma
- analytics eventlerini node ve rule seviyesinde emit etme

Önerilen değişiklikler:

### Kısa Vadede

- mevcut UI korunur
- mapper legacy shape üretir

### Orta Vadede

- activity props `ConversationScenarioRuntime` alır
- option yerine response rule tabanlı runtime kullanılır

---

## 12. Test Stratejisi

Yeni sistem için testler üç seviyede kurulmalı.

### 12.1 Content Validation Tests

- scenario graph valid mi?
- required metadata var mı?
- starter cümle limiti aşılmış mı?

### 12.2 Selector Tests

- hayvan dersi için animals senaryosu seçiliyor mu?
- tekrar penalty düzgün çalışıyor mu?
- yaş bandı uyumsuz senaryo eleniyor mu?

### 12.3 Runtime Match Tests

- kısa cevap kabul ediliyor mu?
- repair akışı doğru tetikleniyor mu?
- wrong input sonrası uygun fallback dönüyor mu?

---

## 13. Migration Roadmap

### Phase A: Document and Types

- yeni schema tipi eklenir
- dokümanlar hazırlanır

### Phase B: Registry Pilot

- ilk 5 senaryo registry altında yazılır
- compat mapper ile mevcut UI’da çalıştırılır

### Phase C: Selector Introduction

- `generateConversation()` selector kullanmaya başlar
- legacy template fallback korunur

### Phase D: Runtime Extraction

- matching logic activity içinden ayrılır

### Phase E: Legacy Sunset

- tüm aktif içerikler registry’ye taşınınca `conversationTemplates.ts` yalnızca fallback/demo olarak kalır veya kaldırılır

---

## 14. Teknik Karar Özeti

Kesin öneriler:

- tek büyük template dosyasından scenario registry modeline geç
- selection logic’i metadata bazlı hale getir
- response matching’i activity bileşeninden ayır
- hint ve repair akışını data seviyesine çıkar
- compat mapper ile kademeli migration yap
- legacy template sistemi bir süre fallback olarak tut

---

## 15. Sonraki Teknik Çıktılar

Bu dokümandan sonra üretilecek teknik işler:

1. `conversationScenario.ts` tip dosyası
2. `selectConversationScenario.ts` selector motoru
3. `toConversationActivityData.ts` compat mapper
4. `validateConversationScenario.ts` doğrulayıcı
5. Phase 1 için ilk 5 registry senaryosu
