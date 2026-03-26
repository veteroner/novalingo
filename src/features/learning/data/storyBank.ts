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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['farm'],
          interactionType: 'none',
        },
        {
          text: 'On the farm there is a big dog. The dog says WOOF!',
          translation: 'Çiftlikte büyük bir köpek var. Köpek HAVO diye sesleniyor!',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['dog'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova sees a cat, a horse, and a bird too.',
          translation: 'Nova ayrıca bir kedi, at ve kuş görüyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['cat', 'horse', 'bird'],
          interactionType: 'tap-word',
        },
        {
          text: 'The bird sings a happy song. Nova claps her hands.',
          translation: 'Kuş neşeli bir şarkı söylüyor. Nova ellerini çırpıyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['bird'],
          interactionType: 'none',
        },
        {
          text: '"I love animals!" says Nova. Do you love animals too?',
          translation: '"Hayvanları seviyorum!" diyor Nova. Sen de hayvanları seviyor musun?',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['ocean'],
          interactionType: 'none',
        },
        {
          text: 'She sees a big whale. The whale is very friendly!',
          translation: 'Büyük bir balina görüyor. Balina çok dostane!',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['whale'],
          interactionType: 'tap-word',
        },
        {
          text: 'A little fish swims past her nose. It says hello!',
          translation: 'Küçük bir balık burnunun yanından geçip merhaba diyor!',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['fish'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova waves goodbye to the whale and the fish. What a wonderful ocean!',
          translation: 'Nova balina ve balığa hoşça kal diye el sallıyor. Ne harika bir okyanus!',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['rainbow'],
          interactionType: 'none',
        },
        {
          text: 'First she paints a red stripe. Red is the colour of a ripe apple.',
          translation: 'Önce kırmızı bir şerit boyuyor. Kırmızı olgun elmanın rengidir.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['red'],
          interactionType: 'tap-word',
        },
        {
          text: 'Next comes yellow, then blue. Yellow is bright like the sun!',
          translation: 'Ardından sarı, sonra mavi geliyor. Sarı güneş gibi parlaktır!',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['yellow', 'blue'],
          interactionType: 'tap-word',
        },
        {
          text: 'She adds green, orange, and purple. The rainbow is almost done!',
          translation: 'Yeşil, turuncu ve mor ekliyor. Gökkuşağı neredeyse bitti!',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['green', 'orange', 'purple'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova holds up her painting. "Look at all the colours!" she says.',
          translation: 'Nova tablosunu yukarı kaldırıyor. "Bütün renklere bak!" diyor.',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['stars'],
          interactionType: 'none',
        },
        {
          text: 'She counts: one, two, three. Three stars wink at her.',
          translation: 'Sayıyor: bir, iki, üç. Üç yıldız ona göz kırpıyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['one', 'two', 'three'],
          interactionType: 'tap-word',
        },
        {
          text: 'She keeps counting: four, five! There are five bright stars in a row.',
          translation: 'Saymaya devam ediyor: dört, beş! Bir sırada beş parlak yıldız var.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['four', 'five'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova makes a wish on the biggest star. She smiles and goes to sleep.',
          translation: 'Nova en büyük yıldıza dilek tutuyor. Gülümseyerek uyumaya gidiyor.',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['dance'],
          interactionType: 'none',
        },
        {
          text: 'She moves her arms up and down, up and down.',
          translation: 'Kollarını yukarı aşağı hareket ettiriyor, yukarı aşağı.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['arms'],
          interactionType: 'tap-word',
        },
        {
          text: 'She stomps her feet on the ground — STOMP! STOMP!',
          translation: 'Ayaklarını yere vuruyor — STOMP! STOMP!',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['feet'],
          interactionType: 'tap-word',
        },
        {
          text: 'She shakes her head left and right. Her eyes are full of joy!',
          translation: 'Kafasını sağa sola sallıyor. Gözleri neşeyle dolup taşıyor!',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['head', 'eyes'],
          interactionType: 'tap-word',
        },
        {
          text: '"Dancing is the best!" laughs Nova. Can you dance like Nova?',
          translation:
            '"Dans etmek çok güzel!" diye gülen Nova. Sen de Nova gibi dans edebilir misin?',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['kitchen', 'fruit'],
          interactionType: 'none',
        },
        {
          text: 'She grabs an apple and cuts it into small pieces.',
          translation: 'Bir elma alıp küçük parçalar halinde kesiyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['apple'],
          interactionType: 'tap-word',
        },
        {
          text: 'Then she adds a banana, some grapes, and a juicy orange.',
          translation: 'Ardından bir muz, biraz üzüm ve sulu bir portakal ekliyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['banana', 'grapes', 'orange'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova mixes everything together. It smells so good!',
          translation: 'Nova her şeyi bir arada karıştırıyor. Çok güzel kokuyor!',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['fruit'],
          interactionType: 'none',
        },
        {
          text: '"Yummy!" says Nova. "Fruit salad is the best snack."',
          translation: '"Lezzetli!" diyor Nova. "Meyve salatası en güzel atıştırmalıktır."',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['bedroom', 'house'],
          interactionType: 'none',
        },
        {
          text: 'There is a big bed in the middle of the room. The bed has a fluffy pillow.',
          translation:
            'Odanın ortasında büyük bir yatak var. Yatağın üzerinde kabarık bir yastık var.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['bed', 'pillow'],
          interactionType: 'tap-word',
        },
        {
          text: 'On the desk next to the window, Nova keeps her books.',
          translation: 'Pencerenin yanındaki masanın üzerinde Nova kitaplarını saklıyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['desk', 'books'],
          interactionType: 'tap-word',
        },
        {
          text: 'There is also a chair and a lamp. The lamp gives a warm, yellow light.',
          translation: 'Bir de sandalye ve lamba var. Lamba sıcak, sarı bir ışık veriyor.',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['toy'],
          interactionType: 'none',
        },
        {
          text: 'Inside there is a red ball, a yellow train, and a blue car.',
          translation: 'İçinde kırmızı bir top, sarı bir tren ve mavi bir araba var.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['ball', 'train', 'car'],
          interactionType: 'tap-word',
        },
        {
          text: 'There is also a drum! BOOM BOOM BOOM goes the drum.',
          translation: 'Bir de davul var! BOOM BOOM BOOM diye ses çıkarıyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['drum'],
          interactionType: 'tap-word',
        },
        {
          text: '"Which toy do you want to play with?" asks Nova.',
          translation: '"Hangi oyuncakla oynamak istiyorsun?" diye soruyor Nova.',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['apple', 'banana'],
          interactionType: 'tap-word',
        },
        {
          text: 'Then she plays in the garden with her dog. She throws the red ball!',
          translation: 'Sonra köpeğiyle bahçede oynuyor. Kırmızı topu fırlatıyor!',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['dog', 'ball', 'red'],
          interactionType: 'tap-word',
        },
        {
          text: 'In the afternoon she paints. She uses five colours: red, yellow, blue, green and purple.',
          translation:
            'Öğleden sonra resim yapıyor. Beş renk kullanıyor: kırmızı, sarı, mavi, yeşil ve mor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['five', 'red', 'yellow', 'blue', 'green', 'purple'],
          interactionType: 'tap-word',
        },
        {
          text: 'At night she reads a book in bed with her lamp on. She is happy and tired.',
          translation: 'Gece lambasını yakarak yatakta kitap okuyor. Mutlu ve yorgun.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['book', 'bed', 'lamp'],
          interactionType: 'tap-word',
        },
        {
          text: '"What a perfect day!" says Nova, closing her eyes.',
          translation: '"Ne mükemmel bir gündü!" diyor Nova, gözlerini kapatarak.',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['house', 'door', 'garden'],
          interactionType: 'tap-word',
        },
        {
          text: 'There is a kitchen in the house. Nova loves to cook here.',
          translation: 'Evde bir mutfak var. Nova burada yemek yapmayı seviyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['kitchen', 'cook'],
          interactionType: 'tap-word',
        },
        {
          text: "Nova's room has a bed, a desk, and a window.",
          translation: "Nova'nın odasında bir yatak, bir masa ve bir pencere var.",
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['room', 'bed', 'desk', 'window'],
          interactionType: 'tap-word',
        },
        {
          text: 'At night, Nova looks out the window. She sees the stars.',
          translation: 'Geceleri Nova pencereden dışarı bakar. Yıldızları görür.',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['school', 'book', 'pen'],
          interactionType: 'tap-word',
        },
        {
          text: 'The teacher says: "Good morning! Sit at your desk."',
          translation: 'Öğretmen diyor ki: "Günaydın! Masanıza oturun."',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['teacher', 'desk'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova writes on the board. She writes: I love school!',
          translation: 'Nova tahtaya yazıyor. Şunu yazıyor: I love school!',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['board', 'school'],
          interactionType: 'tap-word',
        },
        {
          text: 'After school, Nova goes home. She is happy.',
          translation: 'Okuldan sonra Nova eve gidiyor. Mutlu.',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['wake up', 'first'],
          interactionType: 'tap-word',
        },
        {
          text: 'Then, I eat breakfast. I love eating eggs and toast!',
          translation: 'Sonra kahvaltı yaparım. Yumurta ve tost yemeyi seviyorum!',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['eat breakfast', 'then'],
          interactionType: 'tap-word',
        },
        {
          text: 'I get dressed and go to school every day.',
          translation: 'Her gün giyinirim ve okula giderim.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['every day', 'school'],
          interactionType: 'tap-word',
        },
        {
          text: 'After school, I play. Then, I sleep. What a day!',
          translation: 'Okuldan sonra oynarım. Sonra uyurum. Ne güzel bir gün!',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['rain', 'trees', 'leaves'],
          interactionType: 'tap-word',
        },
        {
          text: 'A frog jumps on a rock near the river.',
          translation: 'Bir kurbağa ırmağın yakınındaki bir kayanın üzerine zıplıyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['frog', 'rock', 'river'],
          interactionType: 'tap-word',
        },
        {
          text: 'A flower grows in the mud after the rain.',
          translation: 'Yağmurdan sonra çamurda bir çiçek yetişiyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['flower', 'mud', 'rain'],
          interactionType: 'tap-word',
        },
        {
          text: 'The sun comes out. The forest smells beautiful.',
          translation: 'Güneş çıkıyor. Orman güzel kokuyor.',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['seed', 'soil'],
          interactionType: 'tap-word',
        },
        {
          text: 'She puts the seed in and covers it with soil.',
          translation: 'Tohumu koyuyor ve toprakla kapatıyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['seed', 'soil'],
          interactionType: 'tap-word',
        },
        {
          text: 'Every day, Nova gives the plant water and sun.',
          translation: 'Her gün Nova bitkiye su ve güneş veriyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['plant', 'water', 'sun', 'every day'],
          interactionType: 'tap-word',
        },
        {
          text: 'One day, a flower blooms! Nova says: I grew this!',
          translation: 'Bir gün bir çiçek açıyor! Nova diyor ki: Ben yetiştirdim bunu!',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['cold', 'clothes'],
          interactionType: 'tap-word',
        },
        {
          text: 'She puts on her blue coat and green boots.',
          translation: 'Mavi paltosunu ve yeşil botlarını giyiyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['coat', 'boots'],
          interactionType: 'choose-image',
        },
        {
          text: 'She also wears a red hat and a warm scarf.',
          translation: 'Ayrıca kırmızı bir şapka ve sıcak bir atkı takıyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['hat', 'scarf'],
          interactionType: 'tap-word',
        },
        {
          text: 'Now Nova is ready! She goes outside to play in the snow.',
          translation: 'Şimdi Nova hazır! Karda oynamak için dışarı çıkıyor.',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['party', 'wear'],
          interactionType: 'tap-word',
        },
        {
          text: 'She tries on a yellow dress. It is too big!',
          translation: 'Sarı bir elbise deniyor. Çok büyük!',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['dress', 'big'],
          interactionType: 'choose-image',
        },
        {
          text: 'She tries on a pink shirt and white trousers. Perfect!',
          translation: 'Pembe bir gömlek ve beyaz pantolon deniyor. Mükemmel!',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['shirt', 'trousers'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova puts on her silver shoes and dances to the party!',
          translation: 'Nova gümüş ayakkabılarını giyiyor ve partiye dans ederek gidiyor!',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['forest', 'trees', 'path'],
          interactionType: 'tap-word',
        },
        {
          text: 'She sees a butterfly on a leaf. It has orange wings.',
          translation: 'Bir yaprağın üzerinde kelebek görüyor. Turuncu kanatları var.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['butterfly', 'leaf', 'wings'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova hears a bird singing in the tree above.',
          translation: 'Nova yukarısındaki ağaçta bir kuşun şarkı söylediğini duyuyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['bird', 'tree', 'singing'],
          interactionType: 'tap-word',
        },
        {
          text: 'At the end of the path, she finds a hidden waterfall. How wonderful!',
          translation: 'Yolun sonunda gizli bir şelale buluyor. Ne güzel!',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['spring', 'flowers', 'birds'],
          interactionType: 'tap-word',
        },
        {
          text: 'In summer, the sun is hot. We swim and eat ice cream.',
          translation: 'Yazın güneş sıcak. Yüzer ve dondurma yeriz.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['summer', 'sun', 'swim'],
          interactionType: 'tap-word',
        },
        {
          text: 'In autumn, leaves turn red, orange, and yellow.',
          translation: 'Sonbaharda yapraklar kırmızı, turuncu ve sarıya döner.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['autumn', 'leaves', 'red', 'orange', 'yellow'],
          interactionType: 'choose-image',
        },
        {
          text: 'In winter, it snows. We wear coats and drink hot chocolate.',
          translation: 'Kışın kar yağar. Manto giyeriz ve sıcak çikolata içeriz.',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['city', 'transport'],
          interactionType: 'tap-word',
        },
        {
          text: 'On Monday, she rides the bus to school.',
          translation: 'Pazartesi okula otobüsle gidiyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['bus', 'school'],
          interactionType: 'tap-word',
        },
        {
          text: 'On Saturday, she rides her bicycle to the park.',
          translation: 'Cumartesi parka bisikletiyle gidiyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['bicycle', 'park'],
          interactionType: 'choose-image',
        },
        {
          text: 'When it rains, she takes a taxi. Zoom!',
          translation: 'Yağmur yağdığında taksi alıyor. Vıın!',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['station', 'train'],
          interactionType: 'tap-word',
        },
        {
          text: 'She gets on the train and finds a window seat.',
          translation: 'Trene biniyor ve pencere kenarında yer buluyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['train', 'window', 'seat'],
          interactionType: 'tap-word',
        },
        {
          text: 'The train passes mountains, rivers, and small towns.',
          translation: 'Tren dağlardan, nehirlerden ve küçük kasabalardan geçiyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['mountains', 'rivers'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova arrives at the city. She waves goodbye to the train.',
          translation: 'Nova şehre varıyor. Trene el sallayarak veda ediyor.',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['first', 'then', 'home', 'school'],
          interactionType: 'tap-word',
        },
        {
          text: 'After school, she wears her boots and goes to the forest.',
          translation: 'Okuldan sonra botlarını giyiyor ve ormana gidiyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['boots', 'forest'],
          interactionType: 'tap-word',
        },
        {
          text: 'In the forest, she sees flowers, birds, and a little river.',
          translation: 'Ormanda çiçekler, kuşlar ve küçük bir nehir görüyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['flowers', 'birds', 'river'],
          interactionType: 'choose-image',
        },
        {
          text: 'She takes the train home. It was a wonderful day!',
          translation: 'Trenle eve dönüyor. Bu harika bir günmüş!',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['mother', 'family'],
          interactionType: 'tap-word',
        },
        {
          text: 'This is her father. He is tall and kind.',
          translation: 'Bu babası. O uzun boylu ve nazik.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['father'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova has a sister and a brother. They love to play together.',
          translation:
            "Nova'nın bir kız kardeşi ve bir erkek kardeşi var. Birlikte oynamayı severler.",
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['sister', 'brother'],
          interactionType: 'tap-word',
        },
        {
          text: '"I love my family!" says Nova. Who is in your family?',
          translation: '"Ailemi seviyorum!" diyor Nova. Senin ailende kimler var?',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['hello'],
          interactionType: 'none',
        },
        {
          text: 'A little robot waves at her. "Hi! My name is Bolt!"',
          translation: 'Küçük bir robot ona el sallıyor. "Merhaba! Benim adım Bolt!"',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['name'],
          interactionType: 'tap-word',
        },
        {
          text: '"Hello Bolt! My name is Nova. Nice to meet you!" says Nova.',
          translation: '"Merhaba Bolt! Benim adım Nova. Tanıştığımıza memnun oldum!" diyor Nova.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['hello', 'name'],
          interactionType: 'tap-word',
        },
        {
          text: 'They smile and wave. "See you tomorrow!" says Bolt. "Goodbye!"',
          translation: 'Gülümserler ve el sallarlar. "Yarın görüşürüz!" diyor Bolt. "Güle güle!"',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['breakfast'],
          interactionType: 'none',
        },
        {
          text: 'She has bread, an egg, and some cheese on the table.',
          translation: 'Masada ekmek, yumurta ve biraz peynir var.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['bread', 'egg', 'cheese'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova drinks her milk. "Mmm! I like milk," she says.',
          translation: 'Nova sütünü içer. "Mmm! Sütü seviyorum," diyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['milk', 'like'],
          interactionType: 'tap-word',
        },
        {
          text: '"What do you eat for breakfast?" Nova asks you with a smile.',
          translation: 'Nova sana gülümseyerek soruyor: "Sen kahvaltıda ne yersin?"',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['market', 'mother'],
          interactionType: 'none',
        },
        {
          text: '"I like apples!" says Nova. She puts them in the basket.',
          translation: '"Elmaları seviyorum!" diyor Nova. Onları sepete koyuyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['apple', 'basket'],
          interactionType: 'tap-word',
        },
        {
          text: 'She also gets bananas and some orange juice.',
          translation: 'Ayrıca muz ve portakal suyu da alıyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['banana', 'orange'],
          interactionType: 'tap-word',
        },
        {
          text: '"Thank you!" says Nova to the shopkeeper. Markets are fun!',
          translation: '"Teşekkür ederim!" diyor Nova satıcıya. Pazarlar eğlenceli!',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['happy', 'is'],
          interactionType: 'tap-word',
        },
        {
          text: '"I am Nova," she says proudly. "I am seven years old."',
          translation: '"Ben Novayım," diyor gururla. "Ben yedi yaşındayım."',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['I am'],
          interactionType: 'tap-word',
        },
        {
          text: 'The birds are singing. They are yellow and blue.',
          translation: 'Kuşlar şarkı söylüyor. Onlar sarı ve mavi.',
          interactionType: 'tap-word',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['are', 'yellow', 'blue'],
        },
        {
          text: '"You ARE amazing!" says Bolt. "We are best friends!" shouts Nova.',
          translation:
            '"Sen HAİKA bir varlıksın!" diyor Bolt. "Biz en iyi arkadaşlarız!" diye bağırıyor Nova.',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['play'],
          interactionType: 'none',
        },
        {
          text: 'She can run fast. She can jump very high.',
          translation: 'O hızlı koşabiliyor. Çok yükseğe zıplayabiliyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['run', 'jump'],
          interactionType: 'tap-word',
        },
        {
          text: 'Bolt can skip and spin. They dance and clap their hands.',
          translation: 'Bolt atlayıp dönebiliyor. Dans ediyorlar ve el çırpıyorlar.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['skip', 'dance', 'clap'],
          interactionType: 'tap-word',
        },
        {
          text: '"Can you jump?" asks Nova. Show me your best jump!',
          translation: '"Zıplayabilir misin?" diye soruyor Nova. Bana en iyi zıplayışını göster!',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['big', 'elephant'],
          interactionType: 'tap-word',
        },
        {
          text: 'Next to it is a small mouse. "Big and small!" she laughs.',
          translation: 'Yanında küçük bir fare var. "Büyük ve küçük!" diye güler.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['small', 'mouse'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova finds a tall tree and a short flower in the garden.',
          translation: 'Nova bahçede uzun bir ağaç ve kısa bir çiçek buluyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['tall', 'short', 'tree', 'flower'],
          interactionType: 'tap-word',
        },
        {
          text: '"Everything is different!" says Nova. Big, small, tall or short — all beautiful!',
          translation: '"Her şey farklı!" diyor Nova. Büyük, küçük, uzun ya da kısa — hepsi güzel!',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['library', 'book'],
          interactionType: 'none',
        },
        {
          text: '"Can I have that book, please?" she asks the librarian politely.',
          translation: '"O kitabı alabilir miyim, lütfen?" diye soruyor kütüphaneciye kibarca.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['please'],
          interactionType: 'tap-word',
        },
        {
          text: '"Of course! Here you go!" says the librarian with a big smile.',
          translation: '"Tabii ki! Buyrun!" diyor kütüphaneci gülümseyerek.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['here you go'],
          interactionType: 'none',
        },
        {
          text: '"Thank you so much!" says Nova. Being polite feels wonderful.',
          translation: '"Çok teşekkür ederim!" diyor Nova. Kibar olmak harika bir his.',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['party'],
          interactionType: 'none',
        },
        {
          text: "Nova's family brings food. There is big cake and cold juice.",
          translation: "Nova'nın ailesi yiyecekler getiriyor. Büyük kek ve soğuk meyve suyu var.",
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['family', 'cake', 'juice', 'big'],
          interactionType: 'tap-word',
        },
        {
          text: '"Hello everyone! I am so happy!" shouts Nova.',
          translation: '"Merhaba herkese! Ben çok mutluyum!" diye bağırıyor Nova.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['hello', 'happy', 'I am'],
          interactionType: 'tap-word',
        },
        {
          text: 'The family dances and sings together. What a wonderful day!',
          translation: 'Aile birlikte dans edip şarkı söylüyor. Ne harika bir gün!',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['learned'],
          interactionType: 'none',
        },
        {
          text: 'She knows her family: mother, father, sister, brother.',
          translation: 'Ailesini biliyor: anne, baba, kız kardeş, erkek kardeş.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['mother', 'father', 'sister', 'brother'],
          interactionType: 'tap-word',
        },
        {
          text: 'She can say "I am", "I like", "I can", "please" and "thank you".',
          translation: '"I am", "I like", "I can", "please" ve "thank you" diyebiliyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['I am', 'I like', 'I can', 'please', 'thank you'],
          interactionType: 'tap-word',
        },
        {
          text: '"I am a Grammar Champion!" says Nova. Are you a champion too?',
          translation: '"Ben bir Gramer Şampiyonuyum!" diyor Nova. Sen de bir şampiyon musun?',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['street', 'bank', 'school', 'park'],
          interactionType: 'tap-word',
        },
        {
          text: '"Where is the supermarket?" she asks. "Turn left at the corner," says a man.',
          translation: '"Süpermarket nerede?" diye soruyor. "Köşede sola dön," diyor bir adam.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['supermarket', 'turn', 'left', 'corner'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova finds the supermarket. It is next to the library.',
          translation: 'Nova süpermarketi buluyor. Kütüphanenin yanında.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['library', 'next to'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova buys apples and goes home. She loves her town!',
          translation: 'Nova elma alıp evine gidiyor. Şehrini çok seviyor!',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['hospital', 'police station', 'fire station'],
          interactionType: 'tap-word',
        },
        {
          text: '"Go straight," reads Nova. "Then turn right at the restaurant."',
          translation: '"Düz git," diye okuyor Nova. "Sonra restoranda sağa dön."',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['straight', 'right', 'restaurant'],
          interactionType: 'tap-word',
        },
        {
          text: 'She walks past the post office. She arrives at the playground!',
          translation: 'Postaneyi geçiyor. Oyun parkına varıyor!',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['post office', 'playground'],
          interactionType: 'tap-word',
        },
        {
          text: '"I can read maps!" says Nova proudly. Maps are very useful.',
          translation: '"Harita okuyabiliyorum!" diyor Nova gururla. Haritalar çok işe yarıyor.',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['wakes up', 'seven', "o'clock"],
          interactionType: 'tap-word',
        },
        {
          text: "At half past eight she has breakfast. At nine o'clock she goes to school.",
          translation: 'Sekiz buçukta kahvaltı yapıyor. Dokuzda okula gidiyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['half past', 'breakfast', 'nine'],
          interactionType: 'tap-word',
        },
        {
          text: '"What time is it now?" asks her friend Leo. "It is quarter past twelve," says Nova.',
          translation:
            '"Şimdi saat kaç?" diye soruyor arkadaşı Leo. "On iki çeyrek geçiyor," diyor Nova.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['quarter past', 'twelve'],
          interactionType: 'tap-word',
        },
        {
          text: "At six o'clock Nova goes to bed. She had a wonderful day!",
          translation: 'Saat altıda Nova yatıyor. Harika bir gün geçirdi!',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['morning', 'afternoon', 'outside'],
          interactionType: 'tap-word',
        },
        {
          text: 'In the evening she draws a picture. At night she looks at the stars.',
          translation: 'Akşam resim çiziyor. Gece yıldızlara bakıyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['evening', 'night', 'draws', 'stars'],
          interactionType: 'tap-word',
        },
        {
          text: '"First I do my homework, then I watch TV," says Nova. Order matters!',
          translation: '"Önce ödevimi yapıyorum, sonra TV izliyorum," diyor Nova. Sıra önemli!',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['first', 'then', 'homework'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova is tired but happy. She had time for everything!',
          translation: 'Nova yorgun ama mutlu. Her şeye zaman buldu!',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['doctor', 'hospital'],
          interactionType: 'tap-word',
        },
        {
          text: 'Then she sees a teacher at school. "I teach children," says the teacher.',
          translation:
            'Sonra okulda bir öğretmen görüyor. "Çocuklara öğretiyorum," diyor öğretmen.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['teacher', 'teach'],
          interactionType: 'tap-word',
        },
        {
          text: 'A chef cooks food at a restaurant. A pilot flies an airplane.',
          translation: 'Bir şef restoranda yemek yapıyor. Bir pilot uçak uçuruyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['chef', 'cooks', 'pilot', 'flies'],
          interactionType: 'tap-word',
        },
        {
          text: '"When I grow up, I want to be a pilot!" says Nova. What do you want to be?',
          translation: '"Büyüyünce pilot olmak istiyorum!" diyor Nova. Sen ne olmak istiyorsun?',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['firefighter', 'fires', 'police officer', 'safe'],
          interactionType: 'tap-word',
        },
        {
          text: 'The baker makes bread every morning. The farmer grows vegetables.',
          translation: 'Fırıncı her sabah ekmek yapıyor. Çiftçi sebze yetiştiriyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['baker', 'bread', 'farmer', 'vegetables'],
          interactionType: 'tap-word',
        },
        {
          text: '"Thank you, helpers!" says Nova. Every job is important in our town.',
          translation: '"Teşekkürler, yardımcılar!" diyor Nova. Kasabamızda her meslek önemli.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['thank you', 'important'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova draws a picture of all the helpers. She puts it on the wall.',
          translation: 'Nova tüm yardımcıların resmini çiziyor. Duvara asıyor.',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['game', 'football', 'boots', 'field'],
          interactionType: 'tap-word',
        },
        {
          text: 'Her team wears red shirts. The other team wears blue shirts.',
          translation: 'Takımı kırmızı forma giyiyor. Diğer takım mavi forma giyiyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['team', 'red', 'blue', 'shirts'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova kicks the ball. Goal! The score is one to zero. Her team cheers!',
          translation:
            'Nova topu tekmeliyor. Gol! Skor bir sıfır. Takımı sevinç çığlıkları atıyor!',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['kicks', 'goal', 'score', 'cheers'],
          interactionType: 'tap-word',
        },
        {
          text: 'After the game Nova drinks water with her friends. Great game, team!',
          translation: 'Maçtan sonra Nova arkadaşlarıyla su içiyor. Harika maç, takım!',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['swimming', 'pool', 'Saturday'],
          interactionType: 'tap-word',
        },
        {
          text: 'Mia loves gymnastics. She can do cartwheels and backflips!',
          translation: 'Mia cimnastiği seviyor. Takla ve arka takla yapabiliyor!',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['gymnastics', 'cartwheels'],
          interactionType: 'tap-word',
        },
        {
          text: 'Nova prefers basketball. "I am good at shooting hoops," she says.',
          translation: 'Nova basketbolu tercih ediyor. "Potaya atmakta iyiyim," diyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['basketball', 'shooting', 'hoops'],
          interactionType: 'tap-word',
        },
        {
          text: 'Every sport is fun. What is your favourite sport?',
          translation: 'Her spor eğlenceli. En sevdiğin spor ne?',
          imageUrl: '',
          audioUrl: '',
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
          imageUrl: '',
          audioUrl: '',
          highlightWords: ["ten o'clock", 'explore', 'city'],
          interactionType: 'tap-word',
        },
        {
          text: 'They meet a firefighter near the fire station. "I love my job!" he says.',
          translation:
            'İtfaiyenin yanında bir itfaiyeciyle karşılaşıyorlar. "İşimi seviyorum!" diyor.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['firefighter', 'fire station', 'job'],
          interactionType: 'tap-word',
        },
        {
          text: 'At noon they play basketball in the park. Leo scores three goals!',
          translation: 'Öğle vakti parkta basketbol oynuyorlar. Leo üç gol atıyor!',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ['noon', 'basketball', 'park', 'scores'],
          interactionType: 'tap-word',
        },
        {
          text: 'At five o\'clock they go home. "Best day ever!" says Nova.',
          translation: 'Saat beşte eve gidiyorlar. "En iyi gün!" diyor Nova.',
          imageUrl: '',
          audioUrl: '',
          highlightWords: ["five o'clock", 'home', 'best'],
          interactionType: 'none',
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

export function selectStoryForWords(words: string[], preferredTheme?: string): MicroStory {
  const normalizedWords = new Set(words.map((word) => word.toLowerCase()));
  const fallback = getRandomStory(preferredTheme);

  let bestStory: MicroStory | undefined;
  let bestScore = -1;

  for (const story of storyBank) {
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
