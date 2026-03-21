/**
 * Conversation Scenario Templates
 *
 * Her dünya/ünite teması için senaryolu diyalog ağaçları.
 * Vocabulary placeholder'ları ({word1}, {word2}...) kullanılır,
 * generator bunları gerçek kelimelerle doldurur.
 *
 * Senaryo yapısı:
 *  - Nova bir sahne kurar ve soru sorar
 *  - Çocuk seçeneklerden birini söyler/tıklar
 *  - Nova cevaba göre devam eder
 *  - 3-5 tur sonra sahne biter
 */

import type { ConversationNode } from '@/types/content';

export interface ConversationTemplate {
  /** Which vocabulary categories this template works with */
  categories: string[];
  title: string;
  titleTr: string;
  sceneEmoji: string;
  /** How many vocabulary words this template needs (min) */
  minWords: number;
  /** Build the dialogue nodes from actual vocabulary words */
  buildNodes: (words: string[], translations: string[], emojis: string[]) => ConversationNode[];
}

// ===== TEMPLATE: PET SHOP =====
const petShopTemplate: ConversationTemplate = {
  categories: ['animals', 'pets'],
  title: 'At the Pet Shop',
  titleTr: 'Evcil Hayvan Dükkanında',
  sceneEmoji: '🏪',
  minWords: 3,
  buildNodes: (words, translations, emojis) => {
    const [w0 = 'cat', w1 = 'dog', w2 = 'fish'] = words;
    const [t0 = 'kedi', t1 = 'köpek', t2 = 'balık'] = translations;
    const [e0 = '🐱', e1 = '🐶', e2 = '🐟'] = emojis;

    return [
      {
        id: 'n1',
        speaker: 'nova',
        text: 'Welcome to the pet shop! What animal do you want?',
        textTr: 'Evcil hayvan dükkanına hoş geldin! Hangi hayvanı istersin?',
        emoji: '🤖',
        options: [
          {
            text: `I want a ${w0}!`,
            textTr: `Bir ${t0} istiyorum!`,
            emoji: e0,
            nextNodeId: 'c1a',
            acceptableVariations: [w0, `a ${w0}`, `the ${w0}`],
          },
          {
            text: `I want a ${w1}!`,
            textTr: `Bir ${t1} istiyorum!`,
            emoji: e1,
            nextNodeId: 'c1b',
            acceptableVariations: [w1, `a ${w1}`, `the ${w1}`],
          },
          {
            text: `I want a ${w2}!`,
            textTr: `Bir ${t2} istiyorum!`,
            emoji: e2,
            nextNodeId: 'c1c',
            acceptableVariations: [w2, `a ${w2}`, `the ${w2}`],
          },
        ],
      },
      // — Child choice branches (all converge to n2) —
      {
        id: 'c1a',
        speaker: 'child',
        text: `I want a ${w0}!`,
        textTr: `Bir ${t0} istiyorum!`,
        emoji: e0,
        next: 'n2a',
      },
      {
        id: 'n2a',
        speaker: 'nova',
        text: `A ${w0}! Great choice! ${e0}`,
        textTr: `Bir ${t0}! Harika seçim!`,
        next: 'n3',
      },
      {
        id: 'c1b',
        speaker: 'child',
        text: `I want a ${w1}!`,
        textTr: `Bir ${t1} istiyorum!`,
        emoji: e1,
        next: 'n2b',
      },
      {
        id: 'n2b',
        speaker: 'nova',
        text: `A ${w1}! Awesome! ${e1}`,
        textTr: `Bir ${t1}! Muhteşem!`,
        next: 'n3',
      },
      {
        id: 'c1c',
        speaker: 'child',
        text: `I want a ${w2}!`,
        textTr: `Bir ${t2} istiyorum!`,
        emoji: e2,
        next: 'n2c',
      },
      {
        id: 'n2c',
        speaker: 'nova',
        text: `A ${w2}! Cool! ${e2}`,
        textTr: `Bir ${t2}! Harika!`,
        next: 'n3',
      },
      // — Round 2: Color/size question —
      {
        id: 'n3',
        speaker: 'nova',
        text: 'Is it big or small?',
        textTr: 'Büyük mü küçük mü?',
        options: [
          {
            text: 'It is big!',
            textTr: 'Büyük!',
            emoji: '💪',
            nextNodeId: 'c2a',
            acceptableVariations: ['big', 'its big', 'it is big'],
          },
          {
            text: 'It is small!',
            textTr: 'Küçük!',
            emoji: '🤏',
            nextNodeId: 'c2b',
            acceptableVariations: ['small', 'its small', 'it is small', 'little'],
          },
        ],
      },
      {
        id: 'c2a',
        speaker: 'child',
        text: 'It is big!',
        textTr: 'Büyük!',
        emoji: '💪',
        next: 'n4a',
      },
      {
        id: 'n4a',
        speaker: 'nova',
        text: 'A big pet! Very strong! 💪',
        textTr: 'Büyük bir evcil hayvan! Çok güçlü!',
        next: 'n5',
      },
      {
        id: 'c2b',
        speaker: 'child',
        text: 'It is small!',
        textTr: 'Küçük!',
        emoji: '🤏',
        next: 'n4b',
      },
      {
        id: 'n4b',
        speaker: 'nova',
        text: 'A small pet! So cute! 🥰',
        textTr: 'Küçük bir evcil hayvan! Çok tatlı!',
        next: 'n5',
      },
      // — Round 3: Name —
      {
        id: 'n5',
        speaker: 'nova',
        text: 'Do you like your new pet?',
        textTr: 'Yeni evcil hayvanını sevdin mi?',
        options: [
          {
            text: 'Yes, I love it!',
            textTr: 'Evet, bayıldım!',
            emoji: '❤️',
            nextNodeId: 'c3a',
            acceptableVariations: ['yes', 'i love it', 'yes i do', 'love'],
          },
          {
            text: 'It is so cool!',
            textTr: 'Çok havalı!',
            emoji: '😎',
            nextNodeId: 'c3b',
            acceptableVariations: ['cool', 'so cool', 'its cool'],
          },
        ],
      },
      {
        id: 'c3a',
        speaker: 'child',
        text: 'Yes, I love it!',
        textTr: 'Evet, bayıldım!',
        emoji: '❤️',
        next: 'end',
      },
      {
        id: 'c3b',
        speaker: 'child',
        text: 'It is so cool!',
        textTr: 'Çok havalı!',
        emoji: '😎',
        next: 'end',
      },
      // — End —
      {
        id: 'end',
        speaker: 'nova',
        text: 'Bye bye! See you next time! 👋',
        textTr: 'Hoşça kal! Bir dahaki sefere görüşürüz!',
        emoji: '👋',
      },
    ];
  },
};

