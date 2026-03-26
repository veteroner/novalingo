# Example Conversation Scenario — Template

This file is a copy-paste starting point for content writers.
Replace all placeholder values and remove these comments.

```typescript
import type { ConversationScenario } from '../../../types/conversationScenario';

export const exampleScenario: ConversationScenario = {
  // ─── Metadata ───
  id: 'phase1_THEME_SHORT_NAME',
  version: 1,
  phase: 'phase1',
  title: 'English Title',
  titleTr: 'Türkçe Başlık',
  summary: 'One sentence describing what happens.',
  summaryTr: 'Bir cümlelik Türkçe açıklama.',
  theme: 'animals', // animals | food | colors | toys | emotions | routine
  subTheme: 'pet_shop',
  tags: ['animals', 'pets', 'request'],
  ageBand: '4_6', // 4_6 | 7_9 | 10_12
  difficulty: 'starter', // starter | core | stretch
  mode: 'guided', // guided | semi_open | open_ended
  energy: 'playful', // calm | playful | adventurous
  estimatedDurationSec: 70,
  turnCount: 2,
  sceneEmoji: '🐾',

  // ─── Learning ───
  targetWords: ['dog', 'cat', 'big', 'small'],
  targetPatterns: ['I want...'],
  learningGoals: ['request something', 'describe size'],

  // ─── Success ───
  successCriteria: {
    minimumAcceptedTurns: 2,
    minimumTargetWordsHit: 2,
    requiredPatterns: ['I want...'],
    allowCompletionOnHintedAnswer: true,
  },

  // ─── Reward ───
  reward: {
    rewardType: 'sticker',
    rewardId: 'example-sticker',
  },

  // ─── Selector Policy ───
  selection: {
    priority: 100,
    repeatCooldownDays: 3,
    preferredIfTagsSeen: ['animals'],
    avoidIfCompletedRecently: true,
  },

  // ─── Variants (min 2) ───
  variants: [
    { id: 'default', label: 'Default', labelTr: 'Varsayılan', promptStyle: 'default' },
    { id: 'playful', label: 'Playful', labelTr: 'Eğlenceli', promptStyle: 'playful' },
  ],

  // ─── Dialogue Tree ───
  entryNodeId: 'n1',
  nodes: [
    // --- Nova asks first question ---
    {
      id: 'n1',
      speaker: 'nova',
      role: 'guide',
      text: 'Hi there! What do you want?',
      textTr: 'Merhaba! Ne istiyorsun?',
      emoji: '👋',
      goalType: 'request',
      targetPattern: 'I want...',
      hint: {
        delayMs: 8000,
        text: 'Try saying: I want a dog.',
        textTr: 'Şöyle söylemeyi dene: I want a dog.',
        revealPattern: true,
      },
      repair: {
        enabled: true,
        prompt: 'Say: I want a dog.',
        promptTr: 'Şöyle söyle: I want a dog.',
        maxRetries: 2,
      },
      responses: [
        {
          id: 'r1_dog',
          expectedText: 'I want a dog!',
          expectedTextTr: 'Bir köpek istiyorum!',
          acceptedVariants: ['dog', 'a dog', 'i want dog'],
          acceptedWords: ['dog'],
          nextNodeId: 'n2',
          emoji: '🐶',
          marksTargetWord: ['dog'],
          marksPattern: ['I want...'],
        },
        {
          id: 'r1_cat',
          expectedText: 'I want a cat!',
          expectedTextTr: 'Bir kedi istiyorum!',
          acceptedVariants: ['cat', 'a cat', 'i want cat'],
          acceptedWords: ['cat'],
          nextNodeId: 'n2',
          emoji: '🐱',
          marksTargetWord: ['cat'],
          marksPattern: ['I want...'],
        },
      ],
    },

    // --- Nova's final message (terminal node) ---
    {
      id: 'n2',
      speaker: 'nova',
      role: 'friend',
      text: 'Great choice! You did it! ⭐',
      textTr: 'Harika seçim! Başardın! ⭐',
      emoji: '⭐',
      // No "next" or "responses" → terminal node
    },
  ],
};
```

## How to use

1. Copy this file to `src/features/learning/data/conversations/registry/phase1/{theme}/`
2. Rename file and export variable
3. Fill in all placeholder values
4. Register in `scenarioIndex.ts`:
   ```typescript
   import { yourScenario } from './phase1/{theme}/yourFile';
   // Add to PHASE1_CONVERSATION_SCENARIOS array
   ```
5. Run `validateConversationScenario(yourScenario)` to check for issues
6. Test in dev mode with `conversationScenarioRegistry` feature flag enabled
