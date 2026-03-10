/**
 * Mock Lesson Data — Zengin, eğitici Duolingo-kalitesinde içerik
 *
 * Her ders pedagojik sıra ile tasarlandı:
 *   1. FlashCard    → Yeni kelimeyi tanıt (görsel + ses)
 *   2. ListenAndTap → Dinleme becerisini test et
 *   3. MatchPairs   → Kelime-çeviri bağlantılarını güçlendir
 *   4. WordBuilder  → Yazım/heceleme pekiştir
 *   5. FillBlank    → Kelimeyi bağlam içinde kullan
 *
 * Tematik dersler:
 *   Lesson 1 → Animals (Hayvanlar)
 *   Lesson 2 → Colors (Renkler)
 *   Lesson 3 → Food & Drinks (Yiyecek & İçecekler)
 *   Lesson 4 → Family (Aile)
 *   Lesson 5 → Numbers (Sayılar)
 *   Default  → Mixed review (Karışık Tekrar)
 */

import type { Activity } from '@/types/content';

// ────────────────────────────────────────
// LESSON 1 — Animals (Hayvanlar)
// Hedef kelimeler: Dog, Cat, Bird, Fish, Bear
// ────────────────────────────────────────

const lesson1Animals: Activity[] = [
  // 1️⃣ FlashCard: Tanıtım — Dog
  {
    id: '1_fc_dog',
    type: 'flash-card',
    order: 1,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'flash-card',
      word: 'Dog',
      translation: 'Köpek',
      imageUrl: '',
      audioUrl: '',
      exampleSentence: 'The dog is happy.',
      exampleTranslation: 'Köpek mutlu.',
    },
  },
  // 2️⃣ FlashCard: Tanıtım — Cat
  {
    id: '1_fc_cat',
    type: 'flash-card',
    order: 2,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'flash-card',
      word: 'Cat',
      translation: 'Kedi',
      imageUrl: '',
      audioUrl: '',
      exampleSentence: 'The cat is sleeping.',
      exampleTranslation: 'Kedi uyuyor.',
    },
  },
  // 3️⃣ ListenAndTap: Dinleme — Bird
  {
    id: '1_lt_bird',
    type: 'listen-and-tap',
    order: 3,
    timeLimit: 15,
    maxAttempts: 2,
    data: {
      type: 'listen-and-tap',
      audioUrl: '',
      correctAnswer: 'Bird',
      options: ['Bird', 'Bear', 'Dog', 'Fish'],
      imageHint: null,
    },
  },
  // 4️⃣ FlashCard: Tanıtım — Fish
  {
    id: '1_fc_fish',
    type: 'flash-card',
    order: 4,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'flash-card',
      word: 'Fish',
      translation: 'Balık',
      imageUrl: '',
      audioUrl: '',
      exampleSentence: 'The fish swims fast.',
      exampleTranslation: 'Balık hızlı yüzer.',
    },
  },
  // 5️⃣ MatchPairs: Eşleştirme — İlk 3 kelime
  {
    id: '1_mp_animals1',
    type: 'match-pairs',
    order: 5,
    timeLimit: 30,
    maxAttempts: 2,
    data: {
      type: 'match-pairs',
      pairs: [
        { id: 'p_dog', left: 'Dog', right: 'Köpek', leftType: 'text', rightType: 'text' },
        { id: 'p_cat', left: 'Cat', right: 'Kedi', leftType: 'text', rightType: 'text' },
        { id: 'p_bird', left: 'Bird', right: 'Kuş', leftType: 'text', rightType: 'text' },
        { id: 'p_fish', left: 'Fish', right: 'Balık', leftType: 'text', rightType: 'text' },
      ],
    },
  },
  // 6️⃣ FlashCard: Tanıtım — Bear
  {
    id: '1_fc_bear',
    type: 'flash-card',
    order: 6,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'flash-card',
      word: 'Bear',
      translation: 'Ayı',
      imageUrl: '',
      audioUrl: '',
      exampleSentence: 'The bear is very big.',
      exampleTranslation: 'Ayı çok büyük.',
    },
  },
  // 7️⃣ ListenAndTap: Dinleme — Cat
  {
    id: '1_lt_cat',
    type: 'listen-and-tap',
    order: 7,
    timeLimit: 15,
    maxAttempts: 2,
    data: {
      type: 'listen-and-tap',
      audioUrl: '',
      correctAnswer: 'Cat',
      options: ['Cat', 'Car', 'Hat', 'Bat'],
      imageHint: null,
    },
  },
  // 8️⃣ WordBuilder: Yazım — Dog
  {
    id: '1_wb_dog',
    type: 'word-builder',
    order: 8,
    timeLimit: 25,
    maxAttempts: 3,
    data: {
      type: 'word-builder',
      word: 'Dog',
      translation: 'Köpek',
      imageUrl: '',
      audioUrl: '',
      scrambledLetters: ['O', 'G', 'D'],
      hintLetters: [0],
    },
  },
  // 9️⃣ WordBuilder: Yazım — Bear
  {
    id: '1_wb_bear',
    type: 'word-builder',
    order: 9,
    timeLimit: 25,
    maxAttempts: 3,
    data: {
      type: 'word-builder',
      word: 'Bear',
      translation: 'Ayı',
      imageUrl: '',
      audioUrl: '',
      scrambledLetters: ['E', 'B', 'R', 'A'],
      hintLetters: [0],
    },
  },
  // 🔟 FillBlank: Bağlamda kullanım — Fish
  {
    id: '1_fb_fish',
    type: 'fill-blank',
    order: 10,
    timeLimit: 20,
    maxAttempts: 2,
    data: {
      type: 'fill-blank',
      sentence: 'The ___ lives in water.',
      translation: '___ suda yaşar.',
      correctAnswer: 'Fish',
      options: ['Fish', 'Bird', 'Dog', 'Bear'],
      audioUrl: '',
    },
  },
  // 1️⃣1️⃣ FillBlank: Bağlamda kullanım — Cat
  {
    id: '1_fb_cat',
    type: 'fill-blank',
    order: 11,
    timeLimit: 20,
    maxAttempts: 2,
    data: {
      type: 'fill-blank',
      sentence: 'The ___ says meow.',
      translation: '___ miyav der.',
      correctAnswer: 'Cat',
      options: ['Cat', 'Dog', 'Fish', 'Bear'],
      audioUrl: '',
    },
  },
  // 1️⃣2️⃣ MatchPairs: Final eşleştirme — Tüm hayvanlar
  {
    id: '1_mp_animals2',
    type: 'match-pairs',
    order: 12,
    timeLimit: 40,
    maxAttempts: 2,
    data: {
      type: 'match-pairs',
      pairs: [
        { id: 'p2_dog', left: 'Dog', right: 'Köpek', leftType: 'text', rightType: 'text' },
        { id: 'p2_cat', left: 'Cat', right: 'Kedi', leftType: 'text', rightType: 'text' },
        { id: 'p2_bird', left: 'Bird', right: 'Kuş', leftType: 'text', rightType: 'text' },
        { id: 'p2_fish', left: 'Fish', right: 'Balık', leftType: 'text', rightType: 'text' },
        { id: 'p2_bear', left: 'Bear', right: 'Ayı', leftType: 'text', rightType: 'text' },
      ],
    },
  },
];