// ===== TEMPLATE: FOOD ORDERING =====
const foodOrderTemplate: ConversationTemplate = {
  categories: ['food', 'fruits', 'vegetables', 'drinks'],
  title: 'At the Restaurant',
  titleTr: 'Restoranda',
  sceneEmoji: '🍽️',
  minWords: 3,
  buildNodes: (words, translations, emojis) => {
    const [w0 = 'apple', w1 = 'banana', w2 = 'water'] = words;
    const [t0 = 'elma', t1 = 'muz', t2 = 'su'] = translations;
    const [e0 = '🍎', e1 = '🍌', e2 = '💧'] = emojis;

    return [
      {
        id: 'n1',
        speaker: 'nova',
        text: 'Hello! Welcome! What would you like to eat?',
        textTr: 'Merhaba! Hoş geldin! Ne yemek istersin?',
        emoji: '🤖',
        options: [
          {
            text: `I want ${w0}, please.`,
            textTr: `${t0} istiyorum, lütfen.`,
            emoji: e0,
            nextNodeId: 'c1a',
            acceptableVariations: [w0, `want ${w0}`, `i want ${w0}`],
          },
          {
            text: `I want ${w1}, please.`,
            textTr: `${t1} istiyorum, lütfen.`,
            emoji: e1,
            nextNodeId: 'c1b',
            acceptableVariations: [w1, `want ${w1}`, `i want ${w1}`],
          },
          {
            text: `I want ${w2}, please.`,
            textTr: `${t2} istiyorum, lütfen.`,
            emoji: e2,
            nextNodeId: 'c1c',
            acceptableVariations: [w2, `want ${w2}`, `i want ${w2}`],
          },
        ],
      },
      {
        id: 'c1a',
        speaker: 'child',
        text: `I want ${w0}, please.`,
        textTr: `${t0} istiyorum, lütfen.`,
        emoji: e0,
        next: 'n2',
      },
      {
        id: 'c1b',
        speaker: 'child',
        text: `I want ${w1}, please.`,
        textTr: `${t1} istiyorum, lütfen.`,
        emoji: e1,
        next: 'n2',
      },
      {
        id: 'c1c',
        speaker: 'child',
        text: `I want ${w2}, please.`,
        textTr: `${t2} istiyorum, lütfen.`,
        emoji: e2,
        next: 'n2',
      },
      {
        id: 'n2',
        speaker: 'nova',
        text: 'Good choice! Are you hungry?',
        textTr: 'İyi seçim! Aç mısın?',
        options: [
          {
            text: 'Yes, I am very hungry!',
            textTr: 'Evet, çok açım!',
            emoji: '😋',
            nextNodeId: 'c2a',
            acceptableVariations: ['yes', 'hungry', 'very hungry', 'i am hungry'],
          },
          {
            text: 'A little bit.',
            textTr: 'Biraz.',
            emoji: '🤏',
            nextNodeId: 'c2b',
            acceptableVariations: ['little', 'a little', 'a little bit'],
          },
        ],
      },
      {
        id: 'c2a',
        speaker: 'child',
        text: 'Yes, I am very hungry!',
        textTr: 'Evet, çok açım!',
        emoji: '😋',
        next: 'n3',
      },
      {
        id: 'c2b',
        speaker: 'child',
        text: 'A little bit.',
        textTr: 'Biraz.',
        emoji: '🤏',
        next: 'n3',
      },
      {
        id: 'n3',
        speaker: 'nova',
        text: 'Here is your food! Is it yummy?',
        textTr: 'İşte yemeğin! Lezzetli mi?',
        options: [
          {
            text: 'Yes, it is yummy!',
            textTr: 'Evet, çok lezzetli!',
            emoji: '😋',
            nextNodeId: 'c3a',
            acceptableVariations: ['yummy', 'yes', 'delicious', 'it is yummy'],
          },
          {
            text: 'Thank you!',
            textTr: 'Teşekkür ederim!',
            emoji: '🙏',
            nextNodeId: 'c3b',
            acceptableVariations: ['thank you', 'thanks', 'thank'],
          },
        ],
      },
      {
        id: 'c3a',
        speaker: 'child',
        text: 'Yes, it is yummy!',
        textTr: 'Evet, çok lezzetli!',
        emoji: '😋',
        next: 'end',
      },
      {
        id: 'c3b',
        speaker: 'child',
        text: 'Thank you!',
        textTr: 'Teşekkür ederim!',
        emoji: '🙏',
        next: 'end',
      },
      {
        id: 'end',
        speaker: 'nova',
        text: 'You are welcome! Enjoy your meal! 🎉',
        textTr: 'Rica ederim! Afiyet olsun!',
        emoji: '🎉',
      },
    ];
  },
};

