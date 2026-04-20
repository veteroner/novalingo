/**
 * storyBank.ts — World 1 Micro-Story Content
 *
 * Sprint 2 deliverable: 9 mikro hikaye (micro-stories) for World 1
 * "Başlangıç Bahçesi" (Beginner Garden).
 *
 * Sprint 4 extension: 12 micro-stories for World 3 "Story Forest" (Hikaye Ormanı)
 * covering: Home & School, Nature, Clothes, Nature Exploration, Transportation.
 *
 * Each story has 3-5 pages, bilingual text (en/tr), highlight words, and
 * an interactionType for light engagement.
 */

import { getPreRecordedUrl } from '@/services/speech/audioManifest';
import type { StoryTimeData } from '@/types/content';
import { resolveImageUrl } from '@/utils/mediaFallback';

export interface MicroStory {
  id: string;
  /** Display title shown before the story starts */
  title: string;
  titleTr: string;
  /** W1 unit theme tag — maps to outcomeTag vocabulary category */
  theme: string;
  /** Recommended after which lesson slug (optional guidance for placement) */
  suggestedAfterUnit?: string;
  data: StoryTimeData;
}

export const STORY_TTS_FALLBACK_MARKER = 'tts://story-fallback';

export function resolveStoryAudioUrl(text: string, audioUrl?: string): string {
  if (audioUrl && audioUrl.length > 0) return audioUrl;

  const candidates = [
    text,
    text.trim(),
    text.replace(/\s+/g, ' '),
    text.replace(/[“”]/g, '"'),
    text.replace(/[‘’]/g, "'"),
    text.replace(/["']/g, ''),
  ];

  for (const candidate of candidates) {
    const resolved = getPreRecordedUrl(candidate);
    if (resolved) return resolved;
  }

  return STORY_TTS_FALLBACK_MARKER;
}

const rawStoryBank: MicroStory[] = [
  // ─────────────────────────────────────────────────────────────────────────────
  // 1. ANIMALS — Nova Meets the Farm
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'story-w1-farm-visit',
    title: 'Nova Visits the Farm',
    titleTr: 'Nova Çiftliği Ziyaret Ediyor',
    theme: 'animals',
    suggestedAfterUnit: 'unit-w1-animals',
    data: {
      type: 'story-time',
      title: 'Nova Visits the Farm',
      pages: [
        {
          text: 'Nova wakes up early. Today she is going to the farm!',
          translation: 'Nova erken uyanır. Bugün çiftliğe gidecek!',
          imageUrl: '/story/story-w1-farm-visit-p1.jpg',
          audioUrl: '/audio/tts/132f7d88fe44e513.mp3',
          highlightWords: ['farm'],
          interactionType: 'none',
        },
        {
          text: 'On the farm there is a big dog. The dog says WOOF!',
          translation: 'Çiftlikte büyük bir köpek var. Köpek HAVO diye sesleniyor!',
          imageUrl: '/story/story-w1-farm-visit-p2.jpg',
          audioUrl: '/audio/tts/ffae7f64b1117e08.mp3',
          highlightWords: ['dog'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova sees a cat, a horse, and a bird too.',
          translation: 'Nova ayrıca bir kedi, at ve kuş görüyor.',
          imageUrl: '/story/story-w1-farm-visit-p3.jpg',
          audioUrl: '/audio/tts/f69a02469647d7be.mp3',
          highlightWords: ['cat', 'horse', 'bird'],
          interactionType: 'tap-word',
        },
        {
          text: 'The bird sings a happy song. Nova claps her hands.',
          translation: 'Kuş neşeli bir şarkı söylüyor. Nova ellerini çırpıyor.',
          imageUrl: '/story/story-w1-farm-visit-p4.jpg',
          audioUrl: '/audio/tts/1f82e8c03d433805.mp3',
          highlightWords: ['bird'],
          interactionType: 'none',
        },
        {
          text: '"I love animals!" says Nova. Do you love animals too?',
          translation: '"Hayvanları seviyorum!" diyor Nova. Sen de hayvanları seviyor musun?',
          imageUrl: '/story/story-w1-farm-visit-p5.jpg',
          audioUrl: '/audio/tts/7618dd6ac1e8735f.mp3',
          highlightWords: ['animals'],
          interactionType: 'choose-image',
          interactionData: { question: 'Which animal did Nova see first?', answer: 'dog' },
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. ANIMALS — Ocean Adventure
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'story-w1-ocean',
    title: 'Nova and the Sea Animals',
    titleTr: 'Nova ve Deniz Hayvanları',
    theme: 'animals',
    suggestedAfterUnit: 'unit-w1-animals',
    data: {
      type: 'story-time',
      title: 'Nova and the Sea Animals',
      pages: [
        {
          text: 'Nova puts on her swim goggles and dives into the blue ocean.',
          translation: 'Nova yüzme gözlüğünü takıp mavi okyanusa dalıyor.',
          imageUrl: '/story/story-w1-ocean-p1.jpg',
          audioUrl: '/audio/tts/b7f7e583afd45ea7.mp3',
          highlightWords: ['ocean'],
          interactionType: 'none',
        },
        {
          text: 'She sees a big whale. The whale is very friendly!',
          translation: 'Büyük bir balina görüyor. Balina çok dostane!',
          imageUrl: '/story/story-w1-ocean-p2.jpg',
          audioUrl: '/audio/tts/b6a6a4b016e83eee.mp3',
          highlightWords: ['whale'],
          interactionType: 'tap-word',
        },
        {
          text: 'A little fish swims past her nose. It says hello!',
          translation: 'Küçük bir balık burnunun yanından geçip merhaba diyor!',
          imageUrl: '/story/story-w1-ocean-p3.jpg',
          audioUrl: '/audio/tts/ee86f9c006c47372.mp3',
          highlightWords: ['fish'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova waves goodbye to the whale and the fish. What a wonderful ocean!',
          translation: 'Nova balina ve balığa hoşça kal diye el sallıyor. Ne harika bir okyanus!',
          imageUrl: '/story/story-w1-ocean-p4.jpg',
          audioUrl: '/audio/tts/ca7e75c4b14d951c.mp3',
          highlightWords: ['whale', 'fish'],
          interactionType: 'none',
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. COLORS — Nova Paints a Rainbow
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'story-w1-rainbow',
    title: 'Nova Paints a Rainbow',
    titleTr: 'Nova Bir Gökkuşağı Boyuyor',
    theme: 'colors',
    suggestedAfterUnit: 'unit-w1-colors',
    data: {
      type: 'story-time',
      title: 'Nova Paints a Rainbow',
      pages: [
        {
          text: "Nova has a big piece of paper and lots of paint. Let's make a rainbow!",
          translation: "Nova'nın büyük bir kağıdı ve çok boya var. Bir gökkuşağı yapalım!",
          imageUrl: '/story/story-w1-rainbow-p1.jpg',
          audioUrl: '/audio/tts/53bd7675c931218b.mp3',
          highlightWords: ['rainbow'],
          interactionType: 'none',
        },
        {
          text: 'First she paints a red stripe. Red is the colour of a ripe apple.',
          translation: 'Önce kırmızı bir şerit boyuyor. Kırmızı olgun elmanın rengidir.',
          imageUrl: '/story/story-w1-rainbow-p2.jpg',
          audioUrl: '/audio/tts/dc63a3610203122c.mp3',
          highlightWords: ['red'],
          interactionType: 'tap-word',
        },
        {
          text: 'Next comes yellow, then blue. Yellow is bright like the sun!',
          translation: 'Ardından sarı, sonra mavi geliyor. Sarı güneş gibi parlaktır!',
          imageUrl: '/story/story-w1-rainbow-p3.jpg',
          audioUrl: '/audio/tts/b68208a03e85af8d.mp3',
          highlightWords: ['yellow', 'blue'],
          interactionType: 'tap-word',
        },
        {
          text: 'She adds green, orange, and purple. The rainbow is almost done!',
          translation: 'Yeşil, turuncu ve mor ekliyor. Gökkuşağı neredeyse bitti!',
          imageUrl: '/story/story-w1-rainbow-p4.jpg',
          audioUrl: '/audio/tts/55f6456442a9bbc6.mp3',
          highlightWords: ['green', 'orange', 'purple'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova holds up her painting. "Look at all the colours!" she says.',
          translation: 'Nova tablosunu yukarı kaldırıyor. "Bütün renklere bak!" diyor.',
          imageUrl: '/story/story-w1-rainbow-p5.jpg',
          audioUrl: '/audio/tts/593567cb4a51a778.mp3',
          highlightWords: ['colours'],
          interactionType: 'choose-image',
          interactionData: { question: 'What colour did Nova paint first?', answer: 'red' },
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. NUMBERS — Nova Counts the Stars
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'story-w1-counting-stars',
    title: 'Nova Counts the Stars',
    titleTr: 'Nova Yıldızları Sayıyor',
    theme: 'numbers',
    suggestedAfterUnit: 'unit-w1-numbers',
    data: {
      type: 'story-time',
      title: 'Nova Counts the Stars',
      pages: [
        {
          text: 'It is night time. Nova looks up at the sky. There are so many stars!',
          translation: 'Gece vakti. Nova gökyüzüne bakıyor. Çok fazla yıldız var!',
          imageUrl: '/story/story-w1-counting-stars-p1.jpg',
          audioUrl: '/audio/tts/cf54fbdf734b342f.mp3',
          highlightWords: ['stars'],
          interactionType: 'none',
        },
        {
          text: 'She counts: one, two, three. Three stars wink at her.',
          translation: 'Sayıyor: bir, iki, üç. Üç yıldız ona göz kırpıyor.',
          imageUrl: '/story/story-w1-counting-stars-p2.jpg',
          audioUrl: '/audio/tts/474aa789947e91b1.mp3',
          highlightWords: ['one', 'two', 'three'],
          interactionType: 'tap-word',
        },
        {
          text: 'She keeps counting: four, five! There are five bright stars in a row.',
          translation: 'Saymaya devam ediyor: dört, beş! Bir sırada beş parlak yıldız var.',
          imageUrl: '/story/story-w1-counting-stars-p3.jpg',
          audioUrl: '/audio/tts/86e5a780ffb20c66.mp3',
          highlightWords: ['four', 'five'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova makes a wish on the biggest star. She smiles and goes to sleep.',
          translation: 'Nova en büyük yıldıza dilek tutuyor. Gülümseyerek uyumaya gidiyor.',
          imageUrl: '/story/story-w1-counting-stars-p4.jpg',
          audioUrl: '/audio/tts/ef74f1b9b3a8e023.mp3',
          highlightWords: ['star'],
          interactionType: 'choose-image',
          interactionData: { question: 'How many stars did Nova count in a row?', answer: 'five' },
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. BODY PARTS — Nova Dances
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'story-w1-nova-dances',
    title: 'Nova Dances!',
    titleTr: 'Nova Dans Ediyor!',
    theme: 'body',
    suggestedAfterUnit: 'unit-w1-body',
    data: {
      type: 'story-time',
      title: 'Nova Dances!',
      pages: [
        {
          text: 'The music starts and Nova begins to dance!',
          translation: 'Müzik başlıyor ve Nova dans etmeye başlıyor!',
          imageUrl: '/story/story-w1-nova-dances-p1.jpg',
          audioUrl: '/audio/tts/fe469c35ab02e2a9.mp3',
          highlightWords: ['dance'],
          interactionType: 'none',
        },
        {
          text: 'She moves her arms up and down, up and down.',
          translation: 'Kollarını yukarı aşağı hareket ettiriyor, yukarı aşağı.',
          imageUrl: '/story/story-w1-nova-dances-p2.jpg',
          audioUrl: '/audio/tts/6e5abdde8ad0f621.mp3',
          highlightWords: ['arms'],
          interactionType: 'tap-word',
        },
        {
          text: 'She stomps her feet on the ground — STOMP! STOMP!',
          translation: 'Ayaklarını yere vuruyor — STOMP! STOMP!',
          imageUrl: '/story/story-w1-nova-dances-p3.jpg',
          audioUrl: '/audio/tts/d61edd4f329ce915.mp3',
          highlightWords: ['feet'],
          interactionType: 'tap-word',
        },
        {
          text: 'She shakes her head left and right. Her eyes are full of joy!',
          translation: 'Kafasını sağa sola sallıyor. Gözleri neşeyle dolup taşıyor!',
          imageUrl: '/story/story-w1-nova-dances-p4.jpg',
          audioUrl: '/audio/tts/a99899dfc1491cc3.mp3',
          highlightWords: ['head', 'eyes'],
          interactionType: 'tap-word',
        },
        {
          text: '"Dancing is the best!" laughs Nova. Can you dance like Nova?',
          translation:
            '"Dans etmek çok güzel!" diye gülen Nova. Sen de Nova gibi dans edebilir misin?',
          imageUrl: '/story/story-w1-nova-dances-p5.jpg',
          audioUrl: '/audio/tts/97a0026c5002acc1.mp3',
          highlightWords: ['dance'],
          interactionType: 'none',
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. FOODS — Nova Makes a Fruit Salad
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'story-w1-fruit-salad',
    title: 'Nova Makes a Fruit Salad',
    titleTr: 'Nova Meyve Salatası Yapıyor',
    theme: 'food',
    suggestedAfterUnit: 'unit-w1-foods',
    data: {
      type: 'story-time',
      title: 'Nova Makes a Fruit Salad',
      pages: [
        {
          text: 'Nova is in the kitchen. She wants to make a yummy fruit salad!',
          translation: 'Nova mutfakta. Lezzetli bir meyve salatası yapmak istiyor!',
          imageUrl: '/story/story-w1-fruit-salad-p1.jpg',
          audioUrl: '/audio/tts/69bba4e79f027715.mp3',
          highlightWords: ['kitchen', 'fruit'],
          interactionType: 'none',
        },
        {
          text: 'She grabs an apple and cuts it into small pieces.',
          translation: 'Bir elma alıp küçük parçalar halinde kesiyor.',
          imageUrl: '/story/story-w1-fruit-salad-p2.jpg',
          audioUrl: '/audio/tts/ea92d7584dced8cc.mp3',
          highlightWords: ['apple'],
          interactionType: 'tap-word',
        },
        {
          text: 'Then she adds a banana, some grapes, and a juicy orange.',
          translation: 'Ardından bir muz, biraz üzüm ve sulu bir portakal ekliyor.',
          imageUrl: '/story/story-w1-fruit-salad-p3.jpg',
          audioUrl: '/audio/tts/a53f2f4b9e0c9709.mp3',
          highlightWords: ['banana', 'grapes', 'orange'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova mixes everything together. It smells so good!',
          translation: 'Nova her şeyi bir arada karıştırıyor. Çok güzel kokuyor!',
          imageUrl: '/story/story-w1-fruit-salad-p4.jpg',
          audioUrl: '/audio/tts/60e782e4733cf501.mp3',
          highlightWords: ['fruit'],
          interactionType: 'none',
        },
        {
          text: '"Yummy!" says Nova. "Fruit salad is the best snack."',
          translation: '"Lezzetli!" diyor Nova. "Meyve salatası en güzel atıştırmalıktır."',
          imageUrl: '/story/story-w1-fruit-salad-p5.jpg',
          audioUrl: '/audio/tts/940b241ea2b1bd53.mp3',
          highlightWords: ['snack'],
          interactionType: 'choose-image',
          interactionData: { question: 'Which fruit did Nova add first?', answer: 'apple' },
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. HOUSE ITEMS — Nova's Cosy Bedroom
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'story-w1-bedroom',
    title: "Nova's Cosy Bedroom",
    titleTr: "Nova'nın Rahat Yatak Odası",
    theme: 'home',
    suggestedAfterUnit: 'unit-w1-house',
    data: {
      type: 'story-time',
      title: "Nova's Cosy Bedroom",
      pages: [
        {
          text: 'Nova shows us her bedroom. It is her favourite room in the house!',
          translation: 'Nova bize yatak odasını gösteriyor. Evdeki en sevdiği oda burası!',
          imageUrl: '/story/story-w1-bedroom-p1.jpg',
          audioUrl: '/audio/tts/627ca76388e3fb01.mp3',
          highlightWords: ['bedroom', 'house'],
          interactionType: 'none',
        },
        {
          text: 'There is a big bed in the middle of the room. The bed has a fluffy pillow.',
          translation:
            'Odanın ortasında büyük bir yatak var. Yatağın üzerinde kabarık bir yastık var.',
          imageUrl: '/story/story-w1-bedroom-p2.jpg',
          audioUrl: '/audio/tts/aeca139de4ca2a58.mp3',
          highlightWords: ['bed', 'pillow'],
          interactionType: 'tap-word',
        },
        {
          text: 'On the desk next to the window, Nova keeps her books.',
          translation: 'Pencerenin yanındaki masanın üzerinde Nova kitaplarını saklıyor.',
          imageUrl: '/story/story-w1-bedroom-p3.jpg',
          audioUrl: '/audio/tts/b10b334937905580.mp3',
          highlightWords: ['desk', 'books'],
          interactionType: 'tap-word',
        },
        {
          text: 'There is also a chair and a lamp. The lamp gives a warm, yellow light.',
          translation: 'Bir de sandalye ve lamba var. Lamba sıcak, sarı bir ışık veriyor.',
          imageUrl: '/story/story-w1-bedroom-p4.jpg',
          audioUrl: '/audio/tts/0626804dcb03bca9.mp3',
          highlightWords: ['chair', 'lamp'],
          interactionType: 'tap-word',
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. TOYS & PLAY — Nova's Toy Box
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'story-w1-toy-box',
    title: "Nova's Toy Box",
    titleTr: "Nova'nın Oyuncak Kutusu",
    theme: 'toys',
    suggestedAfterUnit: 'unit-w1-toys',
    data: {
      type: 'story-time',
      title: "Nova's Toy Box",
      pages: [
        {
          text: 'Nova has a big, colourful toy box.',
          translation: "Nova'nın büyük, renkli bir oyuncak kutusu var.",
          imageUrl: '/story/story-w1-toy-box-p1.jpg',
          audioUrl: '/audio/tts/d573c71150749c67.mp3',
          highlightWords: ['toy'],
          interactionType: 'none',
        },
        {
          text: 'Inside there is a red ball, a yellow train, and a blue car.',
          translation: 'İçinde kırmızı bir top, sarı bir tren ve mavi bir araba var.',
          imageUrl: '/story/story-w1-toy-box-p2.jpg',
          audioUrl: '/audio/tts/ebfd1ea877e20757.mp3',
          highlightWords: ['ball', 'train', 'car'],
          interactionType: 'tap-word',
        },
        {
          text: 'There is also a drum! BOOM BOOM BOOM goes the drum.',
          translation: 'Bir de davul var! BOOM BOOM BOOM diye ses çıkarıyor.',
          imageUrl: '/story/story-w1-toy-box-p3.jpg',
          audioUrl: '/audio/tts/1d5e21586af889b3.mp3',
          highlightWords: ['drum'],
          interactionType: 'tap-word',
        },
        {
          text: '"Which toy do you want to play with?" asks Nova.',
          translation: '"Hangi oyuncakla oynamak istiyorsun?" diye soruyor Nova.',
          imageUrl: '/story/story-w1-toy-box-p4.jpg',
          audioUrl: '/audio/tts/22cde3bde4f80dd6.mp3',
          highlightWords: ['play'],
          interactionType: 'choose-image',
          interactionData: {
            question: 'Which toy makes a BOOM sound?',
            answer: 'drum',
          },
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 9. MIXED — Nova's Perfect Day (revision story covering multiple W1 themes)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'story-w1-perfect-day',
    title: "Nova's Perfect Day",
    titleTr: "Nova'nın Mükemmel Günü",
    theme: 'review',
    suggestedAfterUnit: 'unit-w1-review',
    data: {
      type: 'story-time',
      title: "Nova's Perfect Day",
      pages: [
        {
          text: 'In the morning Nova eats breakfast. She has an apple and a banana.',
          translation: 'Sabah Nova kahvaltı yapıyor. Bir elma ve bir muz yiyor.',
          imageUrl: '/story/story-w1-perfect-day-p1.jpg',
          audioUrl: '/audio/tts/9e8b2e6518a25d1a.mp3',
          highlightWords: ['apple', 'banana'],
          interactionType: 'tap-word',
        },
        {
          text: 'Then she plays in the garden with her dog. She throws the red ball!',
          translation: 'Sonra köpeğiyle bahçede oynuyor. Kırmızı topu fırlatıyor!',
          imageUrl: '/story/story-w1-perfect-day-p2.jpg',
          audioUrl: '/audio/tts/c6d04891aa288ac9.mp3',
          highlightWords: ['dog', 'ball', 'red'],
          interactionType: 'tap-word',
        },
        {
          text: 'In the afternoon she paints. She uses five colours: red, yellow, blue, green and purple.',
          translation:
            'Öğleden sonra resim yapıyor. Beş renk kullanıyor: kırmızı, sarı, mavi, yeşil ve mor.',
          imageUrl: '/story/story-w1-perfect-day-p3.jpg',
          audioUrl: '/audio/tts/a4966ffbec39cee5.mp3',
          highlightWords: ['five', 'red', 'yellow', 'blue', 'green', 'purple'],
          interactionType: 'tap-word',
        },
        {
          text: 'At night she reads a book in bed with her lamp on. She is happy and tired.',
          translation: 'Gece lambasını yakarak yatakta kitap okuyor. Mutlu ve yorgun.',
          imageUrl: '/story/story-w1-perfect-day-p4.jpg',
          audioUrl: '/audio/tts/5dd50d0f6af0eb53.mp3',
          highlightWords: ['book', 'bed', 'lamp'],
          interactionType: 'tap-word',
        },
        {
          text: '"What a perfect day!" says Nova, closing her eyes.',
          translation: '"Ne mükemmel bir gündü!" diyor Nova, gözlerini kapatarak.',
          imageUrl: '/story/story-w1-perfect-day-p5.jpg',
          audioUrl: '/audio/tts/f793b4522b393395.mp3',
          highlightWords: ['day'],
          interactionType: 'choose-image',
          interactionData: { question: 'What did Nova play with in the garden?', answer: 'ball' },
        },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WORLD 3 — STORY FOREST (Sprint 4)
  // 12 micro-stories covering: Home & School · Nature · Clothes ·
  //   Nature Exploration · Transportation
  // ═══════════════════════════════════════════════════════════════════════════

  // ── W3-1. HOME — Nova's House Tour ─────────────────────────────────────────
  {
    id: 'story-w3-house-tour',
    title: "Nova's House Tour",
    titleTr: "Nova'nın Ev Turu",
    theme: 'home',
    suggestedAfterUnit: 'w3_u1',
    data: {
      type: 'story-time',
      title: "Nova's House Tour",
      pages: [
        {
          text: "This is Nova's house. It has a big door and a garden.",
          translation: "Bu Nova'nın evi. Büyük bir kapısı ve bahçesi var.",
          imageUrl: '/story/story-w3-house-tour-p1.jpg',
          audioUrl: '/audio/tts/19a31f82e82a4e17.mp3',
          highlightWords: ['house', 'door', 'garden'],
          interactionType: 'tap-word',
        },
        {
          text: 'There is a kitchen in the house. Nova loves to cook here.',
          translation: 'Evde bir mutfak var. Nova burada yemek yapmayı seviyor.',
          imageUrl: '/story/story-w3-house-tour-p2.jpg',
          audioUrl: '/audio/tts/8e0c2ae2c2110848.mp3',
          highlightWords: ['kitchen', 'cook'],
          interactionType: 'tap-word',
        },
        {
          text: "Nova's room has a bed, a desk, and a window.",
          translation: "Nova'nın odasında bir yatak, bir masa ve bir pencere var.",
          imageUrl: '/story/story-w3-house-tour-p3.jpg',
          audioUrl: '/audio/tts/0f8ad550bed0a21a.mp3',
          highlightWords: ['room', 'bed', 'desk', 'window'],
          interactionType: 'tap-word',
        },
        {
          text: 'At night, Nova looks out the window. She sees the stars.',
          translation: 'Geceleri Nova pencereden dışarı bakar. Yıldızları görür.',
          imageUrl: '/story/story-w3-house-tour-p4.jpg',
          audioUrl: '/audio/tts/b1ee9532b49960b7.mp3',
          highlightWords: ['window', 'stars'],
          interactionType: 'none',
        },
      ],
    },
  },

  // ── W3-2. SCHOOL — Nova's First Day ────────────────────────────────────────
  {
    id: 'story-w3-first-day',
    title: "Nova's First Day at School",
    titleTr: "Nova'nın Okuldaki İlk Günü",
    theme: 'school',
    suggestedAfterUnit: 'w3_u1',
    data: {
      type: 'story-time',
      title: "Nova's First Day at School",
      pages: [
        {
          text: 'Nova goes to school. She carries her book and her pen.',
          translation: 'Nova okula gidiyor. Kitabını ve kalemini taşıyor.',
          imageUrl: '/story/story-w3-first-day-p1.jpg',
          audioUrl: '/audio/tts/93c08674bb6e53eb.mp3',
          highlightWords: ['school', 'book', 'pen'],
          interactionType: 'tap-word',
        },
        {
          text: 'The teacher says: "Good morning! Sit at your desk."',
          translation: 'Öğretmen diyor ki: "Günaydın! Masanıza oturun."',
          imageUrl: '/story/story-w3-first-day-p2.jpg',
          audioUrl: '/audio/tts/8c51596f2f19fcd0.mp3',
          highlightWords: ['teacher', 'desk'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova writes on the board. She writes: I love school!',
          translation: 'Nova tahtaya yazıyor. Şunu yazıyor: I love school!',
          imageUrl: '/story/story-w3-first-day-p3.jpg',
          audioUrl: '/audio/tts/1aba30b066ae80f9.mp3',
          highlightWords: ['board', 'school'],
          interactionType: 'tap-word',
        },
        {
          text: 'After school, Nova goes home. She is happy.',
          translation: 'Okuldan sonra Nova eve gidiyor. Mutlu.',
          imageUrl: '/story/story-w3-first-day-p4.jpg',
          audioUrl: '/audio/tts/431ff7e602c910ba.mp3',
          highlightWords: ['home', 'happy'],
          interactionType: 'none',
        },
      ],
    },
  },

  // ── W3-3. DAILY ROUTINE — My Morning ──────────────────────────────────────
  {
    id: 'story-w3-my-morning',
    title: 'My Busy Morning',
    titleTr: 'Meşgul Sabahım',
    theme: 'daily-routine',
    suggestedAfterUnit: 'w3_u1',
    data: {
      type: 'story-time',
      title: 'My Busy Morning',
      pages: [
        {
          text: 'First, I wake up. I open my eyes and stretch.',
          translation: 'Önce uyanırım. Gözlerimi açar ve uzanırım.',
          imageUrl: '/story/story-w3-my-morning-p1.jpg',
          audioUrl: '/audio/tts/48621fbd8e218aee.mp3',
          highlightWords: ['wake up', 'first'],
          interactionType: 'tap-word',
        },
        {
          text: 'Then, I eat breakfast. I love eating eggs and toast!',
          translation: 'Sonra kahvaltı yaparım. Yumurta ve tost yemeyi seviyorum!',
          imageUrl: '/story/story-w3-my-morning-p2.jpg',
          audioUrl: '/audio/tts/de54a2fed914ab03.mp3',
          highlightWords: ['eat breakfast', 'then'],
          interactionType: 'tap-word',
        },
        {
          text: 'I get dressed and go to school every day.',
          translation: 'Her gün giyinirim ve okula giderim.',
          imageUrl: '/story/story-w3-my-morning-p3.jpg',
          audioUrl: '/audio/tts/604df747cdce2e55.mp3',
          highlightWords: ['every day', 'school'],
          interactionType: 'tap-word',
        },
        {
          text: 'After school, I play. Then, I sleep. What a day!',
          translation: 'Okuldan sonra oynarım. Sonra uyurum. Ne güzel bir gün!',
          imageUrl: '/story/story-w3-my-morning-p4.jpg',
          audioUrl: '/audio/tts/38fa62cd07166c2b.mp3',
          highlightWords: ['play', 'sleep', 'then'],
          interactionType: 'none',
        },
      ],
    },
  },

  // ── W3-4. NATURE — The Rainy Day ──────────────────────────────────────────
  {
    id: 'story-w3-rainy-day',
    title: 'A Rainy Day in the Forest',
    titleTr: 'Ormanda Yağmurlu Bir Gün',
    theme: 'nature',
    suggestedAfterUnit: 'w3_u2',
    data: {
      type: 'story-time',
      title: 'A Rainy Day in the Forest',
      pages: [
        {
          text: 'Rain falls on the trees. The leaves are wet and green.',
          translation: 'Yağmur ağaçların üzerine yağıyor. Yapraklar ıslak ve yeşil.',
          imageUrl: '/story/story-w3-rainy-day-p1.jpg',
          audioUrl: '/audio/tts/8b5e076cc6f40a55.mp3',
          highlightWords: ['rain', 'trees', 'leaves'],
          interactionType: 'tap-word',
        },
        {
          text: 'A frog jumps on a rock near the river.',
          translation: 'Bir kurbağa ırmağın yakınındaki bir kayanın üzerine zıplıyor.',
          imageUrl: '/story/story-w3-rainy-day-p2.jpg',
          audioUrl: '/audio/tts/0b15d90bbf6cc26b.mp3',
          highlightWords: ['frog', 'rock', 'river'],
          interactionType: 'tap-word',
        },
        {
          text: 'A flower grows in the mud after the rain.',
          translation: 'Yağmurdan sonra çamurda bir çiçek yetişiyor.',
          imageUrl: '/story/story-w3-rainy-day-p3.jpg',
          audioUrl: '/audio/tts/e5d326614f0c5776.mp3',
          highlightWords: ['flower', 'mud', 'rain'],
          interactionType: 'tap-word',
        },
        {
          text: 'The sun comes out. The forest smells beautiful.',
          translation: 'Güneş çıkıyor. Orman güzel kokuyor.',
          imageUrl: '/story/story-w3-rainy-day-p4.jpg',
          audioUrl: '/audio/tts/8e325737f9dbe9e1.mp3',
          highlightWords: ['sun', 'forest'],
          interactionType: 'none',
        },
      ],
    },
  },

  // ── W3-5. NATURE — Growing Seeds ──────────────────────────────────────────
  {
    id: 'story-w3-seeds',
    title: 'Nova Plants a Seed',
    titleTr: 'Nova Bir Tohum Ekiyor',
    theme: 'nature',
    suggestedAfterUnit: 'w3_u2',
    data: {
      type: 'story-time',
      title: 'Nova Plants a Seed',
      pages: [
        {
          text: 'Nova has a small seed. She digs a hole in the soil.',
          translation: "Nova'nın küçük bir tohumu var. Toprağa bir delik açıyor.",
          imageUrl: '/story/story-w3-seeds-p1.jpg',
          audioUrl: '/audio/tts/200eef5c70ba3429.mp3',
          highlightWords: ['seed', 'soil'],
          interactionType: 'tap-word',
        },
        {
          text: 'She puts the seed in and covers it with soil.',
          translation: 'Tohumu koyuyor ve toprakla kapatıyor.',
          imageUrl: '/story/story-w3-seeds-p2.jpg',
          audioUrl: '/audio/tts/e62c362dca658a0b.mp3',
          highlightWords: ['seed', 'soil'],
          interactionType: 'tap-word',
        },
        {
          text: 'Every day, Nova gives the plant water and sun.',
          translation: 'Her gün Nova bitkiye su ve güneş veriyor.',
          imageUrl: '/story/story-w3-seeds-p3.jpg',
          audioUrl: '/audio/tts/9cf1f0da640bc28e.mp3',
          highlightWords: ['plant', 'water', 'sun', 'every day'],
          interactionType: 'tap-word',
        },
        {
          text: 'One day, a flower blooms! Nova says: I grew this!',
          translation: 'Bir gün bir çiçek açıyor! Nova diyor ki: Ben yetiştirdim bunu!',
          imageUrl: '/story/story-w3-seeds-p4.jpg',
          audioUrl: '/audio/tts/eb0566bc3e8ec082.mp3',
          highlightWords: ['flower'],
          interactionType: 'none',
        },
      ],
    },
  },

  // ── W3-6. CLOTHES — What Should I Wear? ───────────────────────────────────
  {
    id: 'story-w3-what-to-wear',
    title: 'What Should I Wear?',
    titleTr: 'Ne Giysem?',
    theme: 'clothes',
    suggestedAfterUnit: 'w3_u3',
    data: {
      type: 'story-time',
      title: 'What Should I Wear?',
      pages: [
        {
          text: 'Nova wakes up. It is cold outside! She needs warm clothes.',
          translation: 'Nova uyanıyor. Dışarısı soğuk! Sıcak giysiye ihtiyacı var.',
          imageUrl: '/story/story-w3-what-to-wear-p1.jpg',
          audioUrl: '/audio/tts/f56022d7b35dc353.mp3',
          highlightWords: ['cold', 'clothes'],
          interactionType: 'tap-word',
        },
        {
          text: 'She puts on her blue coat and green boots.',
          translation: 'Mavi paltosunu ve yeşil botlarını giyiyor.',
          imageUrl: '/story/story-w3-what-to-wear-p2.jpg',
          audioUrl: '/audio/tts/b20cc49f3ac33463.mp3',
          highlightWords: ['coat', 'boots'],
          interactionType: 'choose-image',
        },
        {
          text: 'She also wears a red hat and a warm scarf.',
          translation: 'Ayrıca kırmızı bir şapka ve sıcak bir atkı takıyor.',
          imageUrl: '/story/story-w3-what-to-wear-p3.jpg',
          audioUrl: '/audio/tts/aa2689d611baf140.mp3',
          highlightWords: ['hat', 'scarf'],
          interactionType: 'tap-word',
        },
        {
          text: 'Now Nova is ready! She goes outside to play in the snow.',
          translation: 'Şimdi Nova hazır! Karda oynamak için dışarı çıkıyor.',
          imageUrl: '/story/story-w3-what-to-wear-p4.jpg',
          audioUrl: '/audio/tts/af0b458cd39840ab.mp3',
          highlightWords: ['snow', 'play'],
          interactionType: 'none',
        },
      ],
    },
  },

  // ── W3-7. CLOTHES — The Party Outfit ──────────────────────────────────────
  {
    id: 'story-w3-party-outfit',
    title: "Nova's Party Outfit",
    titleTr: "Nova'nın Parti Kıyafeti",
    theme: 'clothes',
    suggestedAfterUnit: 'w3_u3',
    data: {
      type: 'story-time',
      title: "Nova's Party Outfit",
      pages: [
        {
          text: 'Today is a party! Nova wants to wear something special.',
          translation: 'Bugün parti var! Nova özel bir şey giymek istiyor.',
          imageUrl: '/story/story-w3-party-outfit-p1.jpg',
          audioUrl: '/audio/tts/3dd14a6945fdaf4f.mp3',
          highlightWords: ['party', 'wear'],
          interactionType: 'tap-word',
        },
        {
          text: 'She tries on a yellow dress. It is too big!',
          translation: 'Sarı bir elbise deniyor. Çok büyük!',
          imageUrl: '/story/story-w3-party-outfit-p2.jpg',
          audioUrl: '/audio/tts/ee13692685dcd571.mp3',
          highlightWords: ['dress', 'big'],
          interactionType: 'choose-image',
        },
        {
          text: 'She tries on a pink shirt and white trousers. Perfect!',
          translation: 'Pembe bir gömlek ve beyaz pantolon deniyor. Mükemmel!',
          imageUrl: '/story/story-w3-party-outfit-p3.jpg',
          audioUrl: '/audio/tts/bc6941aae2312c07.mp3',
          highlightWords: ['shirt', 'trousers'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova puts on her silver shoes and dances to the party!',
          translation: 'Nova gümüş ayakkabılarını giyiyor ve partiye dans ederek gidiyor!',
          imageUrl: '/story/story-w3-party-outfit-p4.jpg',
          audioUrl: '/audio/tts/b2f80ded79faf6ec.mp3',
          highlightWords: ['shoes', 'dance'],
          interactionType: 'none',
        },
      ],
    },
  },

  // ── W3-8. NATURE EXPLORATION — Forest Adventure ────────────────────────────
  {
    id: 'story-w3-forest-adventure',
    title: 'Forest Adventure',
    titleTr: 'Orman Macerası',
    theme: 'nature-exploration',
    suggestedAfterUnit: 'w3_u4',
    data: {
      type: 'story-time',
      title: 'Forest Adventure',
      pages: [
        {
          text: 'Nova walks into the forest. The trees are tall and the path is narrow.',
          translation: 'Nova ormana giriyor. Ağaçlar uzun ve yol dar.',
          imageUrl: '/story/story-w3-forest-adventure-p1.jpg',
          audioUrl: '/audio/tts/99ad1669c7d2b3ff.mp3',
          highlightWords: ['forest', 'trees', 'path'],
          interactionType: 'tap-word',
        },
        {
          text: 'She sees a butterfly on a leaf. It has orange wings.',
          translation: 'Bir yaprağın üzerinde kelebek görüyor. Turuncu kanatları var.',
          imageUrl: '/story/story-w3-forest-adventure-p2.jpg',
          audioUrl: '/audio/tts/a9ca6e90666c0645.mp3',
          highlightWords: ['butterfly', 'leaf', 'wings'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova hears a bird singing in the tree above.',
          translation: 'Nova yukarısındaki ağaçta bir kuşun şarkı söylediğini duyuyor.',
          imageUrl: '/story/story-w3-forest-adventure-p3.jpg',
          audioUrl: '/audio/tts/17b63c090c01c095.mp3',
          highlightWords: ['bird', 'tree', 'singing'],
          interactionType: 'tap-word',
        },
        {
          text: 'At the end of the path, she finds a hidden waterfall. How wonderful!',
          translation: 'Yolun sonunda gizli bir şelale buluyor. Ne güzel!',
          imageUrl: '/story/story-w3-forest-adventure-p4.jpg',
          audioUrl: '/audio/tts/aaf8529da491aacd.mp3',
          highlightWords: ['waterfall', 'wonderful'],
          interactionType: 'none',
        },
      ],
    },
  },

  // ── W3-9. NATURE EXPLORATION — Seasons ────────────────────────────────────
  {
    id: 'story-w3-four-seasons',
    title: 'The Four Seasons',
    titleTr: 'Dört Mevsim',
    theme: 'nature-exploration',
    suggestedAfterUnit: 'w3_u4',
    data: {
      type: 'story-time',
      title: 'The Four Seasons',
      pages: [
        {
          text: 'In spring, flowers bloom and birds sing. Everything is new!',
          translation: 'İlkbaharda çiçekler açar ve kuşlar şarkı söyler. Her şey yeni!',
          imageUrl: '/story/story-w3-four-seasons-p1.jpg',
          audioUrl: '/audio/tts/8493b602a917405a.mp3',
          highlightWords: ['spring', 'flowers', 'birds'],
          interactionType: 'tap-word',
        },
        {
          text: 'In summer, the sun is hot. We swim and eat ice cream.',
          translation: 'Yazın güneş sıcak. Yüzer ve dondurma yeriz.',
          imageUrl: '/story/story-w3-four-seasons-p2.jpg',
          audioUrl: '/audio/tts/2621ff1c62bc110d.mp3',
          highlightWords: ['summer', 'sun', 'swim'],
          interactionType: 'tap-word',
        },
        {
          text: 'In autumn, leaves turn red, orange, and yellow.',
          translation: 'Sonbaharda yapraklar kırmızı, turuncu ve sarıya döner.',
          imageUrl: '/story/story-w3-four-seasons-p3.jpg',
          audioUrl: '/audio/tts/b00d8b34343aeee6.mp3',
          highlightWords: ['autumn', 'leaves', 'red', 'orange', 'yellow'],
          interactionType: 'choose-image',
        },
        {
          text: 'In winter, it snows. We wear coats and drink hot chocolate.',
          translation: 'Kışın kar yağar. Manto giyeriz ve sıcak çikolata içeriz.',
          imageUrl: '/story/story-w3-four-seasons-p4.jpg',
          audioUrl: '/audio/tts/d921ed2dc0f965af.mp3',
          highlightWords: ['winter', 'snow', 'coats'],
          interactionType: 'tap-word',
        },
      ],
    },
  },

  // ── W3-10. TRANSPORTATION — Getting Around ─────────────────────────────────
  {
    id: 'story-w3-getting-around',
    title: 'Getting Around the City',
    titleTr: 'Şehri Dolaşmak',
    theme: 'transportation',
    suggestedAfterUnit: 'w3_u5',
    data: {
      type: 'story-time',
      title: 'Getting Around the City',
      pages: [
        {
          text: 'Nova lives in a big city. She uses different transport every day.',
          translation: 'Nova büyük bir şehirde yaşıyor. Her gün farklı ulaşım araçları kullanıyor.',
          imageUrl: '/story/story-w3-getting-around-p1.jpg',
          audioUrl: '/audio/tts/a478aa888810f67a.mp3',
          highlightWords: ['city', 'transport'],
          interactionType: 'tap-word',
        },
        {
          text: 'On Monday, she rides the bus to school.',
          translation: 'Pazartesi okula otobüsle gidiyor.',
          imageUrl: '/story/story-w3-getting-around-p2.jpg',
          audioUrl: '/audio/tts/31df5bb22fe75e96.mp3',
          highlightWords: ['bus', 'school'],
          interactionType: 'tap-word',
        },
        {
          text: 'On Saturday, she rides her bicycle to the park.',
          translation: 'Cumartesi parka bisikletiyle gidiyor.',
          imageUrl: '/story/story-w3-getting-around-p3.jpg',
          audioUrl: '/audio/tts/5f5149bb23cee969.mp3',
          highlightWords: ['bicycle', 'park'],
          interactionType: 'choose-image',
        },
        {
          text: 'When it rains, she takes a taxi. Zoom!',
          translation: 'Yağmur yağdığında taksi alıyor. Vıın!',
          imageUrl: '/story/story-w3-getting-around-p4.jpg',
          audioUrl: '/audio/tts/f66f78880a134c53.mp3',
          highlightWords: ['taxi', 'rain'],
          interactionType: 'none',
        },
      ],
    },
  },

  // ── W3-11. TRANSPORTATION — A Train Ride ──────────────────────────────────
  {
    id: 'story-w3-train-ride',
    title: 'The Big Train Adventure',
    titleTr: 'Büyük Tren Macerası',
    theme: 'transportation',
    suggestedAfterUnit: 'w3_u5',
    data: {
      type: 'story-time',
      title: 'The Big Train Adventure',
      pages: [
        {
          text: 'Nova is at the station. She sees a big red train.',
          translation: 'Nova istasyonda. Büyük kırmızı bir tren görüyor.',
          imageUrl: '/story/story-w3-train-ride-p1.jpg',
          audioUrl: '/audio/tts/aa9bfdbf0fc435c7.mp3',
          highlightWords: ['station', 'train'],
          interactionType: 'tap-word',
        },
        {
          text: 'She gets on the train and finds a window seat.',
          translation: 'Trene biniyor ve pencere kenarında yer buluyor.',
          imageUrl: '/story/story-w3-train-ride-p2.jpg',
          audioUrl: '/audio/tts/9fb077f6d71f3937.mp3',
          highlightWords: ['train', 'window', 'seat'],
          interactionType: 'tap-word',
        },
        {
          text: 'The train passes mountains, rivers, and small towns.',
          translation: 'Tren dağlardan, nehirlerden ve küçük kasabalardan geçiyor.',
          imageUrl: '/story/story-w3-train-ride-p3.jpg',
          audioUrl: '/audio/tts/18f21ef1c03b022a.mp3',
          highlightWords: ['mountains', 'rivers'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova arrives at the city. She waves goodbye to the train.',
          translation: 'Nova şehre varıyor. Trene el sallayarak veda ediyor.',
          imageUrl: '/story/story-w3-train-ride-p4.jpg',
          audioUrl: '/audio/tts/53ab0907edcd1cff.mp3',
          highlightWords: ['city', 'goodbye'],
          interactionType: 'none',
        },
      ],
    },
  },

  // ── W3-12. REVIEW — A Wonderful Day (W3 mixed review) ─────────────────────
  {
    id: 'story-w3-wonderful-day',
    title: "Nova's Wonderful Day",
    titleTr: "Nova'nın Harika Günü",
    theme: 'review',
    suggestedAfterUnit: 'w3_u5',
    data: {
      type: 'story-time',
      title: "Nova's Wonderful Day",
      pages: [
        {
          text: 'First, Nova eats breakfast at home. Then she goes to school.',
          translation: 'Önce Nova evde kahvaltı ediyor. Sonra okula gidiyor.',
          imageUrl: '/story/story-w3-wonderful-day-p1.jpg',
          audioUrl: '/audio/tts/bf59c23afa4499d0.mp3',
          highlightWords: ['first', 'then', 'home', 'school'],
          interactionType: 'tap-word',
        },
        {
          text: 'After school, she wears her boots and goes to the forest.',
          translation: 'Okuldan sonra botlarını giyiyor ve ormana gidiyor.',
          imageUrl: '/story/story-w3-wonderful-day-p2.jpg',
          audioUrl: '/audio/tts/92f50697d1624aef.mp3',
          highlightWords: ['boots', 'forest'],
          interactionType: 'tap-word',
        },
        {
          text: 'In the forest, she sees flowers, birds, and a little river.',
          translation: 'Ormanda çiçekler, kuşlar ve küçük bir nehir görüyor.',
          imageUrl: '/story/story-w3-wonderful-day-p3.jpg',
          audioUrl: '/audio/tts/edf4f3719b7b8835.mp3',
          highlightWords: ['flowers', 'birds', 'river'],
          interactionType: 'choose-image',
        },
        {
          text: 'She takes the train home. It was a wonderful day!',
          translation: 'Trenle eve dönüyor. Bu harika bir günmüş!',
          imageUrl: '/story/story-w3-wonderful-day-p4.jpg',
          audioUrl: '/audio/tts/fb0fa242a80ff2da.mp3',
          highlightWords: ['train', 'home', 'wonderful'],
          interactionType: 'none',
        },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WORLD 2 — GRAMMAR CASTLE 🏰
  // ═══════════════════════════════════════════════════════════════════════════

  // ── W2-1. FAMILY — Meet My Family ──────────────────────────────────────────
  {
    id: 'story-w2-meet-my-family',
    title: 'Meet My Family!',
    titleTr: 'Ailemi Tanıyın!',
    theme: 'family',
    suggestedAfterUnit: 'w2_u1',
    data: {
      type: 'story-time',
      title: 'Meet My Family!',
      pages: [
        {
          text: 'Nova has a wonderful family. "This is my mother," she says.',
          translation: 'Nova\'nın harika bir ailesi var. "Bu benim annem," diyor.',
          imageUrl: '/story/story-w2-meet-my-family-p1.jpg',
          audioUrl: '/audio/tts/f938d01801fa4ae7.mp3',
          highlightWords: ['mother', 'family'],
          interactionType: 'tap-word',
        },
        {
          text: 'This is her father. He is tall and kind.',
          translation: 'Bu babası. O uzun boylu ve nazik.',
          imageUrl: '/story/story-w2-meet-my-family-p2.jpg',
          audioUrl: '/audio/tts/1903ce7dfcfb2933.mp3',
          highlightWords: ['father'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova has a sister and a brother. They love to play together.',
          translation:
            "Nova'nın bir kız kardeşi ve bir erkek kardeşi var. Birlikte oynamayı severler.",
          imageUrl: '/story/story-w2-meet-my-family-p3.jpg',
          audioUrl: '/audio/tts/0622120d8f41ad77.mp3',
          highlightWords: ['sister', 'brother'],
          interactionType: 'tap-word',
        },
        {
          text: '"I love my family!" says Nova. Who is in your family?',
          translation: '"Ailemi seviyorum!" diyor Nova. Senin ailende kimler var?',
          imageUrl: '/story/story-w2-meet-my-family-p4.jpg',
          audioUrl: '/audio/tts/8d76da36343d13a6.mp3',
          highlightWords: ['family'],
          interactionType: 'choose-image',
          interactionData: { question: 'Who is Nova talking about?', answer: 'family' },
        },
      ],
    },
  },

  // ── W2-2. GREETINGS — Hello, New Friend! ────────────────────────────────────
  {
    id: 'story-w2-hello-friend',
    title: 'Hello, New Friend!',
    titleTr: 'Merhaba, Yeni Arkadaş!',
    theme: 'greetings',
    suggestedAfterUnit: 'w2_u1',
    data: {
      type: 'story-time',
      title: 'Hello, New Friend!',
      pages: [
        {
          text: 'Nova walks into Grammar Castle. She hears a voice. "Hello!"',
          translation: 'Nova Gramer Kalesi\'ne girer. Bir ses duyar. "Merhaba!"',
          imageUrl: '/story/story-w2-hello-friend-p1.jpg',
          audioUrl: '/audio/tts/df761a1b9fc736ef.mp3',
          highlightWords: ['hello'],
          interactionType: 'none',
        },
        {
          text: 'A little robot waves at her. "Hi! My name is Bolt!"',
          translation: 'Küçük bir robot ona el sallıyor. "Merhaba! Benim adım Bolt!"',
          imageUrl: '/story/story-w2-hello-friend-p2.jpg',
          audioUrl: '/audio/tts/10cbdbc53a00f542.mp3',
          highlightWords: ['name'],
          interactionType: 'tap-word',
        },
        {
          text: '"Hello Bolt! My name is Nova. Nice to meet you!" says Nova.',
          translation: '"Merhaba Bolt! Benim adım Nova. Tanıştığımıza memnun oldum!" diyor Nova.',
          imageUrl: '/story/story-w2-hello-friend-p3.jpg',
          audioUrl: '/audio/tts/0e4b591eeeb2d6d2.mp3',
          highlightWords: ['hello', 'name'],
          interactionType: 'tap-word',
        },
        {
          text: 'They smile and wave. "See you tomorrow!" says Bolt. "Goodbye!"',
          translation: 'Gülümserler ve el sallarlar. "Yarın görüşürüz!" diyor Bolt. "Güle güle!"',
          imageUrl: '/story/story-w2-hello-friend-p4.jpg',
          audioUrl: '/audio/tts/b59ae9e208879ed9.mp3',
          highlightWords: ['goodbye'],
          interactionType: 'none',
        },
      ],
    },
  },

  // ── W2-3. FOOD — Yummy Breakfast ────────────────────────────────────────────
  {
    id: 'story-w2-yummy-breakfast',
    title: 'Yummy Breakfast!',
    titleTr: 'Lezzetli Kahvaltı!',
    theme: 'food',
    suggestedAfterUnit: 'w2_u2',
    data: {
      type: 'story-time',
      title: 'Yummy Breakfast!',
      pages: [
        {
          text: 'Good morning! Nova is hungry. Time for breakfast!',
          translation: 'Günaydın! Nova acıktı. Kahvaltı zamanı!',
          imageUrl: '/story/story-w2-yummy-breakfast-p1.jpg',
          audioUrl: '/audio/tts/1bb36efc9ef33be7.mp3',
          highlightWords: ['breakfast'],
          interactionType: 'none',
        },
        {
          text: 'She has bread, an egg, and some cheese on the table.',
          translation: 'Masada ekmek, yumurta ve biraz peynir var.',
          imageUrl: '/story/story-w2-yummy-breakfast-p2.jpg',
          audioUrl: '/audio/tts/7426b89933c0ad13.mp3',
          highlightWords: ['bread', 'egg', 'cheese'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova drinks her milk. "Mmm! I like milk," she says.',
          translation: 'Nova sütünü içer. "Mmm! Sütü seviyorum," diyor.',
          imageUrl: '/story/story-w2-yummy-breakfast-p3.jpg',
          audioUrl: '/audio/tts/34ade90db46d7b06.mp3',
          highlightWords: ['milk', 'like'],
          interactionType: 'tap-word',
        },
        {
          text: '"What do you eat for breakfast?" Nova asks you with a smile.',
          translation: 'Nova sana gülümseyerek soruyor: "Sen kahvaltıda ne yersin?"',
          imageUrl: '/story/story-w2-yummy-breakfast-p4.jpg',
          audioUrl: '/audio/tts/35dc5b83acdfc596.mp3',
          highlightWords: ['eat', 'breakfast'],
          interactionType: 'choose-image',
          interactionData: { question: 'What did Nova drink?', answer: 'milk' },
        },
      ],
    },
  },

  // ── W2-4. FOOD — At the Market ──────────────────────────────────────────────
  {
    id: 'story-w2-at-the-market',
    title: 'At the Market',
    titleTr: 'Pazarda',
    theme: 'food',
    suggestedAfterUnit: 'w2_u2',
    data: {
      type: 'story-time',
      title: 'At the Market',
      pages: [
        {
          text: 'Nova goes to the market with her mother.',
          translation: 'Nova annesiyle pazara gider.',
          imageUrl: '/story/story-w2-at-the-market-p1.jpg',
          audioUrl: '/audio/tts/bdf23b7f15104b7a.mp3',
          highlightWords: ['market', 'mother'],
          interactionType: 'none',
        },
        {
          text: '"I like apples!" says Nova. She puts them in the basket.',
          translation: '"Elmaları seviyorum!" diyor Nova. Onları sepete koyuyor.',
          imageUrl: '/story/story-w2-at-the-market-p2.jpg',
          audioUrl: '/audio/tts/7351f70567da8eac.mp3',
          highlightWords: ['apple', 'basket'],
          interactionType: 'tap-word',
        },
        {
          text: 'She also gets bananas and some orange juice.',
          translation: 'Ayrıca muz ve portakal suyu da alıyor.',
          imageUrl: '/story/story-w2-at-the-market-p3.jpg',
          audioUrl: '/audio/tts/66285616aee1c442.mp3',
          highlightWords: ['banana', 'orange'],
          interactionType: 'tap-word',
        },
        {
          text: '"Thank you!" says Nova to the shopkeeper. Markets are fun!',
          translation: '"Teşekkür ederim!" diyor Nova satıcıya. Pazarlar eğlenceli!',
          imageUrl: '/story/story-w2-at-the-market-p4.jpg',
          audioUrl: '/audio/tts/ab0bc0fc699d88ed.mp3',
          highlightWords: ['thank you'],
          interactionType: 'none',
        },
      ],
    },
  },

  // ── W2-5. TO BE — Nova Is Happy ─────────────────────────────────────────────
  {
    id: 'story-w2-nova-is-happy',
    title: 'Nova Is Happy!',
    titleTr: 'Nova Mutlu!',
    theme: 'grammar-tobe',
    suggestedAfterUnit: 'w2_u3',
    data: {
      type: 'story-time',
      title: 'Nova Is Happy!',
      pages: [
        {
          text: 'Today Nova is very happy. The sun is bright and warm.',
          translation: 'Bugün Nova çok mutlu. Güneş parlak ve sıcak.',
          imageUrl: '/story/story-w2-nova-is-happy-p1.jpg',
          audioUrl: '/audio/tts/e909607b9ba217c6.mp3',
          highlightWords: ['happy', 'is'],
          interactionType: 'tap-word',
        },
        {
          text: '"I am Nova," she says proudly. "I am seven years old."',
          translation: '"Ben Novayım," diyor gururla. "Ben yedi yaşındayım."',
          imageUrl: '/story/story-w2-nova-is-happy-p2.jpg',
          audioUrl: '/audio/tts/788c2c001fa1b7d8.mp3',
          highlightWords: ['I am'],
          interactionType: 'tap-word',
        },
        {
          text: 'The birds are singing. They are yellow and blue.',
          translation: 'Kuşlar şarkı söylüyor. Onlar sarı ve mavi.',
          interactionType: 'tap-word',
          imageUrl: '/story/story-w2-nova-is-happy-p3.jpg',
          audioUrl: '/audio/tts/b4fc4c2dbe202eab.mp3',
          highlightWords: ['are', 'yellow', 'blue'],
        },
        {
          text: '"You ARE amazing!" says Bolt. "We are best friends!" shouts Nova.',
          translation:
            '"Sen HAİKA bir varlıksın!" diyor Bolt. "Biz en iyi arkadaşlarız!" diye bağırıyor Nova.',
          imageUrl: '/story/story-w2-nova-is-happy-p4.jpg',
          audioUrl: '/audio/tts/4e271c01540c0b1a.mp3',
          highlightWords: ['are', 'friends'],
          interactionType: 'none',
        },
      ],
    },
  },

  // ── W2-6. ACTIONS — Jump and Run! ───────────────────────────────────────────
  {
    id: 'story-w2-jump-and-run',
    title: 'Jump and Run!',
    titleTr: 'Zıpla ve Koş!',
    theme: 'actions',
    suggestedAfterUnit: 'w2_u4',
    data: {
      type: 'story-time',
      title: 'Jump and Run!',
      pages: [
        {
          text: 'Nova goes to the playground. She wants to move and play!',
          translation: 'Nova oyun parkına gider. Hareket etmek ve oynamak istiyor!',
          imageUrl: '/story/story-w2-jump-and-run-p1.jpg',
          audioUrl: '/audio/tts/7d0e461bd029ec12.mp3',
          highlightWords: ['play'],
          interactionType: 'none',
        },
        {
          text: 'She can run fast. She can jump very high.',
          translation: 'O hızlı koşabiliyor. Çok yükseğe zıplayabiliyor.',
          imageUrl: '/story/story-w2-jump-and-run-p2.jpg',
          audioUrl: '/audio/tts/2139256449c240e2.mp3',
          highlightWords: ['run', 'jump'],
          interactionType: 'tap-word',
        },
        {
          text: 'Bolt can skip and spin. They dance and clap their hands.',
          translation: 'Bolt atlayıp dönebiliyor. Dans ediyorlar ve el çırpıyorlar.',
          imageUrl: '/story/story-w2-jump-and-run-p3.jpg',
          audioUrl: '/audio/tts/e038e6ef32d4ee86.mp3',
          highlightWords: ['skip', 'dance', 'clap'],
          interactionType: 'tap-word',
        },
        {
          text: '"Can you jump?" asks Nova. Show me your best jump!',
          translation: '"Zıplayabilir misin?" diye soruyor Nova. Bana en iyi zıplayışını göster!',
          imageUrl: '/story/story-w2-jump-and-run-p4.jpg',
          audioUrl: '/audio/tts/68b3c99e23e3bbab.mp3',
          highlightWords: ['jump'],
          interactionType: 'choose-image',
          interactionData: { question: 'What can Nova do?', answer: 'jump' },
        },
      ],
    },
  },

  // ── W2-7. ADJECTIVES — Big and Small ────────────────────────────────────────
  {
    id: 'story-w2-big-and-small',
    title: 'Big and Small',
    titleTr: 'Büyük ve Küçük',
    theme: 'adjectives',
    suggestedAfterUnit: 'w2_u5',
    data: {
      type: 'story-time',
      title: 'Big and Small',
      pages: [
        {
          text: 'Nova is at the zoo. She sees a big elephant!',
          translation: 'Nova hayvanat bahçesinde. Büyük bir fil görüyor!',
          imageUrl: '/story/story-w2-big-and-small-p1.jpg',
          audioUrl: '/audio/tts/82483e685d589bf8.mp3',
          highlightWords: ['big', 'elephant'],
          interactionType: 'tap-word',
        },
        {
          text: 'Next to it is a small mouse. "Big and small!" she laughs.',
          translation: 'Yanında küçük bir fare var. "Büyük ve küçük!" diye güler.',
          imageUrl: '/story/story-w2-big-and-small-p2.jpg',
          audioUrl: '/audio/tts/55d1b8d08c2da612.mp3',
          highlightWords: ['small', 'mouse'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova finds a tall tree and a short flower in the garden.',
          translation: 'Nova bahçede uzun bir ağaç ve kısa bir çiçek buluyor.',
          imageUrl: '/story/story-w2-big-and-small-p3.jpg',
          audioUrl: '/audio/tts/78abb87b54146cd6.mp3',
          highlightWords: ['tall', 'short', 'tree', 'flower'],
          interactionType: 'tap-word',
        },
        {
          text: '"Everything is different!" says Nova. Big, small, tall or short — all beautiful!',
          translation: '"Her şey farklı!" diyor Nova. Büyük, küçük, uzun ya da kısa — hepsi güzel!',
          imageUrl: '/story/story-w2-big-and-small-p4.jpg',
          audioUrl: '/audio/tts/fbe5edf35231444b.mp3',
          highlightWords: ['big', 'small', 'tall', 'short'],
          interactionType: 'none',
        },
      ],
    },
  },

  // ── W2-8. HELPERS — Please and Thank You ────────────────────────────────────
  {
    id: 'story-w2-please-and-thank-you',
    title: 'Please and Thank You',
    titleTr: 'Lütfen ve Teşekkür Ederim',
    theme: 'helpers',
    suggestedAfterUnit: 'w2_u6',
    data: {
      type: 'story-time',
      title: 'Please and Thank You',
      pages: [
        {
          text: 'Nova is at the Grammar Castle library. She needs a book.',
          translation: 'Nova Gramer Kalesi kütüphanesinde. Bir kitaba ihtiyacı var.',
          imageUrl: '/story/story-w2-please-and-thank-you-p1.jpg',
          audioUrl: '/audio/tts/eae8f34366837846.mp3',
          highlightWords: ['library', 'book'],
          interactionType: 'none',
        },
        {
          text: '"Can I have that book, please?" she asks the librarian politely.',
          translation: '"O kitabı alabilir miyim, lütfen?" diye soruyor kütüphaneciye kibarca.',
          imageUrl: '/story/story-w2-please-and-thank-you-p2.jpg',
          audioUrl: '/audio/tts/09684232d9be92b8.mp3',
          highlightWords: ['please'],
          interactionType: 'tap-word',
        },
        {
          text: '"Of course! Here you go!" says the librarian with a big smile.',
          translation: '"Tabii ki! Buyrun!" diyor kütüphaneci gülümseyerek.',
          imageUrl: '/story/story-w2-please-and-thank-you-p3.jpg',
          audioUrl: '/audio/tts/845f537f167e87d6.mp3',
          highlightWords: ['here you go'],
          interactionType: 'none',
        },
        {
          text: '"Thank you so much!" says Nova. Being polite feels wonderful.',
          translation: '"Çok teşekkür ederim!" diyor Nova. Kibar olmak harika bir his.',
          imageUrl: '/story/story-w2-please-and-thank-you-p4.jpg',
          audioUrl: '/audio/tts/ae98585fdd8a47df.mp3',
          highlightWords: ['thank you'],
          interactionType: 'choose-image',
          interactionData: { question: 'What did Nova say to be polite?', answer: 'please' },
        },
      ],
    },
  },

  // ── W2-9. REVIEW — Castle Party ─────────────────────────────────────────────
  {
    id: 'story-w2-castle-party',
    title: 'Castle Party!',
    titleTr: 'Kale Partisi!',
    theme: 'review',
    suggestedAfterUnit: 'w2_u5',
    data: {
      type: 'story-time',
      title: 'Castle Party!',
      pages: [
        {
          text: 'It is party time at Grammar Castle! Everyone is excited.',
          translation: "Gramer Kalesi'nde parti vakti! Herkes heyecanlı.",
          imageUrl: '/story/story-w2-castle-party-p1.jpg',
          audioUrl: '/audio/tts/4f4a52a5d32eaa27.mp3',
          highlightWords: ['party'],
          interactionType: 'none',
        },
        {
          text: "Nova's family brings food. There is big cake and cold juice.",
          translation: "Nova'nın ailesi yiyecekler getiriyor. Büyük kek ve soğuk meyve suyu var.",
          imageUrl: '/story/story-w2-castle-party-p2.jpg',
          audioUrl: '/audio/tts/25fb5e2d6d7dea47.mp3',
          highlightWords: ['family', 'cake', 'juice', 'big'],
          interactionType: 'tap-word',
        },
        {
          text: '"Hello everyone! I am so happy!" shouts Nova.',
          translation: '"Merhaba herkese! Ben çok mutluyum!" diye bağırıyor Nova.',
          imageUrl: '/story/story-w2-castle-party-p3.jpg',
          audioUrl: '/audio/tts/6882690edd9731a6.mp3',
          highlightWords: ['hello', 'happy', 'I am'],
          interactionType: 'tap-word',
        },
        {
          text: 'The family dances and sings together. What a wonderful day!',
          translation: 'Aile birlikte dans edip şarkı söylüyor. Ne harika bir gün!',
          imageUrl: '/story/story-w2-castle-party-p4.jpg',
          audioUrl: '/audio/tts/cfc621c5a22ed60a.mp3',
          highlightWords: ['wonderful'],
          interactionType: 'none',
        },
      ],
    },
  },

  // ── W2-10. REVIEW — Grammar Champion ────────────────────────────────────────
  {
    id: 'story-w2-grammar-champion',
    title: 'I Am a Grammar Champion!',
    titleTr: 'Ben Bir Gramer Şampiyonuyum!',
    theme: 'review',
    suggestedAfterUnit: 'w2_u6',
    data: {
      type: 'story-time',
      title: 'I Am a Grammar Champion!',
      pages: [
        {
          text: 'Nova has learned so much at Grammar Castle!',
          translation: "Nova Gramer Kalesi'nde çok şey öğrendi!",
          imageUrl: '/story/story-w2-grammar-champion-p1.jpg',
          audioUrl: '/audio/tts/f69123dd65fee541.mp3',
          highlightWords: ['learned'],
          interactionType: 'none',
        },
        {
          text: 'She knows her family: mother, father, sister, brother.',
          translation: 'Ailesini biliyor: anne, baba, kız kardeş, erkek kardeş.',
          imageUrl: '/story/story-w2-grammar-champion-p2.jpg',
          audioUrl: '/audio/tts/6d4fbc0bd61cd180.mp3',
          highlightWords: ['mother', 'father', 'sister', 'brother'],
          interactionType: 'tap-word',
        },
        {
          text: 'She can say "I am", "I like", "I can", "please" and "thank you".',
          translation: '"I am", "I like", "I can", "please" ve "thank you" diyebiliyor.',
          imageUrl: '/story/story-w2-grammar-champion-p3.jpg',
          audioUrl: '/audio/tts/ccdf12364eb97ba7.mp3',
          highlightWords: ['I am', 'I like', 'I can', 'please', 'thank you'],
          interactionType: 'tap-word',
        },
        {
          text: '"I am a Grammar Champion!" says Nova. Are you a champion too?',
          translation: '"Ben bir Gramer Şampiyonuyum!" diyor Nova. Sen de bir şampiyon musun?',
          imageUrl: '/story/story-w2-grammar-champion-p4.jpg',
          audioUrl: '/audio/tts/dbe1c9cef5664794.mp3',
          highlightWords: ['champion'],
          interactionType: 'choose-image',
          interactionData: { question: 'What is Nova now?', answer: 'champion' },
        },
      ],
    },
  },

  // ── W4-1. CITY — Nova Goes to Town ────────────────────────────────────────
  {
    id: 'story-w4-nova-goes-to-town',
    title: 'Nova Goes to Town',
    titleTr: 'Nova Şehre Gidiyor',
    theme: 'city',
    suggestedAfterUnit: 'w4_u1',
    data: {
      type: 'story-time',
      title: 'Nova Goes to Town',
      pages: [
        {
          text: 'Nova walks down the street. She sees a bank, a school, and a park.',
          translation: 'Nova sokakta yürüyor. Bir banka, bir okul ve bir park görüyor.',
          imageUrl: '/story/story-w4-nova-goes-to-town-p1.jpg',
          audioUrl: '/audio/tts/1c5b98696bc753c9.mp3',
          highlightWords: ['street', 'bank', 'school', 'park'],
          interactionType: 'tap-word',
        },
        {
          text: '"Where is the supermarket?" she asks. "Turn left at the corner," says a man.',
          translation: '"Süpermarket nerede?" diye soruyor. "Köşede sola dön," diyor bir adam.',
          imageUrl: '/story/story-w4-nova-goes-to-town-p2.jpg',
          audioUrl: '/audio/tts/a88f20c38aa3e3e0.mp3',
          highlightWords: ['supermarket', 'turn', 'left', 'corner'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova finds the supermarket. It is next to the library.',
          translation: 'Nova süpermarketi buluyor. Kütüphanenin yanında.',
          imageUrl: '/story/story-w4-nova-goes-to-town-p3.jpg',
          audioUrl: '/audio/tts/b87daf2ec4f85842.mp3',
          highlightWords: ['library', 'next to'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova buys apples and goes home. She loves her town!',
          translation: 'Nova elma alıp evine gidiyor. Şehrini çok seviyor!',
          imageUrl: '/story/story-w4-nova-goes-to-town-p4.jpg',
          audioUrl: '/audio/tts/9ff03659bc6fb5ad.mp3',
          highlightWords: ['home', 'town'],
          interactionType: 'none',
        },
      ],
    },
  },

  // ── W4-2. CITY — The Big City Map ───────────────────────────────────────────
  {
    id: 'story-w4-big-city-map',
    title: 'The Big City Map',
    titleTr: 'Büyük Şehir Haritası',
    theme: 'city',
    suggestedAfterUnit: 'w4_u1',
    data: {
      type: 'story-time',
      title: 'The Big City Map',
      pages: [
        {
          text: 'Nova has a city map. She sees the hospital, the police station, and the fire station.',
          translation: "Nova'nın bir şehir haritası var. Hastaneyi, karakolu ve itfaiyeyi görüyor.",
          imageUrl: '/story/story-w4-big-city-map-p1.jpg',
          audioUrl: '/audio/tts/cb2243882bc815db.mp3',
          highlightWords: ['hospital', 'police station', 'fire station'],
          interactionType: 'tap-word',
        },
        {
          text: '"Go straight," reads Nova. "Then turn right at the restaurant."',
          translation: '"Düz git," diye okuyor Nova. "Sonra restoranda sağa dön."',
          imageUrl: '/story/story-w4-big-city-map-p2.jpg',
          audioUrl: '/audio/tts/5300ed7d43f0a7f7.mp3',
          highlightWords: ['straight', 'right', 'restaurant'],
          interactionType: 'tap-word',
        },
        {
          text: 'She walks past the post office. She arrives at the playground!',
          translation: 'Postaneyi geçiyor. Oyun parkına varıyor!',
          imageUrl: '/story/story-w4-big-city-map-p3.jpg',
          audioUrl: '/audio/tts/078b9cae9734496f.mp3',
          highlightWords: ['post office', 'playground'],
          interactionType: 'tap-word',
        },
        {
          text: '"I can read maps!" says Nova proudly. Maps are very useful.',
          translation: '"Harita okuyabiliyorum!" diyor Nova gururla. Haritalar çok işe yarıyor.',
          imageUrl: '/story/story-w4-big-city-map-p4.jpg',
          audioUrl: '/audio/tts/c994bac4bc310a61.mp3',
          highlightWords: ['maps', 'useful'],
          interactionType: 'none',
        },
      ],
    },
  },

  // ── W4-3. TIME — What Time Is It? ───────────────────────────────────────────
  {
    id: 'story-w4-what-time-is-it',
    title: 'What Time Is It?',
    titleTr: 'Saat Kaç?',
    theme: 'time',
    suggestedAfterUnit: 'w4_u2',
    data: {
      type: 'story-time',
      title: 'What Time Is It?',
      pages: [
        {
          text: 'Nova wakes up at seven o\'clock. "Good morning!" she says.',
          translation: 'Nova saat yedide uyanıyor. "Günaydın!" diyor.',
          imageUrl: '/story/story-w4-what-time-is-it-p1.jpg',
          audioUrl: '/audio/tts/dc4d538e81bc704d.mp3',
          highlightWords: ['wakes up', 'seven', "o'clock"],
          interactionType: 'tap-word',
        },
        {
          text: "At half past eight she has breakfast. At nine o'clock she goes to school.",
          translation: 'Sekiz buçukta kahvaltı yapıyor. Dokuzda okula gidiyor.',
          imageUrl: '/story/story-w4-what-time-is-it-p2.jpg',
          audioUrl: '/audio/tts/75e230757ea33f30.mp3',
          highlightWords: ['half past', 'breakfast', 'nine'],
          interactionType: 'tap-word',
        },
        {
          text: '"What time is it now?" asks her friend Leo. "It is quarter past twelve," says Nova.',
          translation:
            '"Şimdi saat kaç?" diye soruyor arkadaşı Leo. "On iki çeyrek geçiyor," diyor Nova.',
          imageUrl: '/story/story-w4-what-time-is-it-p3.jpg',
          audioUrl: '/audio/tts/6659cd8df8867262.mp3',
          highlightWords: ['quarter past', 'twelve'],
          interactionType: 'tap-word',
        },
        {
          text: "At six o'clock Nova goes to bed. She had a wonderful day!",
          translation: 'Saat altıda Nova yatıyor. Harika bir gün geçirdi!',
          imageUrl: '/story/story-w4-what-time-is-it-p4.jpg',
          audioUrl: '/audio/tts/8d7e0add0804911c.mp3',
          highlightWords: ['six', 'bed', 'day'],
          interactionType: 'none',
        },
      ],
    },
  },

  // ── W4-4. TIME — Nova's Busy Day ────────────────────────────────────────────
  {
    id: 'story-w4-novas-busy-day',
    title: "Nova's Busy Day",
    titleTr: "Nova'nın Yoğun Günü",
    theme: 'time',
    suggestedAfterUnit: 'w4_u2',
    data: {
      type: 'story-time',
      title: "Nova's Busy Day",
      pages: [
        {
          text: 'In the morning Nova reads a book. In the afternoon she plays outside.',
          translation: 'Sabah Nova kitap okuyor. Öğleden sonra dışarıda oynuyor.',
          imageUrl: '/story/story-w4-novas-busy-day-p1.jpg',
          audioUrl: '/audio/tts/db1d09e1820e42d5.mp3',
          highlightWords: ['morning', 'afternoon', 'outside'],
          interactionType: 'tap-word',
        },
        {
          text: 'In the evening she draws a picture. At night she looks at the stars.',
          translation: 'Akşam resim çiziyor. Gece yıldızlara bakıyor.',
          imageUrl: '/story/story-w4-novas-busy-day-p2.jpg',
          audioUrl: '/audio/tts/d8ab98c3410fdc4b.mp3',
          highlightWords: ['evening', 'night', 'draws', 'stars'],
          interactionType: 'tap-word',
        },
        {
          text: '"First I do my homework, then I watch TV," says Nova. Order matters!',
          translation: '"Önce ödevimi yapıyorum, sonra TV izliyorum," diyor Nova. Sıra önemli!',
          imageUrl: '/story/story-w4-novas-busy-day-p3.jpg',
          audioUrl: '/audio/tts/99713b49ec05e685.mp3',
          highlightWords: ['first', 'then', 'homework'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova is tired but happy. She had time for everything!',
          translation: 'Nova yorgun ama mutlu. Her şeye zaman buldu!',
          imageUrl: '/story/story-w4-novas-busy-day-p4.jpg',
          audioUrl: '/audio/tts/3030daecd7338199.mp3',
          highlightWords: ['tired', 'happy', 'time'],
          interactionType: 'none',
        },
      ],
    },
  },

  // ── W4-5. JOBS — When I Grow Up ─────────────────────────────────────────────
  {
    id: 'story-w4-when-i-grow-up',
    title: 'When I Grow Up',
    titleTr: 'Büyüyünce',
    theme: 'jobs',
    suggestedAfterUnit: 'w4_u3',
    data: {
      type: 'story-time',
      title: 'When I Grow Up',
      pages: [
        {
          text: 'Nova visits different jobs. First she sees a doctor at the hospital.',
          translation: 'Nova farklı meslekleri ziyaret ediyor. Önce hastanede bir doktor görüyor.',
          imageUrl: '/story/story-w4-when-i-grow-up-p1.jpg',
          audioUrl: '/audio/tts/f7379b68aa8e4ad4.mp3',
          highlightWords: ['doctor', 'hospital'],
          interactionType: 'tap-word',
        },
        {
          text: 'Then she sees a teacher at school. "I teach children," says the teacher.',
          translation:
            'Sonra okulda bir öğretmen görüyor. "Çocuklara öğretiyorum," diyor öğretmen.',
          imageUrl: '/story/story-w4-when-i-grow-up-p2.jpg',
          audioUrl: '/audio/tts/e54de510d3c01d18.mp3',
          highlightWords: ['teacher', 'teach'],
          interactionType: 'tap-word',
        },
        {
          text: 'A chef cooks food at a restaurant. A pilot flies an airplane.',
          translation: 'Bir şef restoranda yemek yapıyor. Bir pilot uçak uçuruyor.',
          imageUrl: '/story/story-w4-when-i-grow-up-p3.jpg',
          audioUrl: '/audio/tts/5ecaab10b65c44ee.mp3',
          highlightWords: ['chef', 'cooks', 'pilot', 'flies'],
          interactionType: 'tap-word',
        },
        {
          text: '"When I grow up, I want to be a pilot!" says Nova. What do you want to be?',
          translation: '"Büyüyünce pilot olmak istiyorum!" diyor Nova. Sen ne olmak istiyorsun?',
          imageUrl: '/story/story-w4-when-i-grow-up-p4.jpg',
          audioUrl: '/audio/tts/62dc38c06c2a918c.mp3',
          highlightWords: ['grow up', 'want to be', 'pilot'],
          interactionType: 'none',
        },
      ],
    },
  },

  // ── W4-6. JOBS — Helpers in Our Town ────────────────────────────────────────
  {
    id: 'story-w4-helpers-in-our-town',
    title: 'Helpers in Our Town',
    titleTr: 'Kasabamızdaki Yardımcılar',
    theme: 'jobs',
    suggestedAfterUnit: 'w4_u3',
    data: {
      type: 'story-time',
      title: 'Helpers in Our Town',
      pages: [
        {
          text: 'The firefighter puts out fires. The police officer keeps people safe.',
          translation: 'İtfaiyeci yangınları söndürüyor. Polis memuru insanları güvende tutuyor.',
          imageUrl: '/story/story-w4-helpers-in-our-town-p1.jpg',
          audioUrl: '/audio/tts/ae3e6ef5e023db7d.mp3',
          highlightWords: ['firefighter', 'fires', 'police officer', 'safe'],
          interactionType: 'tap-word',
        },
        {
          text: 'The baker makes bread every morning. The farmer grows vegetables.',
          translation: 'Fırıncı her sabah ekmek yapıyor. Çiftçi sebze yetiştiriyor.',
          imageUrl: '/story/story-w4-helpers-in-our-town-p2.jpg',
          audioUrl: '/audio/tts/05e4cb92a480fd5a.mp3',
          highlightWords: ['baker', 'bread', 'farmer', 'vegetables'],
          interactionType: 'tap-word',
        },
        {
          text: '"Thank you, helpers!" says Nova. Every job is important in our town.',
          translation: '"Teşekkürler, yardımcılar!" diyor Nova. Kasabamızda her meslek önemli.',
          imageUrl: '/story/story-w4-helpers-in-our-town-p3.jpg',
          audioUrl: '/audio/tts/11fb9fba8d69055a.mp3',
          highlightWords: ['thank you', 'important'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova draws a picture of all the helpers. She puts it on the wall.',
          translation: 'Nova tüm yardımcıların resmini çiziyor. Duvara asıyor.',
          imageUrl: '/story/story-w4-helpers-in-our-town-p4.jpg',
          audioUrl: '/audio/tts/dab78a826c79a13e.mp3',
          highlightWords: ['draws', 'picture', 'wall'],
          interactionType: 'none',
        },
      ],
    },
  },

  // ── W4-7. SPORTS — Game Day! ─────────────────────────────────────────────────
  {
    id: 'story-w4-game-day',
    title: 'Game Day!',
    titleTr: 'Maç Günü!',
    theme: 'sports',
    suggestedAfterUnit: 'w4_u5',
    data: {
      type: 'story-time',
      title: 'Game Day!',
      pages: [
        {
          text: 'It is game day! Nova puts on her football boots and runs to the field.',
          translation: 'Maç günü! Nova kramponlarını giyiyor ve sahaya koşuyor.',
          imageUrl: '/story/story-w4-game-day-p1.jpg',
          audioUrl: '/audio/tts/59c2ec50aceedfb1.mp3',
          highlightWords: ['game', 'football', 'boots', 'field'],
          interactionType: 'tap-word',
        },
        {
          text: 'Her team wears red shirts. The other team wears blue shirts.',
          translation: 'Takımı kırmızı forma giyiyor. Diğer takım mavi forma giyiyor.',
          imageUrl: '/story/story-w4-game-day-p2.jpg',
          audioUrl: '/audio/tts/15e8173a367bbde9.mp3',
          highlightWords: ['team', 'red', 'blue', 'shirts'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova kicks the ball. Goal! The score is one to zero. Her team cheers!',
          translation:
            'Nova topu tekmeliyor. Gol! Skor bir sıfır. Takımı sevinç çığlıkları atıyor!',
          imageUrl: '/story/story-w4-game-day-p3.jpg',
          audioUrl: '/audio/tts/c8c298b6a467fa52.mp3',
          highlightWords: ['kicks', 'goal', 'score', 'cheers'],
          interactionType: 'tap-word',
        },
        {
          text: 'After the game Nova drinks water with her friends. Great game, team!',
          translation: 'Maçtan sonra Nova arkadaşlarıyla su içiyor. Harika maç, takım!',
          imageUrl: '/story/story-w4-game-day-p4.jpg',
          audioUrl: '/audio/tts/d31d1d97960b2572.mp3',
          highlightWords: ['after', 'water', 'friends'],
          interactionType: 'none',
        },
      ],
    },
  },

  // ── W4-8. SPORTS — My Favourite Sport ───────────────────────────────────────
  {
    id: 'story-w4-my-favourite-sport',
    title: 'My Favourite Sport',
    titleTr: 'En Sevdiğim Spor',
    theme: 'sports',
    suggestedAfterUnit: 'w4_u5',
    data: {
      type: 'story-time',
      title: 'My Favourite Sport',
      pages: [
        {
          text: 'Leo likes swimming. He goes to the pool every Saturday.',
          translation: 'Leo yüzmeyi seviyor. Her cumartesi havuza gidiyor.',
          imageUrl: '/story/story-w4-my-favourite-sport-p1.jpg',
          audioUrl: '/audio/tts/55c4539aa9c0d504.mp3',
          highlightWords: ['swimming', 'pool', 'Saturday'],
          interactionType: 'tap-word',
        },
        {
          text: 'Mia loves gymnastics. She can do cartwheels and backflips!',
          translation: 'Mia cimnastiği seviyor. Takla ve arka takla yapabiliyor!',
          imageUrl: '/story/story-w4-my-favourite-sport-p2.jpg',
          audioUrl: '/audio/tts/bf5832e6cd2d0d0f.mp3',
          highlightWords: ['gymnastics', 'cartwheels'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova prefers basketball. "I am good at shooting hoops," she says.',
          translation: 'Nova basketbolu tercih ediyor. "Potaya atmakta iyiyim," diyor.',
          imageUrl: '/story/story-w4-my-favourite-sport-p3.jpg',
          audioUrl: '/audio/tts/dca741a59d3e4734.mp3',
          highlightWords: ['basketball', 'shooting', 'hoops'],
          interactionType: 'tap-word',
        },
        {
          text: 'Every sport is fun. What is your favourite sport?',
          translation: 'Her spor eğlenceli. En sevdiğin spor ne?',
          imageUrl: '/story/story-w4-my-favourite-sport-p4.jpg',
          audioUrl: '/audio/tts/10a1d70d408cf0cf.mp3',
          highlightWords: ['favourite', 'sport'],
          interactionType: 'none',
        },
      ],
    },
  },

  // ── W4-9. REVIEW — Adventure in the City ───────────────────────────────────
  {
    id: 'story-w4-adventure-in-the-city',
    title: 'Adventure in the City',
    titleTr: 'Şehirde Macera',
    theme: 'review',
    suggestedAfterUnit: 'w4_u5',
    data: {
      type: 'story-time',
      title: 'Adventure in the City',
      pages: [
        {
          text: "It is ten o'clock. Nova and Leo explore the city together.",
          translation: 'Saat on. Nova ve Leo birlikte şehri keşfediyor.',
          imageUrl: '/story/story-w4-adventure-in-the-city-p1.jpg',
          audioUrl: '/audio/tts/20de844643779ca2.mp3',
          highlightWords: ["ten o'clock", 'explore', 'city'],
          interactionType: 'tap-word',
        },
        {
          text: 'They meet a firefighter near the fire station. "I love my job!" he says.',
          translation:
            'İtfaiyenin yanında bir itfaiyeciyle karşılaşıyorlar. "İşimi seviyorum!" diyor.',
          imageUrl: '/story/story-w4-adventure-in-the-city-p2.jpg',
          audioUrl: '/audio/tts/d1621bb8810f4f7c.mp3',
          highlightWords: ['firefighter', 'fire station', 'job'],
          interactionType: 'tap-word',
        },
        {
          text: 'At noon they play basketball in the park. Leo scores three goals!',
          translation: 'Öğle vakti parkta basketbol oynuyorlar. Leo üç gol atıyor!',
          imageUrl: '/story/story-w4-adventure-in-the-city-p3.jpg',
          audioUrl: '/audio/tts/b384e97b3c952102.mp3',
          highlightWords: ['noon', 'basketball', 'park', 'scores'],
          interactionType: 'tap-word',
        },
        {
          text: 'At five o\'clock they go home. "Best day ever!" says Nova.',
          translation: 'Saat beşte eve gidiyorlar. "En iyi gün!" diyor Nova.',
          imageUrl: '/story/story-w4-adventure-in-the-city-p4.jpg',
          audioUrl: '/audio/tts/b314ca36e120f5fd.mp3',
          highlightWords: ["five o'clock", 'home', 'best'],
          interactionType: 'none',
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // WORLD 5 — Bilim Adası (Science Island)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'story-w5-nova-in-the-lab',
    title: 'Nova in the Lab',
    titleTr: 'Nova Laboratuvarda',
    theme: 'science',
    suggestedAfterUnit: 'unit-w5-science-tools',
    data: {
      type: 'story-time',
      title: 'Nova in the Lab',
      pages: [
        {
          text: 'Nova enters the science lab. "Let\'s do an experiment!" she says.',
          translation: 'Nova bilim laboratuvarına giriyor. "Bir deney yapalım!" diyor.',
          imageUrl: '/story/story-w5-nova-in-the-lab-p1.jpg',
          audioUrl: '/audio/tts/7645207bfcb86f72.mp3',
          highlightWords: ['science', 'lab', 'experiment'],
          interactionType: 'tap-word',
        },
        {
          text: 'She puts on her white coat and safety goggles.',
          translation: 'Beyaz önlüğünü ve koruyucu gözlüklerini takıyor.',
          imageUrl: '/story/story-w5-nova-in-the-lab-p2.jpg',
          audioUrl: '/audio/tts/88703680e3a55624.mp3',
          highlightWords: ['coat', 'goggles', 'safety'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova mixes red liquid and blue liquid. They turn green!',
          translation: 'Nova kırmızı sıvı ile mavi sıvıyı karıştırıyor. Yeşile dönüşüyorlar!',
          imageUrl: '/story/story-w5-nova-in-the-lab-p3.jpg',
          audioUrl: '/audio/tts/0fda549a1d18ee20.mp3',
          highlightWords: ['mixes', 'liquid', 'green'],
          interactionType: 'tap-word',
        },
        {
          text: '"I love science!" says Nova. She writes the result in her notebook.',
          translation: '"Bilimi seviyorum!" diyor Nova. Sonucu defterine yazıyor.',
          imageUrl: '/story/story-w5-nova-in-the-lab-p4.jpg',
          audioUrl: '/audio/tts/8405b82c43deee87.mp3',
          highlightWords: ['love', 'result', 'notebook'],
          interactionType: 'none',
        },
      ],
    },
  },
  {
    id: 'story-w5-the-robot-helper',
    title: 'The Robot Helper',
    titleTr: 'Robot Yardımcı',
    theme: 'robots',
    suggestedAfterUnit: 'unit-w5-technology',
    data: {
      type: 'story-time',
      title: 'The Robot Helper',
      pages: [
        {
          text: 'Nova builds a small robot. It has two eyes and four wheels.',
          translation: 'Nova küçük bir robot inşa ediyor. İki gözü ve dört tekerleği var.',
          imageUrl: '/story/story-w5-the-robot-helper-p1.jpg',
          audioUrl: '/audio/tts/a04cacdb89aaf17d.mp3',
          highlightWords: ['robot', 'eyes', 'wheels'],
          interactionType: 'tap-word',
        },
        {
          text: 'The robot can pick up blocks. It carries them to the shelf.',
          translation: 'Robot blokları kaldırabiliyor. Onları rafa taşıyor.',
          imageUrl: '/story/story-w5-the-robot-helper-p2.jpg',
          audioUrl: '/audio/tts/0619b22dae99b53f.mp3',
          highlightWords: ['pick up', 'blocks', 'shelf'],
          interactionType: 'tap-word',
        },
        {
          text: '"Good job, robot!" says Nova. The robot beeps happily.',
          translation: '"Aferin robot!" diyor Nova. Robot mutlu bir şekilde bip sesi çıkarıyor.',
          imageUrl: '/story/story-w5-the-robot-helper-p3.jpg',
          audioUrl: '/audio/tts/dcdc15ccb810e3b5.mp3',
          highlightWords: ['good job', 'beeps', 'happily'],
          interactionType: 'none',
        },
      ],
    },
  },
  {
    id: 'story-w5-how-plants-grow',
    title: 'How Plants Grow',
    titleTr: 'Bitkiler Nasıl Büyür',
    theme: 'nature',
    suggestedAfterUnit: 'unit-w5-living-things',
    data: {
      type: 'story-time',
      title: 'How Plants Grow',
      pages: [
        {
          text: 'Nova plants a tiny seed in the soil.',
          translation: 'Nova toprağa küçük bir tohum ekiyor.',
          imageUrl: '/story/story-w5-how-plants-grow-p1.jpg',
          audioUrl: '/audio/tts/4b0e330b18b63f7b.mp3',
          highlightWords: ['plants', 'seed', 'soil'],
          interactionType: 'tap-word',
        },
        {
          text: 'Every day she gives it water and sunlight.',
          translation: 'Her gün ona su ve güneş ışığı veriyor.',
          imageUrl: '/story/story-w5-how-plants-grow-p2.jpg',
          audioUrl: '/audio/tts/f0baa88b82b1e6e0.mp3',
          highlightWords: ['water', 'sunlight', 'every day'],
          interactionType: 'tap-word',
        },
        {
          text: 'One week later a green shoot appears!',
          translation: 'Bir hafta sonra yeşil bir filiz çıkıyor!',
          imageUrl: '/story/story-w5-how-plants-grow-p3.jpg',
          audioUrl: '/audio/tts/db5ad551aee81f92.mp3',
          highlightWords: ['week', 'green', 'shoot'],
          interactionType: 'tap-word',
        },
        {
          text: '"It grew!" cheers Nova. "Water plus sunlight equals life!"',
          translation: '"Büyüdü!" diye sevinç çığlığı atıyor Nova. "Su artı güneş eşittir hayat!"',
          imageUrl: '/story/story-w5-how-plants-grow-p4.jpg',
          audioUrl: '/audio/tts/cabd8d6fde3683ea.mp3',
          highlightWords: ['grew', 'plus', 'equals'],
          interactionType: 'none',
        },
      ],
    },
  },
  {
    id: 'story-w5-the-weather-chart',
    title: 'The Weather Chart',
    titleTr: 'Hava Durumu Grafiği',
    theme: 'weather',
    suggestedAfterUnit: 'unit-w5-weather-science',
    data: {
      type: 'story-time',
      title: 'The Weather Chart',
      pages: [
        {
          text: 'Nova keeps a weather chart every day. She draws the sun, clouds, or rain.',
          translation:
            'Nova her gün bir hava durumu grafiği tutuyor. Güneş, bulut ya da yağmur çiziyor.',
          imageUrl: '/story/story-w5-the-weather-chart-p1.jpg',
          audioUrl: '/audio/tts/4d86254c79fe6890.mp3',
          highlightWords: ['weather', 'chart', 'clouds'],
          interactionType: 'tap-word',
        },
        {
          text: 'Monday is sunny. Tuesday is cloudy. Wednesday is rainy.',
          translation: 'Pazartesi güneşli. Salı bulutlu. Çarşamba yağmurlu.',
          imageUrl: '/story/story-w5-the-weather-chart-p2.jpg',
          audioUrl: '/audio/tts/08548525fd1d8cac.mp3',
          highlightWords: ['sunny', 'cloudy', 'rainy'],
          interactionType: 'tap-word',
        },
        {
          text: '"I see a pattern," says Nova. "Rain comes after clouds."',
          translation: '"Bir örüntü görüyorum," diyor Nova. "Yağmur, bulutlardan sonra geliyor."',
          imageUrl: '/story/story-w5-the-weather-chart-p3.jpg',
          audioUrl: '/audio/tts/db3390cf991c3874.mp3',
          highlightWords: ['pattern', 'rain', 'after'],
          interactionType: 'none',
        },
      ],
    },
  },
  {
    id: 'story-w5-space-explorer',
    title: 'Space Explorer',
    titleTr: 'Uzay Kaşifi',
    theme: 'space',
    suggestedAfterUnit: 'unit-w5-earth-and-space',
    data: {
      type: 'story-time',
      title: 'Space Explorer',
      pages: [
        {
          text: 'Nova looks through her telescope at night.',
          translation: 'Nova gece teleskobuna bakıyor.',
          imageUrl: '/story/story-w5-space-explorer-p1.jpg',
          audioUrl: '/audio/tts/d4cf43f9355055ea.mp3',
          highlightWords: ['telescope', 'night'],
          interactionType: 'tap-word',
        },
        {
          text: 'She can see the moon, stars, and a red planet.',
          translation: "Ay'ı, yıldızları ve kırmızı bir gezegeni görebiliyor.",
          imageUrl: '/story/story-w5-space-explorer-p2.jpg',
          audioUrl: '/audio/tts/71697af3dcbcf11c.mp3',
          highlightWords: ['moon', 'stars', 'planet'],
          interactionType: 'tap-word',
        },
        {
          text: '"That red planet is Mars!" says Nova. "One day I will visit it!"',
          translation: '"O kırmızı gezegen Mars!" diyor Nova. "Bir gün onu ziyaret edeceğim!"',
          imageUrl: '/story/story-w5-space-explorer-p3.jpg',
          audioUrl: '/audio/tts/b83947dc7deb2b0c.mp3',
          highlightWords: ['Mars', 'visit'],
          interactionType: 'none',
        },
      ],
    },
  },
  {
    id: 'story-w5-the-magnet-mystery',
    title: 'The Magnet Mystery',
    titleTr: 'Mıknatıs Gizemi',
    theme: 'science',
    suggestedAfterUnit: 'unit-w5-forces',
    data: {
      type: 'story-time',
      title: 'The Magnet Mystery',
      pages: [
        {
          text: 'Nova finds a magnet in the lab. She tests it on different objects.',
          translation:
            'Nova laboratuvarda bir mıknatıs buluyor. Farklı nesneler üzerinde test ediyor.',
          imageUrl: '/story/story-w5-the-magnet-mystery-p1.jpg',
          audioUrl: '/audio/tts/ef1c3949b9cdd4da.mp3',
          highlightWords: ['magnet', 'tests', 'objects'],
          interactionType: 'tap-word',
        },
        {
          text: 'The magnet sticks to the metal spoon but not to the plastic cup.',
          translation: 'Mıknatıs metal kaşığa yapışıyor ama plastik bardağa yapışmıyor.',
          imageUrl: '/story/story-w5-the-magnet-mystery-p2.jpg',
          audioUrl: '/audio/tts/c1a47fcb6c40185a.mp3',
          highlightWords: ['metal', 'plastic', 'sticks'],
          interactionType: 'tap-word',
        },
        {
          text: '"Metal is magnetic and plastic is not!" Nova writes it down.',
          translation: '"Metal manyetik, plastik değil!" Nova bunu not ediyor.',
          imageUrl: '/story/story-w5-the-magnet-mystery-p3.jpg',
          audioUrl: '/audio/tts/5e5300d4ccc4199f.mp3',
          highlightWords: ['magnetic', 'not'],
          interactionType: 'none',
        },
      ],
    },
  },
  {
    id: 'story-w5-the-water-cycle',
    title: 'The Water Cycle',
    titleTr: 'Su Döngüsü',
    theme: 'nature',
    suggestedAfterUnit: 'unit-w5-earth-science',
    data: {
      type: 'story-time',
      title: 'The Water Cycle',
      pages: [
        {
          text: 'The sun heats the ocean. Water rises up as steam.',
          translation: 'Güneş okyanusu ısıtıyor. Su buhar olarak yükseliyor.',
          imageUrl: '/story/story-w5-the-water-cycle-p1.jpg',
          audioUrl: '/audio/tts/32eb9fd3818782e5.mp3',
          highlightWords: ['heats', 'ocean', 'steam'],
          interactionType: 'tap-word',
        },
        {
          text: 'The steam forms clouds high in the sky.',
          translation: 'Buhar gökyüzünde yüksekte bulutlar oluşturuyor.',
          imageUrl: '/story/story-w5-the-water-cycle-p2.jpg',
          audioUrl: '/audio/tts/9a0beca7bc0535b4.mp3',
          highlightWords: ['forms', 'clouds', 'sky'],
          interactionType: 'tap-word',
        },
        {
          text: 'The clouds bring rain. The rain fills rivers and lakes.',
          translation: 'Bulutlar yağmur getiriyor. Yağmur nehirleri ve gölleri dolduruyor.',
          imageUrl: '/story/story-w5-the-water-cycle-p3.jpg',
          audioUrl: '/audio/tts/cc05e2bd315871c0.mp3',
          highlightWords: ['rain', 'rivers', 'lakes'],
          interactionType: 'none',
        },
      ],
    },
  },
  {
    id: 'story-w5-code-with-nova',
    title: 'Code with Nova',
    titleTr: 'Nova ile Kodla',
    theme: 'technology',
    suggestedAfterUnit: 'unit-w5-coding-basics',
    data: {
      type: 'story-time',
      title: 'Code with Nova',
      pages: [
        {
          text: 'Nova opens her computer. She wants to make a game.',
          translation: 'Nova bilgisayarını açıyor. Bir oyun yapmak istiyor.',
          imageUrl: '/story/story-w5-code-with-nova-p1.jpg',
          audioUrl: '/audio/tts/1fdb85bc3b3590a8.mp3',
          highlightWords: ['computer', 'game'],
          interactionType: 'tap-word',
        },
        {
          text: 'She types: "Move right. Jump. Stop." The character follows every step.',
          translation: 'Yazıyor: "Sağa git. Zıpla. Dur." Karakter her adımı takip ediyor.',
          imageUrl: '/story/story-w5-code-with-nova-p2.jpg',
          audioUrl: '/audio/tts/ea4f23a3932e2cff.mp3',
          highlightWords: ['move', 'jump', 'stop', 'step'],
          interactionType: 'tap-word',
        },
        {
          text: '"Code is like giving instructions," smiles Nova. "Computers always listen!"',
          translation:
            '"Kod talimat vermek gibi," gülümsüyor Nova. "Bilgisayarlar her zaman dinler!"',
          imageUrl: '/story/story-w5-code-with-nova-p3.jpg',
          audioUrl: '/audio/tts/d98a2d0547445df8.mp3',
          highlightWords: ['instructions', 'computers'],
          interactionType: 'none',
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // WORLD 6 — Macera Galaksisi (Adventure Galaxy)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'story-w6-journey-to-the-stars',
    title: 'Journey to the Stars',
    titleTr: 'Yıldızlara Yolculuk',
    theme: 'space',
    suggestedAfterUnit: 'unit-w6-galaxy-explorer',
    data: {
      type: 'story-time',
      title: 'Journey to the Stars',
      pages: [
        {
          text: 'Nova boards her spacecraft. The countdown begins: ten, nine, eight...',
          translation: 'Nova uzay aracına biniyor. Geri sayım başlıyor: on, dokuz, sekiz...',
          imageUrl: '/story/story-w6-journey-to-the-stars-p1.jpg',
          audioUrl: '/audio/tts/7e707fc4bf523bf6.mp3',
          highlightWords: ['spacecraft', 'countdown', 'begins'],
          interactionType: 'tap-word',
        },
        {
          text: 'Blast off! Nova flies through stars and galaxies.',
          translation: 'Kalkış! Nova yıldızlar ve galaksiler arasında uçuyor.',
          imageUrl: '/story/story-w6-journey-to-the-stars-p2.jpg',
          audioUrl: '/audio/tts/2a5208e4a5027baf.mp3',
          highlightWords: ['blast off', 'flies', 'galaxies'],
          interactionType: 'tap-word',
        },
        {
          text: 'She lands on a purple moon. The ground feels soft like cotton.',
          translation: 'Mor bir aya iniyor. Zemin pamuk gibi yumuşak hissettiriyor.',
          imageUrl: '/story/story-w6-journey-to-the-stars-p3.jpg',
          audioUrl: '/audio/tts/5116469ca3e97c10.mp3',
          highlightWords: ['lands', 'purple', 'cotton', 'soft'],
          interactionType: 'tap-word',
        },
        {
          text: '"The universe is so big!" whispers Nova. "And we are part of it."',
          translation: '"Evren çok büyük!" diye fısıldıyor Nova. "Ve biz onun bir parçasıyız."',
          imageUrl: '/story/story-w6-journey-to-the-stars-p4.jpg',
          audioUrl: '/audio/tts/a4c0210d87527fb8.mp3',
          highlightWords: ['universe', 'big', 'part'],
          interactionType: 'none',
        },
      ],
    },
  },
  {
    id: 'story-w6-the-alien-friend',
    title: 'The Alien Friend',
    titleTr: 'Uzaylı Arkadaş',
    theme: 'adventure',
    suggestedAfterUnit: 'unit-w6-first-contact',
    data: {
      type: 'story-time',
      title: 'The Alien Friend',
      pages: [
        {
          text: 'On the moon Nova meets a small green alien named Zib.',
          translation: 'Ayda Nova, Zib adlı küçük yeşil bir uzaylıyla tanışıyor.',
          imageUrl: '/story/story-w6-the-alien-friend-p1.jpg',
          audioUrl: '/audio/tts/a02a4b3574b33b1a.mp3',
          highlightWords: ['alien', 'green', 'moon'],
          interactionType: 'tap-word',
        },
        {
          text: 'Zib speaks a different language. Nova draws pictures to communicate.',
          translation: 'Zib farklı bir dil konuşuyor. Nova iletişim kurmak için resimler çiziyor.',
          imageUrl: '/story/story-w6-the-alien-friend-p2.jpg',
          audioUrl: '/audio/tts/6a01e7fae78fd3b5.mp3',
          highlightWords: ['language', 'pictures', 'communicate'],
          interactionType: 'tap-word',
        },
        {
          text: 'They draw the sun, stars, and friendship bracelets.',
          translation: 'Güneşi, yıldızları ve dostluk bilekliklerini çiziyorlar.',
          imageUrl: '/story/story-w6-the-alien-friend-p3.jpg',
          audioUrl: '/audio/tts/9071d4606e81d433.mp3',
          highlightWords: ['friendship', 'bracelets'],
          interactionType: 'none',
        },
      ],
    },
  },
  {
    id: 'story-w6-gravity-game',
    title: 'The Gravity Game',
    titleTr: 'Yerçekimi Oyunu',
    theme: 'science',
    suggestedAfterUnit: 'unit-w6-forces-in-space',
    data: {
      type: 'story-time',
      title: 'The Gravity Game',
      pages: [
        {
          text: 'Inside the spacecraft there is no gravity. Everything floats!',
          translation: 'Uzay aracının içinde yerçekimi yok. Her şey uçuşuyor!',
          imageUrl: '/story/story-w6-gravity-game-p1.jpg',
          audioUrl: '/audio/tts/bda64bc574ee8da0.mp3',
          highlightWords: ['gravity', 'floats'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova throws a ball. It drifts slowly across the room.',
          translation: 'Nova bir top fırlatıyor. Top odada yavaşça sürükleniyor.',
          imageUrl: '/story/story-w6-gravity-game-p2.jpg',
          audioUrl: '/audio/tts/0e28b0e471083d89.mp3',
          highlightWords: ['throws', 'ball', 'drifts'],
          interactionType: 'tap-word',
        },
        {
          text: '"On Earth gravity pulls things down," says Nova. "Here we are free!"',
          translation: '"Dünya\'da yerçekimi şeyleri aşağı çeker," diyor Nova. "Burada özgürüz!"',
          imageUrl: '/story/story-w6-gravity-game-p3.jpg',
          audioUrl: '/audio/tts/21b6925354b22297.mp3',
          highlightWords: ['Earth', 'pulls', 'free'],
          interactionType: 'none',
        },
      ],
    },
  },
  {
    id: 'story-w6-satellite-mission',
    title: 'Satellite Mission',
    titleTr: 'Uydu Görevi',
    theme: 'technology',
    suggestedAfterUnit: 'unit-w6-communication',
    data: {
      type: 'story-time',
      title: 'Satellite Mission',
      pages: [
        {
          text: 'Nova launches a satellite into orbit around the Earth.',
          translation: 'Nova Dünya etrafındaki yörüngeye bir uydu fırlatıyor.',
          imageUrl: '/story/story-w6-satellite-mission-p1.jpg',
          audioUrl: '/audio/tts/6d30ad4932d0a23e.mp3',
          highlightWords: ['satellite', 'orbit', 'Earth'],
          interactionType: 'tap-word',
        },
        {
          text: 'The satellite takes photos and sends signals back to screen.',
          translation: 'Uydu fotoğraf çekiyor ve ekrana sinyaller gönderiyor.',
          imageUrl: '/story/story-w6-satellite-mission-p2.jpg',
          audioUrl: '/audio/tts/e2f234b37f7d36d8.mp3',
          highlightWords: ['photos', 'signals', 'screen'],
          interactionType: 'tap-word',
        },
        {
          text: '"Satellites help us see weather, maps, and talk to each other," explains Nova.',
          translation:
            '"Uydular hava durumunu, haritaları görmemize ve birbirimizle konuşmamıza yardım eder," diye açıklıyor Nova.',
          imageUrl: '/story/story-w6-satellite-mission-p3.jpg',
          audioUrl: '/audio/tts/a63937b7b3a022f0.mp3',
          highlightWords: ['weather', 'maps', 'talk'],
          interactionType: 'none',
        },
      ],
    },
  },
  {
    id: 'story-w6-the-black-hole',
    title: 'The Black Hole',
    titleTr: 'Kara Delik',
    theme: 'space',
    suggestedAfterUnit: 'unit-w6-deep-space',
    data: {
      type: 'story-time',
      title: 'The Black Hole',
      pages: [
        {
          text: 'Nova watches a black hole through a special telescope.',
          translation: 'Nova özel bir teleskopla kara deliği izliyor.',
          imageUrl: '/story/story-w6-the-black-hole-p1.jpg',
          audioUrl: '/audio/tts/d722f3c60ff01b38.mp3',
          highlightWords: ['black hole', 'telescope', 'special'],
          interactionType: 'tap-word',
        },
        {
          text: 'A black hole is so heavy that even light cannot escape it.',
          translation: 'Kara delik o kadar ağır ki ışık bile ondan kaçamıyor.',
          imageUrl: '/story/story-w6-the-black-hole-p2.jpg',
          audioUrl: '/audio/tts/d9340fa86843bc54.mp3',
          highlightWords: ['heavy', 'light', 'escape'],
          interactionType: 'tap-word',
        },
        {
          text: '"The universe is full of mysteries," says Nova. "That\'s why I love science!"',
          translation: '"Evren gizemlerle dolu," diyor Nova. "Bu yüzden bilimi seviyorum!"',
          imageUrl: '/story/story-w6-the-black-hole-p3.jpg',
          audioUrl: '/audio/tts/569ed17eae1380f8.mp3',
          highlightWords: ['mysteries', 'universe'],
          interactionType: 'none',
        },
      ],
    },
  },
  {
    id: 'story-w6-design-a-planet',
    title: 'Design a Planet',
    titleTr: 'Bir Gezegen Tasarla',
    theme: 'adventure',
    suggestedAfterUnit: 'unit-w6-creative-science',
    data: {
      type: 'story-time',
      title: 'Design a Planet',
      pages: [
        {
          text: 'Nova gets to design her own planet!',
          translation: 'Nova kendi gezegenini tasarlayabilecek!',
          imageUrl: '/story/story-w6-design-a-planet-p1.jpg',
          audioUrl: '/audio/tts/584272111c5b9c06.mp3',
          highlightWords: ['design', 'planet'],
          interactionType: 'tap-word',
        },
        {
          text: 'She chooses two moons, bright blue oceans, and purple mountains.',
          translation: 'İki ay, parlak mavi okyanuslar ve mor dağlar seçiyor.',
          imageUrl: '/story/story-w6-design-a-planet-p2.jpg',
          audioUrl: '/audio/tts/42798936890cdf14.mp3',
          highlightWords: ['moons', 'oceans', 'mountains'],
          interactionType: 'tap-word',
        },
        {
          text: '"My planet is called Nova-Prime!" she announces proudly.',
          translation: '"Benim gezegenimi adı Nova-Prime!" diye gururla duyuruyor.',
          imageUrl: '/story/story-w6-design-a-planet-p3.jpg',
          audioUrl: '/audio/tts/bd81cbe6b59bc444.mp3',
          highlightWords: ['called', 'announces', 'proudly'],
          interactionType: 'none',
        },
      ],
    },
  },
  {
    id: 'story-w6-time-traveller',
    title: 'The Time Traveller',
    titleTr: 'Zaman Yolcusu',
    theme: 'adventure',
    suggestedAfterUnit: 'unit-w6-advanced-concepts',
    data: {
      type: 'story-time',
      title: 'The Time Traveller',
      pages: [
        {
          text: 'Nova discovers a mysterious machine that can travel through time.',
          translation: 'Nova zamanda yolculuk yapabilen gizemli bir makine keşfediyor.',
          imageUrl: '/story/story-w6-time-traveller-p1.jpg',
          audioUrl: '/audio/tts/33ab5a97d8310787.mp3',
          highlightWords: ['discovers', 'mysterious', 'machine', 'time'],
          interactionType: 'tap-word',
        },
        {
          text: 'She travels to the past and sees dinosaurs eating leaves.',
          translation: 'Geçmişe yolculuk yapıyor ve yaprak yiyen dinozorları görüyor.',
          imageUrl: '/story/story-w6-time-traveller-p2.jpg',
          audioUrl: '/audio/tts/16d41a0eef211f96.mp3',
          highlightWords: ['past', 'dinosaurs', 'leaves'],
          interactionType: 'tap-word',
        },
        {
          text: 'She travels to the future and sees flying cars and tall crystal towers.',
          translation:
            'Geleceğe yolculuk yapıyor ve uçan arabalar ile uzun kristal kuleler görüyor.',
          imageUrl: '/story/story-w6-time-traveller-p3.jpg',
          audioUrl: '/audio/tts/d6160da485f2c7f0.mp3',
          highlightWords: ['future', 'flying', 'crystal'],
          interactionType: 'tap-word',
        },
        {
          text: '"Home is the best time!" decides Nova. She returns to today.',
          translation: '"Ev en iyi zaman!" diye karar veriyor Nova. Bugüne geri dönüyor.',
          imageUrl: '/story/story-w6-time-traveller-p4.jpg',
          audioUrl: '/audio/tts/424f18b7999b6b5c.mp3',
          highlightWords: ['home', 'returns', 'today'],
          interactionType: 'none',
        },
      ],
    },
  },
  {
    id: 'story-w6-mission-complete',
    title: 'Mission Complete',
    titleTr: 'Görev Tamamlandı',
    theme: 'adventure',
    suggestedAfterUnit: 'unit-w6-final-mission',
    data: {
      type: 'story-time',
      title: 'Mission Complete',
      pages: [
        {
          text: 'Nova has explored six worlds. Each one taught her something new.',
          translation: 'Nova altı dünya keşfetti. Her biri ona yeni bir şey öğretti.',
          imageUrl: '/story/story-w6-mission-complete-p1.jpg',
          audioUrl: '/audio/tts/879d05321914653b.mp3',
          highlightWords: ['explored', 'worlds', 'taught'],
          interactionType: 'tap-word',
        },
        {
          text: 'Words, grammar, stories, the city, science, and the galaxy.',
          translation: 'Kelimeler, dil bilgisi, hikayeler, şehir, bilim ve galaksi.',
          imageUrl: '/story/story-w6-mission-complete-p2.jpg',
          audioUrl: '/audio/tts/80aa9d29c0929666.mp3',
          highlightWords: ['grammar', 'galaxy', 'science'],
          interactionType: 'tap-word',
        },
        {
          text: '"Learning never stops," smiles Nova. "Every day is a new adventure!"',
          translation: '"Öğrenme hiç durmaz," gülümsüyor Nova. "Her gün yeni bir macera!"',
          imageUrl: '/story/story-w6-mission-complete-p3.jpg',
          audioUrl: '/audio/tts/f5b70c716afc34cf.mp3',
          highlightWords: ['learning', 'adventure'],
          interactionType: 'none',
        },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // INTERACTIVE STORY DEMOS — Tap-Reveal, Drag-Word, Choice Branch, Sound, Rhyme
  // ═══════════════════════════════════════════════════════════════════════════════

  // ─── TAP-REVEAL Demo ────────────────────────────────────────────────────────
  {
    id: 'story-w2-mystery-picnic',
    title: 'The Mystery Picnic',
    titleTr: 'Gizemli Piknik',
    theme: 'food',
    suggestedAfterUnit: 'unit-w2-food',
    data: {
      type: 'story-time',
      title: 'The Mystery Picnic',
      pages: [
        {
          text: 'Nova packs a basket. She brings bread, cheese, and juice.',
          translation: 'Nova bir sepet hazırlıyor. Ekmek, peynir ve meyve suyu getiriyor.',
          imageUrl: '/story/story-w2-mystery-picnic-p1.jpg',
          audioUrl: '',
          highlightWords: ['bread', 'cheese', 'juice'],
          interactionType: 'tap-word',
        },
        {
          text: 'At the park, Nova finds a note: "Find the ___ behind the ___!"',
          translation: 'Parkta Nova bir not buluyor: "Ağacın arkasındaki elmayı bul!"',
          imageUrl: '/story/story-w2-mystery-picnic-p2.jpg',
          audioUrl: '',
          highlightWords: ['apple', 'tree'],
          interactionType: 'tap-reveal',
        },
        {
          text: 'She looks behind the tree and finds a red ___! Yummy!',
          translation: 'Ağacın arkasına bakıyor ve kırmızı bir elma buluyor! Lezzetli!',
          imageUrl: '/story/story-w2-mystery-picnic-p3.jpg',
          audioUrl: '',
          highlightWords: ['apple'],
          interactionType: 'tap-reveal',
        },
        {
          text: 'Nova shares the apple with her friend. Sharing is caring!',
          translation: 'Nova elmayı arkadaşıyla paylaşıyor. Paylaşmak güzeldir!',
          imageUrl: '/story/story-w2-mystery-picnic-p4.jpg',
          audioUrl: '',
          highlightWords: ['shares', 'friend'],
          interactionType: 'tap-word',
        },
      ],
    },
  },

  // ─── DRAG-WORD Demo ─────────────────────────────────────────────────────────
  {
    id: 'story-w3-missing-words',
    title: 'The Missing Words',
    titleTr: 'Kayıp Kelimeler',
    theme: 'school',
    suggestedAfterUnit: 'unit-w3-school',
    data: {
      type: 'story-time',
      title: 'The Missing Words',
      pages: [
        {
          text: 'Nova opens her book. Oh no! Some words are missing!',
          translation: 'Nova kitabını açıyor. Eyvah! Bazı kelimeler kayıp!',
          imageUrl: '/story/story-w3-missing-words-p1.jpg',
          audioUrl: '',
          highlightWords: ['book', 'words'],
          interactionType: 'tap-word',
        },
        {
          text: 'The ___ is in the ___. Can you help Nova?',
          translation: 'Kedi bahçede. Nova\'ya yardım edebilir misin?',
          imageUrl: '/story/story-w3-missing-words-p2.jpg',
          audioUrl: '',
          highlightWords: ['cat', 'garden'],
          interactionType: 'drag-word',
          interactionData: {
            blanks: [
              { index: 0, answer: 'cat' },
              { index: 1, answer: 'garden' },
            ],
            options: ['cat', 'garden', 'house'],
          },
        },
        {
          text: 'The ___ flies over the ___.',
          translation: 'Kuş evin üzerinden uçuyor.',
          imageUrl: '/story/story-w3-missing-words-p3.jpg',
          audioUrl: '',
          highlightWords: ['bird', 'house'],
          interactionType: 'drag-word',
          interactionData: {
            blanks: [
              { index: 0, answer: 'bird' },
              { index: 1, answer: 'house' },
            ],
            options: ['house', 'bird', 'tree'],
          },
        },
        {
          text: 'Nova fixed all the words! The book is happy again.',
          translation: 'Nova tüm kelimeleri düzeltti! Kitap yine mutlu.',
          imageUrl: '/story/story-w3-missing-words-p4.jpg',
          audioUrl: '',
          highlightWords: ['fixed', 'happy'],
          interactionType: 'tap-word',
        },
      ],
    },
  },

  // ─── CHOICE BRANCH Demo ─────────────────────────────────────────────────────
  {
    id: 'story-w4-two-paths',
    title: 'Two Paths',
    titleTr: 'İki Yol',
    theme: 'city',
    suggestedAfterUnit: 'unit-w4-city',
    data: {
      type: 'story-time',
      title: 'Two Paths',
      pages: [
        {
          text: 'Nova is walking in the city. She reaches a crossroad.',
          translation: 'Nova şehirde yürüyor. Bir kavşağa geliyor.',
          imageUrl: '/story/story-w4-two-paths-p1.jpg',
          audioUrl: '',
          highlightWords: ['city', 'crossroad'],
          interactionType: 'tap-word',
        },
        {
          text: 'One path goes to the park. The other goes to the market.',
          translation: 'Bir yol parka gidiyor. Diğeri markete.',
          imageUrl: '/story/story-w4-two-paths-p2.jpg',
          audioUrl: '',
          highlightWords: ['park', 'market'],
          interactionType: 'choice',
          interactionData: {
            question: 'Where should Nova go?',
            options: [
              {
                label: 'Go to the park',
                emoji: '🌳',
                nextText: 'Nova runs to the park and finds a swing! She swings high into the sky.',
              },
              {
                label: 'Go to the market',
                emoji: '🛒',
                nextText: 'Nova walks to the market and buys a yummy ice cream. Delicious!',
              },
            ],
          },
        },
        {
          text: 'What a wonderful day! Nova loves exploring the city.',
          translation: 'Ne güzel bir gün! Nova şehri keşfetmeyi seviyor.',
          imageUrl: '/story/story-w4-two-paths-p3.jpg',
          audioUrl: '',
          highlightWords: ['wonderful', 'exploring'],
          interactionType: 'tap-word',
        },
      ],
    },
  },

  // ─── AMBIENT SOUND Demo ─────────────────────────────────────────────────────
  {
    id: 'story-w1-night-sounds',
    title: 'Night Sounds',
    titleTr: 'Gece Sesleri',
    theme: 'animals',
    suggestedAfterUnit: 'unit-w1-animals',
    data: {
      type: 'story-time',
      title: 'Night Sounds',
      pages: [
        {
          text: 'The sun goes down. Nova hears the crickets chirping.',
          translation: 'Güneş batıyor. Nova cırcır böceklerini duyuyor.',
          imageUrl: '/story/story-w1-night-sounds-p1.jpg',
          audioUrl: '',
          highlightWords: ['sun', 'crickets'],
          interactionType: 'tap-word',
          ambientSound: '/audio/ambient/crickets.mp3',
        },
        {
          text: 'An owl says HOO HOO from the tree. The frog says RIBBIT!',
          translation: 'Ağaçtan bir baykuş HU HU diyor. Kurbağa VRAK diyor!',
          imageUrl: '/story/story-w1-night-sounds-p2.jpg',
          audioUrl: '',
          highlightWords: ['owl', 'frog'],
          interactionType: 'tap-word',
          ambientSound: '/audio/ambient/owl.mp3',
        },
        {
          text: 'Nova whispers "goodnight" to all the animals and falls asleep.',
          translation: 'Nova tüm hayvanlara "iyi geceler" fısıldıyor ve uykuya dalıyor.',
          imageUrl: '/story/story-w1-night-sounds-p3.jpg',
          audioUrl: '',
          highlightWords: ['goodnight', 'animals', 'asleep'],
          interactionType: 'tap-word',
          ambientSound: '/audio/ambient/night.mp3',
        },
      ],
    },
  },

  // ─── RHYME STORY Demo ───────────────────────────────────────────────────────
  {
    id: 'story-w2-rhyme-cat-hat',
    title: 'Cat in a Hat',
    titleTr: 'Şapkalı Kedi',
    theme: 'animals',
    suggestedAfterUnit: 'unit-w2-animals',
    data: {
      type: 'story-time',
      variant: 'rhyme',
      title: 'Cat in a Hat',
      pages: [
        {
          text: 'I see a cat, it wears a hat. It sits on a mat, imagine that!',
          translation: 'Bir kedi görüyorum, şapka takıyor. Paspasın üstünde oturuyor, baksana!',
          imageUrl: '/story/story-w2-rhyme-cat-hat-p1.jpg',
          audioUrl: '',
          highlightWords: ['cat', 'hat', 'mat'],
          interactionType: 'tap-word',
          rhymeWords: ['cat', 'hat', 'mat', 'that'],
        },
        {
          text: 'The cat sees a dog on a log. They play in the fog, what a jog!',
          translation: 'Kedi kütükte bir köpek görüyor. Siste oynuyorlar, ne koşu!',
          imageUrl: '/story/story-w2-rhyme-cat-hat-p2.jpg',
          audioUrl: '',
          highlightWords: ['dog', 'log', 'fog'],
          interactionType: 'tap-word',
          rhymeWords: ['dog', 'log', 'fog', 'jog'],
        },
        {
          text: 'At night they say hey, what a day! Let us play another day!',
          translation: 'Gece diyorlar ne güzel gün! Başka gün yine oynayalım!',
          imageUrl: '/story/story-w2-rhyme-cat-hat-p3.jpg',
          audioUrl: '',
          highlightWords: ['night', 'day', 'play'],
          interactionType: 'tap-word',
          rhymeWords: ['hey', 'day', 'play', 'day'],
        },
      ],
    },
  },

  // ─── COMBINED INTERACTIONS Demo ─────────────────────────────────────────────
  {
    id: 'story-w5-lab-experiment',
    title: 'The Lab Experiment',
    titleTr: 'Laboratuvar Deneyi',
    theme: 'science',
    suggestedAfterUnit: 'unit-w5-science',
    data: {
      type: 'story-time',
      title: 'The Lab Experiment',
      pages: [
        {
          text: 'Nova puts on her lab coat. Today she will mix colors!',
          translation: 'Nova önlüğünü giyiyor. Bugün renk karıştıracak!',
          imageUrl: '/story/story-w5-lab-experiment-p1.jpg',
          audioUrl: '',
          highlightWords: ['lab', 'colors'],
          interactionType: 'tap-word',
        },
        {
          text: 'She mixes ___ and ___ together. What color does it make?',
          translation: 'Kırmızı ve maviyi karıştırıyor. Hangi renk oluyor?',
          imageUrl: '/story/story-w5-lab-experiment-p2.jpg',
          audioUrl: '',
          highlightWords: ['red', 'blue'],
          interactionType: 'tap-reveal',
        },
        {
          text: 'It makes purple! Now mix yellow and blue to get ___.',
          translation: 'Mor oluyor! Şimdi sarı ve maviyi karıştırarak yeşil yap.',
          imageUrl: '/story/story-w5-lab-experiment-p3.jpg',
          audioUrl: '',
          highlightWords: ['green'],
          interactionType: 'drag-word',
          interactionData: {
            blanks: [{ index: 0, answer: 'green' }],
            options: ['green', 'orange', 'pink'],
          },
        },
        {
          text: 'Nova made a rainbow! Red, orange, yellow, green, blue, purple!',
          translation: 'Nova bir gökkuşağı yaptı! Kırmızı, turuncu, sarı, yeşil, mavi, mor!',
          imageUrl: '/story/story-w5-lab-experiment-p4.jpg',
          audioUrl: '',
          highlightWords: ['rainbow'],
          interactionType: 'choice',
          interactionData: {
            question: 'What is your favorite color?',
            options: [
              { label: 'Red', emoji: '❤️', nextText: 'Red like a beautiful rose! Great choice!' },
              { label: 'Blue', emoji: '💙', nextText: 'Blue like the ocean! Wonderful!' },
              { label: 'Green', emoji: '💚', nextText: 'Green like the leaves! Amazing!' },
            ],
          },
        },
      ],
    },
  },
];

function enrichStoryData(theme: string, data: StoryTimeData): StoryTimeData {
  return {
    ...data,
    pages: data.pages.map((page, pageIndex) => ({
      ...page,
      imageUrl: resolveImageUrl(page.imageUrl, { theme, pageIndex }),
      audioUrl: resolveStoryAudioUrl(page.text, page.audioUrl),
    })),
  };
}

function enrichMicroStory(story: MicroStory): MicroStory {
  return {
    ...story,
    data: enrichStoryData(story.theme, story.data),
  };
}

function getStoryVocabulary(story: MicroStory): Set<string> {
  const words = new Set<string>();
  for (const page of story.data.pages) {
    for (const word of page.highlightWords) {
      words.add(word.toLowerCase());
    }
  }
  return words;
}

export const storyBank: MicroStory[] = rawStoryBank.map(enrichMicroStory);

export function selectStoryForWords(
  words: string[],
  preferredTheme?: string,
  worldId?: string,
): MicroStory {
  const normalizedWords = new Set(words.map((word) => word.toLowerCase()));

  // Narrow pool by world first when worldId is provided
  const worldPool = worldId
    ? storyBank.filter((s) => s.id.startsWith(`story-${worldId}-`))
    : storyBank;
  // Fall back to full bank if the world has no stories yet
  const pool = worldPool.length > 0 ? worldPool : storyBank;

  const fallback: MicroStory = (pool[Math.floor(Math.random() * pool.length)] ??
    storyBank[0]) as MicroStory;

  let bestStory: MicroStory | undefined;
  let bestScore = -1;

  for (const story of pool) {
    let score = story.theme === preferredTheme ? 3 : 0;
    const storyWords = getStoryVocabulary(story);

    for (const word of storyWords) {
      if (normalizedWords.has(word)) {
        score += 2;
      }
    }

    if (normalizedWords.has(story.theme.toLowerCase())) {
      score += 1;
    }

    if (score > bestScore) {
      bestScore = score;
      bestStory = story;
    }
  }

  return bestStory ?? fallback;
}

/**
 * Returns a micro-story by its id, or undefined if not found.
 */
export function getStory(id: string): MicroStory | undefined {
  return storyBank.find((s) => s.id === id);
}

/**
 * Returns all micro-stories matching the given theme tag.
 */
export function getStoriesByTheme(theme: string): MicroStory[] {
  return storyBank.filter((s) => s.theme === theme);
}

/**
 * Returns a random micro-story. Optionally filtered by theme.
 */
export function getRandomStory(theme?: string): MicroStory {
  const pool = theme ? getStoriesByTheme(theme) : storyBank;
  const idx = Math.floor(Math.random() * pool.length);
  const fallback = storyBank[0];
  if (!fallback) {
    throw new Error('Story bank is empty');
  }
  return pool[idx] ?? pool[0] ?? fallback;
}