// ────────────────────────────────────────
// LESSON 2 — Colors (Renkler)
// Hedef kelimeler: Red, Blue, Green, Yellow, Orange
// ────────────────────────────────────────

const lesson2Colors: Activity[] = [
  {
    id: '2_fc_red',
    type: 'flash-card',
    order: 1,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'flash-card',
      word: 'Red',
      translation: 'Kırmızı',
      imageUrl: '',
      audioUrl: '',
      exampleSentence: 'The apple is red.',
      exampleTranslation: 'Elma kırmızıdır.',
    },
  },
  {
    id: '2_fc_blue',
    type: 'flash-card',
    order: 2,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'flash-card',
      word: 'Blue',
      translation: 'Mavi',
      imageUrl: '',
      audioUrl: '',
      exampleSentence: 'The sky is blue.',
      exampleTranslation: 'Gökyüzü mavidir.',
    },
  },
  {
    id: '2_lt_green',
    type: 'listen-and-tap',
    order: 3,
    timeLimit: 15,
    maxAttempts: 2,
    data: {
      type: 'listen-and-tap',
      audioUrl: '',
      correctAnswer: 'Green',
      options: ['Green', 'Red', 'Blue', 'Yellow'],
      imageHint: null,
    },
  },
  {
    id: '2_fc_yellow',
    type: 'flash-card',
    order: 4,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'flash-card',
      word: 'Yellow',
      translation: 'Sarı',
      imageUrl: '',
      audioUrl: '',
      exampleSentence: 'The sun is yellow.',
      exampleTranslation: 'Güneş sarıdır.',
    },
  },
  {
    id: '2_mp_colors1',
    type: 'match-pairs',
    order: 5,
    timeLimit: 30,
    maxAttempts: 2,
    data: {
      type: 'match-pairs',
      pairs: [
        { id: 'c_red', left: 'Red', right: 'Kırmızı', leftType: 'text', rightType: 'text' },
        { id: 'c_blue', left: 'Blue', right: 'Mavi', leftType: 'text', rightType: 'text' },
        { id: 'c_green', left: 'Green', right: 'Yeşil', leftType: 'text', rightType: 'text' },
        { id: 'c_yellow', left: 'Yellow', right: 'Sarı', leftType: 'text', rightType: 'text' },
      ],
    },
  },
  {
    id: '2_fc_orange',
    type: 'flash-card',
    order: 6,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'flash-card',
      word: 'Orange',
      translation: 'Turuncu',
      imageUrl: '',
      audioUrl: '',
      exampleSentence: 'The orange is orange.',
      exampleTranslation: 'Portakal turuncudur.',
    },
  },
  {
    id: '2_lt_yellow',
    type: 'listen-and-tap',
    order: 7,
    timeLimit: 15,
    maxAttempts: 2,
    data: {
      type: 'listen-and-tap',
      audioUrl: '',
      correctAnswer: 'Yellow',
      options: ['Yellow', 'Green', 'Orange', 'Blue'],
      imageHint: null,
    },
  },
  {
    id: '2_wb_blue',
    type: 'word-builder',
    order: 8,
    timeLimit: 25,
    maxAttempts: 3,
    data: {
      type: 'word-builder',
      word: 'Blue',
      translation: 'Mavi',
      imageUrl: '',
      audioUrl: '',
      scrambledLetters: ['L', 'B', 'E', 'U'],
      hintLetters: [0],
    },
  },
  {
    id: '2_wb_green',
    type: 'word-builder',
    order: 9,
    timeLimit: 25,
    maxAttempts: 3,
    data: {
      type: 'word-builder',
      word: 'Green',
      translation: 'Yeşil',
      imageUrl: '',
      audioUrl: '',
      scrambledLetters: ['E', 'G', 'N', 'R', 'E'],
      hintLetters: [0],
    },
  },
  {
    id: '2_fb_red',
    type: 'fill-blank',
    order: 10,
    timeLimit: 20,
    maxAttempts: 2,
    data: {
      type: 'fill-blank',
      sentence: 'Roses are ___.',
      translation: 'Güller ___ dır.',
      correctAnswer: 'Red',
      options: ['Red', 'Blue', 'Yellow', 'Green'],
      audioUrl: '',
    },
  },
  {
    id: '2_fb_blue',
    type: 'fill-blank',
    order: 11,
    timeLimit: 20,
    maxAttempts: 2,
    data: {
      type: 'fill-blank',
      sentence: 'The ocean is ___.',
      translation: 'Okyanus ___ dır.',
      correctAnswer: 'Blue',
      options: ['Blue', 'Red', 'Green', 'Orange'],
      audioUrl: '',
    },
  },
  {
    id: '2_mp_colors2',
    type: 'match-pairs',
    order: 12,
    timeLimit: 40,
    maxAttempts: 2,
    data: {
      type: 'match-pairs',
      pairs: [
        { id: 'c2_red', left: 'Red', right: 'Kırmızı', leftType: 'text', rightType: 'text' },
        { id: 'c2_blue', left: 'Blue', right: 'Mavi', leftType: 'text', rightType: 'text' },
        { id: 'c2_green', left: 'Green', right: 'Yeşil', leftType: 'text', rightType: 'text' },
        { id: 'c2_yellow', left: 'Yellow', right: 'Sarı', leftType: 'text', rightType: 'text' },
        { id: 'c2_orange', left: 'Orange', right: 'Turuncu', leftType: 'text', rightType: 'text' },
      ],
    },
  },
];