// ===== TEMPLATE: COLOR SHOP =====
const colorShopTemplate: ConversationTemplate = {
  categories: ['colors', 'shapes', 'clothes'],
  title: 'At the Color Shop',
  titleTr: 'Renk Dükkanında',
  sceneEmoji: '🎨',
  minWords: 3,
  buildNodes: (words, translations, emojis) => {
    const [w0 = 'red', w1 = 'blue', w2 = 'green'] = words;
    const [t0 = 'kırmızı', t1 = 'mavi', t2 = 'yeşil'] = translations;
    const [e0 = '🔴', e1 = '🔵', e2 = '🟢'] = emojis;

    return [
      {
        id: 'n1',
        speaker: 'nova',
        text: 'Welcome to my shop! What is your favorite color?',
        textTr: 'Dükkanıma hoş geldin! En sevdiğin renk ne?',
        emoji: '🤖',
        options: [
          {
            text: `I like ${w0}!`,
            textTr: `${t0} seviyorum!`,
            emoji: e0,
            nextNodeId: 'c1a',
            acceptableVariations: [w0, `i like ${w0}`, `like ${w0}`],
          },
          {
            text: `I like ${w1}!`,
            textTr: `${t1} seviyorum!`,
            emoji: e1,
            nextNodeId: 'c1b',
            acceptableVariations: [w1, `i like ${w1}`, `like ${w1}`],
          },
          {
            text: `I like ${w2}!`,
            textTr: `${t2} seviyorum!`,
            emoji: e2,
            nextNodeId: 'c1c',
            acceptableVariations: [w2, `i like ${w2}`, `like ${w2}`],
          },
        ],
      },
      {
        id: 'c1a',
        speaker: 'child',
        text: `I like ${w0}!`,
        textTr: `${t0} seviyorum!`,
        emoji: e0,
        next: 'n2',
      },
      {
        id: 'c1b',
        speaker: 'child',
        text: `I like ${w1}!`,
        textTr: `${t1} seviyorum!`,
        emoji: e1,
        next: 'n2',
      },
      {
        id: 'c1c',
        speaker: 'child',
        text: `I like ${w2}!`,
        textTr: `${t2} seviyorum!`,
        emoji: e2,
        next: 'n2',
      },
      {
        id: 'n2',
        speaker: 'nova',
        text: 'Beautiful! Can you say "hello"?',
        textTr: 'Güzel! "Hello" diyebilir misin?',
        options: [
          {
            text: 'Hello!',
            textTr: 'Merhaba!',
            emoji: '👋',
            nextNodeId: 'c2a',
            acceptableVariations: ['hello', 'hi', 'hey'],
          },
        ],
      },
      { id: 'c2a', speaker: 'child', text: 'Hello!', textTr: 'Merhaba!', emoji: '👋', next: 'n3' },
      {
        id: 'n3',
        speaker: 'nova',
        text: `Do you want a ${w0} or a ${w1} balloon?`,
        textTr: `${t0} mı yoksa ${t1} balon mu istersin?`,
        options: [
          {
            text: `A ${w0} balloon!`,
            textTr: `${t0} balon!`,
            emoji: e0,
            nextNodeId: 'c3a',
            acceptableVariations: [w0, `${w0} balloon`, `a ${w0} balloon`],
          },
          {
            text: `A ${w1} balloon!`,
            textTr: `${t1} balon!`,
            emoji: e1,
            nextNodeId: 'c3b',
            acceptableVariations: [w1, `${w1} balloon`, `a ${w1} balloon`],
          },
        ],
      },
      {
        id: 'c3a',
        speaker: 'child',
        text: `A ${w0} balloon!`,
        textTr: `${t0} balon!`,
        emoji: e0,
        next: 'end',
      },
      {
        id: 'c3b',
        speaker: 'child',
        text: `A ${w1} balloon!`,
        textTr: `${t1} balon!`,
        emoji: e1,
        next: 'end',
      },
      {
        id: 'end',
        speaker: 'nova',
        text: 'Great job! You speak English very well! ⭐',
        textTr: 'Harika! Çok güzel İngilizce konuşuyorsun!',
        emoji: '⭐',
      },
    ];
  },
};

