import type { ConversationScenario } from '../../../types/conversationScenario';

/**
 * Body Checkup — 10-turn conversation.
 * Nova plays doctor and checks the child's body parts.
 * Turkish acceptedWords included for text-mode input.
 */
export const bodyCheckupScenario: ConversationScenario = {
  id: 'phase1_body_body_checkup',
  version: 1,
  phase: 'phase1',
  title: 'Body Checkup',
  titleTr: 'Vücut Kontrolü',
  summary: 'Nova plays doctor and asks the child to point to and name their body parts.',
  summaryTr:
    'Nova doktor rolüne girer ve çocuktan vücut parçalarını gösterip adlandırmasını ister.',
  theme: 'body',
  subTheme: 'checkup',
  tags: ['body', 'health', 'describe', 'point'],
  ageBand: '4_6',
  difficulty: 'starter',
  mode: 'guided',
  energy: 'calm',
  estimatedDurationSec: 200,
  turnCount: 10,
  sceneEmoji: '🩺',
  targetWords: ['head', 'nose', 'eyes', 'ears', 'mouth', 'hands', 'feet', 'big', 'small'],
  targetPatterns: ['I have two...', 'This is my...', 'I can...'],
  learningGoals: [
    'name body parts',
    'say counts (one, two)',
    'describe using "I have"',
    'follow instructions',
  ],
  successCriteria: {
    minimumAcceptedTurns: 6,
    minimumTargetWordsHit: 4,
    requiredPatterns: ['This is my...'],
    allowCompletionOnHintedAnswer: true,
  },
  reward: {
    rewardType: 'sticker',
    rewardId: 'doctor-sticker',
  },
  selection: {
    priority: 90,
    repeatCooldownDays: 3,
    preferredIfTagsSeen: ['body'],
    avoidIfCompletedRecently: true,
  },
  variants: [{ id: 'default', label: 'Default', labelTr: 'Varsayılan', promptStyle: 'default' }],
  entryNodeId: 'n1',
  nodes: [
    // ── Turn 1 ──────────────────────────────────────────────────────────────
    {
      id: 'n1',
      speaker: 'nova',
      role: 'guide',
      text: 'Hello! I am Doctor Nova! Are you ready for your checkup?',
      textTr: 'Merhaba! Ben Doktor Nova! Kontrole hazır mısın?',
      emoji: '🩺',
      goalType: 'react',
      targetPattern: 'Yes!',
      hint: { delayMs: 8000, text: 'Say: Yes, I am ready!', textTr: 'Söyle: Yes, I am ready!' },
      repair: { enabled: true, prompt: 'Say: Yes!', promptTr: 'Söyle: Yes!', maxRetries: 2 },
      responses: [
        {
          id: 'r1_yes',
          expectedText: 'Yes, I am ready!',
          expectedTextTr: 'Evet, hazırım!',
          acceptedVariants: ['yes', 'yes i am', 'i am ready', 'ready', 'yes im ready'],
          acceptedWords: ['yes', 'ready', 'evet', 'hazırım'],
          nextNodeId: 'n2',
          emoji: '✅',
          marksTargetWord: [],
          marksPattern: [],
        },
      ],
    },

    // ── Turn 2 ──────────────────────────────────────────────────────────────
    {
      id: 'n2',
      speaker: 'nova',
      role: 'guide',
      text: 'Great! First — can you touch your head? Say: This is my head!',
      textTr: 'Harika! Önce — başını dokunabilir misin? Söyle: This is my head!',
      emoji: '🤚',
      goalType: 'answer',
      targetPattern: 'This is my...',
      hint: { delayMs: 7000, text: 'Say: This is my head!', textTr: 'Söyle: This is my head!' },
      repair: {
        enabled: true,
        prompt: 'Touch your head and say: This is my head!',
        promptTr: 'Başına dokun ve söyle: This is my head!',
        maxRetries: 2,
      },
      responses: [
        {
          id: 'r2_head',
          expectedText: 'This is my head!',
          expectedTextTr: 'Bu benim başım!',
          acceptedVariants: ['head', 'this is my head', 'my head'],
          acceptedWords: ['head', 'baş', 'başım'],
          nextNodeId: 'n3',
          emoji: '🙂',
          marksTargetWord: ['head'],
          marksPattern: ['This is my...'],
        },
      ],
    },

    // ── Turn 3 ──────────────────────────────────────────────────────────────
    {
      id: 'n3',
      speaker: 'nova',
      role: 'guide',
      text: 'Perfect! Now point to your nose. Say: This is my nose!',
      textTr: 'Mükemmel! Şimdi burnuna işaret et. Söyle: This is my nose!',
      emoji: '👆',
      goalType: 'answer',
      targetPattern: 'This is my...',
      hint: { delayMs: 7000, text: 'Say: This is my nose!', textTr: 'Söyle: This is my nose!' },
      repair: {
        enabled: true,
        prompt: 'Point to your nose and say: This is my nose!',
        promptTr: 'Burnuna işaret et ve söyle: This is my nose!',
        maxRetries: 2,
      },
      responses: [
        {
          id: 'r3_nose',
          expectedText: 'This is my nose!',
          expectedTextTr: 'Bu benim burnum!',
          acceptedVariants: ['nose', 'this is my nose', 'my nose'],
          acceptedWords: ['nose', 'burun', 'burnum'],
          nextNodeId: 'n4',
          emoji: '👃',
          marksTargetWord: ['nose'],
          marksPattern: ['This is my...'],
        },
      ],
    },

    // ── Turn 4 ──────────────────────────────────────────────────────────────
    {
      id: 'n4',
      speaker: 'nova',
      role: 'guide',
      text: 'Excellent! Now — how many eyes do you have? Say: I have two eyes!',
      textTr: 'Mükemmel! Şimdi — kaç tane gözün var? Söyle: I have two eyes!',
      emoji: '👀',
      goalType: 'answer',
      targetPattern: 'I have two...',
      hint: { delayMs: 7000, text: 'Say: I have two eyes!', textTr: 'Söyle: I have two eyes!' },
      repair: {
        enabled: true,
        prompt: 'Count your eyes: I have two eyes!',
        promptTr: 'Gözlerini say: I have two eyes!',
        maxRetries: 2,
      },
      responses: [
        {
          id: 'r4_eyes',
          expectedText: 'I have two eyes!',
          expectedTextTr: 'İki gözüm var!',
          acceptedVariants: ['two eyes', 'i have two eyes', 'two', 'eyes', 'i have eyes'],
          acceptedWords: ['eyes', 'two', 'göz', 'gözüm', 'iki'],
          nextNodeId: 'n5',
          emoji: '👀',
          marksTargetWord: ['eyes'],
          marksPattern: ['I have two...'],
        },
      ],
    },

    // ── Turn 5 ──────────────────────────────────────────────────────────────
    {
      id: 'n5',
      speaker: 'nova',
      role: 'guide',
      text: 'Two eyes — very good! And how many ears do you have? Say: I have two ears!',
      textTr: 'İki göz — çok iyi! Ve kaç tane kulağın var? Söyle: I have two ears!',
      emoji: '👂',
      goalType: 'answer',
      targetPattern: 'I have two...',
      hint: { delayMs: 7000, text: 'Say: I have two ears!', textTr: 'Söyle: I have two ears!' },
      repair: {
        enabled: true,
        prompt: 'Touch your ears: I have two ears!',
        promptTr: 'Kulaklarına dokun: I have two ears!',
        maxRetries: 2,
      },
      responses: [
        {
          id: 'r5_ears',
          expectedText: 'I have two ears!',
          expectedTextTr: 'İki kulağım var!',
          acceptedVariants: ['two ears', 'i have two ears', 'ears', 'i have ears'],
          acceptedWords: ['ears', 'two', 'kulak', 'kulağım', 'iki'],
          nextNodeId: 'n6',
          emoji: '👂',
          marksTargetWord: ['ears'],
          marksPattern: ['I have two...'],
        },
      ],
    },

    // ── Turn 6 ──────────────────────────────────────────────────────────────
    {
      id: 'n6',
      speaker: 'nova',
      role: 'guide',
      text: 'Great! Can you open your mouth? Say: This is my mouth!',
      textTr: 'Harika! Ağzını açabilir misin? Söyle: This is my mouth!',
      emoji: '😮',
      goalType: 'answer',
      targetPattern: 'This is my...',
      hint: {
        delayMs: 7000,
        text: 'Open wide and say: This is my mouth!',
        textTr: 'Geniş aç ve söyle: This is my mouth!',
      },
      repair: {
        enabled: true,
        prompt: 'Say: This is my mouth!',
        promptTr: 'Söyle: This is my mouth!',
        maxRetries: 2,
      },
      responses: [
        {
          id: 'r6_mouth',
          expectedText: 'This is my mouth!',
          expectedTextTr: 'Bu benim ağzım!',
          acceptedVariants: ['mouth', 'this is my mouth', 'my mouth'],
          acceptedWords: ['mouth', 'ağız', 'ağzım'],
          nextNodeId: 'n7',
          emoji: '😁',
          marksTargetWord: ['mouth'],
          marksPattern: ['This is my...'],
        },
      ],
    },

    // ── Turn 7 ──────────────────────────────────────────────────────────────
    {
      id: 'n7',
      speaker: 'nova',
      role: 'guide',
      text: 'Beautiful smile! Show me your hands. How many hands do you have?',
      textTr: 'Güzel gülümseme! Ellerini göster. Kaç tane elin var?',
      emoji: '🤲',
      goalType: 'answer',
      targetPattern: 'I have two...',
      hint: {
        delayMs: 7000,
        text: 'Hold up your hands and say: I have two hands!',
        textTr: 'Ellerini kaldır ve söyle: I have two hands!',
      },
      repair: {
        enabled: true,
        prompt: 'Say: I have two hands!',
        promptTr: 'Söyle: I have two hands!',
        maxRetries: 2,
      },
      responses: [
        {
          id: 'r7_hands',
          expectedText: 'I have two hands!',
          expectedTextTr: 'İki elim var!',
          acceptedVariants: ['two hands', 'i have two hands', 'hands', 'i have hands'],
          acceptedWords: ['hands', 'hand', 'two', 'el', 'elim', 'iki'],
          nextNodeId: 'n8',
          emoji: '🤲',
          marksTargetWord: ['hands'],
          marksPattern: ['I have two...'],
        },
      ],
    },

    // ── Turn 8 ──────────────────────────────────────────────────────────────
    {
      id: 'n8',
      speaker: 'nova',
      role: 'guide',
      text: 'Wonderful! Now stomp your feet! Say: I have two feet!',
      textTr: 'Harika! Şimdi ayaklarını yere vur! Söyle: I have two feet!',
      emoji: '🦶',
      goalType: 'answer',
      targetPattern: 'I have two...',
      hint: {
        delayMs: 7000,
        text: 'Stomp and say: I have two feet!',
        textTr: 'Yere vur ve söyle: I have two feet!',
      },
      repair: {
        enabled: true,
        prompt: 'Say: I have two feet!',
        promptTr: 'Söyle: I have two feet!',
        maxRetries: 2,
      },
      responses: [
        {
          id: 'r8_feet',
          expectedText: 'I have two feet!',
          expectedTextTr: 'İki ayağım var!',
          acceptedVariants: ['two feet', 'i have two feet', 'feet', 'i have feet'],
          acceptedWords: ['feet', 'foot', 'two', 'ayak', 'ayağım', 'iki'],
          nextNodeId: 'n9',
          emoji: '🦶',
          marksTargetWord: ['feet'],
          marksPattern: ['I have two...'],
        },
      ],
    },

    // ── Turn 9 ──────────────────────────────────────────────────────────────
    {
      id: 'n9',
      speaker: 'nova',
      role: 'guide',
      text: 'Amazing! Can you jump? Can your feet jump? Say: Yes, I can jump!',
      textTr: 'İnanılmaz! Zıplayabilir misin? Ayakların zıplayabilir mi? Söyle: Yes, I can jump!',
      emoji: '🦘',
      goalType: 'answer',
      targetPattern: 'I can...',
      hint: { delayMs: 7000, text: 'Say: Yes, I can jump!', textTr: 'Söyle: Yes, I can jump!' },
      repair: {
        enabled: true,
        prompt: 'Jump and say: I can jump!',
        promptTr: 'Zıpla ve söyle: I can jump!',
        maxRetries: 2,
      },
      responses: [
        {
          id: 'r9_jump',
          expectedText: 'Yes, I can jump!',
          expectedTextTr: 'Evet, zıplayabilirim!',
          acceptedVariants: ['jump', 'yes i can', 'i can jump', 'yes i can jump'],
          acceptedWords: ['jump', 'can', 'yes', 'evet', 'zıpla', 'zıplayabilirim'],
          nextNodeId: 'n10',
          emoji: '🦘',
          marksTargetWord: [],
          marksPattern: ['I can...'],
        },
      ],
    },

    // ── Turn 10 ─────────────────────────────────────────────────────────────
    {
      id: 'n10',
      speaker: 'nova',
      role: 'guide',
      text: 'Superb! Your body is perfectly healthy! Say: My body is great!',
      textTr: 'Süper! Vücudun mükemmel sağlıklı! Söyle: My body is great!',
      emoji: '💪',
      goalType: 'answer',
      targetPattern: 'My body is...',
      hint: { delayMs: 7000, text: 'Say: My body is great!', textTr: 'Söyle: My body is great!' },
      repair: {
        enabled: true,
        prompt: 'Say: My body is great!',
        promptTr: 'Söyle: My body is great!',
        maxRetries: 2,
      },
      responses: [
        {
          id: 'r10_great',
          expectedText: 'My body is great!',
          expectedTextTr: 'Vücudum harika!',
          acceptedVariants: ['great', 'my body is great', 'body is great', 'i am great', 'amazing'],
          acceptedWords: ['great', 'body', 'amazing', 'harika', 'vücudum', 'mükemmel'],
          nextNodeId: 'n11',
          emoji: '🌟',
          marksTargetWord: [],
          marksPattern: [],
        },
      ],
    },

    {
      id: 'n11',
      speaker: 'nova',
      role: 'guide',
      text: 'HEALTHY! You passed the checkup! 🏆 You know all your body parts in English — BRILLIANT!',
      textTr:
        'SAĞLIKLI! Kontrolden geçtin! 🏆 İngilizce olarak tüm vücut parçalarını biliyorsun — HARİKASIN!',
      emoji: '🏆',
    },
  ],
};