// ────────────────────────────────────────
// LESSON 3 — Food & Drinks (Yiyecek & İçecekler)
// Hedef kelimeler: Apple, Banana, Bread, Milk, Egg
// ────────────────────────────────────────

const lesson3Food: Activity[] = [
  {
    id: '3_fc_apple',
    type: 'flash-card',
    order: 1,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'flash-card',
      word: 'Apple',
      translation: 'Elma',
      imageUrl: '',
      audioUrl: '',
      exampleSentence: 'I eat an apple every day.',
      exampleTranslation: 'Her gün bir elma yerim.',
    },
  },
  {
    id: '3_fc_banana',
    type: 'flash-card',
    order: 2,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'flash-card',
      word: 'Banana',
      translation: 'Muz',
      imageUrl: '',
      audioUrl: '',
      exampleSentence: 'Monkeys love bananas.',
      exampleTranslation: 'Maymunlar muzu sever.',
    },
  },
  {
    id: '3_lt_bread',
    type: 'listen-and-tap',
    order: 3,
    timeLimit: 15,
    maxAttempts: 2,
    data: {
      type: 'listen-and-tap',
      audioUrl: '',
      correctAnswer: 'Bread',
      options: ['Bread', 'Apple', 'Milk', 'Egg'],
      imageHint: null,
    },
  },
  {
    id: '3_fc_milk',
    type: 'flash-card',
    order: 4,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'flash-card',
      word: 'Milk',
      translation: 'Süt',
      imageUrl: '',
      audioUrl: '',
      exampleSentence: 'I drink milk in the morning.',
      exampleTranslation: 'Sabahları süt içerim.',
    },
  },
  {
    id: '3_mp_food1',
    type: 'match-pairs',
    order: 5,
    timeLimit: 30,
    maxAttempts: 2,
    data: {
      type: 'match-pairs',
      pairs: [
        { id: 'f_apple', left: 'Apple', right: 'Elma', leftType: 'text', rightType: 'text' },
        { id: 'f_banana', left: 'Banana', right: 'Muz', leftType: 'text', rightType: 'text' },
        { id: 'f_bread', left: 'Bread', right: 'Ekmek', leftType: 'text', rightType: 'text' },
        { id: 'f_milk', left: 'Milk', right: 'Süt', leftType: 'text', rightType: 'text' },
      ],
    },
  },
  {
    id: '3_fc_egg',
    type: 'flash-card',
    order: 6,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'flash-card',
      word: 'Egg',
      translation: 'Yumurta',
      imageUrl: '',
      audioUrl: '',
      exampleSentence: 'I had an egg for breakfast.',
      exampleTranslation: 'Kahvaltıda yumurta yedim.',
    },
  },
  {
    id: '3_lt_milk',
    type: 'listen-and-tap',
    order: 7,
    timeLimit: 15,
    maxAttempts: 2,
    data: {
      type: 'listen-and-tap',
      audioUrl: '',
      correctAnswer: 'Milk',
      options: ['Milk', 'Bread', 'Banana', 'Water'],
      imageHint: null,
    },
  },
  {
    id: '3_wb_apple',
    type: 'word-builder',
    order: 8,
    timeLimit: 25,
    maxAttempts: 3,
    data: {
      type: 'word-builder',
      word: 'Apple',
      translation: 'Elma',
      imageUrl: '',
      audioUrl: '',
      scrambledLetters: ['P', 'A', 'L', 'P', 'E'],
      hintLetters: [0],
    },
  },
  {
    id: '3_wb_bread',
    type: 'word-builder',
    order: 9,
    timeLimit: 25,
    maxAttempts: 3,
    data: {
      type: 'word-builder',
      word: 'Bread',
      translation: 'Ekmek',
      imageUrl: '',
      audioUrl: '',
      scrambledLetters: ['R', 'B', 'A', 'E', 'D'],
      hintLetters: [0],
    },
  },
  {
    id: '3_fb_apple',
    type: 'fill-blank',
    order: 10,
    timeLimit: 20,
    maxAttempts: 2,
    data: {
      type: 'fill-blank',
      sentence: 'I eat an ___ every day.',
      translation: 'Her gün bir ___ yerim.',
      correctAnswer: 'Apple',
      options: ['Apple', 'Egg', 'Banana', 'Bread'],
      audioUrl: '',
    },
  },
  {
    id: '3_fb_milk',
    type: 'fill-blank',
    order: 11,
    timeLimit: 20,
    maxAttempts: 2,
    data: {
      type: 'fill-blank',
      sentence: 'The baby drinks ___.',
      translation: 'Bebek ___ içer.',
      correctAnswer: 'Milk',
      options: ['Milk', 'Bread', 'Egg', 'Apple'],
      audioUrl: '',
    },
  },
  {
    id: '3_mp_food2',
    type: 'match-pairs',
    order: 12,
    timeLimit: 40,
    maxAttempts: 2,
    data: {
      type: 'match-pairs',
      pairs: [
        { id: 'f2_apple', left: 'Apple', right: 'Elma', leftType: 'text', rightType: 'text' },
        { id: 'f2_banana', left: 'Banana', right: 'Muz', leftType: 'text', rightType: 'text' },
        { id: 'f2_bread', left: 'Bread', right: 'Ekmek', leftType: 'text', rightType: 'text' },
        { id: 'f2_milk', left: 'Milk', right: 'Süt', leftType: 'text', rightType: 'text' },
        { id: 'f2_egg', left: 'Egg', right: 'Yumurta', leftType: 'text', rightType: 'text' },
      ],
    },
  },
];