// ===== TEMPLATE: GENERIC (fallback for any vocabulary) =====
const genericTemplate: ConversationTemplate = {
  categories: ['*'],
  title: 'Talk with Nova',
  titleTr: 'Nova ile Konuş',
  sceneEmoji: '💬',
  minWords: 2,
  buildNodes: (words, translations, emojis) => {
    const [w0 = 'hello', w1 = 'yes'] = words;
    const [t0 = 'merhaba', t1 = 'evet'] = translations;
    const [e0 = '👋', e1 = '👍'] = emojis;

    return [
      {
        id: 'n1',
        speaker: 'nova',
        text: `Hi! Do you know what "${w0}" means?`,
        textTr: `Merhaba! "${w0}" ne demek biliyor musun?`,
        emoji: '🤖',
        options: [
          {
            text: `Yes! It means ${t0}!`,
            textTr: `Evet! ${t0} demek!`,
            emoji: e0,
            nextNodeId: 'c1a',
            acceptableVariations: ['yes', t0, w0],
          },
          {
            text: "I don't know.",
            textTr: 'Bilmiyorum.',
            emoji: '🤔',
            nextNodeId: 'c1b',
            acceptableVariations: ['no', "i don't know", 'dont know'],
          },
        ],
      },
      {
        id: 'c1a',
        speaker: 'child',
        text: `Yes! It means ${t0}!`,
        textTr: `Evet! ${t0} demek!`,
        emoji: e0,
        next: 'n2a',
      },
      {
        id: 'n2a',
        speaker: 'nova',
        text: `That is right! ${e0} You are so smart!`,
        textTr: 'Doğru! Çok zekisin!',
        next: 'n3',
      },
      {
        id: 'c1b',
        speaker: 'child',
        text: "I don't know.",
        textTr: 'Bilmiyorum.',
        emoji: '🤔',
        next: 'n2b',
      },
      {
        id: 'n2b',
        speaker: 'nova',
        text: `"${w0}" means "${t0}"! ${e0} Now you know!`,
        textTr: `"${w0}" demek "${t0}" demek! Şimdi biliyorsun!`,
        next: 'n3',
      },
      {
        id: 'n3',
        speaker: 'nova',
        text: `Now, can you say "${w1}"?`,
        textTr: `Şimdi, "${w1}" diyebilir misin?`,
        options: [
          {
            text: w1.charAt(0).toUpperCase() + w1.slice(1) + '!',
            textTr: `${t1}!`,
            emoji: e1,
            nextNodeId: 'c2a',
            acceptableVariations: [w1],
          },
        ],
      },
      {
        id: 'c2a',
        speaker: 'child',
        text: w1.charAt(0).toUpperCase() + w1.slice(1) + '!',
        textTr: `${t1}!`,
        emoji: e1,
        next: 'n4',
      },
      {
        id: 'n4',
        speaker: 'nova',
        text: 'Excellent! Did you have fun today?',
        textTr: 'Harika! Bugün eğlendin mi?',
        options: [
          { text: 'Yes, it was fun!', textTr: 'Evet, çok eğlenceliydi!', emoji: '🎉', nextNodeId: 'c3a', acceptableVariations: ['yes', 'fun', 'it was fun', 'yes it was'] },
          { text: 'I want to learn more!', textTr: 'Daha fazla öğrenmek istiyorum!', emoji: '📚', nextNodeId: 'c3b', acceptableVariations: ['more', 'learn more', 'i want to learn', 'learn'] },
        ],
      },
      { id: 'c3a', speaker: 'child', text: 'Yes, it was fun!', textTr: 'Evet, çok eğlenceliydi!', emoji: '🎉', next: 'end' },
      { id: 'c3b', speaker: 'child', text: 'I want to learn more!', textTr: 'Daha fazla öğrenmek istiyorum!', emoji: '📚', next: 'end' },
      {
        id: 'end',
        speaker: 'nova',
        text: 'Perfect! You did amazing! 🎉',
        textTr: 'Mükemmel! Harika başardın!',
        emoji: '🎉',
      },
    ];
  },
};

// ===== TEMPLATE: COUNTING / NUMBERS =====
const numberTemplate: ConversationTemplate = {
  categories: ['numbers', 'counting'],
  title: 'Counting Game',
  titleTr: 'Sayma Oyunu',
  sceneEmoji: '🔢',
  minWords: 3,
  buildNodes: (words, translations, emojis) => {
    const [w0 = 'one', w1 = 'two', w2 = 'three'] = words;
    const [t0 = 'bir', t1 = 'iki', t2 = 'üç'] = translations;
    const [e0 = '1️⃣', e1 = '2️⃣', e2 = '3️⃣'] = emojis;

    return [
      {
        id: 'n1',
        speaker: 'nova',
        text: "Let's count together! Can you say the first number?",
        textTr: 'Birlikte sayalım! İlk sayıyı söyleyebilir misin?',
        emoji: '🤖',
        options: [
          {
            text: `${w0}!`,
            textTr: `${t0}!`,
            emoji: e0,
            nextNodeId: 'c1',
            acceptableVariations: [w0],
          },
        ],
      },
      { id: 'c1', speaker: 'child', text: `${w0}!`, textTr: `${t0}!`, emoji: e0, next: 'n2' },
      {
        id: 'n2',
        speaker: 'nova',
        text: `Great! ${w0}! Now what comes next?`,
        textTr: `Harika! ${w0}! Şimdi sıradaki ne?`,
        options: [
          {
            text: `${w1}!`,
            textTr: `${t1}!`,
            emoji: e1,
            nextNodeId: 'c2',
            acceptableVariations: [w1],
          },
        ],
      },
      { id: 'c2', speaker: 'child', text: `${w1}!`, textTr: `${t1}!`, emoji: e1, next: 'n3' },
      {
        id: 'n3',
        speaker: 'nova',
        text: `${w0}, ${w1}... and?`,
        textTr: `${w0}, ${w1}... ve?`,
        options: [
          {
            text: `${w2}!`,
            textTr: `${t2}!`,
            emoji: e2,
            nextNodeId: 'c3',
            acceptableVariations: [w2],
          },
        ],
      },
      { id: 'c3', speaker: 'child', text: `${w2}!`, textTr: `${t2}!`, emoji: e2, next: 'end' },
      {
        id: 'end',
        speaker: 'nova',
        text: `${w0}, ${w1}, ${w2}! You can count! 🎉`,
        textTr: `${w0}, ${w1}, ${w2}! Sayabiliyorsun!`,
        emoji: '🎉',
      },
    ];
  },
};

