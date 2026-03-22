# Nova ile Konuş Content Schema

> Amaç: Konuşma içeriklerinin kodda nasıl temsil edileceğini netleştirmek
> Kapsam: Mevcut `ConversationData` modelinden Phase 1 ve sonrası için önerilen şemaya geçiş
> Tarih: 22 Mart 2026

---

## 1. Mevcut Durum

Bugünkü konuşma veri modeli üç ana parçadan oluşuyor:

- `ConversationData`
- `ConversationNode`
- `ConversationOption`

Mevcut güçlü yönler:

- Basit node graph yapısı var.
- Şimdiki UI bunu doğrudan işleyebiliyor.
- `acceptableVariations` alanı serbest giriş eşleme için temel sağlıyor.
- `targetWords` ile kaba öğrenme takibi yapılabiliyor.

Mevcut yetersizlikler:

- Senaryo metadatası çok zayıf.
- Yaş bandı, zorluk, tema, pattern hedefi tutulmuyor.
- Repair ve hint akışı veri modelinde birinci sınıf vatandaş değil.
- Başarı kriteri içerik bazında tanımlanmıyor.
- Varyant setleri ve tekrar oynanabilirlik alanları yok.
- Analytics için node-level intent bilgisi yok.

Bu yüzden iki katmanlı bir şema önerilmeli:

- `Content Registry Layer`
- `Runtime Dialogue Layer`

---

## 2. Tasarım İlkesi

Yeni şema şu soruları cevaplamalı:

- Bu içerik ne öğretiyor?
- Kim için yazıldı?
- Ne kadar sürmeli?
- Hangi cevapları kabul edeceğiz?
- Çocuk zorlanırsa ne diyeceğiz?
- Bu akışın varyantları neler?
- Sonuçta neyi analitikte ölçeceğiz?

---

## 3. Önerilen Model Katmanları

### 3.1 Registry Layer

İçerik paketini ve senaryonun üst metadata’sını taşır.

### 3.2 Runtime Layer

UI’ın işlediği node graph ve response kurallarını taşır.

### 3.3 Selection Layer

Hangi çocuğa hangi senaryonun seçileceğini belirleyen alanları taşır.

---

## 4. Önerilen TypeScript Modeli

```ts
export type ConversationAgeBand = '4_6' | '7_9' | '10_12';
export type ConversationDifficulty = 'starter' | 'core' | 'stretch';
export type ConversationMode = 'guided' | 'semi_open' | 'mission' | 'story';
export type ConversationEnergy = 'calm' | 'playful' | 'exciting';
export type ConversationGoalType =
  | 'choose'
  | 'describe'
  | 'request'
  | 'answer'
  | 'ask'
  | 'react'
  | 'compare'
  | 'express_feeling'
  | 'solve'
  | 'sequence';

export interface ConversationScenario {
  id: string;
  version: number;
  title: string;
  titleTr: string;
  summary: string;
  summaryTr: string;
  theme: string;
  subTheme: string;
  tags: string[];
  ageBand: ConversationAgeBand;
  difficulty: ConversationDifficulty;
  mode: ConversationMode;
  energy: ConversationEnergy;
  estimatedDurationSec: number;
  turnCount: number;
  sceneEmoji: string;
  targetWords: string[];
  targetPatterns: string[];
  learningGoals: string[];
  successCriteria: ConversationSuccessCriteria;
  reward: ConversationReward;
  selection: ConversationSelectionPolicy;
  variants: ConversationVariant[];
  entryNodeId: string;
  nodes: ConversationNodeV2[];
}

export interface ConversationSuccessCriteria {
  minimumAcceptedTurns: number;
  minimumTargetWordsHit: number;
  requiredPatterns?: string[];
  allowCompletionOnHintedAnswer: boolean;
}

export interface ConversationReward {
  rewardType: 'praise' | 'sticker' | 'badge_progress' | 'collectible' | 'none';
  rewardId?: string;
}

export interface ConversationSelectionPolicy {
  priority: number;
  repeatCooldownDays?: number;
  preferredIfTagsSeen?: string[];
  avoidIfCompletedRecently?: boolean;
}

export interface ConversationVariant {
  id: string;
  label: string;
  labelTr: string;
  promptStyle: 'default' | 'short' | 'playful' | 'mission';
  swapWordSets?: string[];
}

export interface ConversationNodeV2 {
  id: string;
  speaker: 'nova' | 'child' | 'system';
  role?: 'guide' | 'friend' | 'shopkeeper' | 'teammate' | 'narrator';
  text: string;
  textTr: string;
  audioUrl?: string;
  emoji?: string;
  intent?: string;
  goalType?: ConversationGoalType;
  targetWord?: string;
  targetPattern?: string;
  hint?: ConversationHint;
  repair?: ConversationRepair;
  scoring?: ConversationScoringRule;
  responses?: ConversationResponseRule[];
  next?: string;
}

export interface ConversationHint {
  delayMs?: number;
  text: string;
  textTr: string;
  revealPattern?: boolean;
}

export interface ConversationRepair {
  enabled: boolean;
  prompt: string;
  promptTr: string;
  maxRetries: number;
  fallbackResponse?: string;
  fallbackResponseTr?: string;
}

export interface ConversationScoringRule {
  scoreType: 'target_word' | 'pattern' | 'turn_completion' | 'mission_step';
  weight: number;
}

export interface ConversationResponseRule {
  id: string;
  expectedText: string;
  expectedTextTr: string;
  acceptedVariants: string[];
  acceptedWords?: string[];
  minimumConfidence?: number;
  nextNodeId: string;
  marksTargetWord?: string[];
  marksPattern?: string[];
}
```