// ────────────────────────────────────────
// LESSON 4 — Family (Aile)
// Hedef kelimeler: Mom, Dad, Baby, Sister, Brother
// ────────────────────────────────────────

const lesson4Family: Activity[] = [
  {
    id: '4_fc_mom',
    type: 'flash-card',
    order: 1,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'flash-card',
      word: 'Mom',
      translation: 'Anne',
      imageUrl: '',
      audioUrl: '',
      exampleSentence: 'My mom is kind.',
      exampleTranslation: 'Annem iyi kalplidir.',
    },
  },
  {
    id: '4_fc_dad',
    type: 'flash-card',
    order: 2,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'flash-card',
      word: 'Dad',
      translation: 'Baba',
      imageUrl: '',
      audioUrl: '',
      exampleSentence: 'My dad is strong.',
      exampleTranslation: 'Babam güçlüdür.',
    },
  },
  {
    id: '4_lt_baby',
    type: 'listen-and-tap',
    order: 3,
    timeLimit: 15,
    maxAttempts: 2,
    data: {
      type: 'listen-and-tap',
      audioUrl: '',
      correctAnswer: 'Baby',
      options: ['Baby', 'Dad', 'Bird', 'Ball'],
      imageHint: null,
    },
  },
  {
    id: '4_fc_sister',
    type: 'flash-card',
    order: 4,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'flash-card',
      word: 'Sister',
      translation: 'Kız Kardeş',
      imageUrl: '',
      audioUrl: '',
      exampleSentence: 'My sister is funny.',
      exampleTranslation: 'Kız kardeşim komiktir.',
    },
  },
  {
    id: '4_mp_family1',
    type: 'match-pairs',
    order: 5,
    timeLimit: 30,
    maxAttempts: 2,
    data: {
      type: 'match-pairs',
      pairs: [
        { id: 'fam_mom', left: 'Mom', right: 'Anne', leftType: 'text', rightType: 'text' },
        { id: 'fam_dad', left: 'Dad', right: 'Baba', leftType: 'text', rightType: 'text' },
        { id: 'fam_baby', left: 'Baby', right: 'Bebek', leftType: 'text', rightType: 'text' },
        {
          id: 'fam_sister',
          left: 'Sister',
          right: 'Kız Kardeş',
          leftType: 'text',
          rightType: 'text',
        },
      ],
    },
  },
  {
    id: '4_fc_brother',
    type: 'flash-card',
    order: 6,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'flash-card',
      word: 'Brother',
      translation: 'Erkek Kardeş',
      imageUrl: '',
      audioUrl: '',
      exampleSentence: 'My brother plays games.',
      exampleTranslation: 'Erkek kardeşim oyun oynar.',
    },
  },
  {
    id: '4_lt_sister',
    type: 'listen-and-tap',
    order: 7,
    timeLimit: 15,
    maxAttempts: 2,
    data: {
      type: 'listen-and-tap',
      audioUrl: '',
      correctAnswer: 'Sister',
      options: ['Sister', 'Brother', 'Star', 'Sun'],
      imageHint: null,
    },
  },
  {
    id: '4_wb_mom',
    type: 'word-builder',
    order: 8,
    timeLimit: 25,
    maxAttempts: 3,
    data: {
      type: 'word-builder',
      word: 'Mom',
      translation: 'Anne',
      imageUrl: '',
      audioUrl: '',
      scrambledLetters: ['O', 'M', 'M'],
      hintLetters: [0],
    },
  },
  {
    id: '4_wb_dad',
    type: 'word-builder',
    order: 9,
    timeLimit: 25,
    maxAttempts: 3,
    data: {
      type: 'word-builder',
      word: 'Dad',
      translation: 'Baba',
      imageUrl: '',
      audioUrl: '',
      scrambledLetters: ['A', 'D', 'D'],
      hintLetters: [0],
    },
  },
  {
    id: '4_fb_mom',
    type: 'fill-blank',
    order: 10,
    timeLimit: 20,
    maxAttempts: 2,
    data: {
      type: 'fill-blank',
      sentence: 'My ___ cooks dinner.',
      translation: '___ yemek pişirir.',
      correctAnswer: 'Mom',
      options: ['Mom', 'Dog', 'Baby', 'Fish'],
      audioUrl: '',
    },
  },
  {
    id: '4_fb_brother',
    type: 'fill-blank',
    order: 11,
    timeLimit: 20,
    maxAttempts: 2,
    data: {
      type: 'fill-blank',
      sentence: 'My ___ and I play together.',
      translation: '___ ve ben birlikte oynarız.',
      correctAnswer: 'Brother',
      options: ['Brother', 'Bird', 'Bear', 'Bread'],
      audioUrl: '',
    },
  },
  {
    id: '4_mp_family2',
    type: 'match-pairs',
    order: 12,
    timeLimit: 40,
    maxAttempts: 2,
    data: {
      type: 'match-pairs',
      pairs: [
        { id: 'fam2_mom', left: 'Mom', right: 'Anne', leftType: 'text', rightType: 'text' },
        { id: 'fam2_dad', left: 'Dad', right: 'Baba', leftType: 'text', rightType: 'text' },
        { id: 'fam2_baby', left: 'Baby', right: 'Bebek', leftType: 'text', rightType: 'text' },
        {
          id: 'fam2_sister',
          left: 'Sister',
          right: 'Kız Kardeş',
          leftType: 'text',
          rightType: 'text',
        },
        {
          id: 'fam2_brother',
          left: 'Brother',
          right: 'Erkek Kardeş',
          leftType: 'text',
          rightType: 'text',
        },
      ],
    },
  },
];