// ===== TEMPLATE: PLAYGROUND =====
const playgroundTemplate: ConversationTemplate = {
  categories: ['body', 'actions', 'sports', 'verbs'],
  title: 'At the Playground',
  titleTr: 'Oyun Parkında',
  sceneEmoji: '🛝',
  minWords: 3,
  buildNodes: (words, translations, emojis) => {
    const [w0 = 'run', w1 = 'jump', w2 = 'play'] = words;
    const [t0 = 'koşmak', t1 = 'zıplamak', t2 = 'oynamak'] = translations;
    const [e0 = '🏃', e1 = '🦘', e2 = '⚽'] = emojis;

    return [
      {
        id: 'n1',
        speaker: 'nova',
        text: 'Welcome to the playground! What do you want to do?',
        textTr: 'Oyun parkına hoş geldin! Ne yapmak istersin?',
        emoji: '🤖',
        options: [
          {
            text: `I want to ${w0}!`,
            textTr: `${t0} istiyorum!`,
            emoji: e0,
            nextNodeId: 'c1a',
            acceptableVariations: [w0, `want to ${w0}`, `i want to ${w0}`, `let's ${w0}`],
          },
          {
            text: `I want to ${w1}!`,
            textTr: `${t1} istiyorum!`,
            emoji: e1,
            nextNodeId: 'c1b',
            acceptableVariations: [w1, `want to ${w1}`, `i want to ${w1}`, `let's ${w1}`],
          },
          {
            text: `I want to ${w2}!`,
            textTr: `${t2} istiyorum!`,
            emoji: e2,
            nextNodeId: 'c1c',
            acceptableVariations: [w2, `want to ${w2}`, `i want to ${w2}`, `let's ${w2}`],
          },
        ],
      },
      { id: 'c1a', speaker: 'child', text: `I want to ${w0}!`, textTr: `${t0} istiyorum!`, emoji: e0, next: 'n2a' },
      { id: 'n2a', speaker: 'nova', text: `${e0} You can ${w0} so fast! Amazing!`, textTr: `Çok hızlı ${t0.replace('mak', '')}biliyorsun! Harika!`, next: 'n3' },
      { id: 'c1b', speaker: 'child', text: `I want to ${w1}!`, textTr: `${t1} istiyorum!`, emoji: e1, next: 'n2b' },
      { id: 'n2b', speaker: 'nova', text: `${e1} Wow, you can ${w1} so high!`, textTr: `Vay, çok yükseğe ${t1.replace('mak', '')}biliyorsun!`, next: 'n3' },
      { id: 'c1c', speaker: 'child', text: `I want to ${w2}!`, textTr: `${t2} istiyorum!`, emoji: e2, next: 'n2c' },
      { id: 'n2c', speaker: 'nova', text: `${e2} Let's ${w2} together! So fun!`, textTr: `Birlikte ${t2.replace('mak', '')}yalım! Çok eğlenceli!`, next: 'n3' },
      {
        id: 'n3',
        speaker: 'nova',
        text: 'Are you tired or do you want to continue?',
        textTr: 'Yoruldun mu yoksa devam mı etmek istiyorsun?',
        options: [
          {
            text: 'I am not tired!',
            textTr: 'Yorulmadım!',
            emoji: '💪',
            nextNodeId: 'c2a',
            acceptableVariations: ['not tired', 'no', 'i am not tired', 'continue'],
          },
          {
            text: 'A little bit tired!',
            textTr: 'Biraz yoruldum!',
            emoji: '😅',
            nextNodeId: 'c2b',
            acceptableVariations: ['tired', 'a little', 'little bit', 'yes'],
          },
        ],
      },
      { id: 'c2a', speaker: 'child', text: 'I am not tired!', textTr: 'Yorulmadım!', emoji: '💪', next: 'n4' },
      { id: 'c2b', speaker: 'child', text: 'A little bit tired!', textTr: 'Biraz yoruldum!', emoji: '😅', next: 'n4' },
      {
        id: 'n4',
        speaker: 'nova',
        text: 'Did you have fun at the playground?',
        textTr: 'Oyun parkında eğlendin mi?',
        options: [
          {
            text: 'Yes! It was so fun!',
            textTr: 'Evet! Çok eğlenceliydi!',
            emoji: '🎉',
            nextNodeId: 'c3a',
            acceptableVariations: ['yes', 'fun', 'so fun', 'it was fun'],
          },
          {
            text: 'I love the playground!',
            textTr: 'Oyun parkını seviyorum!',
            emoji: '❤️',
            nextNodeId: 'c3b',
            acceptableVariations: ['love', 'i love', 'love it', 'love the playground'],
          },
        ],
      },
      { id: 'c3a', speaker: 'child', text: 'Yes! It was so fun!', textTr: 'Evet! Çok eğlenceliydi!', emoji: '🎉', next: 'end' },
      { id: 'c3b', speaker: 'child', text: 'I love the playground!', textTr: 'Oyun parkını seviyorum!', emoji: '❤️', next: 'end' },
      {
        id: 'end',
        speaker: 'nova',
        text: 'Great job today! You learned new words! 🌟',
        textTr: 'Bugün harika iş çıkardın! Yeni kelimeler öğrendin!',
        emoji: '🌟',
      },
    ];
  },
};