---

## 5. Mevcut Model ile Önerilen Model Eşlemesi

### Bugünkü Alanlar

```ts
ConversationData {
  title
  titleTr
  sceneEmoji
  nodes
  startNodeId
  targetWords
}
```

### Yarınki Ana Alanlar

```ts
ConversationScenario {
  id
  version
  theme
  subTheme
  ageBand
  difficulty
  mode
  targetWords
  targetPatterns
  successCriteria
  selection
  variants
  entryNodeId
  nodes
}
```

Korunacak mevcut alanlar:

- `title`
- `titleTr`
- `sceneEmoji`
- `nodes`
- `startNodeId` veya `entryNodeId`
- `targetWords`

Genişletilecek alanlar:

- `ConversationOption` yerine `ConversationResponseRule[]`
- `targetWord` alanı node seviyesinde korunur ama `targetPattern` ile genişler

Eklenecek yeni alanlar:

- `ageBand`
- `difficulty`
- `mode`
- `successCriteria`
- `repair`
- `hint`
- `scoring`
- `selection`
- `variants`

---

## 6. Runtime İçin Geriye Dönük Uyum Stratejisi

UI tarafı bir anda tamamen değişmemeli. Bunun yerine iki seviye destek önerilir.

### Aşama 1: Compat Layer

Yeni senaryo objesi runtime'a girmeden önce `ConversationActivityData` formatına dönüştürülür.

Örnek:

```ts
function toConversationActivityData(
  scenario: ConversationScenario,
): ConversationData {
  return {
    type: 'conversation',
    title: scenario.title,
    titleTr: scenario.titleTr,
    sceneEmoji: scenario.sceneEmoji,
    startNodeId: scenario.entryNodeId,
    targetWords: scenario.targetWords,
    nodes: scenario.nodes.map(toLegacyNode),
  };
}
```

Bu yaklaşım sayesinde UI aynı kalırken içerik veri modeli güçlenebilir.

### Aşama 2: Native V2 Runtime

Sonraki fazda `ConversationActivity` doğrudan `ConversationScenario` ve `ConversationResponseRule` ile çalışır.

---

## 7. Kod Organizasyonu Önerisi

Mevcut dosya yapısı içinde yeni klasörleme önerisi:

```ts
src/features/learning/data/conversations/
  registry/
    phase1Scenarios.ts
    scenarioIndex.ts
  schemas/
    conversationSchema.ts
  selectors/
    selectConversationScenario.ts
  mappers/
    toConversationActivityData.ts
  validators/
    validateConversationScenario.ts
  packs/
    animals/
      petShopPick.ts
      myFavoriteAnimal.ts
    food/
      fruitStandOrder.ts
      picnicBasket.ts
```

Bu yapı template tabanlı tek dosya sisteminden daha ölçeklenebilir olur.

---

## 8. İçerik Kaydetme Formatı Kararı

İki ana seçenek vardır:

### Seçenek A: TypeScript Object Files

Artıları:

- tip güvenliği yüksek
- import/export kolay
- placeholder logic rahat
- test etmek kolay

Eksileri:

- içerik ekleme geliştirici bağımlı olur

### Seçenek B: JSON Content Packs

Artıları:

- içerik ve kod ayrışır
- ileride CMS benzeri yapı kolaylaşır

Eksileri:

- validation katmanı gerekir
- placeholder ve fonksiyonel varyasyon üretimi zorlaşır

Kısa vadeli öneri:

- Phase 1 ve Phase 2 için TypeScript object files
- Phase 3 sonrası JSON veya remote content pack değerlendirmesi

---

## 9. Validation Gereksinimleri

Her senaryo build anında doğrulanmalı.

Validator kuralları:

- benzersiz node id
- geçerli `nextNodeId`
- en az bir terminal node
- en az bir `targetWord`
- boş `acceptedVariants` olmaması
- starter senaryolarda cümle uzunluğu limitleri
- `turnCount` ile graph tutarlılığı
- reward type geçerliliği

Önerilen dosya:

- `validateConversationScenario.ts`

---

## 10. Analytics Olayları

Yeni şema şu eventleri beslemeli:

- `conversation_started`
- `conversation_turn_completed`
- `conversation_hint_shown`
- `conversation_repair_prompt_used`
- `conversation_target_word_hit`
- `conversation_pattern_hit`
- `conversation_completed`
- `conversation_abandoned`

Her event payload’ında şu alanlar bulunmalı:

- `scenarioId`
- `variantId`
- `theme`
- `difficulty`
- `ageBand`
- `turnId`
- `inputMode`
- `matchedResponseRuleId`
- `usedHint`
- `usedRepair`

---

## 11. Migration Planı

### Step 1

Yeni `ConversationScenario` tipi eklenir.

### Step 2

Compat mapper yazılır.

### Step 3

Phase 1’in ilk senaryoları yeni schema ile yazılır.

### Step 4

`generateConversation()` yalnızca `findBestTemplate()` çağırmak yerine scenario selector kullanır.

### Step 5

Eski `conversationTemplates.ts` fallback legacy pack olarak tutulur.

### Step 6

Tüm konuşmalar yeni registry’ye taşınınca legacy template dosyası kaldırılır veya sadece test fixture olarak bırakılır.

---

## 12. Kısa Karar Özeti

Net kararlar:

- içerik modeli metadata-first olmalı
- node graph korunmalı ama response rule ile güçlendirilmeli
- kısa vadede TypeScript object registry kullanılmalı
- UI uyumu için compat mapper yazılmalı
- analytics ve validation ilk günden modele girmeli