// ────────────────────────────────────────
// LESSON 5 — Numbers (Sayılar)
// Hedef kelimeler: One, Two, Three, Four, Five
// ────────────────────────────────────────

const lesson5Numbers: Activity[] = [
  {
    id: '5_fc_one',
    type: 'flash-card',
    order: 1,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'flash-card',
      word: 'One',
      translation: 'Bir',
      imageUrl: '',
      audioUrl: '',
      exampleSentence: 'I have one nose.',
      exampleTranslation: 'Bir burnum var.',
    },
  },
  {
    id: '5_fc_two',
    type: 'flash-card',
    order: 2,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'flash-card',
      word: 'Two',
      translation: 'İki',
      imageUrl: '',
      audioUrl: '',
      exampleSentence: 'I have two hands.',
      exampleTranslation: 'İki elim var.',
    },
  },
  {
    id: '5_lt_three',
    type: 'listen-and-tap',
    order: 3,
    timeLimit: 15,
    maxAttempts: 2,
    data: {
      type: 'listen-and-tap',
      audioUrl: '',
      correctAnswer: 'Three',
      options: ['Three', 'Tree', 'Two', 'Ten'],
      imageHint: null,
    },
  },
  {
    id: '5_fc_four',
    type: 'flash-card',
    order: 4,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'flash-card',
      word: 'Four',
      translation: 'Dört',
      imageUrl: '',
      audioUrl: '',
      exampleSentence: 'A dog has four legs.',
      exampleTranslation: 'Bir köpeğin dört bacağı vardır.',
    },
  },
  {
    id: '5_mp_nums1',
    type: 'match-pairs',
    order: 5,
    timeLimit: 30,
    maxAttempts: 2,
    data: {
      type: 'match-pairs',
      pairs: [
        { id: 'n_one', left: 'One', right: 'Bir', leftType: 'text', rightType: 'text' },
        { id: 'n_two', left: 'Two', right: 'İki', leftType: 'text', rightType: 'text' },
        { id: 'n_three', left: 'Three', right: 'Üç', leftType: 'text', rightType: 'text' },
        { id: 'n_four', left: 'Four', right: 'Dört', leftType: 'text', rightType: 'text' },
      ],
    },
  },
  {
    id: '5_fc_five',
    type: 'flash-card',
    order: 6,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'flash-card',
      word: 'Five',
      translation: 'Beş',
      imageUrl: '',
      audioUrl: '',
      exampleSentence: 'I have five fingers.',
      exampleTranslation: 'Beş parmağım var.',
    },
  },
  {
    id: '5_lt_two',
    type: 'listen-and-tap',
    order: 7,
    timeLimit: 15,
    maxAttempts: 2,
    data: {
      type: 'listen-and-tap',
      audioUrl: '',
      correctAnswer: 'Two',
      options: ['Two', 'Too', 'Three', 'Four'],
      imageHint: null,
    },
  },
  {
    id: '5_wb_three',
    type: 'word-builder',
    order: 8,
    timeLimit: 25,
    maxAttempts: 3,
    data: {
      type: 'word-builder',
      word: 'Three',
      translation: 'Üç',
      imageUrl: '',
      audioUrl: '',
      scrambledLetters: ['H', 'T', 'E', 'R', 'E'],
      hintLetters: [0],
    },
  },
  {
    id: '5_wb_five',
    type: 'word-builder',
    order: 9,
    timeLimit: 25,
    maxAttempts: 3,
    data: {
      type: 'word-builder',
      word: 'Five',
      translation: 'Beş',
      imageUrl: '',
      audioUrl: '',
      scrambledLetters: ['I', 'F', 'E', 'V'],
      hintLetters: [0],
    },
  },
  {
    id: '5_fb_one',
    type: 'fill-blank',
    order: 10,
    timeLimit: 20,
    maxAttempts: 2,
    data: {
      type: 'fill-blank',
      sentence: 'I have ___ mouth.',
      translation: '___ ağzım var.',
      correctAnswer: 'One',
      options: ['One', 'Five', 'Three', 'Four'],
      audioUrl: '',
    },
  },
  {
    id: '5_fb_four',
    type: 'fill-blank',
    order: 11,
    timeLimit: 20,
    maxAttempts: 2,
    data: {
      type: 'fill-blank',
      sentence: 'A cat has ___ legs.',
      translation: 'Kedinin ___ bacağı vardır.',
      correctAnswer: 'Four',
      options: ['Four', 'Five', 'Two', 'One'],
      audioUrl: '',
    },
  },
  {
    id: '5_mp_nums2',
    type: 'match-pairs',
    order: 12,
    timeLimit: 40,
    maxAttempts: 2,
    data: {
      type: 'match-pairs',
      pairs: [
        { id: 'n2_one', left: 'One', right: 'Bir', leftType: 'text', rightType: 'text' },
        { id: 'n2_two', left: 'Two', right: 'İki', leftType: 'text', rightType: 'text' },
        { id: 'n2_three', left: 'Three', right: 'Üç', leftType: 'text', rightType: 'text' },
        { id: 'n2_four', left: 'Four', right: 'Dört', leftType: 'text', rightType: 'text' },
        { id: 'n2_five', left: 'Five', right: 'Beş', leftType: 'text', rightType: 'text' },
      ],
    },
  },
];