// ===== TEMPLATE: WEATHER =====
const weatherTemplate: ConversationTemplate = {
  categories: ['weather', 'seasons', 'nature', 'clothes'],
  title: 'Weather Report',
  titleTr: 'Hava Durumu',
  sceneEmoji: '🌤️',
  minWords: 3,
  buildNodes: (words, translations, emojis) => {
    const [w0 = 'sunny', w1 = 'rainy', w2 = 'cold'] = words;
    const [t0 = 'güneşli', t1 = 'yağmurlu', t2 = 'soğuk'] = translations;
    const [e0 = '☀️', e1 = '🌧️', e2 = '🥶'] = emojis;

    return [
      {
        id: 'n1',
        speaker: 'nova',
        text: "Good morning! Let's look outside! How is the weather today?",
        textTr: 'Günaydın! Dışarı bakalım! Bugün hava nasıl?',
        emoji: '🤖',
        options: [
          {
            text: `It is ${w0}!`,
            textTr: `Hava ${t0}!`,
            emoji: e0,
            nextNodeId: 'c1a',
            acceptableVariations: [w0, `it is ${w0}`, `its ${w0}`, `the weather is ${w0}`],
          },
          {
            text: `It is ${w1}!`,
            textTr: `Hava ${t1}!`,
            emoji: e1,
            nextNodeId: 'c1b',
            acceptableVariations: [w1, `it is ${w1}`, `its ${w1}`, `the weather is ${w1}`],
          },
          {
            text: `It is ${w2}!`,
            textTr: `Hava ${t2}!`,
            emoji: e2,
            nextNodeId: 'c1c',
            acceptableVariations: [w2, `it is ${w2}`, `its ${w2}`, `the weather is ${w2}`],
          },
        ],
      },
      { id: 'c1a', speaker: 'child', text: `It is ${w0}!`, textTr: `Hava ${t0}!`, emoji: e0, next: 'n2a' },
      { id: 'n2a', speaker: 'nova', text: `${e0} Yes! It is ${w0}! I like ${w0} days!`, textTr: `Evet! Hava ${t0}! ${t0} günleri severim!`, next: 'n3' },
      { id: 'c1b', speaker: 'child', text: `It is ${w1}!`, textTr: `Hava ${t1}!`, emoji: e1, next: 'n2b' },
      { id: 'n2b', speaker: 'nova', text: `${e1} Oh! It is ${w1}! Do not forget your umbrella!`, textTr: `Ay! Hava ${t1}! Şemsiyeni unutma!`, next: 'n3' },
      { id: 'c1c', speaker: 'child', text: `It is ${w2}!`, textTr: `Hava ${t2}!`, emoji: e2, next: 'n2c' },
      { id: 'n2c', speaker: 'nova', text: `${e2} Brr! It is ${w2}! Wear a warm jacket!`, textTr: `Brr! Hava ${t2}! Sıcak bir ceket giy!`, next: 'n3' },
      {
        id: 'n3',
        speaker: 'nova',
        text: 'What do you like to do when the weather is nice?',
        textTr: 'Hava güzel olunca ne yapmayı seversin?',
        options: [
          {
            text: 'I like to go outside!',
            textTr: 'Dışarı çıkmayı severim!',
            emoji: '🏃',
            nextNodeId: 'c2a',
            acceptableVariations: ['outside', 'go outside', 'i like to go outside', 'play outside'],
          },
          {
            text: 'I like to stay home!',
            textTr: 'Evde kalmayı severim!',
            emoji: '🏠',
            nextNodeId: 'c2b',
            acceptableVariations: ['home', 'stay home', 'i like to stay home', 'stay'],
          },
        ],
      },
      { id: 'c2a', speaker: 'child', text: 'I like to go outside!', textTr: 'Dışarı çıkmayı severim!', emoji: '🏃', next: 'n4' },
      { id: 'c2b', speaker: 'child', text: 'I like to stay home!', textTr: 'Evde kalmayı severim!', emoji: '🏠', next: 'n4' },
      {
        id: 'n4',
        speaker: 'nova',
        text: 'You are a great weather reporter! What is your favorite season?',
        textTr: 'Harika bir hava muhabirisin! En sevdiğin mevsim hangisi?',
        options: [
          {
            text: 'I like summer!',
            textTr: 'Yazı severim!',
            emoji: '☀️',
            nextNodeId: 'c3a',
            acceptableVariations: ['summer', 'i like summer', 'like summer'],
          },
          {
            text: 'I like winter!',
            textTr: 'Kışı severim!',
            emoji: '❄️',
            nextNodeId: 'c3b',
            acceptableVariations: ['winter', 'i like winter', 'like winter'],
          },
        ],
      },
      { id: 'c3a', speaker: 'child', text: 'I like summer!', textTr: 'Yazı severim!', emoji: '☀️', next: 'end' },
      { id: 'c3b', speaker: 'child', text: 'I like winter!', textTr: 'Kışı severim!', emoji: '❄️', next: 'end' },
      {
        id: 'end',
        speaker: 'nova',
        text: 'Great answers! You are a weather expert now! 🏆',
        textTr: 'Harika cevaplar! Artık bir hava durumu uzmanısın!',
        emoji: '🏆',
      },
    ];
  },
};