// ────────────────────────────────────────
// DEFAULT — Mixed Review (Karışık Tekrar)
// ────────────────────────────────────────

const defaultMixed: Activity[] = [
  {
    id: 'mix_fc_sun',
    type: 'flash-card',
    order: 1,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'flash-card',
      word: 'Sun',
      translation: 'Güneş',
      imageUrl: '',
      audioUrl: '',
      exampleSentence: 'The sun is bright.',
      exampleTranslation: 'Güneş parlaktır.',
    },
  },
  {
    id: 'mix_fc_moon',
    type: 'flash-card',
    order: 2,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'flash-card',
      word: 'Moon',
      translation: 'Ay',
      imageUrl: '',
      audioUrl: '',
      exampleSentence: 'The moon shines at night.',
      exampleTranslation: 'Ay gece parlar.',
    },
  },
  {
    id: 'mix_lt_star',
    type: 'listen-and-tap',
    order: 3,
    timeLimit: 15,
    maxAttempts: 2,
    data: {
      type: 'listen-and-tap',
      audioUrl: '',
      correctAnswer: 'Star',
      options: ['Star', 'Sun', 'Moon', 'Car'],
      imageHint: null,
    },
  },
  {
    id: 'mix_mp_nature',
    type: 'match-pairs',
    order: 4,
    timeLimit: 30,
    maxAttempts: 2,
    data: {
      type: 'match-pairs',
      pairs: [
        { id: 'mx_sun', left: 'Sun', right: 'Güneş', leftType: 'text', rightType: 'text' },
        { id: 'mx_moon', left: 'Moon', right: 'Ay', leftType: 'text', rightType: 'text' },
        { id: 'mx_star', left: 'Star', right: 'Yıldız', leftType: 'text', rightType: 'text' },
        { id: 'mx_tree', left: 'Tree', right: 'Ağaç', leftType: 'text', rightType: 'text' },
      ],
    },
  },
  {
    id: 'mix_fc_tree',
    type: 'flash-card',
    order: 5,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'flash-card',
      word: 'Tree',
      translation: 'Ağaç',
      imageUrl: '',
      audioUrl: '',
      exampleSentence: 'Birds sit on the tree.',
      exampleTranslation: 'Kuşlar ağacın üstüne konar.',
    },
  },
  {
    id: 'mix_lt_moon',
    type: 'listen-and-tap',
    order: 6,
    timeLimit: 15,
    maxAttempts: 2,
    data: {
      type: 'listen-and-tap',
      audioUrl: '',
      correctAnswer: 'Moon',
      options: ['Moon', 'Mom', 'Milk', 'Mouse'],
      imageHint: null,
    },
  },
  {
    id: 'mix_wb_star',
    type: 'word-builder',
    order: 7,
    timeLimit: 25,
    maxAttempts: 3,
    data: {
      type: 'word-builder',
      word: 'Star',
      translation: 'Yıldız',
      imageUrl: '',
      audioUrl: '',
      scrambledLetters: ['T', 'S', 'R', 'A'],
      hintLetters: [0],
    },
  },
  {
    id: 'mix_wb_tree',
    type: 'word-builder',
    order: 8,
    timeLimit: 25,
    maxAttempts: 3,
    data: {
      type: 'word-builder',
      word: 'Tree',
      translation: 'Ağaç',
      imageUrl: '',
      audioUrl: '',
      scrambledLetters: ['R', 'T', 'E', 'E'],
      hintLetters: [0],
    },
  },
  {
    id: 'mix_fb_sun',
    type: 'fill-blank',
    order: 9,
    timeLimit: 20,
    maxAttempts: 2,
    data: {
      type: 'fill-blank',
      sentence: 'The ___ rises in the morning.',
      translation: '___ sabah doğar.',
      correctAnswer: 'Sun',
      options: ['Sun', 'Moon', 'Star', 'Rain'],
      audioUrl: '',
    },
  },
  {
    id: 'mix_fb_moon',
    type: 'fill-blank',
    order: 10,
    timeLimit: 20,
    maxAttempts: 2,
    data: {
      type: 'fill-blank',
      sentence: 'I see the ___ at night.',
      translation: 'Geceleri ___ görürüm.',
      correctAnswer: 'Moon',
      options: ['Moon', 'Sun', 'Star', 'Tree'],
      audioUrl: '',
    },
  },
  {
    id: 'mix_mp_final',
    type: 'match-pairs',
    order: 11,
    timeLimit: 40,
    maxAttempts: 2,
    data: {
      type: 'match-pairs',
      pairs: [
        { id: 'mxf_sun', left: 'Sun', right: 'Güneş', leftType: 'text', rightType: 'text' },
        { id: 'mxf_moon', left: 'Moon', right: 'Ay', leftType: 'text', rightType: 'text' },
        { id: 'mxf_star', left: 'Star', right: 'Yıldız', leftType: 'text', rightType: 'text' },
        { id: 'mxf_tree', left: 'Tree', right: 'Ağaç', leftType: 'text', rightType: 'text' },
        { id: 'mxf_water', left: 'Water', right: 'Su', leftType: 'text', rightType: 'text' },
      ],
    },
  },
];

// ────────────────────────────────────────
// LESSON 6 — Advanced Activities (İleri Seviye)
// 5 yeni aktivite tipi: speak-it, memory-game, word-search, story-time, quiz-battle
// ────────────────────────────────────────