// ===== TEMPLATE: FAMILY =====
const familyTemplate: ConversationTemplate = {
  categories: ['family', 'people', 'home', 'house'],
  title: 'My Family',
  titleTr: 'Ailem',
  sceneEmoji: '👨‍👩‍👧‍👦',
  minWords: 3,
  buildNodes: (words, translations, emojis) => {
    const [w0 = 'mother', w1 = 'father', w2 = 'sister'] = words;
    const [t0 = 'anne', t1 = 'baba', t2 = 'kız kardeş'] = translations;
    const [e0 = '👩', e1 = '👨', e2 = '👧'] = emojis;

    return [
      {
        id: 'n1',
        speaker: 'nova',
        text: "Let's talk about your family! Who is in your family?",
        textTr: 'Ailen hakkında konuşalım! Ailende kimler var?',
        emoji: '🤖',
        options: [
          {
            text: `I have a ${w0}!`,
            textTr: `Bir ${t0}m var!`,
            emoji: e0,
            nextNodeId: 'c1a',
            acceptableVariations: [w0, `my ${w0}`, `i have a ${w0}`, `a ${w0}`],
          },
          {
            text: `I have a ${w1}!`,
            textTr: `Bir ${t1}m var!`,
            emoji: e1,
            nextNodeId: 'c1b',
            acceptableVariations: [w1, `my ${w1}`, `i have a ${w1}`, `a ${w1}`],
          },
          {
            text: `I have a ${w2}!`,
            textTr: `Bir ${t2}m var!`,
            emoji: e2,
            nextNodeId: 'c1c',
            acceptableVariations: [w2, `my ${w2}`, `i have a ${w2}`, `a ${w2}`],
          },
        ],
      },
      { id: 'c1a', speaker: 'child', text: `I have a ${w0}!`, textTr: `Bir ${t0}m var!`, emoji: e0, next: 'n2a' },
      { id: 'n2a', speaker: 'nova', text: `${e0} Your ${w0} is wonderful! I am sure you love your ${w0}!`, textTr: `${t0}n harika! Eminim ${t0}nı çok seviyorsun!`, next: 'n3' },
      { id: 'c1b', speaker: 'child', text: `I have a ${w1}!`, textTr: `Bir ${t1}m var!`, emoji: e1, next: 'n2b' },
      { id: 'n2b', speaker: 'nova', text: `${e1} That is great! Your ${w1} must be amazing!`, textTr: `Harika! ${t1}n muhteşem olmalı!`, next: 'n3' },
      { id: 'c1c', speaker: 'child', text: `I have a ${w2}!`, textTr: `Bir ${t2}m var!`, emoji: e2, next: 'n2c' },
      { id: 'n2c', speaker: 'nova', text: `${e2} How nice! Having a ${w2} is wonderful!`, textTr: `Ne güzel! ${t2} sahibi olmak harika!`, next: 'n3' },
      {
        id: 'n3',
        speaker: 'nova',
        text: 'What do you like to do with your family?',
        textTr: 'Ailenle ne yapmayı seversin?',
        options: [
          {
            text: 'We play together!',
            textTr: 'Birlikte oynarız!',
            emoji: '🎮',
            nextNodeId: 'c2a',
            acceptableVariations: ['play', 'play together', 'we play', 'we play together'],
          },
          {
            text: 'We eat together!',
            textTr: 'Birlikte yeriz!',
            emoji: '🍕',
            nextNodeId: 'c2b',
            acceptableVariations: ['eat', 'eat together', 'we eat', 'we eat together'],
          },
        ],
      },
      { id: 'c2a', speaker: 'child', text: 'We play together!', textTr: 'Birlikte oynarız!', emoji: '🎮', next: 'n4' },
      { id: 'c2b', speaker: 'child', text: 'We eat together!', textTr: 'Birlikte yeriz!', emoji: '🍕', next: 'n4' },
      {
        id: 'n4',
        speaker: 'nova',
        text: 'That sounds lovely! Do you love your family?',
        textTr: 'Kulağa çok güzel geliyor! Aileni seviyor musun?',
        options: [
          {
            text: 'Yes! I love my family!',
            textTr: 'Evet! Ailemi seviyorum!',
            emoji: '❤️',
            nextNodeId: 'c3a',
            acceptableVariations: ['yes', 'love', 'i love my family', 'love my family'],
          },
          {
            text: 'My family is the best!',
            textTr: 'Ailem en iyisi!',
            emoji: '🏆',
            nextNodeId: 'c3b',
            acceptableVariations: ['best', 'the best', 'my family is the best', 'family best'],
          },
        ],
      },
      { id: 'c3a', speaker: 'child', text: 'Yes! I love my family!', textTr: 'Evet! Ailemi seviyorum!', emoji: '❤️', next: 'end' },
      { id: 'c3b', speaker: 'child', text: 'My family is the best!', textTr: 'Ailem en iyisi!', emoji: '🏆', next: 'end' },
      {
        id: 'end',
        speaker: 'nova',
        text: 'Family is so important! You did great today! 💖',
        textTr: 'Aile çok önemli! Bugün harika iş çıkardın!',
        emoji: '💖',
      },
    ];
  },
};

// ===== TEMPLATE REGISTRY =====

export const CONVERSATION_TEMPLATES: ConversationTemplate[] = [
  petShopTemplate,
  foodOrderTemplate,
  colorShopTemplate,
  numberTemplate,
  playgroundTemplate,
  weatherTemplate,
  familyTemplate,
  genericTemplate, // fallback — always last
];

/**
 * Find the best matching template for a set of vocabulary words.
 * Falls back to generic template.
 */
export function findBestTemplate(words: string[]): ConversationTemplate {
  const wordSet = new Set(words.map((w) => w.toLowerCase()));

  // Category detection heuristic based on vocabulary
  const animalWords = new Set([
    'dog',
    'cat',
    'fish',
    'bird',
    'rabbit',
    'cow',
    'horse',
    'sheep',
    'pig',
    'chicken',
    'duck',
    'frog',
    'lion',
    'tiger',
    'bear',
    'elephant',
    'monkey',
    'giraffe',
    'penguin',
    'dolphin',
    'turtle',
    'butterfly',
    'bee',
    'ant',
    'spider',
    'snake',
    'whale',
    'shark',
    'octopus',
    'crab',
  ]);
  const foodWords = new Set([
    'apple',
    'banana',
    'orange',
    'grape',
    'strawberry',
    'watermelon',
    'cherry',
    'peach',
    'lemon',
    'mango',
    'melon',
    'pear',
    'plum',
    'kiwi',
    'pineapple',
    'coconut',
    'pizza',
    'cake',
    'bread',
    'egg',
    'milk',
    'water',
    'juice',
    'rice',
    'soup',
    'salad',
    'cheese',
    'chicken',
    'fish',
    'carrot',
    'tomato',
    'potato',
    'onion',
    'broccoli',
    'corn',
    'pea',
    'cookie',
    'ice cream',
    'chocolate',
    'candy',
    'hamburger',
    'sandwich',
    'pasta',
    'pancake',
  ]);
  const colorWords = new Set([
    'red',
    'blue',
    'green',
    'yellow',
    'orange',
    'purple',
    'pink',
    'black',
    'white',
    'brown',
    'gray',
    'grey',
    'rainbow',
  ]);
  const numberWords = new Set([
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'zero',
    'first',
    'second',
    'third',
  ]);
  const actionWords = new Set([
    'run',
    'jump',
    'play',
    'walk',
    'swim',
    'dance',
    'sing',
    'climb',
    'kick',
    'throw',
    'catch',
    'ride',
    'fly',
    'sit',
    'stand',
    'hand',
    'foot',
    'head',
    'arm',
    'leg',
    'eye',
    'ear',
    'nose',
    'mouth',
  ]);
  const weatherWords = new Set([
    'sunny',
    'rainy',
    'cold',
    'hot',
    'warm',
    'windy',
    'cloudy',
    'snowy',
    'snow',
    'rain',
    'sun',
    'cloud',
    'wind',
    'storm',
    'summer',
    'winter',
    'spring',
    'autumn',
    'fall',
    'umbrella',
    'jacket',
    'coat',
  ]);
  const familyWords = new Set([
    'mother',
    'father',
    'sister',
    'brother',
    'mom',
    'dad',
    'baby',
    'family',
    'grandma',
    'grandpa',
    'grandmother',
    'grandfather',
    'aunt',
    'uncle',
    'cousin',
    'parents',
    'home',
    'house',
  ]);

  const categories: Array<{ cat: string; set: Set<string> }> = [
    { cat: 'animals', set: animalWords },
    { cat: 'food', set: foodWords },
    { cat: 'colors', set: colorWords },
    { cat: 'numbers', set: numberWords },
    { cat: 'body', set: actionWords },
    { cat: 'weather', set: weatherWords },
    { cat: 'family', set: familyWords },
  ];

  let bestTemplate = genericTemplate;
  let bestOverlap = 0;

  for (const { cat, set } of categories) {
    const overlap = [...wordSet].filter((w) => set.has(w)).length;
    if (overlap > bestOverlap) {
      bestOverlap = overlap;
      const match = CONVERSATION_TEMPLATES.find(
        (t) => t.categories.includes(cat) || t.categories.includes('*'),
      );
      if (match && !match.categories.includes('*')) {
        bestTemplate = match;
      }
    }
  }

  return bestTemplate;
}