const lesson6Advanced: Activity[] = [
  // 1️⃣ FlashCard — Sun tanıtımı
  {
    id: '6_fc_sun',
    type: 'flash-card',
    order: 1,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'flash-card',
      word: 'Sun',
      translation: 'Güneş',
      imageUrl: '',
      audioUrl: '',
      exampleSentence: 'The sun is bright.',
      exampleTranslation: 'Güneş parlak.',
    },
  },
  // 2️⃣ SpeakIt — Dog seslendir
  {
    id: '6_si_dog',
    type: 'speak-it',
    order: 2,
    timeLimit: 30,
    maxAttempts: 3,
    data: {
      type: 'speak-it',
      word: 'Dog',
      translation: 'Köpek',
      audioUrl: '',
      imageUrl: '',
      acceptableVariations: ['dog', 'dogs', 'a dog'],
    },
  },
  // 3️⃣ SpeakIt — Apple seslendir
  {
    id: '6_si_apple',
    type: 'speak-it',
    order: 3,
    timeLimit: 30,
    maxAttempts: 3,
    data: {
      type: 'speak-it',
      word: 'Apple',
      translation: 'Elma',
      audioUrl: '',
      imageUrl: '',
      acceptableVariations: ['apple', 'an apple', 'apples'],
    },
  },
  // 4️⃣ MemoryGame — Hayvanlar eşleştirme
  {
    id: '6_mg_animals',
    type: 'memory-game',
    order: 4,
    timeLimit: 60,
    maxAttempts: 1,
    data: {
      type: 'memory-game',
      cards: [
        { id: 'mg_d1', matchId: 'dog', content: 'Dog', contentType: 'text' },
        { id: 'mg_d2', matchId: 'dog', content: 'Köpek', contentType: 'text' },
        { id: 'mg_c1', matchId: 'cat', content: 'Cat', contentType: 'text' },
        { id: 'mg_c2', matchId: 'cat', content: 'Kedi', contentType: 'text' },
        { id: 'mg_b1', matchId: 'bird', content: 'Bird', contentType: 'text' },
        { id: 'mg_b2', matchId: 'bird', content: 'Kuş', contentType: 'text' },
        { id: 'mg_f1', matchId: 'fish', content: 'Fish', contentType: 'text' },
        { id: 'mg_f2', matchId: 'fish', content: 'Balık', contentType: 'text' },
      ],
      gridSize: { rows: 2, cols: 4 },
    },
  },
  // 5️⃣ WordSearch — Renkler bulmaca
  {
    id: '6_ws_colors',
    type: 'word-search',
    order: 5,
    timeLimit: 90,
    maxAttempts: 1,
    data: {
      type: 'word-search',
      gridSize: 6,
      grid: [
        ['R', 'E', 'D', 'X', 'K', 'L'],
        ['B', 'L', 'U', 'E', 'P', 'M'],
        ['G', 'R', 'E', 'E', 'N', 'A'],
        ['Y', 'P', 'I', 'N', 'K', 'X'],
        ['W', 'H', 'I', 'T', 'E', 'Q'],
        ['Z', 'B', 'D', 'F', 'G', 'H'],
      ],
      words: [
        { word: 'RED', translation: 'Kırmızı', direction: 'horizontal', startRow: 0, startCol: 0 },
        { word: 'BLUE', translation: 'Mavi', direction: 'horizontal', startRow: 1, startCol: 0 },
        { word: 'GREEN', translation: 'Yeşil', direction: 'horizontal', startRow: 2, startCol: 0 },
        { word: 'PINK', translation: 'Pembe', direction: 'horizontal', startRow: 3, startCol: 1 },
        { word: 'WHITE', translation: 'Beyaz', direction: 'horizontal', startRow: 4, startCol: 0 },
      ],
    },
  },
  // 6️⃣ StoryTime — Ormandaki hayvanlar
  {
    id: '6_st_forest',
    type: 'story-time',
    order: 6,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'story-time',
      title: 'The Forest Friends',
      pages: [
        {
          text: 'A little bird lives in the forest. The bird is blue.',
          translation: 'Küçük bir kuş ormanda yaşıyor. Kuş mavi.',
          imageUrl: 'forest',
          audioUrl: '',
          highlightWords: ['bird', 'forest', 'blue'],
          interactionType: 'tap-word',
        },
        {
          text: 'The bird has a friend. It is a red fish in the river.',
          translation: 'Kuşun bir arkadaşı var. Nehirdeki kırmızı bir balık.',
          imageUrl: 'forest',
          audioUrl: '',
          highlightWords: ['friend', 'red', 'fish', 'river'],
          interactionType: 'tap-word',
        },
        {
          text: 'They play together every day. They are happy!',
          translation: 'Her gün birlikte oynuyorlar. Mutlular!',
          imageUrl: 'forest',
          audioUrl: '',
          highlightWords: ['play', 'together', 'happy'],
          interactionType: 'tap-word',
        },
      ],
    },
  },
  // 7️⃣ QuizBattle — Genel bilgi testi
  {
    id: '6_qb_review',
    type: 'quiz-battle',
    order: 7,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'quiz-battle',
      questions: [
        {
          id: 'qb1',
          question: '"Köpek" İngilizce ne demek?',
          questionType: 'text',
          options: ['Cat', 'Dog', 'Bird', 'Fish'],
          correctIndex: 1,
          timeLimit: 10,
          points: 100,
        },
        {
          id: 'qb2',
          question: '"Red" Türkçe ne demek?',
          questionType: 'text',
          options: ['Mavi', 'Yeşil', 'Kırmızı', 'Sarı'],
          correctIndex: 2,
          timeLimit: 10,
          points: 100,
        },
        {
          id: 'qb3',
          question: '"Elma" İngilizce ne demek?',
          questionType: 'text',
          options: ['Banana', 'Apple', 'Orange', 'Grape'],
          correctIndex: 1,
          timeLimit: 10,
          points: 100,
        },
        {
          id: 'qb4',
          question: '"Mother" Türkçe ne demek?',
          questionType: 'text',
          options: ['Baba', 'Anne', 'Kardeş', 'Abla'],
          correctIndex: 1,
          timeLimit: 10,
          points: 100,
        },
        {
          id: 'qb5',
          question: '"Blue" ne renk?',
          questionType: 'text',
          options: ['Kırmızı', 'Sarı', 'Yeşil', 'Mavi'],
          correctIndex: 3,
          timeLimit: 8,
          points: 150,
        },
      ],
    },
  },
  // 8️⃣ MemoryGame — Yiyecekler
  {
    id: '6_mg_food',
    type: 'memory-game',
    order: 8,
    timeLimit: 60,
    maxAttempts: 1,
    data: {
      type: 'memory-game',
      cards: [
        { id: 'mgf_a1', matchId: 'apple', content: 'Apple', contentType: 'text' },
        { id: 'mgf_a2', matchId: 'apple', content: 'Elma', contentType: 'text' },
        { id: 'mgf_b1', matchId: 'banana', content: 'Banana', contentType: 'text' },
        { id: 'mgf_b2', matchId: 'banana', content: 'Muz', contentType: 'text' },
        { id: 'mgf_m1', matchId: 'milk', content: 'Milk', contentType: 'text' },
        { id: 'mgf_m2', matchId: 'milk', content: 'Süt', contentType: 'text' },
      ],
      gridSize: { rows: 2, cols: 3 },
    },
  },
  // 9️⃣ SpeakIt — Green seslendir
  {
    id: '6_si_green',
    type: 'speak-it',
    order: 9,
    timeLimit: 30,
    maxAttempts: 3,
    data: {
      type: 'speak-it',
      word: 'Green',
      translation: 'Yeşil',
      audioUrl: '',
      imageUrl: '',
      acceptableVariations: ['green', 'the green'],
    },
  },
  // 🔟 QuizBattle — Sayılar quiz
  {
    id: '6_qb_numbers',
    type: 'quiz-battle',
    order: 10,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'quiz-battle',
      questions: [
        {
          id: 'qbn1',
          question: '"Three" kaç demek?',
          questionType: 'text',
          options: ['1', '2', '3', '4'],
          correctIndex: 2,
          timeLimit: 8,
          points: 100,
        },
        {
          id: 'qbn2',
          question: '"Yedi" İngilizce ne?',
          questionType: 'text',
          options: ['Five', 'Six', 'Seven', 'Eight'],
          correctIndex: 2,
          timeLimit: 8,
          points: 100,
        },
        {
          id: 'qbn3',
          question: '"Ten" kaç?',
          questionType: 'text',
          options: ['8', '9', '10', '11'],
          correctIndex: 2,
          timeLimit: 8,
          points: 100,
        },
      ],
    },
  },
  // 1️⃣1️⃣ WordSearch — Hayvanlar
  {
    id: '6_ws_animals',
    type: 'word-search',
    order: 11,
    timeLimit: 90,
    maxAttempts: 1,
    data: {
      type: 'word-search',
      gridSize: 5,
      grid: [
        ['D', 'O', 'G', 'X', 'M'],
        ['C', 'A', 'T', 'P', 'Q'],
        ['B', 'I', 'R', 'D', 'Z'],
        ['F', 'I', 'S', 'H', 'L'],
        ['B', 'E', 'A', 'R', 'N'],
      ],
      words: [
        { word: 'DOG', translation: 'Köpek', direction: 'horizontal', startRow: 0, startCol: 0 },
        { word: 'CAT', translation: 'Kedi', direction: 'horizontal', startRow: 1, startCol: 0 },
        { word: 'BIRD', translation: 'Kuş', direction: 'horizontal', startRow: 2, startCol: 0 },
        { word: 'FISH', translation: 'Balık', direction: 'horizontal', startRow: 3, startCol: 0 },
        { word: 'BEAR', translation: 'Ayı', direction: 'horizontal', startRow: 4, startCol: 0 },
      ],
    },
  },
  // 1️⃣2️⃣ StoryTime — Final hikaye
  {
    id: '6_st_school',
    type: 'story-time',
    order: 12,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'story-time',
      title: 'My First Day at School',
      pages: [
        {
          text: 'Today is my first day at school. I have a new bag.',
          translation: 'Bugün okulda ilk günüm. Yeni bir çantam var.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['first', 'school', 'new', 'bag'],
          interactionType: 'tap-word',
        },
        {
          text: 'I see many children. They are my new friends.',
          translation: 'Birçok çocuk görüyorum. Onlar benim yeni arkadaşlarım.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['children', 'friends'],
          interactionType: 'tap-word',
        },
        {
          text: 'The teacher says hello. We learn numbers and colors. It is fun!',
          translation: 'Öğretmen merhaba diyor. Sayılar ve renkler öğreniyoruz. Eğlenceli!',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['teacher', 'hello', 'numbers', 'colors', 'fun'],
          interactionType: 'tap-word',
        },
      ],
    },
  },
];

// ────────────────────────────────────────
// EXPORT — Lesson ID'ye göre aktivite listesi döndür
// ────────────────────────────────────────

const lessonMap: Record<string, Activity[]> = {
  '1': lesson1Animals,
  '2': lesson2Colors,
  '3': lesson3Food,
  '4': lesson4Family,
  '5': lesson5Numbers,
  '6': lesson6Advanced,
};

/**
 * Verilen ders ID'si için aktivite listesi döndürür.
 * Bilinmeyen ID'ler için karışık tekrar dersi döner.
 */
export function getMockActivities(lessonId: string): Activity[] {
  return lessonMap[lessonId] ?? defaultMixed;
}
