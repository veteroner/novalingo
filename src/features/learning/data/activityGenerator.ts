/**
 * Activity Data Generator
 *
 * Curriculum'daki vocabulary + activityTypes listesinden gerçek Activity[]
 * oluşturur. Her ders için pedagojik sıralama ile tam oynanabilir veriler üretir.
 */

import { resolveFeatureFlags } from '@/config/featureFlags';
import { trackConversationLegacyFallback } from '@/services/analytics/analyticsService';
import type {
  Activity,
  ConversationData,
  FillBlankData,
  FlashCardData,
  GrammarTransformData,
  ListenAndTapData,
  MatchPairsData,
  MemoryGameData,
  QuizBattleData,
  SentenceBuilderData,
  SpeakItData,
  StoryComprehensionData,
  StoryTimeData,
  WordBuilderData,
  WordSearchData,
} from '@/types/content';
import { shuffle } from '@/utils/array';
import { generateStoryPlaceholderImage, generateWordPlaceholderImage } from '@/utils/mediaFallback';
import { getChunksByWorld } from './chunkBank';
import { COMPREHENSION_TEMPLATES, type ComprehensionTemplate } from './comprehensionTemplates';
import { findBestTemplate } from './conversationTemplates';
import { selectConversationScenario, toConversationActivityData } from './conversations';
import type { CurriculumLesson } from './curriculum';
import { GRAMMAR_PATTERNS } from './grammarPatterns';
import { PHONEME_MAP } from './phonemeMap';
import { resolveStoryAudioUrl, selectStoryForWords } from './storyBank';

// ===== VOCABULARY DATABASE =====
// Kelime → Türkçe çeviri + birden fazla örnek cümle
interface VocabEntry {
  tr: string;
  /** Emoji visual hint for the word */
  emoji?: string;
  sentence: string;
  sentenceTr: string;
  /** Additional sentences for variety — fill-blank, flash-card can pick different ones */
  altSentences?: Array<{ en: string; tr: string }>;
}

const vocabDB: Record<string, VocabEntry> = {
  // Animals
  dog: {
    tr: 'Köpek',
    sentence: 'The dog is happy.',
    sentenceTr: 'Köpek mutlu.',
    altSentences: [
      { en: 'My dog likes to play.', tr: 'Köpeğim oynamayı sever.' },
      { en: 'The dog runs in the garden.', tr: 'Köpek bahçede koşar.' },
    ],
  },
  cat: {
    tr: 'Kedi',
    sentence: 'The cat is sleeping.',
    sentenceTr: 'Kedi uyuyor.',
    altSentences: [
      { en: 'The cat drinks milk.', tr: 'Kedi süt içer.' },
      { en: 'My cat is black and white.', tr: 'Kedim siyah beyaz.' },
    ],
  },
  fish: {
    tr: 'Balık',
    sentence: 'The fish swims fast.',
    sentenceTr: 'Balık hızlı yüzer.',
    altSentences: [
      { en: 'The fish lives in water.', tr: 'Balık suda yaşar.' },
      { en: 'I like to watch the fish.', tr: 'Balığı izlemeyi severim.' },
    ],
  },
  bird: {
    tr: 'Kuş',
    sentence: 'The bird can fly.',
    sentenceTr: 'Kuş uçabilir.',
    altSentences: [
      { en: 'The bird sings in the morning.', tr: 'Kuş sabahları şarkı söyler.' },
      { en: 'A bird sits on the tree.', tr: 'Bir kuş ağaçta oturur.' },
    ],
  },
  rabbit: {
    tr: 'Tavşan',
    sentence: 'The rabbit is white.',
    sentenceTr: 'Tavşan beyaz.',
    altSentences: [
      { en: 'The rabbit eats carrots.', tr: 'Tavşan havuç yer.' },
      { en: 'The rabbit jumps high.', tr: 'Tavşan yükseğe zıplar.' },
    ],
  },
  cow: {
    tr: 'İnek',
    sentence: 'The cow gives milk.',
    sentenceTr: 'İnek süt verir.',
    altSentences: [{ en: 'The cow eats grass.', tr: 'İnek çimen yer.' }],
  },
  horse: {
    tr: 'At',
    sentence: 'The horse runs fast.',
    sentenceTr: 'At hızlı koşar.',
    altSentences: [{ en: 'I ride a horse.', tr: 'At binerim.' }],
  },
  sheep: {
    tr: 'Koyun',
    sentence: 'The sheep has wool.',
    sentenceTr: 'Koyunun yünü var.',
    altSentences: [
      { en: 'The sheep is big.', tr: 'Koyun büyük.' },
      { en: 'This is a sheep.', tr: 'Bu bir koyun.' },
      { en: 'There is a sheep.', tr: 'Bir koyun var.' },
    ],
  },
  pig: {
    tr: 'Domuz',
    sentence: 'The pig is pink.',
    sentenceTr: 'Domuz pembe.',
    altSentences: [
      { en: 'This is a pig.', tr: 'Bu bir domuz.' },
      { en: 'There is a pig.', tr: 'Bir domuz var.' },
      { en: 'Where is the pig?', tr: 'Domuz nerede?' },
    ],
  },
  chicken: {
    tr: 'Tavuk',
    sentence: 'The chicken lays eggs.',
    sentenceTr: 'Tavuk yumurta yapar.',
    altSentences: [
      { en: 'The chicken is big.', tr: 'Tavuk büyük.' },
      { en: 'This is a chicken.', tr: 'Bu bir tavuk.' },
      { en: 'There is a chicken.', tr: 'Bir tavuk var.' },
    ],
  },
  lion: {
    tr: 'Aslan',
    sentence: 'The lion is strong.',
    sentenceTr: 'Aslan güçlü.',
    altSentences: [
      { en: 'The lion is the king of animals.', tr: 'Aslan hayvanların kralı.' },
      { en: 'The lion roars loudly.', tr: 'Aslan yüksek sesle kükrer.' },
    ],
  },
  bear: {
    tr: 'Ayı',
    sentence: 'The bear likes honey.',
    sentenceTr: 'Ayı bal sever.',
    altSentences: [{ en: 'The bear sleeps in winter.', tr: 'Ayı kışın uyur.' }],
  },
  elephant: {
    tr: 'Fil',
    sentence: 'The elephant is big.',
    sentenceTr: 'Fil büyük.',
    altSentences: [{ en: 'The elephant has a long nose.', tr: 'Filin uzun burnu var.' }],
  },
  monkey: {
    tr: 'Maymun',
    sentence: 'The monkey climbs trees.',
    sentenceTr: 'Maymun ağaçlara tırmanır.',
    altSentences: [{ en: 'The monkey likes bananas.', tr: 'Maymun muz sever.' }],
  },
  tiger: {
    tr: 'Kaplan',
    sentence: 'The tiger has stripes.',
    sentenceTr: 'Kaplanın çizgileri var.',
    altSentences: [
      { en: 'There is a tiger.', tr: 'Bir kaplan var.' },
      { en: 'Where is the tiger?', tr: 'Kaplan nerede?' },
      { en: 'The tiger is here.', tr: 'Kaplan burada.' },
    ],
  },
  whale: {
    tr: 'Balina',
    sentence: 'The whale is huge.',
    sentenceTr: 'Balina devasa.',
    altSentences: [
      { en: 'The whale is here.', tr: 'Balina burada.' },
      { en: 'The whale is nice.', tr: 'Balina güzel.' },
      { en: 'I want a whale.', tr: 'Bir balina istiyorum.' },
    ],
  },
  shark: {
    tr: 'Köpekbalığı',
    sentence: 'The shark swims fast.',
    sentenceTr: 'Köpekbalığı hızlı yüzer.',
    altSentences: [
      { en: 'The shark is here.', tr: 'Köpekbalığı burada.' },
      { en: 'The shark is nice.', tr: 'Köpekbalığı güzel.' },
      { en: 'I want a shark.', tr: 'Bir köpekbalığı istiyorum.' },
    ],
  },
  dolphin: {
    tr: 'Yunus',
    sentence: 'The dolphin is smart.',
    sentenceTr: 'Yunus akıllı.',
    altSentences: [{ en: 'The dolphin jumps out of water.', tr: 'Yunus sudan zıplar.' }],
  },
  octopus: {
    tr: 'Ahtapot',
    sentence: 'The octopus has eight arms.',
    sentenceTr: 'Ahtapotun sekiz kolu var.',
    altSentences: [
      { en: 'The octopus is big.', tr: 'Ahtapot büyük.' },
      { en: 'This is an octopus.', tr: 'Bu bir ahtapot.' },
      { en: 'There is an octopus.', tr: 'Bir ahtapot var.' },
    ],
  },
  turtle: {
    tr: 'Kaplumbağa',
    sentence: 'The turtle is slow.',
    sentenceTr: 'Kaplumbağa yavaş.',
    altSentences: [
      { en: 'The house is slow.', tr: 'Ev yavaş.' },
      { en: 'That is slow too.', tr: 'O da yavaş.' },
      { en: 'This is slow.', tr: 'Bu yavaş.' },
    ],
  },

  // Colors
  red: {
    tr: 'Kırmızı',
    sentence: 'The apple is red.',
    sentenceTr: 'Elma kırmızı.',
    altSentences: [
      { en: 'I have a red ball.', tr: 'Kırmızı topum var.' },
      { en: 'The car is red.', tr: 'Araba kırmızı.' },
    ],
  },
  blue: {
    tr: 'Mavi',
    sentence: 'The sky is blue.',
    sentenceTr: 'Gökyüzü mavi.',
    altSentences: [
      { en: 'My shirt is blue.', tr: 'Gömleğim mavi.' },
      { en: 'The sea is blue.', tr: 'Deniz mavi.' },
    ],
  },
  yellow: {
    tr: 'Sarı',
    sentence: 'The sun is yellow.',
    sentenceTr: 'Güneş sarı.',
    altSentences: [
      { en: 'The banana is yellow.', tr: 'Muz sarı.' },
      { en: 'I see a yellow flower.', tr: 'Sarı bir çiçek görüyorum.' },
    ],
  },
  green: {
    tr: 'Yeşil',
    sentence: 'The grass is green.',
    sentenceTr: 'Çimen yeşil.',
    altSentences: [
      { en: 'The frog is green.', tr: 'Kurbağa yeşil.' },
      { en: 'I like the green tree.', tr: 'Yeşil ağacı severim.' },
    ],
  },
  orange: {
    tr: 'Turuncu',
    sentence: 'The orange is round.',
    sentenceTr: 'Portakal yuvarlak.',
    altSentences: [{ en: 'I like orange juice.', tr: 'Portakal suyu severim.' }],
  },
  purple: {
    tr: 'Mor',
    sentence: 'The flower is purple.',
    sentenceTr: 'Çiçek mor.',
    altSentences: [{ en: 'Grapes are purple.', tr: 'Üzümler mor.' }],
  },
  pink: {
    tr: 'Pembe',
    sentence: 'The pig is pink.',
    sentenceTr: 'Domuz pembe.',
    altSentences: [{ en: 'She has a pink dress.', tr: 'Pembe elbisesi var.' }],
  },
  brown: {
    tr: 'Kahverengi',
    sentence: 'The bear is brown.',
    sentenceTr: 'Ayı kahverengi.',
    altSentences: [{ en: 'The tree is brown.', tr: 'Ağaç kahverengi.' }],
  },
  black: {
    tr: 'Siyah',
    sentence: 'The cat is black.',
    sentenceTr: 'Kedi siyah.',
    altSentences: [{ en: 'I have black shoes.', tr: 'Siyah ayakkabılarım var.' }],
  },
  white: {
    tr: 'Beyaz',
    sentence: 'The rabbit is white.',
    sentenceTr: 'Tavşan beyaz.',
    altSentences: [{ en: 'Snow is white.', tr: 'Kar beyaz.' }],
  },
  'red bird': {
    tr: 'Kırmızı kuş',
    sentence: 'The red bird sings.',
    sentenceTr: 'Kırmızı kuş şarkı söyler.',
    altSentences: [
      { en: 'The red bird is nice.', tr: 'Kırmızı kuş güzel.' },
      { en: 'I want a red bird.', tr: 'Bir kırmızı kuş istiyorum.' },
      { en: 'I see a red bird.', tr: 'Bir kırmızı kuş görüyorum.' },
    ],
  },
  'blue fish': {
    tr: 'Mavi balık',
    sentence: 'The blue fish swims.',
    sentenceTr: 'Mavi balık yüzer.',
    altSentences: [
      { en: 'I see a blue fish.', tr: 'Bir mavi balık görüyorum.' },
      { en: 'The blue fish is big.', tr: 'Mavi balık büyük.' },
      { en: 'This is a blue fish.', tr: 'Bu bir mavi balık.' },
    ],
  },
  'green frog': {
    tr: 'Yeşil kurbağa',
    sentence: 'The green frog jumps.',
    sentenceTr: 'Yeşil kurbağa zıplar.',
    altSentences: [
      { en: 'I want a green frog.', tr: 'Bir yeşil kurbağa istiyorum.' },
      { en: 'I see a green frog.', tr: 'Bir yeşil kurbağa görüyorum.' },
      { en: 'The green frog is big.', tr: 'Yeşil kurbağa büyük.' },
    ],
  },
  'yellow duck': {
    tr: 'Sarı ördek',
    sentence: 'The yellow duck swims.',
    sentenceTr: 'Sarı ördek yüzer.',
    altSentences: [
      { en: 'There is a yellow duck.', tr: 'Bir sarı ördek var.' },
      { en: 'Where is the yellow duck?', tr: 'Sarı ördek nerede?' },
      { en: 'The yellow duck is here.', tr: 'Sarı ördek burada.' },
    ],
  },

  // Numbers
  one: {
    tr: 'Bir',
    sentence: 'I have one dog.',
    sentenceTr: 'Bir köpeğim var.',
    altSentences: [{ en: 'One bird is in the tree.', tr: 'Ağaçta bir kuş var.' }],
  },
  two: {
    tr: 'İki',
    sentence: 'I have two cats.',
    sentenceTr: 'İki kedim var.',
    altSentences: [{ en: 'Two fish swim in the water.', tr: 'Suda iki balık yüzer.' }],
  },
  three: {
    tr: 'Üç',
    sentence: 'Three birds fly.',
    sentenceTr: 'Üç kuş uçar.',
    altSentences: [{ en: 'I eat three apples.', tr: 'Üç elma yerim.' }],
  },
  four: {
    tr: 'Dört',
    sentence: 'I see four trees.',
    sentenceTr: 'Dört ağaç görüyorum.',
    altSentences: [{ en: 'Four ducks swim.', tr: 'Dört ördek yüzer.' }],
  },
  five: {
    tr: 'Beş',
    sentence: 'Five fish swim.',
    sentenceTr: 'Beş balık yüzer.',
    altSentences: [{ en: 'I have five pencils.', tr: 'Beş kalemim var.' }],
  },
  six: {
    tr: 'Altı',
    sentence: 'Six apples are red.',
    sentenceTr: 'Altı elma kırmızı.',
    altSentences: [
      { en: 'I have six apples.', tr: 'Altı elmam var.' },
      { en: 'There are six birds.', tr: 'Altı kuş var.' },
      { en: 'I can count to six.', tr: "Altı'e kadar sayabilirim." },
    ],
  },
  seven: {
    tr: 'Yedi',
    sentence: 'Seven days in a week.',
    sentenceTr: 'Haftada yedi gün var.',
    altSentences: [
      { en: 'I have seven apples.', tr: 'Yedi elmam var.' },
      { en: 'There are seven birds.', tr: 'Yedi kuş var.' },
      { en: 'I can count to seven.', tr: "Yedi'e kadar sayabilirim." },
    ],
  },
  eight: {
    tr: 'Sekiz',
    sentence: 'Octopus has eight arms.',
    sentenceTr: 'Ahtapotun sekiz kolu var.',
    altSentences: [
      { en: 'I have eight apples.', tr: 'Sekiz elmam var.' },
      { en: 'There are eight birds.', tr: 'Sekiz kuş var.' },
      { en: 'I can count to eight.', tr: "Sekiz'e kadar sayabilirim." },
    ],
  },
  nine: {
    tr: 'Dokuz',
    sentence: 'Nine birds in the tree.',
    sentenceTr: 'Ağaçta dokuz kuş var.',
    altSentences: [
      { en: 'I have nine apples.', tr: 'Dokuz elmam var.' },
      { en: 'There are nine birds.', tr: 'Dokuz kuş var.' },
      { en: 'I can count to nine.', tr: "Dokuz'e kadar sayabilirim." },
    ],
  },
  ten: {
    tr: 'On',
    sentence: 'I count to ten.',
    sentenceTr: 'Ona kadar sayarım.',
    altSentences: [
      { en: 'I have ten apples.', tr: 'On elmam var.' },
      { en: 'There are ten birds.', tr: 'On kuş var.' },
      { en: 'I can count to ten.', tr: "On'e kadar sayabilirim." },
    ],
  },
  eleven: {
    tr: 'On bir',
    sentence: 'There are eleven players.',
    sentenceTr: 'On bir oyuncu var.',
    altSentences: [
      { en: 'I have eleven apples.', tr: 'On bir elmam var.' },
      { en: 'There are eleven birds.', tr: 'On bir kuş var.' },
      { en: 'I can count to eleven.', tr: "On bir'e kadar sayabilirim." },
    ],
  },
  twelve: {
    tr: 'On iki',
    sentence: 'There are twelve months.',
    sentenceTr: 'On iki ay var.',
    altSentences: [
      { en: 'I have twelve apples.', tr: 'On iki elmam var.' },
      { en: 'There are twelve birds.', tr: 'On iki kuş var.' },
      { en: 'I can count to twelve.', tr: "On iki'e kadar sayabilirim." },
    ],
  },
  thirteen: {
    tr: 'On üç',
    sentence: 'I am thirteen years old.',
    sentenceTr: 'On üç yaşındayım.',
    altSentences: [
      { en: 'I have thirteen apples.', tr: 'On üç elmam var.' },
      { en: 'There are thirteen birds.', tr: 'On üç kuş var.' },
      { en: 'I can count to thirteen.', tr: "On üç'e kadar sayabilirim." },
    ],
  },
  fourteen: {
    tr: 'On dört',
    sentence: 'Fourteen flowers bloom.',
    sentenceTr: 'On dört çiçek açar.',
    altSentences: [
      { en: 'I have fourteen apples.', tr: 'On dört elmam var.' },
      { en: 'There are fourteen birds.', tr: 'On dört kuş var.' },
      { en: 'I can count to fourteen.', tr: "On dört'e kadar sayabilirim." },
    ],
  },
  fifteen: {
    tr: 'On beş',
    sentence: 'Fifteen minutes left.',
    sentenceTr: 'On beş dakika kaldı.',
    altSentences: [
      { en: 'I have fifteen apples.', tr: 'On beş elmam var.' },
      { en: 'There are fifteen birds.', tr: 'On beş kuş var.' },
      { en: 'I can count to fifteen.', tr: "On beş'e kadar sayabilirim." },
    ],
  },
  twenty: {
    tr: 'Yirmi',
    sentence: 'There are twenty students.',
    sentenceTr: 'Yirmi öğrenci var.',
    altSentences: [
      { en: 'I have twenty apples.', tr: 'Yirmi elmam var.' },
      { en: 'There are twenty birds.', tr: 'Yirmi kuş var.' },
      { en: 'I can count to twenty.', tr: "Yirmi'e kadar sayabilirim." },
    ],
  },
  thirty: {
    tr: 'Otuz',
    sentence: 'There are thirty days in a month.',
    sentenceTr: 'Bir ayda otuz gün var.',
    altSentences: [
      { en: 'I have thirty marbles.', tr: 'Otuz bilyem var.' },
      { en: 'The bus comes in thirty minutes.', tr: 'Otobüs otuz dakikaya gelir.' },
      { en: 'She is thirty years old.', tr: 'O otuz yaşında.' },
    ],
  },
  forty: {
    tr: 'Kırk',
    sentence: 'My uncle is forty years old.',
    sentenceTr: 'Amcam kırk yaşında.',
    altSentences: [
      { en: 'I can count to forty.', tr: "Kırk'a kadar sayabilirim." },
      { en: 'There are forty chairs.', tr: 'Kırk sandalye var.' },
      { en: 'We have forty books.', tr: 'Kırk kitabımız var.' },
    ],
  },
  fifty: {
    tr: 'Elli',
    sentence: 'I have fifty stickers.',
    sentenceTr: 'Elli çıkartmam var.',
    altSentences: [
      { en: 'Fifty students are in the school.', tr: 'Okulda elli öğrenci var.' },
      { en: 'It costs fifty dollars.', tr: 'Elli dolar tutar.' },
      { en: 'I counted to fifty.', tr: "Elli'ye kadar saydım." },
    ],
  },
  sixty: {
    tr: 'Altmış',
    sentence: 'There are sixty seconds in a minute.',
    sentenceTr: 'Bir dakikada altmış saniye var.',
    altSentences: [
      { en: 'My grandmother is sixty.', tr: 'Büyükannem altmış yaşında.' },
      { en: 'I have sixty cards.', tr: 'Altmış kartım var.' },
      { en: 'Sixty minutes make one hour.', tr: 'Altmış dakika bir saat eder.' },
    ],
  },
  seventy: {
    tr: 'Yetmiş',
    sentence: 'My grandfather is seventy years old.',
    sentenceTr: 'Dedem yetmiş yaşında.',
    altSentences: [
      { en: 'There are seventy trees.', tr: 'Yetmiş ağaç var.' },
      { en: 'I counted seventy stars.', tr: 'Yetmiş yıldız saydım.' },
      { en: 'Seventy birds flew away.', tr: 'Yetmiş kuş uçtu.' },
    ],
  },
  eighty: {
    tr: 'Seksen',
    sentence: 'Eighty children play in the park.',
    sentenceTr: 'Seksen çocuk parkta oynuyor.',
    altSentences: [
      { en: 'The book has eighty pages.', tr: 'Kitabın seksen sayfası var.' },
      { en: 'I have eighty crayons.', tr: 'Seksen boya kalemim var.' },
      { en: 'Eighty flowers are blooming.', tr: 'Seksen çiçek açıyor.' },
    ],
  },
  ninety: {
    tr: 'Doksan',
    sentence: 'She scored ninety on the test.',
    sentenceTr: 'Sınavdan doksan aldı.',
    altSentences: [
      { en: 'There are ninety apples.', tr: 'Doksan elma var.' },
      { en: 'I can count to ninety.', tr: "Doksan'a kadar sayabilirim." },
      { en: 'Ninety birds are singing.', tr: 'Doksan kuş şarkı söylüyor.' },
    ],
  },
  hundred: {
    tr: 'Yüz',
    sentence: 'I can count to one hundred!',
    sentenceTr: 'Yüze kadar sayabilirim!',
    altSentences: [
      { en: 'There are a hundred stars.', tr: 'Yüz yıldız var.' },
      { en: 'She got a hundred on her test.', tr: 'Sınavdan yüz aldı.' },
      { en: 'One hundred is a big number.', tr: 'Yüz büyük bir sayı.' },
    ],
  },

  // Articles & Auxiliary Verbs
  a: {
    tr: 'Bir (belirsiz)',
    sentence: 'I see a dog in the park.',
    sentenceTr: 'Parkta bir köpek görüyorum.',
    altSentences: [
      { en: 'She has a cat.', tr: 'Bir kedisi var.' },
      { en: 'I ate a banana.', tr: 'Bir muz yedim.' },
      { en: 'There is a book on the table.', tr: 'Masada bir kitap var.' },
    ],
  },
  an: {
    tr: 'Bir (sesli harf öncesi)',
    sentence: 'I eat an apple every day.',
    sentenceTr: 'Her gün bir elma yerim.',
    altSentences: [
      { en: 'She has an umbrella.', tr: 'Bir şemsiyesi var.' },
      { en: 'He is an artist.', tr: 'O bir sanatçı.' },
      { en: 'I see an elephant.', tr: 'Bir fil görüyorum.' },
    ],
  },
  the: {
    tr: '(Belirli tanımlık)',
    sentence: 'The cat is on the chair.',
    sentenceTr: 'Kedi sandalyenin üstünde.',
    altSentences: [
      { en: 'Open the door, please.', tr: 'Kapıyı aç, lütfen.' },
      { en: 'The sun is bright today.', tr: 'Güneş bugün parlak.' },
      { en: 'The children are playing.', tr: 'Çocuklar oynuyor.' },
    ],
  },
  do: {
    tr: 'Yapmak (yardimci)',
    sentence: 'Do you like ice cream?',
    sentenceTr: 'Dondurma sever misin?',
    altSentences: [
      { en: 'Do you have a pen?', tr: 'Kalemin var mı?' },
      { en: 'I do my homework.', tr: 'Ödevimi yaparım.' },
      { en: 'Do you speak English?', tr: 'İngilizce konuşuyor musun?' },
    ],
  },
  does: {
    tr: 'Yapar (3. tekil)',
    sentence: 'Does she like cats?',
    sentenceTr: 'Kedileri sever mi?',
    altSentences: [
      { en: 'Does he play football?', tr: 'Futbol oynar mı?' },
      { en: 'Does it rain today?', tr: 'Bugün yağmur yağıyor mu?' },
      { en: 'She does her homework.', tr: 'Ödevini yapar.' },
    ],
  },
  did: {
    tr: 'Yaptı (geçmiş)',
    sentence: 'Did you eat breakfast?',
    sentenceTr: 'Kahvaltı yedin mi?',
    altSentences: [
      { en: 'Did she go to school?', tr: 'Okula gitti mi?' },
      { en: 'I did my best.', tr: 'Elimden gelenin en iyisini yaptım.' },
      { en: 'Did you see the movie?', tr: 'Filmi gördün mü?' },
    ],
  },
  can: {
    tr: 'Yapabilmek',
    sentence: 'I can swim very fast.',
    sentenceTr: 'Çok hızlı yüzebilirim.',
    altSentences: [
      { en: 'Can you help me?', tr: 'Bana yardım edebilir misin?' },
      { en: 'She can speak English.', tr: 'İngilizce konuşabilir.' },
      { en: 'Birds can fly.', tr: 'Kuşlar uçabilir.' },
    ],
  },
  should: {
    tr: 'Yapmalı',
    sentence: 'You should drink water.',
    sentenceTr: 'Su içmelisin.',
    altSentences: [
      { en: 'We should be kind.', tr: 'Nazik olmalıyız.' },
      { en: 'You should go to bed early.', tr: 'Erken yatmalısın.' },
      { en: 'She should study more.', tr: 'Daha fazla çalışmalı.' },
    ],
  },
  must: {
    tr: 'Zorunda/Mutlaka',
    sentence: 'You must wash your hands.',
    sentenceTr: 'Ellerini yıkamak zorundasın.',
    altSentences: [
      { en: 'We must be quiet in the library.', tr: 'Kütüphanede sessiz olmalıyız.' },
      { en: 'You must wear a seatbelt.', tr: 'Emniyet kemeri takmalısın.' },
      { en: 'She must finish her homework.', tr: 'Ödevini bitirmek zorunda.' },
    ],
  },

  // Body
  eye: {
    tr: 'Göz',
    sentence: 'I see with my eyes.',
    sentenceTr: 'Gözlerimle görürüm.',
    altSentences: [
      { en: 'There is an eye.', tr: 'Bir göz var.' },
      { en: 'Where is the eye?', tr: 'Göz nerede?' },
      { en: 'The eye is here.', tr: 'Göz burada.' },
    ],
  },
  nose: {
    tr: 'Burun',
    sentence: 'I smell with my nose.',
    sentenceTr: 'Burnumla koklarım.',
    altSentences: [
      { en: 'The nose is big.', tr: 'Burun büyük.' },
      { en: 'This is a nose.', tr: 'Bu bir burun.' },
      { en: 'There is a nose.', tr: 'Bir burun var.' },
    ],
  },
  mouth: {
    tr: 'Ağız',
    sentence: 'I eat with my mouth.',
    sentenceTr: 'Ağzımla yerim.',
    altSentences: [
      { en: 'The mouth is big.', tr: 'Ağız büyük.' },
      { en: 'This is a mouth.', tr: 'Bu bir ağız.' },
      { en: 'There is a mouth.', tr: 'Bir ağız var.' },
    ],
  },
  ear: {
    tr: 'Kulak',
    sentence: 'I hear with my ears.',
    sentenceTr: 'Kulaklarımla duyarım.',
    altSentences: [
      { en: 'This is an ear.', tr: 'Bu bir kulak.' },
      { en: 'There is an ear.', tr: 'Bir kulak var.' },
      { en: 'Where is the ear?', tr: 'Kulak nerede?' },
    ],
  },
  hair: {
    tr: 'Saç',
    sentence: 'My hair is brown.',
    sentenceTr: 'Saçım kahverengi.',
    altSentences: [
      { en: 'The hair is nice.', tr: 'Saç güzel.' },
      { en: 'I want a hair.', tr: 'Bir saç istiyorum.' },
      { en: 'I see a hair.', tr: 'Bir saç görüyorum.' },
    ],
  },
  hand: {
    tr: 'El',
    sentence: 'I wave my hand.',
    sentenceTr: 'Elimi sallarım.',
    altSentences: [
      { en: 'There is a hand.', tr: 'Bir el var.' },
      { en: 'Where is the hand?', tr: 'El nerede?' },
      { en: 'The hand is here.', tr: 'El burada.' },
    ],
  },
  foot: {
    tr: 'Ayak',
    sentence: 'I walk with my feet.',
    sentenceTr: 'Ayaklarımla yürürüm.',
    altSentences: [
      { en: 'This is a foot.', tr: 'Bu bir ayak.' },
      { en: 'There is a foot.', tr: 'Bir ayak var.' },
      { en: 'Where is the foot?', tr: 'Ayak nerede?' },
    ],
  },
  arm: {
    tr: 'Kol',
    sentence: 'I raise my arm.',
    sentenceTr: 'Kolumu kaldırırım.',
    altSentences: [
      { en: 'This is an arm.', tr: 'Bu bir kol.' },
      { en: 'There is an arm.', tr: 'Bir kol var.' },
      { en: 'Where is the arm?', tr: 'Kol nerede?' },
    ],
  },
  leg: {
    tr: 'Bacak',
    sentence: 'I run with my legs.',
    sentenceTr: 'Bacaklarımla koşarım.',
    altSentences: [
      { en: 'This is a leg.', tr: 'Bu bir bacak.' },
      { en: 'There is a leg.', tr: 'Bir bacak var.' },
      { en: 'Where is the leg?', tr: 'Bacak nerede?' },
    ],
  },
  head: {
    tr: 'Baş',
    sentence: 'I wear a hat on my head.',
    sentenceTr: 'Başıma şapka takarım.',
    altSentences: [
      { en: 'I see a head.', tr: 'Bir baş görüyorum.' },
      { en: 'The head is big.', tr: 'Baş büyük.' },
      { en: 'This is a head.', tr: 'Bu bir baş.' },
    ],
  },

  // Family & Greetings
  mother: {
    tr: 'Anne',
    sentence: 'My mother is kind.',
    sentenceTr: 'Annem iyi kalpli.',
    altSentences: [
      { en: 'My mother cooks well.', tr: 'Annem güzel yemek yapar.' },
      { en: 'I love my mother.', tr: 'Annemi severim.' },
    ],
  },
  father: {
    tr: 'Baba',
    sentence: 'My father is tall.',
    sentenceTr: 'Babam uzun boylu.',
    altSentences: [
      { en: 'My father reads a book.', tr: 'Babam kitap okur.' },
      { en: 'I play with my father.', tr: 'Babamla oynarım.' },
    ],
  },
  sister: {
    tr: 'Kız kardeş',
    sentence: 'My sister is young.',
    sentenceTr: 'Kız kardeşim genç.',
    altSentences: [{ en: 'My sister draws pictures.', tr: 'Kız kardeşim resim çizer.' }],
  },
  brother: {
    tr: 'Erkek kardeş',
    sentence: 'My brother plays football.',
    sentenceTr: 'Erkek kardeşim futbol oynar.',
    altSentences: [{ en: 'My brother is funny.', tr: 'Erkek kardeşim komik.' }],
  },
  baby: {
    tr: 'Bebek',
    sentence: 'The baby is cute.',
    sentenceTr: 'Bebek sevimli.',
    altSentences: [{ en: 'The baby is laughing.', tr: 'Bebek gülüyor.' }],
  },
  hello: {
    tr: 'Merhaba',
    sentence: 'Hello, how are you?',
    sentenceTr: 'Merhaba, nasılsın?',
    altSentences: [{ en: 'Hello, my name is Nova!', tr: 'Merhaba, benim adım Nova!' }],
  },
  goodbye: {
    tr: 'Güle güle',
    sentence: 'Goodbye, see you!',
    sentenceTr: 'Güle güle, görüşürüz!',
    altSentences: [
      { en: 'The goodbye is here.', tr: 'Güle güle burada.' },
      { en: 'The goodbye is nice.', tr: 'Güle güle güzel.' },
      { en: 'I want a goodbye.', tr: 'Bir güle güle istiyorum.' },
    ],
  },
  'thank you': {
    tr: 'Teşekkür ederim',
    sentence: 'Thank you for the gift.',
    sentenceTr: 'Hediye için teşekkür ederim.',
    altSentences: [
      { en: 'There is a thank you.', tr: 'Bir teşekkür ederim var.' },
      { en: 'Where is the thank you?', tr: 'Teşekkür ederim nerede?' },
      { en: 'The thank you is here.', tr: 'Teşekkür ederim burada.' },
    ],
  },
  please: {
    tr: 'Lütfen',
    sentence: 'Please sit down.',
    sentenceTr: 'Lütfen oturun.',
    altSentences: [
      { en: 'I see a please.', tr: 'Bir lütfen görüyorum.' },
      { en: 'The please is big.', tr: 'Lütfen büyük.' },
      { en: 'This is a please.', tr: 'Bu bir lütfen.' },
    ],
  },
  sorry: {
    tr: 'Özür dilerim',
    sentence: 'I am sorry.',
    sentenceTr: 'Özür dilerim.',
    altSentences: [
      { en: 'I want a sorry.', tr: 'Bir özür dilerim istiyorum.' },
      { en: 'I see a sorry.', tr: 'Bir özür dilerim görüyorum.' },
      { en: 'The sorry is big.', tr: 'Özür dilerim büyük.' },
    ],
  },
  'I am': {
    tr: 'Ben ...im',
    sentence: 'I am happy.',
    sentenceTr: 'Mutluyum.',
    altSentences: [
      { en: 'I am a student.', tr: 'Ben bir öğrenciyim.' },
      { en: 'I am at home.', tr: 'Evdeyim.' },
      { en: 'I am very happy.', tr: 'Çok mutluyum.' },
    ],
  },
  'My name is': {
    tr: 'Benim adım',
    sentence: 'My name is Nova.',
    sentenceTr: 'Benim adım Nova.',
    altSentences: [
      { en: 'There is a My name is.', tr: 'Bir benim adım var.' },
      { en: 'Where is the My name is?', tr: 'Benim adım nerede?' },
      { en: 'The My name is is here.', tr: 'Benim adım burada.' },
    ],
  },
  'I like': {
    tr: 'Seviyorum',
    sentence: 'I like apples.',
    sentenceTr: 'Elma severim.',
    altSentences: [
      { en: 'I like sunny days.', tr: 'Güneşli günleri severim.' },
      { en: 'I like my school.', tr: 'Okulumu severim.' },
      { en: 'I like to draw.', tr: 'Çizim yapmayı severim.' },
    ],
  },
  'How are you': {
    tr: 'Nasılsın',
    sentence: 'How are you today?',
    sentenceTr: 'Bugün nasılsın?',
    altSentences: [
      { en: 'How are you today?', tr: 'Bugün nasılsın?' },
      { en: 'How are you doing?', tr: 'Nasıl gidiyor?' },
      { en: 'How are you, my friend?', tr: 'Nasılsın arkadaşım?' },
    ],
  },
  Fine: {
    tr: 'İyiyim',
    sentence: 'I am fine, thank you.',
    sentenceTr: 'İyiyim, teşekkürler.',
    altSentences: [
      { en: 'I see a Fine.', tr: 'Bir i̇yiyim görüyorum.' },
      { en: 'The Fine is big.', tr: 'İyiyim büyük.' },
      { en: 'This is a Fine.', tr: 'Bu bir i̇yiyim.' },
    ],
  },

  // Food & Drinks
  apple: {
    tr: 'Elma',
    sentence: 'The apple is red.',
    sentenceTr: 'Elma kırmızı.',
    altSentences: [
      { en: 'I eat an apple every day.', tr: 'Her gün bir elma yerim.' },
      { en: 'The apple is very sweet.', tr: 'Elma çok tatlı.' },
    ],
  },
  banana: {
    tr: 'Muz',
    sentence: 'The banana is yellow.',
    sentenceTr: 'Muz sarı.',
    altSentences: [
      { en: 'The monkey eats a banana.', tr: 'Maymun muz yer.' },
      { en: 'I like bananas.', tr: 'Muz severim.' },
    ],
  },
  grape: {
    tr: 'Üzüm',
    sentence: 'I eat grapes.',
    sentenceTr: 'Üzüm yerim.',
    altSentences: [{ en: 'Grapes are purple.', tr: 'Üzümler mor.' }],
  },
  strawberry: {
    tr: 'Çilek',
    sentence: 'Strawberries are sweet.',
    sentenceTr: 'Çilekler tatlı.',
    altSentences: [{ en: 'I pick strawberries in summer.', tr: 'Yazın çilek toplarım.' }],
  },
  carrot: {
    tr: 'Havuç',
    sentence: 'Rabbits eat carrots.',
    sentenceTr: 'Tavşanlar havuç yer.',
    altSentences: [{ en: 'The carrot is orange.', tr: 'Havuç turuncu.' }],
  },
  tomato: {
    tr: 'Domates',
    sentence: 'The tomato is red.',
    sentenceTr: 'Domates kırmızı.',
    altSentences: [
      { en: 'The tomato is nice.', tr: 'Domates güzel.' },
      { en: 'I want a tomato.', tr: 'Bir domates istiyorum.' },
      { en: 'I see a tomato.', tr: 'Bir domates görüyorum.' },
    ],
  },
  potato: {
    tr: 'Patates',
    sentence: 'I like potatoes.',
    sentenceTr: 'Patates severim.',
    altSentences: [
      { en: 'I want a potato.', tr: 'Bir patates istiyorum.' },
      { en: 'I see a potato.', tr: 'Bir patates görüyorum.' },
      { en: 'The potato is big.', tr: 'Patates büyük.' },
    ],
  },
  onion: {
    tr: 'Soğan',
    sentence: 'Onions make you cry.',
    sentenceTr: 'Soğan ağlatır.',
    altSentences: [
      { en: 'There is an onion.', tr: 'Bir soğan var.' },
      { en: 'Where is the onion?', tr: 'Soğan nerede?' },
      { en: 'The onion is here.', tr: 'Soğan burada.' },
    ],
  },
  pepper: {
    tr: 'Biber',
    sentence: 'The pepper is green.',
    sentenceTr: 'Biber yeşil.',
    altSentences: [
      { en: 'The pepper is nice.', tr: 'Biber güzel.' },
      { en: 'I want a pepper.', tr: 'Bir biber istiyorum.' },
      { en: 'I see a pepper.', tr: 'Bir biber görüyorum.' },
    ],
  },
  water: {
    tr: 'Su',
    sentence: 'I drink water every day.',
    sentenceTr: 'Her gün su içerim.',
    altSentences: [
      { en: 'Water is good for you.', tr: 'Su sağlığa iyi.' },
      { en: 'Fish live in water.', tr: 'Balıklar suda yaşar.' },
    ],
  },
  milk: {
    tr: 'Süt',
    sentence: 'Milk is white.',
    sentenceTr: 'Süt beyaz.',
    altSentences: [{ en: 'I drink milk in the morning.', tr: 'Sabah süt içerim.' }],
  },
  juice: {
    tr: 'Meyve suyu',
    sentence: 'I like orange juice.',
    sentenceTr: 'Portakal suyu severim.',
    altSentences: [
      { en: 'This is a juice.', tr: 'Bu bir meyve suyu.' },
      { en: 'There is a juice.', tr: 'Bir meyve suyu var.' },
      { en: 'Where is the juice?', tr: 'Meyve suyu nerede?' },
    ],
  },
  tea: {
    tr: 'Çay',
    sentence: 'Turkish tea is delicious.',
    sentenceTr: 'Türk çayı lezzetli.',
    altSentences: [
      { en: 'I see a tea.', tr: 'Bir çay görüyorum.' },
      { en: 'The tea is big.', tr: 'Çay büyük.' },
      { en: 'This is a tea.', tr: 'Bu bir çay.' },
    ],
  },
  coffee: {
    tr: 'Kahve',
    sentence: 'My dad drinks coffee.',
    sentenceTr: 'Babam kahve içer.',
    altSentences: [
      { en: 'This is a coffee.', tr: 'Bu bir kahve.' },
      { en: 'There is a coffee.', tr: 'Bir kahve var.' },
      { en: 'Where is the coffee?', tr: 'Kahve nerede?' },
    ],
  },
  "I don't like": {
    tr: 'Sevmiyorum',
    sentence: "I don't like onions.",
    sentenceTr: 'Soğan sevmiyorum.',
    altSentences: [
      { en: "I see an I don't like.", tr: 'Bir sevmiyorum görüyorum.' },
      { en: "The I don't like is big.", tr: 'Sevmiyorum büyük.' },
      { en: "This is an I don't like.", tr: 'Bu bir sevmiyorum.' },
    ],
  },
  'Do you like': {
    tr: 'Sever misin',
    sentence: 'Do you like bananas?',
    sentenceTr: 'Muz sever misin?',
    altSentences: [
      { en: 'The Do you like is big.', tr: 'Sever misin büyük.' },
      { en: 'This is a Do you like.', tr: 'Bu bir sever misin.' },
      { en: 'There is a Do you like.', tr: 'Bir sever misin var.' },
    ],
  },
  Yes: {
    tr: 'Evet',
    sentence: 'Yes, I do!',
    sentenceTr: 'Evet, severim!',
    altSentences: [
      { en: 'The Yes is here.', tr: 'Evet burada.' },
      { en: 'The Yes is nice.', tr: 'Evet güzel.' },
      { en: 'I want a Yes.', tr: 'Bir evet istiyorum.' },
    ],
  },
  No: {
    tr: 'Hayır',
    sentence: "No, I don't.",
    sentenceTr: 'Hayır, sevmem.',
    altSentences: [
      { en: 'The No is big.', tr: 'Hayır büyük.' },
      { en: 'This is a No.', tr: 'Bu bir hayır.' },
      { en: 'There is a No.', tr: 'Bir hayır var.' },
    ],
  },

  // Grammar — to be / have
  'You are': {
    tr: 'Sen ...sin',
    sentence: 'You are my friend.',
    sentenceTr: 'Sen benim arkadaşımsın.',
    altSentences: [
      { en: 'The You are is big.', tr: 'Sen ...sin büyük.' },
      { en: 'This is a You are.', tr: 'Bu bir sen ...sin.' },
      { en: 'There is a You are.', tr: 'Bir sen ...sin var.' },
    ],
  },
  'He is': {
    tr: 'O (erkek) ...dır',
    sentence: 'He is tall.',
    sentenceTr: 'O uzun boylu.',
    altSentences: [
      { en: 'He is my brother.', tr: 'O benim erkek kardeşim.' },
      { en: 'He is very tall.', tr: 'O çok uzun.' },
      { en: 'He is in the garden.', tr: 'O bahçede.' },
    ],
  },
  'She is': {
    tr: 'O (kız) ...dır',
    sentence: 'She is smart.',
    sentenceTr: 'O akıllı.',
    altSentences: [
      { en: 'She is my sister.', tr: 'O benim kız kardeşim.' },
      { en: 'She is very kind.', tr: 'O çok nazik.' },
      { en: 'She is at school.', tr: 'O okulda.' },
    ],
  },
  'It is': {
    tr: 'O (nesne) ...dır',
    sentence: 'It is a book.',
    sentenceTr: 'O bir kitap.',
    altSentences: [
      { en: 'The It is is here.', tr: 'O (nesne) ...dır burada.' },
      { en: 'The It is is nice.', tr: 'O (nesne) ...dır güzel.' },
      { en: 'I want an It is.', tr: 'Bir o (nesne) ...dır istiyorum.' },
    ],
  },
  'We are': {
    tr: 'Biz ...iz',
    sentence: 'We are friends.',
    sentenceTr: 'Biz arkadaşız.',
    altSentences: [
      { en: 'We are friends.', tr: 'Biz arkadaşız.' },
      { en: 'We are at the park.', tr: 'Parkta yız.' },
      { en: 'We are happy today.', tr: 'Bugün mutluyuz.' },
    ],
  },
  'They are': {
    tr: 'Onlar ...lar',
    sentence: 'They are playing.',
    sentenceTr: 'Onlar oynuyor.',
    altSentences: [
      { en: 'I see a They are.', tr: 'Bir onlar ...lar görüyorum.' },
      { en: 'The They are is big.', tr: 'Onlar ...lar büyük.' },
      { en: 'This is a They are.', tr: 'Bu bir onlar ...lar.' },
    ],
  },
  happy: {
    tr: 'Mutlu',
    sentence: 'I am happy today.',
    sentenceTr: 'Bugün mutluyum.',
    altSentences: [
      { en: 'The dog is happy.', tr: 'Köpek mutlu.' },
      { en: 'We are happy together.', tr: 'Birlikte mutluyuz.' },
    ],
  },
  sad: {
    tr: 'Üzgün',
    sentence: 'The boy is sad.',
    sentenceTr: 'Çocuk üzgün.',
    altSentences: [{ en: 'I am sad today.', tr: 'Bugün üzgünüm.' }],
  },
  big: {
    tr: 'Büyük',
    sentence: 'The elephant is big.',
    sentenceTr: 'Fil büyük.',
    altSentences: [{ en: 'I have a big house.', tr: 'Büyük bir evim var.' }],
  },
  small: {
    tr: 'Küçük',
    sentence: 'The mouse is small.',
    sentenceTr: 'Fare küçük.',
    altSentences: [{ en: 'The ant is very small.', tr: 'Karınca çok küçük.' }],
  },
  'I have': {
    tr: 'Benim var',
    sentence: 'I have a book.',
    sentenceTr: 'Bir kitabım var.',
    altSentences: [
      { en: 'I have a blue pen.', tr: 'Mavi bir kalemim var.' },
      { en: 'I have many friends.', tr: 'Çok arkadaşım var.' },
      { en: 'I have a pet cat.', tr: 'Evcil bir kedim var.' },
    ],
  },
  'She has': {
    tr: 'Onun var (kız)',
    sentence: 'She has a cat.',
    sentenceTr: 'Onun bir kedisi var.',
    altSentences: [
      { en: 'The She has is nice.', tr: 'Onun var (kız) güzel.' },
      { en: 'I want a She has.', tr: 'Bir onun var (kız) istiyorum.' },
      { en: 'I see a She has.', tr: 'Bir onun var (kız) görüyorum.' },
    ],
  },
  'He has': {
    tr: 'Onun var (erkek)',
    sentence: 'He has a dog.',
    sentenceTr: 'Onun bir köpeği var.',
    altSentences: [
      { en: 'The He has is here.', tr: 'Onun var (erkek) burada.' },
      { en: 'The He has is nice.', tr: 'Onun var (erkek) güzel.' },
      { en: 'I want a He has.', tr: 'Bir onun var (erkek) istiyorum.' },
    ],
  },
  'We have': {
    tr: 'Bizim var',
    sentence: 'We have a garden.',
    sentenceTr: 'Bahçemiz var.',
    altSentences: [
      { en: 'This is a We have.', tr: 'Bu bir bizim var.' },
      { en: 'There is a We have.', tr: 'Bir bizim var var.' },
      { en: 'Where is the We have?', tr: 'Bizim var nerede?' },
    ],
  },
  'a dog': {
    tr: 'bir köpek',
    sentence: 'I have a dog.',
    sentenceTr: 'Bir köpeğim var.',
    altSentences: [
      { en: 'There is an a dog.', tr: 'Bir bir köpek var.' },
      { en: 'Where is the a dog?', tr: 'bir köpek nerede?' },
      { en: 'The a dog is here.', tr: 'bir köpek burada.' },
    ],
  },
  'a cat': {
    tr: 'bir kedi',
    sentence: 'She has a cat.',
    sentenceTr: 'Onun bir kedisi var.',
    altSentences: [
      { en: 'The a cat is here.', tr: 'bir kedi burada.' },
      { en: 'The a cat is nice.', tr: 'bir kedi güzel.' },
      { en: 'I want an a cat.', tr: 'Bir bir kedi istiyorum.' },
    ],
  },

  // Home & School
  house: {
    tr: 'Ev',
    sentence: 'This is my house.',
    sentenceTr: 'Bu benim evim.',
    altSentences: [
      { en: 'The house is nice.', tr: 'Ev güzel.' },
      { en: 'I want a house.', tr: 'Bir ev istiyorum.' },
      { en: 'I see a house.', tr: 'Bir ev görüyorum.' },
    ],
  },
  room: {
    tr: 'Oda',
    sentence: 'My room is clean.',
    sentenceTr: 'Odam temiz.',
    altSentences: [
      { en: 'The room is big.', tr: 'Oda büyük.' },
      { en: 'This is a room.', tr: 'Bu bir oda.' },
      { en: 'There is a room.', tr: 'Bir oda var.' },
    ],
  },
  kitchen: {
    tr: 'Mutfak',
    sentence: 'Mom is in the kitchen.',
    sentenceTr: 'Anne mutfakta.',
    altSentences: [
      { en: 'Where is the kitchen?', tr: 'Mutfak nerede?' },
      { en: 'The kitchen is here.', tr: 'Mutfak burada.' },
      { en: 'The kitchen is nice.', tr: 'Mutfak güzel.' },
    ],
  },
  garden: {
    tr: 'Bahçe',
    sentence: 'We play in the garden.',
    sentenceTr: 'Bahçede oynarız.',
    altSentences: [
      { en: 'The garden is here.', tr: 'Bahçe burada.' },
      { en: 'The garden is nice.', tr: 'Bahçe güzel.' },
      { en: 'I want a garden.', tr: 'Bir bahçe istiyorum.' },
    ],
  },
  door: {
    tr: 'Kapı',
    sentence: 'Please close the door.',
    sentenceTr: 'Lütfen kapıyı kapat.',
    altSentences: [
      { en: 'The door is nice.', tr: 'Kapı güzel.' },
      { en: 'I want a door.', tr: 'Bir kapı istiyorum.' },
      { en: 'I see a door.', tr: 'Bir kapı görüyorum.' },
    ],
  },
  window: {
    tr: 'Pencere',
    sentence: 'Open the window.',
    sentenceTr: 'Pencereyi aç.',
    altSentences: [
      { en: 'This is a window.', tr: 'Bu bir pencere.' },
      { en: 'There is a window.', tr: 'Bir pencere var.' },
      { en: 'Where is the window?', tr: 'Pencere nerede?' },
    ],
  },
  school: {
    tr: 'Okul',
    sentence: 'I go to school.',
    sentenceTr: 'Okula giderim.',
    altSentences: [
      { en: 'This is a school.', tr: 'Bu bir okul.' },
      { en: 'There is a school.', tr: 'Bir okul var.' },
      { en: 'Where is the school?', tr: 'Okul nerede?' },
    ],
  },
  teacher: {
    tr: 'Öğretmen',
    sentence: 'My teacher is nice.',
    sentenceTr: 'Öğretmenim iyi.',
    altSentences: [
      { en: 'The teacher is nice.', tr: 'Öğretmen güzel.' },
      { en: 'I want a teacher.', tr: 'Bir öğretmen istiyorum.' },
      { en: 'I see a teacher.', tr: 'Bir öğretmen görüyorum.' },
    ],
  },
  book: {
    tr: 'Kitap',
    sentence: 'I read a book.',
    sentenceTr: 'Bir kitap okurum.',
    altSentences: [
      { en: 'There is a book.', tr: 'Bir kitap var.' },
      { en: 'Where is the book?', tr: 'Kitap nerede?' },
      { en: 'The book is here.', tr: 'Kitap burada.' },
    ],
  },
  pen: {
    tr: 'Kalem',
    sentence: 'I write with a pen.',
    sentenceTr: 'Kalemle yazarım.',
    altSentences: [
      { en: 'There is a pen.', tr: 'Bir kalem var.' },
      { en: 'Where is the pen?', tr: 'Kalem nerede?' },
      { en: 'The pen is here.', tr: 'Kalem burada.' },
    ],
  },
  desk: {
    tr: 'Sıra',
    sentence: 'My desk is tidy.',
    sentenceTr: 'Sıram düzenli.',
    altSentences: [
      { en: 'I want a desk.', tr: 'Bir sıra istiyorum.' },
      { en: 'I see a desk.', tr: 'Bir sıra görüyorum.' },
      { en: 'The desk is big.', tr: 'Sıra büyük.' },
    ],
  },
  board: {
    tr: 'Tahta',
    sentence: 'The teacher writes on the board.',
    sentenceTr: 'Öğretmen tahtaya yazar.',
    altSentences: [
      { en: 'This is a board.', tr: 'Bu bir tahta.' },
      { en: 'There is a board.', tr: 'Bir tahta var.' },
      { en: 'Where is the board?', tr: 'Tahta nerede?' },
    ],
  },
  'wake up': {
    tr: 'Uyanmak',
    sentence: 'I wake up at seven.',
    sentenceTr: 'Yedide uyanırım.',
    altSentences: [
      { en: 'The wake up is big.', tr: 'Uyanmak büyük.' },
      { en: 'This is a wake up.', tr: 'Bu bir uyanmak.' },
      { en: 'There is a wake up.', tr: 'Bir uyanmak var.' },
    ],
  },
  'eat breakfast': {
    tr: 'Kahvaltı yapmak',
    sentence: 'I eat breakfast every day.',
    sentenceTr: 'Her gün kahvaltı yaparım.',
    altSentences: [
      { en: 'The eat breakfast is big.', tr: 'Kahvaltı yapmak büyük.' },
      { en: 'This is an eat breakfast.', tr: 'Bu bir kahvaltı yapmak.' },
      { en: 'There is an eat breakfast.', tr: 'Bir kahvaltı yapmak var.' },
    ],
  },
  'go to school': {
    tr: 'Okula gitmek',
    sentence: 'I go to school by bus.',
    sentenceTr: 'Okula otobüsle giderim.',
    altSentences: [
      { en: 'The go to school is here.', tr: 'Okula gitmek burada.' },
      { en: 'The go to school is nice.', tr: 'Okula gitmek güzel.' },
      { en: 'I want a go to school.', tr: 'Bir okula gitmek istiyorum.' },
    ],
  },
  play: {
    tr: 'Oynamak',
    sentence: 'I play after school.',
    sentenceTr: 'Okuldan sonra oynarım.',
    altSentences: [
      { en: 'Where is the play?', tr: 'Oynamak nerede?' },
      { en: 'The play is here.', tr: 'Oynamak burada.' },
      { en: 'The play is nice.', tr: 'Oynamak güzel.' },
    ],
  },
  sleep: {
    tr: 'Uyumak',
    sentence: 'I sleep at nine.',
    sentenceTr: 'Dokuzda uyurum.',
    altSentences: [
      { en: 'The sleep is here.', tr: 'Uyumak burada.' },
      { en: 'The sleep is nice.', tr: 'Uyumak güzel.' },
      { en: 'I want a sleep.', tr: 'Bir uyumak istiyorum.' },
    ],
  },

  // Weather & Nature
  sunny: {
    tr: 'Güneşli',
    sentence: 'It is sunny today.',
    sentenceTr: 'Bugün güneşli.',
    altSentences: [
      { en: 'The sunny is big.', tr: 'Güneşli büyük.' },
      { en: 'This is a sunny.', tr: 'Bu bir güneşli.' },
      { en: 'There is a sunny.', tr: 'Bir güneşli var.' },
    ],
  },
  rainy: {
    tr: 'Yağmurlu',
    sentence: 'It is rainy today.',
    sentenceTr: 'Bugün yağmurlu.',
    altSentences: [
      { en: 'There is a rainy.', tr: 'Bir yağmurlu var.' },
      { en: 'Where is the rainy?', tr: 'Yağmurlu nerede?' },
      { en: 'The rainy is here.', tr: 'Yağmurlu burada.' },
    ],
  },
  cloudy: {
    tr: 'Bulutlu',
    sentence: 'The sky is cloudy.',
    sentenceTr: 'Gökyüzü bulutlu.',
    altSentences: [
      { en: 'This is a cloudy.', tr: 'Bu bir bulutlu.' },
      { en: 'There is a cloudy.', tr: 'Bir bulutlu var.' },
      { en: 'Where is the cloudy?', tr: 'Bulutlu nerede?' },
    ],
  },
  windy: {
    tr: 'Rüzgarlı',
    sentence: 'It is very windy.',
    sentenceTr: 'Çok rüzgarlı.',
    altSentences: [
      { en: 'There is a windy.', tr: 'Bir rüzgarlı var.' },
      { en: 'Where is the windy?', tr: 'Rüzgarlı nerede?' },
      { en: 'The windy is here.', tr: 'Rüzgarlı burada.' },
    ],
  },
  snowy: {
    tr: 'Karlı',
    sentence: 'It is snowy in winter.',
    sentenceTr: 'Kışın karlı olur.',
    altSentences: [
      { en: 'This is a snowy.', tr: 'Bu bir karlı.' },
      { en: 'There is a snowy.', tr: 'Bir karlı var.' },
      { en: 'Where is the snowy?', tr: 'Karlı nerede?' },
    ],
  },
  spring: {
    tr: 'İlkbahar',
    sentence: 'Flowers bloom in spring.',
    sentenceTr: 'İlkbaharda çiçekler açar.',
    altSentences: [
      { en: 'There is a spring.', tr: 'Bir i̇lkbahar var.' },
      { en: 'Where is the spring?', tr: 'İlkbahar nerede?' },
      { en: 'The spring is here.', tr: 'İlkbahar burada.' },
    ],
  },
  summer: {
    tr: 'Yaz',
    sentence: 'Summer is hot.',
    sentenceTr: 'Yaz sıcak.',
    altSentences: [
      { en: 'The summer is here.', tr: 'Yaz burada.' },
      { en: 'The summer is nice.', tr: 'Yaz güzel.' },
      { en: 'I want a summer.', tr: 'Bir yaz istiyorum.' },
    ],
  },
  autumn: {
    tr: 'Sonbahar',
    sentence: 'Leaves fall in autumn.',
    sentenceTr: 'Sonbaharda yapraklar düşer.',
    altSentences: [
      { en: 'I see an autumn.', tr: 'Bir sonbahar görüyorum.' },
      { en: 'The autumn is big.', tr: 'Sonbahar büyük.' },
      { en: 'This is an autumn.', tr: 'Bu bir sonbahar.' },
    ],
  },
  winter: {
    tr: 'Kış',
    sentence: 'Winter is cold.',
    sentenceTr: 'Kış soğuk.',
    altSentences: [
      { en: 'The winter is here.', tr: 'Kış burada.' },
      { en: 'The winter is nice.', tr: 'Kış güzel.' },
      { en: 'I want a winter.', tr: 'Bir kış istiyorum.' },
    ],
  },
  tree: {
    tr: 'Ağaç',
    sentence: 'The tree is tall.',
    sentenceTr: 'Ağaç uzun.',
    altSentences: [
      { en: 'This is a tree.', tr: 'Bu bir ağaç.' },
      { en: 'There is a tree.', tr: 'Bir ağaç var.' },
      { en: 'Where is the tree?', tr: 'Ağaç nerede?' },
    ],
  },
  flower: {
    tr: 'Çiçek',
    sentence: 'The flower is beautiful.',
    sentenceTr: 'Çiçek güzel.',
    altSentences: [
      { en: 'I want a flower.', tr: 'Bir çiçek istiyorum.' },
      { en: 'I see a flower.', tr: 'Bir çiçek görüyorum.' },
      { en: 'The flower is big.', tr: 'Çiçek büyük.' },
    ],
  },
  leaf: {
    tr: 'Yaprak',
    sentence: 'The leaf is green.',
    sentenceTr: 'Yaprak yeşil.',
    altSentences: [
      { en: 'This is a leaf.', tr: 'Bu bir yaprak.' },
      { en: 'There is a leaf.', tr: 'Bir yaprak var.' },
      { en: 'Where is the leaf?', tr: 'Yaprak nerede?' },
    ],
  },
  grass: {
    tr: 'Çimen',
    sentence: 'The grass is soft.',
    sentenceTr: 'Çimen yumuşak.',
    altSentences: [
      { en: 'This is a grass.', tr: 'Bu bir çimen.' },
      { en: 'There is a grass.', tr: 'Bir çimen var.' },
      { en: 'Where is the grass?', tr: 'Çimen nerede?' },
    ],
  },
  sun: {
    tr: 'Güneş',
    sentence: 'The sun is bright.',
    sentenceTr: 'Güneş parlak.',
    altSentences: [
      { en: 'Where is the sun?', tr: 'Güneş nerede?' },
      { en: 'The sun is here.', tr: 'Güneş burada.' },
      { en: 'The sun is nice.', tr: 'Güneş güzel.' },
    ],
  },
  rain: {
    tr: 'Yağmur',
    sentence: 'I like the rain.',
    sentenceTr: 'Yağmuru severim.',
    altSentences: [
      { en: 'I see a rain.', tr: 'Bir yağmur görüyorum.' },
      { en: 'The rain is big.', tr: 'Yağmur büyük.' },
      { en: 'This is a rain.', tr: 'Bu bir yağmur.' },
    ],
  },

  // Clothes
  shirt: {
    tr: 'Gömlek',
    sentence: 'I wear a blue shirt.',
    sentenceTr: 'Mavi gömlek giyerim.',
    altSentences: [
      { en: 'I see a shirt.', tr: 'Bir gömlek görüyorum.' },
      { en: 'The shirt is big.', tr: 'Gömlek büyük.' },
      { en: 'This is a shirt.', tr: 'Bu bir gömlek.' },
    ],
  },
  jacket: {
    tr: 'Ceket',
    sentence: 'Put on your jacket.',
    sentenceTr: 'Ceketini giy.',
    altSentences: [
      { en: 'I see a jacket.', tr: 'Bir ceket görüyorum.' },
      { en: 'The jacket is big.', tr: 'Ceket büyük.' },
      { en: 'This is a jacket.', tr: 'Bu bir ceket.' },
    ],
  },
  hat: {
    tr: 'Şapka',
    sentence: 'I have a red hat.',
    sentenceTr: 'Kırmızı şapkam var.',
    altSentences: [
      { en: 'The hat is big.', tr: 'Şapka büyük.' },
      { en: 'This is a hat.', tr: 'Bu bir şapka.' },
      { en: 'There is a hat.', tr: 'Bir şapka var.' },
    ],
  },
  scarf: {
    tr: 'Atkı',
    sentence: 'The scarf is warm.',
    sentenceTr: 'Atkı sıcak tutar.',
    altSentences: [
      { en: 'I want a scarf.', tr: 'Bir atkı istiyorum.' },
      { en: 'I see a scarf.', tr: 'Bir atkı görüyorum.' },
      { en: 'The scarf is big.', tr: 'Atkı büyük.' },
    ],
  },
  sweater: {
    tr: 'Kazak',
    sentence: 'I wear a sweater in winter.',
    sentenceTr: 'Kışın kazak giyerim.',
    altSentences: [
      { en: 'There is a sweater.', tr: 'Bir kazak var.' },
      { en: 'Where is the sweater?', tr: 'Kazak nerede?' },
      { en: 'The sweater is here.', tr: 'Kazak burada.' },
    ],
  },
  pants: {
    tr: 'Pantolon',
    sentence: 'My pants are blue.',
    sentenceTr: 'Pantolonum mavi.',
    altSentences: [
      { en: 'Where is the pants?', tr: 'Pantolon nerede?' },
      { en: 'The pants is here.', tr: 'Pantolon burada.' },
      { en: 'The pants is nice.', tr: 'Pantolon güzel.' },
    ],
  },
  shoes: {
    tr: 'Ayakkabı',
    sentence: 'I put on my shoes.',
    sentenceTr: 'Ayakkabılarımı giyerim.',
    altSentences: [
      { en: 'I see a shoes.', tr: 'Bir ayakkabı görüyorum.' },
      { en: 'The shoes is big.', tr: 'Ayakkabı büyük.' },
      { en: 'This is a shoes.', tr: 'Bu bir ayakkabı.' },
    ],
  },
  socks: {
    tr: 'Çorap',
    sentence: 'My socks are white.',
    sentenceTr: 'Çoraplarım beyaz.',
    altSentences: [
      { en: 'There is a socks.', tr: 'Bir çorap var.' },
      { en: 'Where is the socks?', tr: 'Çorap nerede?' },
      { en: 'The socks is here.', tr: 'Çorap burada.' },
    ],
  },
  dress: {
    tr: 'Elbise',
    sentence: 'She wears a dress.',
    sentenceTr: 'O elbise giyer.',
    altSentences: [
      { en: 'The dress is here.', tr: 'Elbise burada.' },
      { en: 'The dress is nice.', tr: 'Elbise güzel.' },
      { en: 'I want a dress.', tr: 'Bir elbise istiyorum.' },
    ],
  },
  skirt: {
    tr: 'Etek',
    sentence: 'The skirt is pink.',
    sentenceTr: 'Etek pembe.',
    altSentences: [
      { en: 'The skirt is big.', tr: 'Etek büyük.' },
      { en: 'This is a skirt.', tr: 'Bu bir etek.' },
      { en: 'There is a skirt.', tr: 'Bir etek var.' },
    ],
  },
  'I wear': {
    tr: 'Giyerim',
    sentence: 'I wear a jacket.',
    sentenceTr: 'Ceket giyerim.',
    altSentences: [
      { en: 'I wear a scarf in winter.', tr: 'Kışın atkı giyerim.' },
      { en: 'I wear glasses.', tr: 'Gözlük takarım.' },
      { en: 'I wear blue shoes.', tr: 'Mavi ayakkabı giyerim.' },
    ],
  },
  'It is cold': {
    tr: 'Hava soğuk',
    sentence: 'It is cold today.',
    sentenceTr: 'Bugün hava soğuk.',
    altSentences: [
      { en: 'It is cold outside.', tr: 'Dışarısı soğuk.' },
      { en: 'It is cold in winter.', tr: 'Kışın hava soğuk.' },
      { en: 'It is cold in the morning.', tr: 'Sabahları soğuk.' },
    ],
  },
  'It is hot': {
    tr: 'Hava sıcak',
    sentence: 'It is hot in summer.',
    sentenceTr: 'Yazın hava sıcak.',
    altSentences: [
      { en: 'It is hot outside.', tr: 'Dışarısı sıcak.' },
      { en: 'It is hot in July.', tr: 'Temmuzda hava sıcak.' },
      { en: 'It is hot at noon.', tr: 'Öğleyin hava sıcak.' },
    ],
  },

  // City & Directions
  park: {
    tr: 'Park',
    sentence: 'I play in the park.',
    sentenceTr: 'Parkta oynarım.',
    altSentences: [
      { en: 'Where is the park?', tr: 'Park nerede?' },
      { en: 'The park is here.', tr: 'Park burada.' },
      { en: 'The park is nice.', tr: 'Park güzel.' },
    ],
  },
  shop: {
    tr: 'Mağaza',
    sentence: 'I go to the shop.',
    sentenceTr: 'Mağazaya giderim.',
    altSentences: [
      { en: 'I see a shop.', tr: 'Bir mağaza görüyorum.' },
      { en: 'The shop is big.', tr: 'Mağaza büyük.' },
      { en: 'This is a shop.', tr: 'Bu bir mağaza.' },
    ],
  },
  hospital: {
    tr: 'Hastane',
    sentence: 'The hospital is big.',
    sentenceTr: 'Hastane büyük.',
    altSentences: [
      { en: 'The hospital is nice.', tr: 'Hastane güzel.' },
      { en: 'I want a hospital.', tr: 'Bir hastane istiyorum.' },
      { en: 'I see a hospital.', tr: 'Bir hastane görüyorum.' },
    ],
  },
  restaurant: {
    tr: 'Restoran',
    sentence: 'We eat at a restaurant.',
    sentenceTr: 'Restoranda yeriz.',
    altSentences: [
      { en: 'The restaurant is here.', tr: 'Restoran burada.' },
      { en: 'The restaurant is nice.', tr: 'Restoran güzel.' },
      { en: 'I want a restaurant.', tr: 'Bir restoran istiyorum.' },
    ],
  },
  library: {
    tr: 'Kütüphane',
    sentence: 'I read at the library.',
    sentenceTr: 'Kütüphanede okurum.',
    altSentences: [
      { en: 'The library is big.', tr: 'Kütüphane büyük.' },
      { en: 'This is a library.', tr: 'Bu bir kütüphane.' },
      { en: 'There is a library.', tr: 'Bir kütüphane var.' },
    ],
  },
  left: {
    tr: 'Sol',
    sentence: 'Turn left here.',
    sentenceTr: 'Burada sola dön.',
    altSentences: [
      { en: 'Turn left at the corner.', tr: 'Köşeden sola dön.' },
      { en: 'My left hand is stronger.', tr: 'Sol elim daha güçlü.' },
      { en: 'The shop is on the left.', tr: 'Mağaza solda.' },
    ],
  },
  right: {
    tr: 'Sağ',
    sentence: 'Turn right please.',
    sentenceTr: 'Lütfen sağa dön.',
    altSentences: [
      { en: 'Turn right here.', tr: 'Burada sağa dön.' },
      { en: 'The answer is right.', tr: 'Cevap doğru.' },
      { en: 'My right foot hurts.', tr: 'Sağ ayağım ağrıyor.' },
    ],
  },
  straight: {
    tr: 'Düz',
    sentence: 'Go straight ahead.',
    sentenceTr: 'Düz ilerle.',
    altSentences: [
      { en: 'Go straight for two minutes.', tr: 'İki dakika düz git.' },
      { en: 'Walk straight ahead.', tr: 'Düz ilerle.' },
      { en: 'The road is straight.', tr: 'Yol düz.' },
    ],
  },
  turn: {
    tr: 'Dönmek',
    sentence: 'Turn at the corner.',
    sentenceTr: 'Köşeden dön.',
    altSentences: [
      { en: 'I turn the page.', tr: 'Sayfayı çeviririm.' },
      { en: 'She turns left.', tr: 'O sola döner.' },
      { en: 'We turn around.', tr: 'Etrafımıza döneriz.' },
    ],
  },
  'next to': {
    tr: 'Yanında',
    sentence: 'The park is next to the school.',
    sentenceTr: 'Park okulun yanında.',
    altSentences: [
      { en: 'The cat is next to the dog.', tr: 'Kedi köpeğin yanında.' },
      { en: 'I sit next to my friend.', tr: 'Arkadaşımın yanında otururum.' },
      { en: 'The book is next to the lamp.', tr: 'Kitap lambanın yanında.' },
    ],
  },
  'How much': {
    tr: 'Ne kadar',
    sentence: 'How much is this?',
    sentenceTr: 'Bu ne kadar?',
    altSentences: [
      { en: 'How much is the apple?', tr: 'Elma ne kadar?' },
      { en: 'How much does it cost?', tr: 'Bu kaça?' },
      { en: 'How much water do you need?', tr: 'Ne kadar suya ihtiyacın var?' },
    ],
  },
  expensive: {
    tr: 'Pahalı',
    sentence: 'This is expensive.',
    sentenceTr: 'Bu pahalı.',
    altSentences: [
      { en: 'That is expensive too.', tr: 'O da pahalı.' },
      { en: 'This is expensive.', tr: 'Bu pahalı.' },
      { en: 'The house is expensive.', tr: 'Ev pahalı.' },
    ],
  },
  cheap: {
    tr: 'Ucuz',
    sentence: 'This is cheap.',
    sentenceTr: 'Bu ucuz.',
    altSentences: [
      { en: 'The house is cheap.', tr: 'Ev ucuz.' },
      { en: 'That is cheap too.', tr: 'O da ucuz.' },
      { en: 'This is cheap.', tr: 'Bu ucuz.' },
    ],
  },
  buy: {
    tr: 'Satın almak',
    sentence: 'I want to buy this.',
    sentenceTr: 'Bunu satın almak istiyorum.',
    altSentences: [
      { en: 'I buy a new book.', tr: 'Yeni bir kitap alırım.' },
      { en: 'She buys fruit.', tr: 'O meyve alır.' },
      { en: 'We buy food.', tr: 'Yiyecek alırız.' },
    ],
  },
  money: {
    tr: 'Para',
    sentence: 'I have money.',
    sentenceTr: 'Param var.',
    altSentences: [
      { en: 'This is a money.', tr: 'Bu bir para.' },
      { en: 'There is a money.', tr: 'Bir para var.' },
      { en: 'Where is the money?', tr: 'Para nerede?' },
    ],
  },

  // Time
  Monday: {
    tr: 'Pazartesi',
    sentence: 'Monday is the first day.',
    sentenceTr: 'Pazartesi ilk gün.',
    altSentences: [
      { en: 'Today is Monday.', tr: 'Bugün Pazartesi.' },
      { en: 'Monday is fun.', tr: 'Pazartesi eğlenceli.' },
      { en: 'See you on Monday!', tr: 'Pazartesi günü görüşürüz!' },
    ],
  },
  Tuesday: {
    tr: 'Salı',
    sentence: 'We have art on Tuesday.',
    sentenceTr: 'Salı günü resim dersimiz var.',
    altSentences: [
      { en: 'Today is Tuesday.', tr: 'Bugün Salı.' },
      { en: 'Tuesday is fun.', tr: 'Salı eğlenceli.' },
      { en: 'See you on Tuesday!', tr: 'Salı günü görüşürüz!' },
    ],
  },
  Wednesday: {
    tr: 'Çarşamba',
    sentence: 'Wednesday is in the middle.',
    sentenceTr: 'Çarşamba haftanın ortası.',
    altSentences: [
      { en: 'Today is Wednesday.', tr: 'Bugün Çarşamba.' },
      { en: 'Wednesday is fun.', tr: 'Çarşamba eğlenceli.' },
      { en: 'See you on Wednesday!', tr: 'Çarşamba günü görüşürüz!' },
    ],
  },
  Thursday: {
    tr: 'Perşembe',
    sentence: 'I play football on Thursday.',
    sentenceTr: 'Perşembe futbol oynarım.',
    altSentences: [
      { en: 'Today is Thursday.', tr: 'Bugün Perşembe.' },
      { en: 'Thursday is fun.', tr: 'Perşembe eğlenceli.' },
      { en: 'See you on Thursday!', tr: 'Perşembe günü görüşürüz!' },
    ],
  },
  Friday: {
    tr: 'Cuma',
    sentence: 'Friday is fun!',
    sentenceTr: 'Cuma eğlenceli!',
    altSentences: [
      { en: 'Today is Friday.', tr: 'Bugün Cuma.' },
      { en: 'Friday is fun.', tr: 'Cuma eğlenceli.' },
      { en: 'See you on Friday!', tr: 'Cuma günü görüşürüz!' },
    ],
  },
  Saturday: {
    tr: 'Cumartesi',
    sentence: 'I rest on Saturday.',
    sentenceTr: 'Cumartesi dinlenirim.',
    altSentences: [
      { en: 'Today is Saturday.', tr: 'Bugün Cumartesi.' },
      { en: 'Saturday is fun.', tr: 'Cumartesi eğlenceli.' },
      { en: 'See you on Saturday!', tr: 'Cumartesi günü görüşürüz!' },
    ],
  },
  Sunday: {
    tr: 'Pazar',
    sentence: 'Sunday is family day.',
    sentenceTr: 'Pazar aile günü.',
    altSentences: [
      { en: 'Today is Sunday.', tr: 'Bugün Pazar.' },
      { en: 'Sunday is fun.', tr: 'Pazar eğlenceli.' },
      { en: 'See you on Sunday!', tr: 'Pazar günü görüşürüz!' },
    ],
  },
  January: {
    tr: 'Ocak',
    sentence: 'January is cold.',
    sentenceTr: 'Ocak soğuk.',
    altSentences: [
      { en: 'It is January now.', tr: 'Şimdi Ocak.' },
      { en: 'January is a nice month.', tr: 'Ocak güzel bir ay.' },
      { en: 'I was born in January.', tr: 'Ocak ayında doğdum.' },
    ],
  },
  February: {
    tr: 'Şubat',
    sentence: 'February is short.',
    sentenceTr: 'Şubat kısa.',
    altSentences: [
      { en: 'It is February now.', tr: 'Şimdi Şubat.' },
      { en: 'February is a nice month.', tr: 'Şubat güzel bir ay.' },
      { en: 'I was born in February.', tr: 'Şubat ayında doğdum.' },
    ],
  },
  March: {
    tr: 'Mart',
    sentence: 'Spring starts in March.',
    sentenceTr: 'İlkbahar Martta başlar.',
    altSentences: [
      { en: 'It is March now.', tr: 'Şimdi Mart.' },
      { en: 'March is a nice month.', tr: 'Mart güzel bir ay.' },
      { en: 'I was born in March.', tr: 'Mart ayında doğdum.' },
    ],
  },
  April: {
    tr: 'Nisan',
    sentence: 'It rains in April.',
    sentenceTr: 'Nisanda yağmur yağar.',
    altSentences: [
      { en: 'It is April now.', tr: 'Şimdi Nisan.' },
      { en: 'April is a nice month.', tr: 'Nisan güzel bir ay.' },
      { en: 'I was born in April.', tr: 'Nisan ayında doğdum.' },
    ],
  },
  May: {
    tr: 'Mayıs',
    sentence: 'May is beautiful.',
    sentenceTr: 'Mayıs güzel.',
    altSentences: [
      { en: 'It is May now.', tr: 'Şimdi Mayıs.' },
      { en: 'May is a nice month.', tr: 'Mayıs güzel bir ay.' },
      { en: 'I was born in May.', tr: 'Mayıs ayında doğdum.' },
    ],
  },
  June: {
    tr: 'Haziran',
    sentence: 'School ends in June.',
    sentenceTr: 'Okul Haziranda biter.',
    altSentences: [
      { en: 'It is June now.', tr: 'Şimdi Haziran.' },
      { en: 'June is a nice month.', tr: 'Haziran güzel bir ay.' },
      { en: 'I was born in June.', tr: 'Haziran ayında doğdum.' },
    ],
  },
  "o'clock": {
    tr: 'Saat (tam)',
    sentence: "It is three o'clock.",
    sentenceTr: 'Saat üç.',
    altSentences: [
      { en: "It is five o'clock.", tr: 'Saat beş.' },
      { en: "I wake up at seven o'clock.", tr: 'Saat yedide uyanırım.' },
      { en: "We eat at six o'clock.", tr: 'Saat altıda yeriz.' },
    ],
  },
  'half past': {
    tr: 'Buçuk',
    sentence: 'It is half past four.',
    sentenceTr: 'Saat dört buçuk.',
    altSentences: [
      { en: 'It is half past three.', tr: 'Saat üç buçuk.' },
      { en: 'School starts at half past eight.', tr: 'Okul sekiz buçukta başlar.' },
      { en: 'We eat at half past twelve.', tr: 'On iki buçukta yeriz.' },
    ],
  },
  morning: {
    tr: 'Sabah',
    sentence: 'Good morning!',
    sentenceTr: 'Günaydın!',
    altSentences: [
      { en: 'I eat breakfast in the morning.', tr: 'Sabah kahvaltı yaparım.' },
      { en: 'The morning is cool.', tr: 'Sabah serin.' },
      { en: 'I study in the morning.', tr: 'Sabahları çalışırım.' },
    ],
  },
  evening: {
    tr: 'Akşam',
    sentence: 'Good evening!',
    sentenceTr: 'İyi akşamlar!',
    altSentences: [
      { en: 'I read books in the evening.', tr: 'Akşamları kitap okurum.' },
      { en: 'The evening sky is pretty.', tr: 'Akşam gökyüzü güzel.' },
      { en: 'We eat dinner in the evening.', tr: 'Akşam yemek yeriz.' },
    ],
  },
  night: {
    tr: 'Gece',
    sentence: 'Good night!',
    sentenceTr: 'İyi geceler!',
    altSentences: [
      { en: 'Stars shine at night.', tr: 'Yıldızlar gece parlar.' },
      { en: 'I sleep at night.', tr: 'Gece uyurum.' },
      { en: 'The night is quiet.', tr: 'Gece sessiz.' },
    ],
  },

  // Jobs
  doctor: {
    tr: 'Doktor',
    sentence: 'The doctor helps people.',
    sentenceTr: 'Doktor insanlara yardım eder.',
    altSentences: [
      { en: 'There is a doctor.', tr: 'Bir doktor var.' },
      { en: 'Where is the doctor?', tr: 'Doktor nerede?' },
      { en: 'The doctor is here.', tr: 'Doktor burada.' },
    ],
  },
  pilot: {
    tr: 'Pilot',
    sentence: 'The pilot flies a plane.',
    sentenceTr: 'Pilot uçak uçurur.',
    altSentences: [
      { en: 'This is a pilot.', tr: 'Bu bir pilot.' },
      { en: 'There is a pilot.', tr: 'Bir pilot var.' },
      { en: 'Where is the pilot?', tr: 'Pilot nerede?' },
    ],
  },
  firefighter: {
    tr: 'İtfaiyeci',
    sentence: 'Firefighters are brave.',
    sentenceTr: 'İtfaiyeciler cesur.',
    altSentences: [
      { en: 'I want a firefighter.', tr: 'Bir i̇tfaiyeci istiyorum.' },
      { en: 'I see a firefighter.', tr: 'Bir i̇tfaiyeci görüyorum.' },
      { en: 'The firefighter is big.', tr: 'İtfaiyeci büyük.' },
    ],
  },
  police: {
    tr: 'Polis',
    sentence: 'The police keeps us safe.',
    sentenceTr: 'Polis bizi korur.',
    altSentences: [
      { en: 'The police is nice.', tr: 'Polis güzel.' },
      { en: 'I want a police.', tr: 'Bir polis istiyorum.' },
      { en: 'I see a police.', tr: 'Bir polis görüyorum.' },
    ],
  },
  chef: {
    tr: 'Aşçı',
    sentence: 'The chef cooks food.',
    sentenceTr: 'Aşçı yemek pişirir.',
    altSentences: [
      { en: 'Where is the chef?', tr: 'Aşçı nerede?' },
      { en: 'The chef is here.', tr: 'Aşçı burada.' },
      { en: 'The chef is nice.', tr: 'Aşçı güzel.' },
    ],
  },
  farmer: {
    tr: 'Çiftçi',
    sentence: 'The farmer grows food.',
    sentenceTr: 'Çiftçi yiyecek yetiştirir.',
    altSentences: [
      { en: 'The farmer is big.', tr: 'Çiftçi büyük.' },
      { en: 'This is a farmer.', tr: 'Bu bir çiftçi.' },
      { en: 'There is a farmer.', tr: 'Bir çiftçi var.' },
    ],
  },
  nurse: {
    tr: 'Hemşire',
    sentence: 'The nurse is kind.',
    sentenceTr: 'Hemşire iyidir.',
    altSentences: [
      { en: 'The nurse is big.', tr: 'Hemşire büyük.' },
      { en: 'This is a nurse.', tr: 'Bu bir hemşire.' },
      { en: 'There is a nurse.', tr: 'Bir hemşire var.' },
    ],
  },
  artist: {
    tr: 'Sanatçı',
    sentence: 'The artist paints pictures.',
    sentenceTr: 'Sanatçı resim yapar.',
    altSentences: [
      { en: 'I want an artist.', tr: 'Bir sanatçı istiyorum.' },
      { en: 'I see an artist.', tr: 'Bir sanatçı görüyorum.' },
      { en: 'The artist is big.', tr: 'Sanatçı büyük.' },
    ],
  },
  singer: {
    tr: 'Şarkıcı',
    sentence: 'The singer has a good voice.',
    sentenceTr: 'Şarkıcının sesi güzel.',
    altSentences: [
      { en: 'This is a singer.', tr: 'Bu bir şarkıcı.' },
      { en: 'There is a singer.', tr: 'Bir şarkıcı var.' },
      { en: 'Where is the singer?', tr: 'Şarkıcı nerede?' },
    ],
  },
  'I want to be': {
    tr: 'Olmak istiyorum',
    sentence: 'I want to be a doctor.',
    sentenceTr: 'Doktor olmak istiyorum.',
    altSentences: [
      { en: 'I want to be a teacher.', tr: 'Öğretmen olmak istiyorum.' },
      { en: 'I want to be brave.', tr: 'Cesur olmak istiyorum.' },
      { en: 'I want to be a pilot.', tr: 'Pilot olmak istiyorum.' },
    ],
  },
  because: {
    tr: 'Çünkü',
    sentence: 'I like dogs because they are cute.',
    sentenceTr: 'Köpekleri severim çünkü sevimli.',
    altSentences: [
      { en: 'I smile because I am happy.', tr: 'Gülümsüyorum çünkü mutluyum.' },
      { en: 'She runs because she is late.', tr: 'Koşuyor çünkü geç kaldı.' },
      { en: 'We rest because we are tired.', tr: 'Dinleniyoruz çünkü yorgunuz.' },
    ],
  },
  'help people': {
    tr: 'İnsanlara yardım etmek',
    sentence: 'I want to help people.',
    sentenceTr: 'İnsanlara yardım etmek istiyorum.',
    altSentences: [
      { en: 'I like to help people.', tr: 'İnsanlara yardım etmeyi severim.' },
      { en: 'Doctors help people.', tr: 'Doktorlar insanlara yardım eder.' },
      { en: 'We should help people.', tr: 'İnsanlara yardım etmeliyiz.' },
    ],
  },

  // Space
  moon: {
    tr: 'Ay',
    sentence: 'The moon shines at night.',
    sentenceTr: 'Ay geceleyin parlar.',
    altSentences: [
      { en: 'The moon is here.', tr: 'Ay burada.' },
      { en: 'The moon is nice.', tr: 'Ay güzel.' },
      { en: 'I want a moon.', tr: 'Bir ay istiyorum.' },
    ],
  },
  star: {
    tr: 'Yıldız',
    sentence: 'Stars are bright.',
    sentenceTr: 'Yıldızlar parlak.',
    altSentences: [
      { en: 'I see a star.', tr: 'Bir yıldız görüyorum.' },
      { en: 'The star is big.', tr: 'Yıldız büyük.' },
      { en: 'This is a star.', tr: 'Bu bir yıldız.' },
    ],
  },
  planet: {
    tr: 'Gezegen',
    sentence: 'Earth is a planet.',
    sentenceTr: 'Dünya bir gezegen.',
    altSentences: [
      { en: 'The planet is nice.', tr: 'Gezegen güzel.' },
      { en: 'I want a planet.', tr: 'Bir gezegen istiyorum.' },
      { en: 'I see a planet.', tr: 'Bir gezegen görüyorum.' },
    ],
  },
  Earth: {
    tr: 'Dünya',
    sentence: 'We live on Earth.',
    sentenceTr: "Dünya'da yaşarız.",
    altSentences: [
      { en: 'The Earth is nice.', tr: 'Dünya güzel.' },
      { en: 'I want an Earth.', tr: 'Bir dünya istiyorum.' },
      { en: 'I see an Earth.', tr: 'Bir dünya görüyorum.' },
    ],
  },
  Mars: {
    tr: 'Mars',
    sentence: 'Mars is red.',
    sentenceTr: 'Mars kırmızı.',
    altSentences: [
      { en: 'There is a Mars.', tr: 'Bir mars var.' },
      { en: 'Where is the Mars?', tr: 'Mars nerede?' },
      { en: 'The Mars is here.', tr: 'Mars burada.' },
    ],
  },
  Jupiter: {
    tr: 'Jüpiter',
    sentence: 'Jupiter is the biggest planet.',
    sentenceTr: 'Jüpiter en büyük gezegen.',
    altSentences: [
      { en: 'There is a Jupiter.', tr: 'Bir jüpiter var.' },
      { en: 'Where is the Jupiter?', tr: 'Jüpiter nerede?' },
      { en: 'The Jupiter is here.', tr: 'Jüpiter burada.' },
    ],
  },
  Saturn: {
    tr: 'Satürn',
    sentence: 'Saturn has rings.',
    sentenceTr: "Satürn'ün halkaları var.",
    altSentences: [
      { en: 'The Saturn is big.', tr: 'Satürn büyük.' },
      { en: 'This is a Saturn.', tr: 'Bu bir satürn.' },
      { en: 'There is a Saturn.', tr: 'Bir satürn var.' },
    ],
  },
  rocket: {
    tr: 'Roket',
    sentence: 'The rocket goes to space.',
    sentenceTr: 'Roket uzaya gider.',
    altSentences: [
      { en: 'This is a rocket.', tr: 'Bu bir roket.' },
      { en: 'There is a rocket.', tr: 'Bir roket var.' },
      { en: 'Where is the rocket?', tr: 'Roket nerede?' },
    ],
  },
  astronaut: {
    tr: 'Astronot',
    sentence: 'The astronaut is in space.',
    sentenceTr: 'Astronot uzayda.',
    altSentences: [
      { en: 'The astronaut is here.', tr: 'Astronot burada.' },
      { en: 'The astronaut is nice.', tr: 'Astronot güzel.' },
      { en: 'I want an astronaut.', tr: 'Bir astronot istiyorum.' },
    ],
  },
  'fly to': {
    tr: 'Uçmak',
    sentence: 'We fly to the moon.',
    sentenceTr: 'Aya uçarız.',
    altSentences: [
      { en: 'I want to fly to the moon.', tr: 'Aya uçmak istiyorum.' },
      { en: 'Birds fly to warm places.', tr: 'Kuşlar sıcak yerlere uçar.' },
      { en: 'We fly to London.', tr: "Londra'ya uçarız." },
    ],
  },
  amazing: {
    tr: 'Harika',
    sentence: 'Space is amazing!',
    sentenceTr: 'Uzay harika!',
    altSentences: [
      { en: 'That is amazing too.', tr: 'O da harika.' },
      { en: 'This is amazing.', tr: 'Bu harika.' },
      { en: 'The house is amazing.', tr: 'Ev harika.' },
    ],
  },

  // Technology
  computer: {
    tr: 'Bilgisayar',
    sentence: 'I use a computer.',
    sentenceTr: 'Bilgisayar kullanırım.',
    altSentences: [
      { en: 'I want a computer.', tr: 'Bir bilgisayar istiyorum.' },
      { en: 'I see a computer.', tr: 'Bir bilgisayar görüyorum.' },
      { en: 'The computer is big.', tr: 'Bilgisayar büyük.' },
    ],
  },
  phone: {
    tr: 'Telefon',
    sentence: 'Mom has a phone.',
    sentenceTr: 'Annemin telefonu var.',
    altSentences: [
      { en: 'I see a phone.', tr: 'Bir telefon görüyorum.' },
      { en: 'The phone is big.', tr: 'Telefon büyük.' },
      { en: 'This is a phone.', tr: 'Bu bir telefon.' },
    ],
  },
  tablet: {
    tr: 'Tablet',
    sentence: 'I play games on my tablet.',
    sentenceTr: 'Tabletimde oyun oynarım.',
    altSentences: [
      { en: 'The tablet is nice.', tr: 'Tablet güzel.' },
      { en: 'I want a tablet.', tr: 'Bir tablet istiyorum.' },
      { en: 'I see a tablet.', tr: 'Bir tablet görüyorum.' },
    ],
  },
  robot: {
    tr: 'Robot',
    sentence: 'The robot can dance.',
    sentenceTr: 'Robot dans edebilir.',
    altSentences: [
      { en: 'Where is the robot?', tr: 'Robot nerede?' },
      { en: 'The robot is here.', tr: 'Robot burada.' },
      { en: 'The robot is nice.', tr: 'Robot güzel.' },
    ],
  },
  camera: {
    tr: 'Kamera',
    sentence: 'I take photos with the camera.',
    sentenceTr: 'Kamerayla fotoğraf çekerim.',
    altSentences: [
      { en: 'The camera is here.', tr: 'Kamera burada.' },
      { en: 'The camera is nice.', tr: 'Kamera güzel.' },
      { en: 'I want a camera.', tr: 'Bir kamera istiyorum.' },
    ],
  },
  website: {
    tr: 'Web sitesi',
    sentence: 'I visit a website.',
    sentenceTr: 'Bir web sitesini ziyaret ederim.',
    altSentences: [
      { en: 'There is a website.', tr: 'Bir web sitesi var.' },
      { en: 'Where is the website?', tr: 'Web sitesi nerede?' },
      { en: 'The website is here.', tr: 'Web sitesi burada.' },
    ],
  },
  email: {
    tr: 'E-posta',
    sentence: 'I send an email.',
    sentenceTr: 'E-posta gönderirim.',
    altSentences: [
      { en: 'This is an email.', tr: 'Bu bir e-posta.' },
      { en: 'There is an email.', tr: 'Bir e-posta var.' },
      { en: 'Where is the email?', tr: 'E-posta nerede?' },
    ],
  },
  download: {
    tr: 'İndirmek',
    sentence: 'I download a game.',
    sentenceTr: 'Bir oyun indiririm.',
    altSentences: [
      { en: 'I download music.', tr: 'Müzik indiririm.' },
      { en: 'She downloads a book.', tr: 'O bir kitap indirir.' },
      { en: 'We download the app.', tr: 'Uygulamayı indiririz.' },
    ],
  },
  search: {
    tr: 'Aramak',
    sentence: 'I search for answers.',
    sentenceTr: 'Cevapları ararım.',
    altSentences: [
      { en: 'I search for my pen.', tr: 'Kalemimi ararım.' },
      { en: 'She searches the room.', tr: 'O odayı arar.' },
      { en: 'We search together.', tr: 'Birlikte ararız.' },
    ],
  },
  video: {
    tr: 'Video',
    sentence: 'I watch a video.',
    sentenceTr: 'Video izlerim.',
    altSentences: [
      { en: 'I want a video.', tr: 'Bir video istiyorum.' },
      { en: 'I see a video.', tr: 'Bir video görüyorum.' },
      { en: 'The video is big.', tr: 'Video büyük.' },
    ],
  },

  // Emotions
  angry: {
    tr: 'Kızgın',
    sentence: "Don't be angry!",
    sentenceTr: 'Kızma!',
    altSentences: [
      { en: 'That is angry too.', tr: 'O da kızgın.' },
      { en: 'This is angry.', tr: 'Bu kızgın.' },
      { en: 'The house is angry.', tr: 'Ev kızgın.' },
    ],
  },
  scared: {
    tr: 'Korkmuş',
    sentence: 'The cat is scared.',
    sentenceTr: 'Kedi korkmuş.',
    altSentences: [
      { en: 'It is not scared.', tr: 'Korkmuş değil.' },
      { en: 'She is scared.', tr: 'O korkmuş.' },
      { en: 'It is very scared.', tr: 'Çok korkmuş.' },
    ],
  },
  excited: {
    tr: 'Heyecanlı',
    sentence: 'I am excited about the trip!',
    sentenceTr: 'Gezi için heyecanlıyım!',
    altSentences: [
      { en: 'She is excited.', tr: 'O heyecanlı.' },
      { en: 'It is very excited.', tr: 'Çok heyecanlı.' },
      { en: 'It is not excited.', tr: 'Heyecanlı değil.' },
    ],
  },
  'I feel': {
    tr: 'Hissediyorum',
    sentence: 'I feel happy today.',
    sentenceTr: 'Bugün mutlu hissediyorum.',
    altSentences: [
      { en: 'I feel great today.', tr: 'Bugün harika hissediyorum.' },
      { en: 'I feel tired now.', tr: 'Şimdi yorgun hissediyorum.' },
      { en: 'I feel excited!', tr: 'Heyecanlıyım!' },
    ],
  },
  'happy because': {
    tr: 'Mutlu çünkü',
    sentence: 'I am happy because I won.',
    sentenceTr: 'Mutluyum çünkü kazandım.',
    altSentences: [
      { en: 'I am happy because I have friends.', tr: 'Mutluyum çünkü arkadaşlarım var.' },
      { en: 'She is happy because of the gift.', tr: 'Hediye yüzünden mutlu.' },
      { en: 'We are happy because it is sunny.', tr: 'Hava güneşli olduğu için mutluyuz.' },
    ],
  },
  'sad because': {
    tr: 'Üzgün çünkü',
    sentence: 'I am sad because it rains.',
    sentenceTr: 'Üzgünüm çünkü yağmur yağıyor.',
    altSentences: [
      { en: 'I am sad because my cat is lost.', tr: 'Üzgünüm çünkü kedim kayıp.' },
      { en: 'She is sad because of the rain.', tr: 'Yağmur yüzünden üzgün.' },
      { en: 'He is sad because school is over.', tr: 'Okul bittiği için üzgün.' },
    ],
  },
  'excited because': {
    tr: 'Heyecanlı çünkü',
    sentence: 'I am excited because of the trip.',
    sentenceTr: 'Gezi yüzünden heyecanlıyım.',
    altSentences: [
      { en: 'I am excited because of my birthday.', tr: 'Doğum günüm yüzünden heyecanlıyım.' },
      { en: 'She is excited because of the trip.', tr: 'Gezi yüzünden heyecanlı.' },
      { en: 'We are excited because of the show.', tr: 'Gösteri yüzünden heyecanlıyız.' },
    ],
  },

  // Past Tense
  played: {
    tr: 'Oynadı',
    sentence: 'I played football yesterday.',
    sentenceTr: 'Dün futbol oynadım.',
    altSentences: [
      { en: 'I played with my friend.', tr: 'Arkadaşımla oynadım.' },
      { en: 'She played the piano.', tr: 'O piyano çaldı.' },
      { en: 'We played in the garden.', tr: 'Bahçede oynadık.' },
    ],
  },
  walked: {
    tr: 'Yürüdü',
    sentence: 'We walked to school.',
    sentenceTr: 'Okula yürüdük.',
    altSentences: [
      { en: 'I walked to the park.', tr: 'Parka yürüdüm.' },
      { en: 'She walked slowly.', tr: 'O yavaş yürüdü.' },
      { en: 'We walked together.', tr: 'Birlikte yürüdük.' },
    ],
  },
  talked: {
    tr: 'Konuştu',
    sentence: 'She talked to her friend.',
    sentenceTr: 'Arkadaşıyla konuştu.',
    altSentences: [
      { en: 'I talked to my mom.', tr: 'Annemle konuştum.' },
      { en: 'She talked a lot.', tr: 'O çok konuştu.' },
      { en: 'We talked on the phone.', tr: 'Telefonda konuştuk.' },
    ],
  },
  watched: {
    tr: 'İzledi',
    sentence: 'I watched a movie.',
    sentenceTr: 'Film izledim.',
    altSentences: [
      { en: 'I watched a cartoon.', tr: 'Çizgi film izledim.' },
      { en: 'She watched the birds.', tr: 'O kuşları izledi.' },
      { en: 'We watched the sunset.', tr: 'Gün batımını izledik.' },
    ],
  },
  cooked: {
    tr: 'Pişirdi',
    sentence: 'Mom cooked dinner.',
    sentenceTr: 'Anne akşam yemeği pişirdi.',
    altSentences: [
      { en: 'I cooked breakfast.', tr: 'Kahvaltı hazırladım.' },
      { en: 'She cooked pasta.', tr: 'O makarna pişirdi.' },
      { en: 'We cooked together.', tr: 'Birlikte pişirdik.' },
    ],
  },
  went: {
    tr: 'Gitti',
    sentence: 'I went to the park.',
    sentenceTr: 'Parka gittim.',
    altSentences: [
      { en: 'I went to the beach.', tr: 'Sahile gittim.' },
      { en: 'She went home early.', tr: 'O erken eve gitti.' },
      { en: 'We went shopping.', tr: 'Alışverişe gittik.' },
    ],
  },
  ate: {
    tr: 'Yedi',
    sentence: 'She ate an apple.',
    sentenceTr: 'Elma yedi.',
    altSentences: [
      { en: 'I ate a sandwich.', tr: 'Sandviç yedim.' },
      { en: 'She ate breakfast.', tr: 'O kahvaltı yaptı.' },
      { en: 'We ate together.', tr: 'Birlikte yedik.' },
    ],
  },
  saw: {
    tr: 'Gördü',
    sentence: 'I saw a bird.',
    sentenceTr: 'Bir kuş gördüm.',
    altSentences: [
      { en: 'I saw a dog.', tr: 'Bir köpek gördüm.' },
      { en: 'She saw the movie.', tr: 'O filmi gördü.' },
      { en: 'We saw the rainbow.', tr: 'Gökkuşağını gördük.' },
    ],
  },
  came: {
    tr: 'Geldi',
    sentence: 'He came to my house.',
    sentenceTr: 'Evime geldi.',
    altSentences: [
      { en: 'She came to my house.', tr: 'O evime geldi.' },
      { en: 'He came early.', tr: 'O erken geldi.' },
      { en: 'They came by bus.', tr: 'Otobüsle geldiler.' },
    ],
  },
  said: {
    tr: 'Dedi',
    sentence: 'She said hello.',
    sentenceTr: 'Merhaba dedi.',
    altSentences: [
      { en: 'She said thank you.', tr: 'O teşekkür etti.' },
      { en: 'He said goodbye.', tr: 'O veda etti.' },
      { en: 'They said yes.', tr: 'Evet dediler.' },
    ],
  },
  got: {
    tr: 'Aldı',
    sentence: 'I got a gift.',
    sentenceTr: 'Bir hediye aldım.',
    altSentences: [
      { en: 'I got a new toy.', tr: 'Yeni bir oyuncak aldım.' },
      { en: 'She got a good grade.', tr: 'O iyi not aldı.' },
      { en: 'We got ice cream.', tr: 'Dondurma aldık.' },
    ],
  },
  yesterday: {
    tr: 'Dün',
    sentence: 'I played yesterday.',
    sentenceTr: 'Dün oynadım.',
    altSentences: [
      { en: 'I was happy yesterday.', tr: 'Dün mutluydum.' },
      { en: 'Yesterday was Monday.', tr: 'Dün pazartesiydi.' },
      { en: 'I saw you yesterday.', tr: 'Seni dün gördüm.' },
    ],
  },
  'I played': {
    tr: 'Oynadım',
    sentence: 'I played in the park.',
    sentenceTr: 'Parkta oynadım.',
    altSentences: [
      { en: 'I played with my sister.', tr: 'Kız kardeşimle oynadım.' },
      { en: 'I played all day.', tr: 'Bütün gün oynadım.' },
      { en: 'I played at the beach.', tr: 'Sahilde oynadım.' },
    ],
  },
  'I went to': {
    tr: 'Gittim',
    sentence: 'I went to the zoo.',
    sentenceTr: 'Hayvanat bahçesine gittim.',
    altSentences: [
      { en: 'I went to the market.', tr: 'Pazara gittim.' },
      { en: "I went to my friend's house.", tr: 'Arkadaşımın evine gittim.' },
      { en: 'I went to the cinema.', tr: 'Sinemaya gittim.' },
    ],
  },
  'I ate': {
    tr: 'Yedim',
    sentence: 'I ate pizza.',
    sentenceTr: 'Pizza yedim.',
    altSentences: [
      { en: 'I ate cake yesterday.', tr: 'Dün pasta yedim.' },
      { en: 'I ate lunch at school.', tr: 'Okulda öğle yemeği yedim.' },
      { en: 'I ate a sandwich.', tr: 'Sandviç yedim.' },
    ],
  },
  'I saw': {
    tr: 'Gördüm',
    sentence: 'I saw a rainbow.',
    sentenceTr: 'Gökkuşağı gördüm.',
    altSentences: [
      { en: 'I saw a bird in the tree.', tr: 'Ağaçta bir kuş gördüm.' },
      { en: 'I saw my teacher.', tr: 'Öğretmenimi gördüm.' },
      { en: 'I saw a big fish.', tr: 'Büyük bir balık gördüm.' },
    ],
  },
  was: {
    tr: 'İdi',
    sentence: 'It was a great day.',
    sentenceTr: 'Harika bir gündü.',
    altSentences: [
      { en: 'It was a sunny day.', tr: 'Güneşli bir gündü.' },
      { en: 'She was at home.', tr: 'O evdeydi.' },
      { en: 'It was very cold.', tr: 'Çok soğuktu.' },
    ],
  },

  // Future Tense
  'I will': {
    tr: 'Yapacağım',
    sentence: 'I will study hard.',
    sentenceTr: 'Çok çalışacağım.',
    altSentences: [
      { en: 'I will help you.', tr: 'Sana yardım edeceğim.' },
      { en: 'I will try my best.', tr: 'Elimden geleni yapacağım.' },
      { en: 'I will read a book.', tr: 'Bir kitap okuyacağım.' },
    ],
  },
  'You will': {
    tr: 'Yapacaksın',
    sentence: 'You will be great!',
    sentenceTr: 'Harika olacaksın!',
    altSentences: [
      { en: 'You will do great!', tr: 'Harika yapacaksın!' },
      { en: 'You will learn fast.', tr: 'Hızlı öğreneceksin.' },
      { en: 'You will love this.', tr: 'Bunu seveceksin.' },
    ],
  },
  go: {
    tr: 'Gitmek',
    sentence: 'I will go to the park.',
    sentenceTr: 'Parka gideceğim.',
    altSentences: [
      { en: 'I go to school.', tr: 'Okula giderim.' },
      { en: 'She goes home.', tr: 'O eve gider.' },
      { en: 'We go together.', tr: 'Birlikte gideriz.' },
    ],
  },
  eat: {
    tr: 'Yemek',
    sentence: 'We will eat lunch.',
    sentenceTr: 'Öğle yemeği yiyeceğiz.',
    altSentences: [
      { en: 'I eat breakfast.', tr: 'Kahvaltı yaparım.' },
      { en: 'She eats an apple.', tr: 'O bir elma yer.' },
      { en: 'We eat lunch.', tr: 'Öğle yemeği yeriz.' },
    ],
  },
  see: {
    tr: 'Görmek',
    sentence: 'I will see you tomorrow.',
    sentenceTr: 'Yarın görüşürüz.',
    altSentences: [
      { en: 'I see a rainbow.', tr: 'Bir gökkuşağı görüyorum.' },
      { en: 'She sees the bird.', tr: 'O kuşu görür.' },
      { en: 'We see the stars.', tr: 'Yıldızları görürüz.' },
    ],
  },
  'I am going to': {
    tr: 'Yapacağım',
    sentence: 'I am going to study.',
    sentenceTr: 'Çalışacağım.',
    altSentences: [
      { en: 'I am going to play.', tr: 'Oynayacağım.' },
      { en: 'I am going to read.', tr: 'Okuyacağım.' },
      { en: 'I am going to sleep.', tr: 'Uyuyacağım.' },
    ],
  },
  tomorrow: {
    tr: 'Yarın',
    sentence: 'I will go tomorrow.',
    sentenceTr: 'Yarın gideceğim.',
    altSentences: [
      { en: 'Tomorrow is Saturday.', tr: 'Yarın cumartesi.' },
      { en: 'I will come tomorrow.', tr: 'Yarın geleceğim.' },
      { en: 'Tomorrow will be sunny.', tr: 'Yarın güneşli olacak.' },
    ],
  },
  'next week': {
    tr: 'Gelecek hafta',
    sentence: 'We travel next week.',
    sentenceTr: 'Gelecek hafta seyahat edeceğiz.',
    altSentences: [
      { en: 'We have a test next week.', tr: 'Gelecek hafta sınavımız var.' },
      { en: 'I will visit you next week.', tr: 'Gelecek hafta seni ziyaret edeceğim.' },
      { en: 'Next week is my birthday.', tr: 'Gelecek hafta doğum günüm.' },
    ],
  },
  travel: {
    tr: 'Seyahat',
    sentence: 'I love to travel.',
    sentenceTr: 'Seyahat etmeyi severim.',
    altSentences: [
      { en: 'I travel by train.', tr: 'Trenle seyahat ederim.' },
      { en: 'She travels to France.', tr: "O Fransa'ya seyahat eder." },
      { en: 'We travel in summer.', tr: 'Yazın seyahat ederiz.' },
    ],
  },
  study: {
    tr: 'Çalışmak',
    sentence: 'I study every day.',
    sentenceTr: 'Her gün çalışırım.',
    altSentences: [
      { en: 'I study at home.', tr: 'Evde çalışırım.' },
      { en: 'She studies math.', tr: 'O matematik çalışır.' },
      { en: 'We study together.', tr: 'Birlikte çalışırız.' },
    ],
  },
  "Let's": {
    tr: 'Hadi',
    sentence: "Let's go to the park!",
    sentenceTr: 'Hadi parka gidelim!',
    altSentences: [
      { en: "Let's play a game!", tr: 'Hadi bir oyun oynayalım!' },
      { en: "Let's eat together.", tr: 'Hadi birlikte yiyelim.' },
      { en: "Let's read a story.", tr: 'Hadi bir hikaye okuyalım.' },
    ],
  },
  'Shall we': {
    tr: 'Yapalım mı',
    sentence: 'Shall we play?',
    sentenceTr: 'Oynayalım mı?',
    altSentences: [
      { en: 'Shall we dance?', tr: 'Dans edelim mi?' },
      { en: 'Shall we go now?', tr: 'Şimdi gidelim mi?' },
      { en: 'Shall we sing a song?', tr: 'Bir şarkı söyleyelim mi?' },
    ],
  },
  'I will go': {
    tr: 'Gideceğim',
    sentence: 'I will go to school.',
    sentenceTr: 'Okula gideceğim.',
    altSentences: [
      { en: 'I will go to the park.', tr: 'Parka gideceğim.' },
      { en: 'I will go home now.', tr: 'Şimdi eve gideceğim.' },
      { en: 'I will go swimming.', tr: 'Yüzmeye gideceğim.' },
    ],
  },
  'going to travel': {
    tr: 'Seyahat edecek',
    sentence: 'We are going to travel.',
    sentenceTr: 'Seyahat edeceğiz.',
    altSentences: [
      { en: 'We are going to travel by plane.', tr: 'Uçakla seyahat edeceğiz.' },
      { en: 'They are going to travel far.', tr: 'Uzağa seyahat edecekler.' },
      { en: 'I am going to travel to Japan.', tr: "Japonya'ya seyahat edeceğim." },
    ],
  },
  'next summer': {
    tr: 'Gelecek yaz',
    sentence: 'We will travel next summer.',
    sentenceTr: 'Gelecek yaz seyahat edeceğiz.',
    altSentences: [
      { en: 'We will travel next summer.', tr: 'Gelecek yaz seyahat edeceğiz.' },
      { en: 'I will swim next summer.', tr: 'Gelecek yaz yüzeceğim.' },
      { en: 'Next summer will be fun.', tr: 'Gelecek yaz eğlenceli olacak.' },
    ],
  },

  // World Tour
  Turkey: {
    tr: 'Türkiye',
    sentence: 'I live in Turkey.',
    sentenceTr: "Türkiye'de yaşıyorum.",
    altSentences: [
      { en: 'The Turkey is nice.', tr: 'Türkiye güzel.' },
      { en: 'I want a Turkey.', tr: 'Bir türkiye istiyorum.' },
      { en: 'I see a Turkey.', tr: 'Bir türkiye görüyorum.' },
    ],
  },
  England: {
    tr: 'İngiltere',
    sentence: 'England is in Europe.',
    sentenceTr: "İngiltere Avrupa'da.",
    altSentences: [
      { en: 'The England is here.', tr: 'İngiltere burada.' },
      { en: 'The England is nice.', tr: 'İngiltere güzel.' },
      { en: 'I want an England.', tr: 'Bir i̇ngiltere istiyorum.' },
    ],
  },
  America: {
    tr: 'Amerika',
    sentence: 'America is big.',
    sentenceTr: 'Amerika büyük.',
    altSentences: [
      { en: 'I see an America.', tr: 'Bir amerika görüyorum.' },
      { en: 'The America is big.', tr: 'Amerika büyük.' },
      { en: 'This is an America.', tr: 'Bu bir amerika.' },
    ],
  },
  Japan: {
    tr: 'Japonya',
    sentence: 'Japan has beautiful temples.',
    sentenceTr: "Japonya'nın güzel tapınakları var.",
    altSentences: [
      { en: 'I see a Japan.', tr: 'Bir japonya görüyorum.' },
      { en: 'The Japan is big.', tr: 'Japonya büyük.' },
      { en: 'This is a Japan.', tr: 'Bu bir japonya.' },
    ],
  },
  France: {
    tr: 'Fransa',
    sentence: 'The Eiffel Tower is in France.',
    sentenceTr: "Eyfel Kulesi Fransa'da.",
    altSentences: [
      { en: 'I want a France.', tr: 'Bir fransa istiyorum.' },
      { en: 'I see a France.', tr: 'Bir fransa görüyorum.' },
      { en: 'The France is big.', tr: 'Fransa büyük.' },
    ],
  },
  airport: {
    tr: 'Havalimanı',
    sentence: 'We go to the airport.',
    sentenceTr: 'Havalimanına gideriz.',
    altSentences: [
      { en: 'The airport is here.', tr: 'Havalimanı burada.' },
      { en: 'The airport is nice.', tr: 'Havalimanı güzel.' },
      { en: 'I want an airport.', tr: 'Bir havalimanı istiyorum.' },
    ],
  },
  ticket: {
    tr: 'Bilet',
    sentence: 'I buy a ticket.',
    sentenceTr: 'Bilet alırım.',
    altSentences: [
      { en: 'The ticket is nice.', tr: 'Bilet güzel.' },
      { en: 'I want a ticket.', tr: 'Bir bilet istiyorum.' },
      { en: 'I see a ticket.', tr: 'Bir bilet görüyorum.' },
    ],
  },
  passport: {
    tr: 'Pasaport',
    sentence: 'I need my passport.',
    sentenceTr: 'Pasaportuma ihtiyacım var.',
    altSentences: [
      { en: 'The passport is nice.', tr: 'Pasaport güzel.' },
      { en: 'I want a passport.', tr: 'Bir pasaport istiyorum.' },
      { en: 'I see a passport.', tr: 'Bir pasaport görüyorum.' },
    ],
  },
  hotel: {
    tr: 'Otel',
    sentence: 'We stay at a hotel.',
    sentenceTr: 'Otelde kalırız.',
    altSentences: [
      { en: 'The hotel is nice.', tr: 'Otel güzel.' },
      { en: 'I want a hotel.', tr: 'Bir otel istiyorum.' },
      { en: 'I see a hotel.', tr: 'Bir otel görüyorum.' },
    ],
  },
  suitcase: {
    tr: 'Bavul',
    sentence: 'I pack my suitcase.',
    sentenceTr: 'Bavulumu hazırlarım.',
    altSentences: [
      { en: 'The suitcase is here.', tr: 'Bavul burada.' },
      { en: 'The suitcase is nice.', tr: 'Bavul güzel.' },
      { en: 'I want a suitcase.', tr: 'Bir bavul istiyorum.' },
    ],
  },
  'I will visit': {
    tr: 'Ziyaret edeceğim',
    sentence: 'I will visit France.',
    sentenceTr: "Fransa'yı ziyaret edeceğim.",
    altSentences: [
      { en: 'I will visit my grandma.', tr: 'Büyükannemi ziyaret edeceğim.' },
      { en: 'I will visit the zoo.', tr: 'Hayvanat bahçesini ziyaret edeceğim.' },
      { en: 'I will visit London.', tr: "Londra'yı ziyaret edeceğim." },
    ],
  },
  beautiful: {
    tr: 'Güzel',
    sentence: 'The view is beautiful.',
    sentenceTr: 'Manzara güzel.',
    altSentences: [
      { en: 'This is beautiful.', tr: 'Bu güzel.' },
      { en: 'The house is beautiful.', tr: 'Ev güzel.' },
      { en: 'That is beautiful too.', tr: 'O da güzel.' },
    ],
  },
  culture: {
    tr: 'Kültür',
    sentence: 'Every country has a culture.',
    sentenceTr: 'Her ülkenin bir kültürü var.',
    altSentences: [
      { en: 'The culture is nice.', tr: 'Kültür güzel.' },
      { en: 'I want a culture.', tr: 'Bir kültür istiyorum.' },
      { en: 'I see a culture.', tr: 'Bir kültür görüyorum.' },
    ],
  },

  // ===== EXTENDED VOCABULARY — Adjectives =====
  tall: {
    tr: 'Uzun',
    emoji: '📏',
    sentence: 'My father is tall.',
    sentenceTr: 'Babam uzun boylu.',
    altSentences: [
      { en: 'The house is tall.', tr: 'Ev uzun.' },
      { en: 'That is tall too.', tr: 'O da uzun.' },
      { en: 'This is tall.', tr: 'Bu uzun.' },
    ],
  },
  short: {
    tr: 'Kısa',
    emoji: '📐',
    sentence: 'The table is short.',
    sentenceTr: 'Masa kısa.',
    altSentences: [
      { en: 'It is not short.', tr: 'Kısa değil.' },
      { en: 'She is short.', tr: 'O kısa.' },
      { en: 'It is very short.', tr: 'Çok kısa.' },
    ],
  },
  fast: {
    tr: 'Hızlı',
    emoji: '⚡',
    sentence: 'The car is fast.',
    sentenceTr: 'Araba hızlı.',
    altSentences: [
      { en: 'She is fast.', tr: 'O hızlı.' },
      { en: 'It is very fast.', tr: 'Çok hızlı.' },
      { en: 'It is not fast.', tr: 'Hızlı değil.' },
    ],
  },
  slow: {
    tr: 'Yavaş',
    emoji: '🐢',
    sentence: 'The turtle is slow.',
    sentenceTr: 'Kaplumbağa yavaş.',
    altSentences: [
      { en: 'This is a turtle.', tr: 'Bu bir kaplumbağa.' },
      { en: 'There is a turtle.', tr: 'Bir kaplumbağa var.' },
      { en: 'Where is the turtle?', tr: 'Kaplumbağa nerede?' },
    ],
  },
  hot: {
    tr: 'Sıcak',
    emoji: '🔥',
    sentence: 'The soup is hot.',
    sentenceTr: 'Çorba sıcak.',
    altSentences: [
      { en: 'This is hot.', tr: 'Bu sıcak.' },
      { en: 'The house is hot.', tr: 'Ev sıcak.' },
      { en: 'That is hot too.', tr: 'O da sıcak.' },
    ],
  },
  cold: {
    tr: 'Soğuk',
    emoji: '🥶',
    sentence: 'The water is cold.',
    sentenceTr: 'Su soğuk.',
    altSentences: [
      { en: 'She is cold.', tr: 'O soğuk.' },
      { en: 'It is very cold.', tr: 'Çok soğuk.' },
      { en: 'It is not cold.', tr: 'Soğuk değil.' },
    ],
  },
  new: {
    tr: 'Yeni',
    emoji: '✨',
    sentence: 'I have a new book.',
    sentenceTr: 'Yeni bir kitabım var.',
    altSentences: [
      { en: 'It is very new.', tr: 'Çok yeni.' },
      { en: 'It is not new.', tr: 'Yeni değil.' },
      { en: 'She is new.', tr: 'O yeni.' },
    ],
  },
  old: {
    tr: 'Eski',
    emoji: '📦',
    sentence: 'This house is old.',
    sentenceTr: 'Bu ev eski.',
    altSentences: [
      { en: 'This is old.', tr: 'Bu eski.' },
      { en: 'The house is old.', tr: 'Ev eski.' },
      { en: 'That is old too.', tr: 'O da eski.' },
    ],
  },
  good: {
    tr: 'İyi',
    emoji: '👍',
    sentence: 'This cake is good.',
    sentenceTr: 'Bu kek iyi.',
    altSentences: [
      { en: 'That is good too.', tr: 'O da i̇yi.' },
      { en: 'This is good.', tr: 'Bu i̇yi.' },
      { en: 'The house is good.', tr: 'Ev i̇yi.' },
    ],
  },
  bad: {
    tr: 'Kötü',
    emoji: '👎',
    sentence: 'The weather is bad.',
    sentenceTr: 'Hava kötü.',
    altSentences: [
      { en: 'This is bad.', tr: 'Bu kötü.' },
      { en: 'The house is bad.', tr: 'Ev kötü.' },
      { en: 'That is bad too.', tr: 'O da kötü.' },
    ],
  },
  clean: {
    tr: 'Temiz',
    emoji: '🧹',
    sentence: 'My room is clean.',
    sentenceTr: 'Odam temiz.',
    altSentences: [
      { en: 'That is clean too.', tr: 'O da temiz.' },
      { en: 'This is clean.', tr: 'Bu temiz.' },
      { en: 'The house is clean.', tr: 'Ev temiz.' },
    ],
  },
  dirty: {
    tr: 'Kirli',
    emoji: '🟤',
    sentence: 'My shoes are dirty.',
    sentenceTr: 'Ayakkabılarım kirli.',
    altSentences: [
      { en: 'She is dirty.', tr: 'O kirli.' },
      { en: 'It is very dirty.', tr: 'Çok kirli.' },
      { en: 'It is not dirty.', tr: 'Kirli değil.' },
    ],
  },
  strong: {
    tr: 'Güçlü',
    emoji: '💪',
    sentence: 'The lion is strong.',
    sentenceTr: 'Aslan güçlü.',
    altSentences: [
      { en: 'The house is strong.', tr: 'Ev güçlü.' },
      { en: 'That is strong too.', tr: 'O da güçlü.' },
      { en: 'This is strong.', tr: 'Bu güçlü.' },
    ],
  },
  weak: {
    tr: 'Zayıf',
    emoji: '🪶',
    sentence: 'The baby bird is weak.',
    sentenceTr: 'Yavru kuş zayıf.',
    altSentences: [
      { en: 'She is weak.', tr: 'O zayıf.' },
      { en: 'It is very weak.', tr: 'Çok zayıf.' },
      { en: 'It is not weak.', tr: 'Zayıf değil.' },
    ],
  },
  young: {
    tr: 'Genç',
    emoji: '👶',
    sentence: 'The puppy is young.',
    sentenceTr: 'Yavru köpek genç.',
    altSentences: [
      { en: 'She is young.', tr: 'O genç.' },
      { en: 'It is very young.', tr: 'Çok genç.' },
      { en: 'It is not young.', tr: 'Genç değil.' },
    ],
  },
  long: {
    tr: 'Uzun',
    emoji: '📏',
    sentence: 'The snake is long.',
    sentenceTr: 'Yılan uzun.',
    altSentences: [
      { en: 'It is very long.', tr: 'Çok uzun.' },
      { en: 'It is not long.', tr: 'Uzun değil.' },
      { en: 'She is long.', tr: 'O uzun.' },
    ],
  },
  round: {
    tr: 'Yuvarlak',
    emoji: '⭕',
    sentence: 'The ball is round.',
    sentenceTr: 'Top yuvarlak.',
    altSentences: [
      { en: 'It is very round.', tr: 'Çok yuvarlak.' },
      { en: 'It is not round.', tr: 'Yuvarlak değil.' },
      { en: 'She is round.', tr: 'O yuvarlak.' },
    ],
  },
  heavy: {
    tr: 'Ağır',
    emoji: '🏋️',
    sentence: 'The box is heavy.',
    sentenceTr: 'Kutu ağır.',
    altSentences: [
      { en: 'This is heavy.', tr: 'Bu ağır.' },
      { en: 'The house is heavy.', tr: 'Ev ağır.' },
      { en: 'That is heavy too.', tr: 'O da ağır.' },
    ],
  },
  light: {
    tr: 'Hafif',
    emoji: '🎈',
    sentence: 'The balloon is light.',
    sentenceTr: 'Balon hafif.',
    altSentences: [
      { en: 'It is not light.', tr: 'Hafif değil.' },
      { en: 'She is light.', tr: 'O hafif.' },
      { en: 'It is very light.', tr: 'Çok hafif.' },
    ],
  },
  quiet: {
    tr: 'Sessiz',
    emoji: '🤫',
    sentence: 'The library is quiet.',
    sentenceTr: 'Kütüphane sessiz.',
    altSentences: [
      { en: 'It is very quiet.', tr: 'Çok sessiz.' },
      { en: 'It is not quiet.', tr: 'Sessiz değil.' },
      { en: 'She is quiet.', tr: 'O sessiz.' },
    ],
  },
  loud: {
    tr: 'Gürültülü',
    emoji: '📢',
    sentence: 'The music is loud.',
    sentenceTr: 'Müzik gürültülü.',
    altSentences: [
      { en: 'She is loud.', tr: 'O gürültülü.' },
      { en: 'It is very loud.', tr: 'Çok gürültülü.' },
      { en: 'It is not loud.', tr: 'Gürültülü değil.' },
    ],
  },
  hungry: {
    tr: 'Aç',
    emoji: '🍽️',
    sentence: 'I am hungry.',
    sentenceTr: 'Açım.',
    altSentences: [
      { en: 'The house is hungry.', tr: 'Ev aç.' },
      { en: 'That is hungry too.', tr: 'O da aç.' },
      { en: 'This is hungry.', tr: 'Bu aç.' },
    ],
  },
  thirsty: {
    tr: 'Susuz',
    emoji: '💧',
    sentence: 'I am thirsty.',
    sentenceTr: 'Susadım.',
    altSentences: [
      { en: 'That is thirsty too.', tr: 'O da susuz.' },
      { en: 'This is thirsty.', tr: 'Bu susuz.' },
      { en: 'The house is thirsty.', tr: 'Ev susuz.' },
    ],
  },
  full: {
    tr: 'Tok',
    emoji: '😊',
    sentence: 'I am full now.',
    sentenceTr: 'Artık tokum.',
    altSentences: [
      { en: 'The house is full.', tr: 'Ev tok.' },
      { en: 'That is full too.', tr: 'O da tok.' },
      { en: 'This is full.', tr: 'Bu tok.' },
    ],
  },
  empty: {
    tr: 'Boş',
    emoji: '📭',
    sentence: 'The box is empty.',
    sentenceTr: 'Kutu boş.',
    altSentences: [
      { en: 'This is empty.', tr: 'Bu boş.' },
      { en: 'The house is empty.', tr: 'Ev boş.' },
      { en: 'That is empty too.', tr: 'O da boş.' },
    ],
  },

  // ===== Common Verbs =====
  run: {
    tr: 'Koşmak',
    emoji: '🏃',
    sentence: 'I run in the park.',
    sentenceTr: 'Parkta koşarım.',
    altSentences: [
      { en: 'I run every morning.', tr: 'Her sabah koşarım.' },
      { en: 'She runs very fast.', tr: 'O çok hızlı koşar.' },
      { en: 'We run in the park.', tr: 'Parkta koşarız.' },
    ],
  },
  jump: {
    tr: 'Zıplamak',
    emoji: '🦘',
    sentence: 'I can jump high.',
    sentenceTr: 'Yükseğe zıplayabilirim.',
    altSentences: [
      { en: 'The frog can jump high.', tr: 'Kurbağa yükseğe zıplayabilir.' },
      { en: 'I jump over the box.', tr: 'Kutunun üstünden atlarım.' },
      { en: 'We jump together.', tr: 'Birlikte zıplarız.' },
    ],
  },
  swim: {
    tr: 'Yüzmek',
    emoji: '🏊',
    sentence: 'I swim in summer.',
    sentenceTr: 'Yazın yüzerim.',
    altSentences: [
      { en: 'I swim in the pool.', tr: 'Havuzda yüzerim.' },
      { en: 'Fish can swim fast.', tr: 'Balıklar hızlı yüzebilir.' },
      { en: 'We swim every summer.', tr: 'Her yaz yüzeriz.' },
    ],
  },
  read: {
    tr: 'Okumak',
    emoji: '📖',
    sentence: 'I read books every day.',
    sentenceTr: 'Her gün kitap okurum.',
    altSentences: [
      { en: 'She reads a story.', tr: 'O bir hikaye okur.' },
      { en: 'I read before bed.', tr: 'Yatmadan önce okurum.' },
      { en: 'We read together.', tr: 'Birlikte okuruz.' },
    ],
  },
  write: {
    tr: 'Yazmak',
    emoji: '✍️',
    sentence: 'I write in my notebook.',
    sentenceTr: 'Defterime yazarım.',
    altSentences: [
      { en: 'I write a letter.', tr: 'Bir mektup yazarım.' },
      { en: 'She writes her name.', tr: 'O adını yazar.' },
      { en: 'We write every day.', tr: 'Her gün yazarız.' },
    ],
  },
  draw: {
    tr: 'Çizmek',
    emoji: '🎨',
    sentence: 'I draw animals.',
    sentenceTr: 'Hayvanlar çizerim.',
    altSentences: [
      { en: 'I draw a house.', tr: 'Bir ev çizerim.' },
      { en: 'She draws flowers.', tr: 'O çiçekler çizer.' },
      { en: 'We draw in art class.', tr: 'Resim dersinde çizeriz.' },
    ],
  },
  sing: {
    tr: 'Şarkı söylemek',
    emoji: '🎤',
    sentence: 'I sing happy songs.',
    sentenceTr: 'Mutlu şarkılar söylerim.',
    altSentences: [
      { en: 'I sing in the shower.', tr: 'Duşta şarkı söylerim.' },
      { en: 'She sings a song.', tr: 'O bir şarkı söyler.' },
      { en: 'We sing together.', tr: 'Birlikte şarkı söyleriz.' },
    ],
  },
  dance: {
    tr: 'Dans etmek',
    emoji: '💃',
    sentence: 'I like to dance.',
    sentenceTr: 'Dans etmeyi severim.',
    altSentences: [
      { en: 'I dance at the party.', tr: 'Partide dans ederim.' },
      { en: 'She dances very well.', tr: 'O çok iyi dans eder.' },
      { en: 'We dance to music.', tr: 'Müzikle dans ederiz.' },
    ],
  },
  give: {
    tr: 'Vermek',
    emoji: '🎁',
    sentence: 'I give a gift to my friend.',
    sentenceTr: 'Arkadaşıma hediye veririm.',
    altSentences: [
      { en: 'I give flowers to Mom.', tr: 'Anneye çiçek veririm.' },
      { en: 'She gives me a book.', tr: 'O bana bir kitap verir.' },
      { en: 'We give presents.', tr: 'Hediyeler veririz.' },
    ],
  },
  take: {
    tr: 'Almak',
    emoji: '🤲',
    sentence: 'I take my bag.',
    sentenceTr: 'Çantamı alırım.',
    altSentences: [
      { en: 'I take my umbrella.', tr: 'Şemsiyemi alırım.' },
      { en: 'She takes the bus.', tr: 'O otobüse biner.' },
      { en: 'We take our bags.', tr: 'Çantalarımızı alırız.' },
    ],
  },
  open: {
    tr: 'Açmak',
    emoji: '📂',
    sentence: 'Open the door please.',
    sentenceTr: 'Lütfen kapıyı aç.',
    altSentences: [
      { en: 'I open the book.', tr: 'Kitabı açarım.' },
      { en: 'She opens the box.', tr: 'O kutuyu açar.' },
      { en: 'We open the window.', tr: 'Pencereyi açarız.' },
    ],
  },
  close: {
    tr: 'Kapatmak',
    emoji: '📁',
    sentence: 'Close the window.',
    sentenceTr: 'Pencereyi kapat.',
    altSentences: [
      { en: 'I close my eyes.', tr: 'Gözlerimi kapatırım.' },
      { en: 'She closes the book.', tr: 'O kitabı kapatır.' },
      { en: 'We close the gate.', tr: 'Kapıyı kapatırız.' },
    ],
  },
  stop: {
    tr: 'Durmak',
    emoji: '🛑',
    sentence: 'Stop at the red light.',
    sentenceTr: 'Kırmızı ışıkta dur.',
    altSentences: [
      { en: 'I stop and look.', tr: 'Durur ve bakarım.' },
      { en: 'The bus stops here.', tr: 'Otobüs burada durur.' },
      { en: 'We stop at the sign.', tr: 'İşarette dururuz.' },
    ],
  },
  start: {
    tr: 'Başlamak',
    emoji: '▶️',
    sentence: 'Let us start the game.',
    sentenceTr: 'Oyunu başlatalım.',
    altSentences: [
      { en: 'I start my homework.', tr: 'Ödevime başlarım.' },
      { en: 'The movie starts now.', tr: 'Film şimdi başlar.' },
      { en: 'We start at nine.', tr: 'Dokuzda başlarız.' },
    ],
  },
  sit: {
    tr: 'Oturmak',
    emoji: '🪑',
    sentence: 'Please sit down.',
    sentenceTr: 'Lütfen otur.',
    altSentences: [
      { en: 'I sit on the floor.', tr: 'Yere otururum.' },
      { en: 'She sits next to me.', tr: 'O yanıma oturur.' },
      { en: 'We sit in the garden.', tr: 'Bahçede otururuz.' },
    ],
  },
  stand: {
    tr: 'Ayakta durmak',
    emoji: '🧍',
    sentence: 'Stand up please.',
    sentenceTr: 'Lütfen ayağa kalk.',
    altSentences: [
      { en: 'I stand in line.', tr: 'Sırada dururum.' },
      { en: 'She stands at the door.', tr: 'O kapıda durur.' },
      { en: 'We stand up together.', tr: 'Birlikte ayağa kalkarız.' },
    ],
  },
  wait: {
    tr: 'Beklemek',
    emoji: '⏳',
    sentence: 'Wait for me.',
    sentenceTr: 'Beni bekle.',
    altSentences: [
      { en: 'I wait at the bus stop.', tr: 'Otobüs durağında beklerim.' },
      { en: 'She waits for her friend.', tr: 'O arkadaşını bekler.' },
      { en: 'We wait patiently.', tr: 'Sabırla bekleriz.' },
    ],
  },
  listen: {
    tr: 'Dinlemek',
    emoji: '👂',
    sentence: 'Listen to the teacher.',
    sentenceTr: 'Öğretmeni dinle.',
    altSentences: [
      { en: 'I listen to music.', tr: 'Müzik dinlerim.' },
      { en: 'She listens carefully.', tr: 'O dikkatle dinler.' },
      { en: 'We listen to stories.', tr: 'Hikaye dinleriz.' },
    ],
  },
  think: {
    tr: 'Düşünmek',
    emoji: '💭',
    sentence: 'I think about animals.',
    sentenceTr: 'Hayvanları düşünürüm.',
    altSentences: [
      { en: 'I think it is good.', tr: 'İyi olduğunu düşünüyorum.' },
      { en: 'She thinks about school.', tr: 'O okulu düşünür.' },
      { en: 'We think together.', tr: 'Birlikte düşünürüz.' },
    ],
  },
  learn: {
    tr: 'Öğrenmek',
    emoji: '📚',
    sentence: 'I learn English every day.',
    sentenceTr: 'Her gün İngilizce öğrenirim.',
    altSentences: [
      { en: 'I learn new words.', tr: 'Yeni kelimeler öğrenirim.' },
      { en: 'She learns quickly.', tr: 'O hızlı öğrenir.' },
      { en: 'We learn at school.', tr: 'Okulda öğreniriz.' },
    ],
  },
  remember: {
    tr: 'Hatırlamak',
    emoji: '🧠',
    sentence: 'I remember your name.',
    sentenceTr: 'Adını hatırlıyorum.',
    altSentences: [
      { en: 'I remember the song.', tr: 'Şarkıyı hatırlıyorum.' },
      { en: 'She remembers my name.', tr: 'O adımı hatırlar.' },
      { en: 'We remember the rules.', tr: 'Kuralları hatırlarız.' },
    ],
  },
  forget: {
    tr: 'Unutmak',
    emoji: '❓',
    sentence: 'Do not forget your homework.',
    sentenceTr: 'Ödevini unutma.',
    altSentences: [
      { en: 'I forget my keys.', tr: 'Anahtarımı unuturum.' },
      { en: 'She forgets the answer.', tr: 'O cevabı unutur.' },
      { en: 'We never forget.', tr: 'Asla unutmayız.' },
    ],
  },
  try: {
    tr: 'Denemek',
    emoji: '💪',
    sentence: 'I will try again.',
    sentenceTr: 'Tekrar deneyeceğim.',
    altSentences: [
      { en: 'I try my best.', tr: 'Elimden geleni yaparım.' },
      { en: 'She tries new food.', tr: 'O yeni yemek dener.' },
      { en: 'We try together.', tr: 'Birlikte deneriz.' },
    ],
  },
  wash: {
    tr: 'Yıkamak',
    emoji: '🧼',
    sentence: 'Wash your hands.',
    sentenceTr: 'Ellerini yıka.',
    altSentences: [
      { en: 'I wash the dishes.', tr: 'Bulaşıkları yıkarım.' },
      { en: 'She washes her face.', tr: 'O yüzünü yıkar.' },
      { en: 'We wash the car.', tr: 'Arabayı yıkarız.' },
    ],
  },
  carry: {
    tr: 'Taşımak',
    emoji: '📦',
    sentence: 'I carry my bag.',
    sentenceTr: 'Çantamı taşırım.',
    altSentences: [
      { en: 'I carry the boxes.', tr: 'Kutuları taşırım.' },
      { en: 'She carries her books.', tr: 'O kitaplarını taşır.' },
      { en: 'We carry the bags.', tr: 'Çantaları taşırız.' },
    ],
  },
  throw: {
    tr: 'Fırlatmak',
    emoji: '🤾',
    sentence: 'Throw the ball.',
    sentenceTr: 'Topu fırlat.',
    altSentences: [
      { en: 'I throw the ball high.', tr: 'Topu yükseğe fırlatırım.' },
      { en: 'She throws it to me.', tr: 'O bana fırlatır.' },
      { en: 'We throw snowballs.', tr: 'Kar topu fırlatırız.' },
    ],
  },
  catch: {
    tr: 'Yakalamak',
    emoji: '🧤',
    sentence: 'Catch the ball!',
    sentenceTr: 'Topu yakala!',
    altSentences: [
      { en: 'I catch the ball.', tr: 'Topu yakalarım.' },
      { en: 'She catches butterflies.', tr: 'O kelebek yakalar.' },
      { en: 'We catch fish.', tr: 'Balık yakalarız.' },
    ],
  },
  push: {
    tr: 'İtmek',
    emoji: '👉',
    sentence: 'Push the door.',
    sentenceTr: 'Kapıyı it.',
    altSentences: [
      { en: 'I push the cart.', tr: 'Arabayı iterim.' },
      { en: 'She pushes the button.', tr: 'O düğmeye basar.' },
      { en: 'We push together.', tr: 'Birlikte iteriz.' },
    ],
  },
  pull: {
    tr: 'Çekmek',
    emoji: '👈',
    sentence: 'Pull the rope.',
    sentenceTr: 'İpi çek.',
    altSentences: [
      { en: 'I pull the door.', tr: 'Kapıyı çekerim.' },
      { en: 'She pulls the wagon.', tr: 'O vagonu çeker.' },
      { en: 'We pull the rope hard.', tr: 'İpi sıkı çekeriz.' },
    ],
  },

  // ===== Transport =====
  car: {
    tr: 'Araba',
    emoji: '🚗',
    sentence: 'The car is red.',
    sentenceTr: 'Araba kırmızı.',
    altSentences: [
      { en: 'Where is the car?', tr: 'Araba nerede?' },
      { en: 'The car is here.', tr: 'Araba burada.' },
      { en: 'The car is nice.', tr: 'Araba güzel.' },
    ],
  },
  bus: {
    tr: 'Otobüs',
    emoji: '🚌',
    sentence: 'I go to school by bus.',
    sentenceTr: 'Okula otobüsle giderim.',
    altSentences: [
      { en: 'I see a bus.', tr: 'Bir otobüs görüyorum.' },
      { en: 'The bus is big.', tr: 'Otobüs büyük.' },
      { en: 'This is a bus.', tr: 'Bu bir otobüs.' },
    ],
  },
  train: {
    tr: 'Tren',
    emoji: '🚂',
    sentence: 'The train is fast.',
    sentenceTr: 'Tren hızlı.',
    altSentences: [
      { en: 'Where is the train?', tr: 'Tren nerede?' },
      { en: 'The train is here.', tr: 'Tren burada.' },
      { en: 'The train is nice.', tr: 'Tren güzel.' },
    ],
  },
  plane: {
    tr: 'Uçak',
    emoji: '✈️',
    sentence: 'The plane flies in the sky.',
    sentenceTr: 'Uçak gökyüzünde uçar.',
    altSentences: [
      { en: 'This is a plane.', tr: 'Bu bir uçak.' },
      { en: 'There is a plane.', tr: 'Bir uçak var.' },
      { en: 'Where is the plane?', tr: 'Uçak nerede?' },
    ],
  },
  bicycle: {
    tr: 'Bisiklet',
    emoji: '🚲',
    sentence: 'I ride my bicycle.',
    sentenceTr: 'Bisikletimi sürerim.',
    altSentences: [
      { en: 'There is a bicycle.', tr: 'Bir bisiklet var.' },
      { en: 'Where is the bicycle?', tr: 'Bisiklet nerede?' },
      { en: 'The bicycle is here.', tr: 'Bisiklet burada.' },
    ],
  },
  boat: {
    tr: 'Tekne',
    emoji: '⛵',
    sentence: 'The boat is on the lake.',
    sentenceTr: 'Tekne gölde.',
    altSentences: [
      { en: 'Where is the boat?', tr: 'Tekne nerede?' },
      { en: 'The boat is here.', tr: 'Tekne burada.' },
      { en: 'The boat is nice.', tr: 'Tekne güzel.' },
    ],
  },
  ship: {
    tr: 'Gemi',
    emoji: '🚢',
    sentence: 'The ship is very big.',
    sentenceTr: 'Gemi çok büyük.',
    altSentences: [
      { en: 'The ship is nice.', tr: 'Gemi güzel.' },
      { en: 'I want a ship.', tr: 'Bir gemi istiyorum.' },
      { en: 'I see a ship.', tr: 'Bir gemi görüyorum.' },
    ],
  },
  taxi: {
    tr: 'Taksi',
    emoji: '🚕',
    sentence: 'We take a taxi.',
    sentenceTr: 'Taksi alırız.',
    altSentences: [
      { en: 'Where is the taxi?', tr: 'Taksi nerede?' },
      { en: 'The taxi is here.', tr: 'Taksi burada.' },
      { en: 'The taxi is nice.', tr: 'Taksi güzel.' },
    ],
  },
  helicopter: {
    tr: 'Helikopter',
    emoji: '🚁',
    sentence: 'The helicopter flies.',
    sentenceTr: 'Helikopter uçar.',
    altSentences: [
      { en: 'I want a helicopter.', tr: 'Bir helikopter istiyorum.' },
      { en: 'I see a helicopter.', tr: 'Bir helikopter görüyorum.' },
      { en: 'The helicopter is big.', tr: 'Helikopter büyük.' },
    ],
  },
  motorcycle: {
    tr: 'Motosiklet',
    emoji: '🏍️',
    sentence: 'The motorcycle is loud.',
    sentenceTr: 'Motosiklet gürültülü.',
    altSentences: [
      { en: 'The motorcycle is here.', tr: 'Motosiklet burada.' },
      { en: 'The motorcycle is nice.', tr: 'Motosiklet güzel.' },
      { en: 'I want a motorcycle.', tr: 'Bir motosiklet istiyorum.' },
    ],
  },

  // ===== More Food =====
  bread: {
    tr: 'Ekmek',
    emoji: '🍞',
    sentence: 'I eat bread for breakfast.',
    sentenceTr: 'Kahvaltıda ekmek yerim.',
    altSentences: [
      { en: 'Where is the bread?', tr: 'Ekmek nerede?' },
      { en: 'The bread is here.', tr: 'Ekmek burada.' },
      { en: 'The bread is nice.', tr: 'Ekmek güzel.' },
    ],
  },
  egg: {
    tr: 'Yumurta',
    emoji: '🥚',
    sentence: 'I eat an egg every morning.',
    sentenceTr: 'Her sabah yumurta yerim.',
    altSentences: [
      { en: 'There is an egg.', tr: 'Bir yumurta var.' },
      { en: 'Where is the egg?', tr: 'Yumurta nerede?' },
      { en: 'The egg is here.', tr: 'Yumurta burada.' },
    ],
  },
  cheese: {
    tr: 'Peynir',
    emoji: '🧀',
    sentence: 'The cheese is delicious.',
    sentenceTr: 'Peynir lezzetli.',
    altSentences: [
      { en: 'The cheese is big.', tr: 'Peynir büyük.' },
      { en: 'This is a cheese.', tr: 'Bu bir peynir.' },
      { en: 'There is a cheese.', tr: 'Bir peynir var.' },
    ],
  },
  rice: {
    tr: 'Pilav',
    emoji: '🍚',
    sentence: 'I like rice very much.',
    sentenceTr: 'Pilavı çok severim.',
    altSentences: [
      { en: 'There is a rice.', tr: 'Bir pilav var.' },
      { en: 'Where is the rice?', tr: 'Pilav nerede?' },
      { en: 'The rice is here.', tr: 'Pilav burada.' },
    ],
  },
  soup: {
    tr: 'Çorba',
    emoji: '🍲',
    sentence: 'The soup is hot.',
    sentenceTr: 'Çorba sıcak.',
    altSentences: [
      { en: 'I want a soup.', tr: 'Bir çorba istiyorum.' },
      { en: 'I see a soup.', tr: 'Bir çorba görüyorum.' },
      { en: 'The soup is big.', tr: 'Çorba büyük.' },
    ],
  },
  pizza: {
    tr: 'Pizza',
    emoji: '🍕',
    sentence: 'I love pizza!',
    sentenceTr: 'Pizzayı seviyorum!',
    altSentences: [
      { en: 'Where is the pizza?', tr: 'Pizza nerede?' },
      { en: 'The pizza is here.', tr: 'Pizza burada.' },
      { en: 'The pizza is nice.', tr: 'Pizza güzel.' },
    ],
  },
  cake: {
    tr: 'Pasta',
    emoji: '🎂',
    sentence: 'The cake is sweet.',
    sentenceTr: 'Pasta tatlı.',
    altSentences: [
      { en: 'The cake is nice.', tr: 'Pasta güzel.' },
      { en: 'I want a cake.', tr: 'Bir pasta istiyorum.' },
      { en: 'I see a cake.', tr: 'Bir pasta görüyorum.' },
    ],
  },
  candy: {
    tr: 'Şeker',
    emoji: '🍬',
    sentence: 'The candy is colorful.',
    sentenceTr: 'Şekerler renkli.',
    altSentences: [
      { en: 'I want a candy.', tr: 'Bir şeker istiyorum.' },
      { en: 'I see a candy.', tr: 'Bir şeker görüyorum.' },
      { en: 'The candy is big.', tr: 'Şeker büyük.' },
    ],
  },
  'ice cream': {
    tr: 'Dondurma',
    emoji: '🍦',
    sentence: 'I like ice cream in summer.',
    sentenceTr: 'Yazın dondurma severim.',
    altSentences: [
      { en: 'The ice cream is here.', tr: 'Dondurma burada.' },
      { en: 'The ice cream is nice.', tr: 'Dondurma güzel.' },
      { en: 'I want an ice cream.', tr: 'Bir dondurma istiyorum.' },
    ],
  },
  sandwich: {
    tr: 'Sandviç',
    emoji: '🥪',
    sentence: 'I make a sandwich.',
    sentenceTr: 'Sandviç yaparım.',
    altSentences: [
      { en: 'The sandwich is here.', tr: 'Sandviç burada.' },
      { en: 'The sandwich is nice.', tr: 'Sandviç güzel.' },
      { en: 'I want a sandwich.', tr: 'Bir sandviç istiyorum.' },
    ],
  },
  salad: {
    tr: 'Salata',
    emoji: '🥗',
    sentence: 'The salad is fresh.',
    sentenceTr: 'Salata taze.',
    altSentences: [
      { en: 'The salad is big.', tr: 'Salata büyük.' },
      { en: 'This is a salad.', tr: 'Bu bir salata.' },
      { en: 'There is a salad.', tr: 'Bir salata var.' },
    ],
  },
  meat: {
    tr: 'Et',
    emoji: '🥩',
    sentence: 'We eat meat on Sunday.',
    sentenceTr: 'Pazar günü et yeriz.',
    altSentences: [
      { en: 'I want a meat.', tr: 'Bir et istiyorum.' },
      { en: 'I see a meat.', tr: 'Bir et görüyorum.' },
      { en: 'The meat is big.', tr: 'Et büyük.' },
    ],
  },
  chocolate: {
    tr: 'Çikolata',
    emoji: '🍫',
    sentence: 'I love chocolate.',
    sentenceTr: 'Çikolatayı seviyorum.',
    altSentences: [
      { en: 'I see a chocolate.', tr: 'Bir çikolata görüyorum.' },
      { en: 'The chocolate is big.', tr: 'Çikolata büyük.' },
      { en: 'This is a chocolate.', tr: 'Bu bir çikolata.' },
    ],
  },
  cookie: {
    tr: 'Kurabiye',
    emoji: '🍪',
    sentence: 'My mom makes cookies.',
    sentenceTr: 'Annem kurabiye yapar.',
    altSentences: [
      { en: 'I see a cookie.', tr: 'Bir kurabiye görüyorum.' },
      { en: 'The cookie is big.', tr: 'Kurabiye büyük.' },
      { en: 'This is a cookie.', tr: 'Bu bir kurabiye.' },
    ],
  },
  honey: {
    tr: 'Bal',
    emoji: '🍯',
    sentence: 'Bears like honey.',
    sentenceTr: 'Ayılar bal sever.',
    altSentences: [
      { en: 'There is a honey.', tr: 'Bir bal var.' },
      { en: 'Where is the honey?', tr: 'Bal nerede?' },
      { en: 'The honey is here.', tr: 'Bal burada.' },
    ],
  },

  // ===== Household =====
  table: {
    tr: 'Masa',
    emoji: '🪑',
    sentence: 'The book is on the table.',
    sentenceTr: 'Kitap masanın üstünde.',
    altSentences: [
      { en: 'This is a table.', tr: 'Bu bir masa.' },
      { en: 'There is a table.', tr: 'Bir masa var.' },
      { en: 'Where is the table?', tr: 'Masa nerede?' },
    ],
  },
  chair: {
    tr: 'Sandalye',
    emoji: '💺',
    sentence: 'Sit on the chair.',
    sentenceTr: 'Sandalyeye otur.',
    altSentences: [
      { en: 'I want a chair.', tr: 'Bir sandalye istiyorum.' },
      { en: 'I see a chair.', tr: 'Bir sandalye görüyorum.' },
      { en: 'The chair is big.', tr: 'Sandalye büyük.' },
    ],
  },
  bed: {
    tr: 'Yatak',
    emoji: '🛏️',
    sentence: 'I sleep in my bed.',
    sentenceTr: 'Yatağımda uyurum.',
    altSentences: [
      { en: 'There is a bed.', tr: 'Bir yatak var.' },
      { en: 'Where is the bed?', tr: 'Yatak nerede?' },
      { en: 'The bed is here.', tr: 'Yatak burada.' },
    ],
  },
  lamp: {
    tr: 'Lamba',
    emoji: '💡',
    sentence: 'Turn on the lamp.',
    sentenceTr: 'Lambayı aç.',
    altSentences: [
      { en: 'I see a lamp.', tr: 'Bir lamba görüyorum.' },
      { en: 'The lamp is big.', tr: 'Lamba büyük.' },
      { en: 'This is a lamp.', tr: 'Bu bir lamba.' },
    ],
  },
  clock: {
    tr: 'Saat',
    emoji: '🕐',
    sentence: 'The clock is on the wall.',
    sentenceTr: 'Saat duvarda.',
    altSentences: [
      { en: 'The clock is nice.', tr: 'Saat güzel.' },
      { en: 'I want a clock.', tr: 'Bir saat istiyorum.' },
      { en: 'I see a clock.', tr: 'Bir saat görüyorum.' },
    ],
  },
  mirror: {
    tr: 'Ayna',
    emoji: '🪞',
    sentence: 'I look in the mirror.',
    sentenceTr: 'Aynaya bakarım.',
    altSentences: [
      { en: 'There is a mirror.', tr: 'Bir ayna var.' },
      { en: 'Where is the mirror?', tr: 'Ayna nerede?' },
      { en: 'The mirror is here.', tr: 'Ayna burada.' },
    ],
  },
  sofa: {
    tr: 'Kanepe',
    emoji: '🛋️',
    sentence: 'We sit on the sofa.',
    sentenceTr: 'Kanepede otururuz.',
    altSentences: [
      { en: 'The sofa is here.', tr: 'Kanepe burada.' },
      { en: 'The sofa is nice.', tr: 'Kanepe güzel.' },
      { en: 'I want a sofa.', tr: 'Bir kanepe istiyorum.' },
    ],
  },
  television: {
    tr: 'Televizyon',
    emoji: '📺',
    sentence: 'We watch television.',
    sentenceTr: 'Televizyon izleriz.',
    altSentences: [
      { en: 'I see a television.', tr: 'Bir televizyon görüyorum.' },
      { en: 'The television is big.', tr: 'Televizyon büyük.' },
      { en: 'This is a television.', tr: 'Bu bir televizyon.' },
    ],
  },
  fridge: {
    tr: 'Buzdolabı',
    emoji: '🧊',
    sentence: 'The milk is in the fridge.',
    sentenceTr: 'Süt buzdolabında.',
    altSentences: [
      { en: 'The fridge is here.', tr: 'Buzdolabı burada.' },
      { en: 'The fridge is nice.', tr: 'Buzdolabı güzel.' },
      { en: 'I want a fridge.', tr: 'Bir buzdolabı istiyorum.' },
    ],
  },
  oven: {
    tr: 'Fırın',
    emoji: '🔲',
    sentence: 'Mom uses the oven.',
    sentenceTr: 'Anne fırını kullanır.',
    altSentences: [
      { en: 'This is an oven.', tr: 'Bu bir fırın.' },
      { en: 'There is an oven.', tr: 'Bir fırın var.' },
      { en: 'Where is the oven?', tr: 'Fırın nerede?' },
    ],
  },
  pillow: {
    tr: 'Yastık',
    emoji: '🛌',
    sentence: 'My pillow is soft.',
    sentenceTr: 'Yastığım yumuşak.',
    altSentences: [
      { en: 'I want a pillow.', tr: 'Bir yastık istiyorum.' },
      { en: 'I see a pillow.', tr: 'Bir yastık görüyorum.' },
      { en: 'The pillow is big.', tr: 'Yastık büyük.' },
    ],
  },
  blanket: {
    tr: 'Battaniye',
    emoji: '🧣',
    sentence: 'The blanket is warm.',
    sentenceTr: 'Battaniye sıcak.',
    altSentences: [
      { en: 'The blanket is here.', tr: 'Battaniye burada.' },
      { en: 'The blanket is nice.', tr: 'Battaniye güzel.' },
      { en: 'I want a blanket.', tr: 'Bir battaniye istiyorum.' },
    ],
  },
  stairs: {
    tr: 'Merdiven',
    emoji: '🪜',
    sentence: 'I climb the stairs.',
    sentenceTr: 'Merdivenleri çıkarım.',
    altSentences: [
      { en: 'Where is the stairs?', tr: 'Merdiven nerede?' },
      { en: 'The stairs is here.', tr: 'Merdiven burada.' },
      { en: 'The stairs is nice.', tr: 'Merdiven güzel.' },
    ],
  },
  key: {
    tr: 'Anahtar',
    emoji: '🔑',
    sentence: 'I have the key.',
    sentenceTr: 'Anahtar bende.',
    altSentences: [
      { en: 'The key is here.', tr: 'Anahtar burada.' },
      { en: 'The key is nice.', tr: 'Anahtar güzel.' },
      { en: 'I want a key.', tr: 'Bir anahtar istiyorum.' },
    ],
  },
  telephone: {
    tr: 'Telefon',
    emoji: '📞',
    sentence: 'The telephone rings.',
    sentenceTr: 'Telefon çalıyor.',
    altSentences: [
      { en: 'The telephone is nice.', tr: 'Telefon güzel.' },
      { en: 'I want a telephone.', tr: 'Bir telefon istiyorum.' },
      { en: 'I see a telephone.', tr: 'Bir telefon görüyorum.' },
    ],
  },

  // ===== School Supplies =====
  ruler: {
    tr: 'Cetvel',
    emoji: '📏',
    sentence: 'I draw a line with a ruler.',
    sentenceTr: 'Cetvelle çizgi çizerim.',
    altSentences: [
      { en: 'I see a ruler.', tr: 'Bir cetvel görüyorum.' },
      { en: 'The ruler is big.', tr: 'Cetvel büyük.' },
      { en: 'This is a ruler.', tr: 'Bu bir cetvel.' },
    ],
  },
  eraser: {
    tr: 'Silgi',
    emoji: '🧹',
    sentence: 'I use an eraser.',
    sentenceTr: 'Silgi kullanırım.',
    altSentences: [
      { en: 'I see an eraser.', tr: 'Bir silgi görüyorum.' },
      { en: 'The eraser is big.', tr: 'Silgi büyük.' },
      { en: 'This is an eraser.', tr: 'Bu bir silgi.' },
    ],
  },
  pencil: {
    tr: 'Kurşun kalem',
    emoji: '✏️',
    sentence: 'I write with a pencil.',
    sentenceTr: 'Kurşun kalemle yazarım.',
    altSentences: [
      { en: 'There is a pencil.', tr: 'Bir kurşun kalem var.' },
      { en: 'Where is the pencil?', tr: 'Kurşun kalem nerede?' },
      { en: 'The pencil is here.', tr: 'Kurşun kalem burada.' },
    ],
  },
  notebook: {
    tr: 'Defter',
    emoji: '📓',
    sentence: 'I write in my notebook.',
    sentenceTr: 'Defterime yazarım.',
    altSentences: [
      { en: 'The notebook is here.', tr: 'Defter burada.' },
      { en: 'The notebook is nice.', tr: 'Defter güzel.' },
      { en: 'I want a notebook.', tr: 'Bir defter istiyorum.' },
    ],
  },
  backpack: {
    tr: 'Sırt çantası',
    emoji: '🎒',
    sentence: 'My backpack is blue.',
    sentenceTr: 'Sırt çantam mavi.',
    altSentences: [
      { en: 'This is a backpack.', tr: 'Bu bir sırt çantası.' },
      { en: 'There is a backpack.', tr: 'Bir sırt çantası var.' },
      { en: 'Where is the backpack?', tr: 'Sırt çantası nerede?' },
    ],
  },
  scissors: {
    tr: 'Makas',
    emoji: '✂️',
    sentence: 'I cut paper with scissors.',
    sentenceTr: 'Makasla kağıt keserim.',
    altSentences: [
      { en: 'The scissors is here.', tr: 'Makas burada.' },
      { en: 'The scissors is nice.', tr: 'Makas güzel.' },
      { en: 'I want a scissors.', tr: 'Bir makas istiyorum.' },
    ],
  },
  paper: {
    tr: 'Kağıt',
    emoji: '📄',
    sentence: 'I need paper.',
    sentenceTr: 'Kağıda ihtiyacım var.',
    altSentences: [
      { en: 'This is a paper.', tr: 'Bu bir kağıt.' },
      { en: 'There is a paper.', tr: 'Bir kağıt var.' },
      { en: 'Where is the paper?', tr: 'Kağıt nerede?' },
    ],
  },
  map: {
    tr: 'Harita',
    emoji: '🗺️',
    sentence: 'I look at the map.',
    sentenceTr: 'Haritaya bakarım.',
    altSentences: [
      { en: 'Where is the map?', tr: 'Harita nerede?' },
      { en: 'The map is here.', tr: 'Harita burada.' },
      { en: 'The map is nice.', tr: 'Harita güzel.' },
    ],
  },

  // ===== Shapes =====
  circle: {
    tr: 'Daire',
    emoji: '⭕',
    sentence: 'The ball is a circle.',
    sentenceTr: 'Top bir daire.',
    altSentences: [
      { en: 'I see a circle.', tr: 'Bir daire görüyorum.' },
      { en: 'The circle is big.', tr: 'Daire büyük.' },
      { en: 'This is a circle.', tr: 'Bu bir daire.' },
    ],
  },
  square: {
    tr: 'Kare',
    emoji: '⬜',
    sentence: 'The window is a square.',
    sentenceTr: 'Pencere bir kare.',
    altSentences: [
      { en: 'The square is here.', tr: 'Kare burada.' },
      { en: 'The square is nice.', tr: 'Kare güzel.' },
      { en: 'I want a square.', tr: 'Bir kare istiyorum.' },
    ],
  },
  triangle: {
    tr: 'Üçgen',
    emoji: '🔺',
    sentence: 'This is a triangle.',
    sentenceTr: 'Bu bir üçgen.',
    altSentences: [
      { en: 'Where is the triangle?', tr: 'Üçgen nerede?' },
      { en: 'The triangle is here.', tr: 'Üçgen burada.' },
      { en: 'The triangle is nice.', tr: 'Üçgen güzel.' },
    ],
  },
  rectangle: {
    tr: 'Dikdörtgen',
    emoji: '▬',
    sentence: 'The door is a rectangle.',
    sentenceTr: 'Kapı bir dikdörtgen.',
    altSentences: [
      { en: 'The rectangle is big.', tr: 'Dikdörtgen büyük.' },
      { en: 'This is a rectangle.', tr: 'Bu bir dikdörtgen.' },
      { en: 'There is a rectangle.', tr: 'Bir dikdörtgen var.' },
    ],
  },
  heart: {
    tr: 'Kalp',
    emoji: '❤️',
    sentence: 'I draw a heart.',
    sentenceTr: 'Kalp çizerim.',
    altSentences: [
      { en: 'The heart is nice.', tr: 'Kalp güzel.' },
      { en: 'I want a heart.', tr: 'Bir kalp istiyorum.' },
      { en: 'I see a heart.', tr: 'Bir kalp görüyorum.' },
    ],
  },

  // ===== Sports =====
  football: {
    tr: 'Futbol',
    emoji: '⚽',
    sentence: 'I play football.',
    sentenceTr: 'Futbol oynarım.',
    altSentences: [
      { en: 'There is a football.', tr: 'Bir futbol var.' },
      { en: 'Where is the football?', tr: 'Futbol nerede?' },
      { en: 'The football is here.', tr: 'Futbol burada.' },
    ],
  },
  basketball: {
    tr: 'Basketbol',
    emoji: '🏀',
    sentence: 'I play basketball.',
    sentenceTr: 'Basketbol oynarım.',
    altSentences: [
      { en: 'The basketball is big.', tr: 'Basketbol büyük.' },
      { en: 'This is a basketball.', tr: 'Bu bir basketbol.' },
      { en: 'There is a basketball.', tr: 'Bir basketbol var.' },
    ],
  },
  tennis: {
    tr: 'Tenis',
    emoji: '🎾',
    sentence: 'I play tennis on Saturday.',
    sentenceTr: 'Cumartesi tenis oynarım.',
    altSentences: [
      { en: 'The tennis is here.', tr: 'Tenis burada.' },
      { en: 'The tennis is nice.', tr: 'Tenis güzel.' },
      { en: 'I want a tennis.', tr: 'Bir tenis istiyorum.' },
    ],
  },
  swimming: {
    tr: 'Yüzme',
    emoji: '🏊',
    sentence: 'I love swimming.',
    sentenceTr: 'Yüzmeyi severim.',
    altSentences: [
      { en: 'There is a swimming.', tr: 'Bir yüzme var.' },
      { en: 'Where is the swimming?', tr: 'Yüzme nerede?' },
      { en: 'The swimming is here.', tr: 'Yüzme burada.' },
    ],
  },
  running: {
    tr: 'Koşu',
    emoji: '🏃',
    sentence: 'Running is fun.',
    sentenceTr: 'Koşu eğlenceli.',
    altSentences: [
      { en: 'The running is here.', tr: 'Koşu burada.' },
      { en: 'The running is nice.', tr: 'Koşu güzel.' },
      { en: 'I want a running.', tr: 'Bir koşu istiyorum.' },
    ],
  },
  ball: {
    tr: 'Top',
    emoji: '⚽',
    sentence: 'Throw the ball to me.',
    sentenceTr: 'Bana topu at.',
    altSentences: [
      { en: 'There is a ball.', tr: 'Bir top var.' },
      { en: 'Where is the ball?', tr: 'Top nerede?' },
      { en: 'The ball is here.', tr: 'Top burada.' },
    ],
  },
  team: {
    tr: 'Takım',
    emoji: '👥',
    sentence: 'We are a team.',
    sentenceTr: 'Biz bir takımız.',
    altSentences: [
      { en: 'I want a team.', tr: 'Bir takım istiyorum.' },
      { en: 'I see a team.', tr: 'Bir takım görüyorum.' },
      { en: 'The team is big.', tr: 'Takım büyük.' },
    ],
  },
  win: {
    tr: 'Kazanmak',
    emoji: '🏆',
    sentence: 'I want to win.',
    sentenceTr: 'Kazanmak istiyorum.',
    altSentences: [
      { en: 'Where is the win?', tr: 'Kazanmak nerede?' },
      { en: 'The win is here.', tr: 'Kazanmak burada.' },
      { en: 'The win is nice.', tr: 'Kazanmak güzel.' },
    ],
  },
  lose: {
    tr: 'Kaybetmek',
    emoji: '😞',
    sentence: 'I do not want to lose.',
    sentenceTr: 'Kaybetmek istemiyorum.',
    altSentences: [
      { en: 'There is a lose.', tr: 'Bir kaybetmek var.' },
      { en: 'Where is the lose?', tr: 'Kaybetmek nerede?' },
      { en: 'The lose is here.', tr: 'Kaybetmek burada.' },
    ],
  },
  goal: {
    tr: 'Gol',
    emoji: '🥅',
    sentence: 'I score a goal!',
    sentenceTr: 'Gol atarım!',
    altSentences: [
      { en: 'There is a goal.', tr: 'Bir gol var.' },
      { en: 'Where is the goal?', tr: 'Gol nerede?' },
      { en: 'The goal is here.', tr: 'Gol burada.' },
    ],
  },

  // ===== Music =====
  guitar: {
    tr: 'Gitar',
    emoji: '🎸',
    sentence: 'I play the guitar.',
    sentenceTr: 'Gitar çalarım.',
    altSentences: [
      { en: 'The guitar is nice.', tr: 'Gitar güzel.' },
      { en: 'I want a guitar.', tr: 'Bir gitar istiyorum.' },
      { en: 'I see a guitar.', tr: 'Bir gitar görüyorum.' },
    ],
  },
  piano: {
    tr: 'Piyano',
    emoji: '🎹',
    sentence: 'She plays the piano.',
    sentenceTr: 'O piyano çalar.',
    altSentences: [
      { en: 'I want a piano.', tr: 'Bir piyano istiyorum.' },
      { en: 'I see a piano.', tr: 'Bir piyano görüyorum.' },
      { en: 'The piano is big.', tr: 'Piyano büyük.' },
    ],
  },
  drum: {
    tr: 'Davul',
    emoji: '🥁',
    sentence: 'I play the drum.',
    sentenceTr: 'Davul çalarım.',
    altSentences: [
      { en: 'This is a drum.', tr: 'Bu bir davul.' },
      { en: 'There is a drum.', tr: 'Bir davul var.' },
      { en: 'Where is the drum?', tr: 'Davul nerede?' },
    ],
  },
  music: {
    tr: 'Müzik',
    emoji: '🎵',
    sentence: 'I love music.',
    sentenceTr: 'Müziği severim.',
    altSentences: [
      { en: 'The music is here.', tr: 'Müzik burada.' },
      { en: 'The music is nice.', tr: 'Müzik güzel.' },
      { en: 'I want a music.', tr: 'Bir müzik istiyorum.' },
    ],
  },

  // ===== Animals Extended =====
  penguin: {
    tr: 'Penguen',
    emoji: '🐧',
    sentence: 'The penguin lives in the cold.',
    sentenceTr: 'Penguen soğukta yaşar.',
    altSentences: [
      { en: 'Where is the penguin?', tr: 'Penguen nerede?' },
      { en: 'The penguin is here.', tr: 'Penguen burada.' },
      { en: 'The penguin is nice.', tr: 'Penguen güzel.' },
    ],
  },
  giraffe: {
    tr: 'Zürafa',
    emoji: '🦒',
    sentence: 'The giraffe is very tall.',
    sentenceTr: 'Zürafa çok uzun.',
    altSentences: [
      { en: 'The giraffe is nice.', tr: 'Zürafa güzel.' },
      { en: 'I want a giraffe.', tr: 'Bir zürafa istiyorum.' },
      { en: 'I see a giraffe.', tr: 'Bir zürafa görüyorum.' },
    ],
  },
  snake: {
    tr: 'Yılan',
    emoji: '🐍',
    sentence: 'The snake is long.',
    sentenceTr: 'Yılan uzun.',
    altSentences: [
      { en: 'I see a snake.', tr: 'Bir yılan görüyorum.' },
      { en: 'The snake is big.', tr: 'Yılan büyük.' },
      { en: 'This is a snake.', tr: 'Bu bir yılan.' },
    ],
  },
  parrot: {
    tr: 'Papağan',
    emoji: '🦜',
    sentence: 'The parrot can talk.',
    sentenceTr: 'Papağan konuşabilir.',
    altSentences: [
      { en: 'This is a parrot.', tr: 'Bu bir papağan.' },
      { en: 'There is a parrot.', tr: 'Bir papağan var.' },
      { en: 'Where is the parrot?', tr: 'Papağan nerede?' },
    ],
  },
  butterfly: {
    tr: 'Kelebek',
    emoji: '🦋',
    sentence: 'The butterfly is colorful.',
    sentenceTr: 'Kelebek renkli.',
    altSentences: [
      { en: 'The butterfly is here.', tr: 'Kelebek burada.' },
      { en: 'The butterfly is nice.', tr: 'Kelebek güzel.' },
      { en: 'I want a butterfly.', tr: 'Bir kelebek istiyorum.' },
    ],
  },
  bee: {
    tr: 'Arı',
    emoji: '🐝',
    sentence: 'The bee makes honey.',
    sentenceTr: 'Arı bal yapar.',
    altSentences: [
      { en: 'The bee is nice.', tr: 'Arı güzel.' },
      { en: 'I want a bee.', tr: 'Bir arı istiyorum.' },
      { en: 'I see a bee.', tr: 'Bir arı görüyorum.' },
    ],
  },
  ant: {
    tr: 'Karınca',
    emoji: '🐜',
    sentence: 'The ant is very small.',
    sentenceTr: 'Karınca çok küçük.',
    altSentences: [
      { en: 'There is an ant.', tr: 'Bir karınca var.' },
      { en: 'Where is the ant?', tr: 'Karınca nerede?' },
      { en: 'The ant is here.', tr: 'Karınca burada.' },
    ],
  },
  frog: {
    tr: 'Kurbağa',
    emoji: '🐸',
    sentence: 'The frog jumps high.',
    sentenceTr: 'Kurbağa yükseğe zıplar.',
    altSentences: [
      { en: 'Where is the frog?', tr: 'Kurbağa nerede?' },
      { en: 'The frog is here.', tr: 'Kurbağa burada.' },
      { en: 'The frog is nice.', tr: 'Kurbağa güzel.' },
    ],
  },
  owl: {
    tr: 'Baykuş',
    emoji: '🦉',
    sentence: 'The owl sees at night.',
    sentenceTr: 'Baykuş geceleyin görür.',
    altSentences: [
      { en: 'I see an owl.', tr: 'Bir baykuş görüyorum.' },
      { en: 'The owl is big.', tr: 'Baykuş büyük.' },
      { en: 'This is an owl.', tr: 'Bu bir baykuş.' },
    ],
  },
  kangaroo: {
    tr: 'Kanguru',
    emoji: '🦘',
    sentence: 'The kangaroo jumps far.',
    sentenceTr: 'Kanguru uzağa zıplar.',
    altSentences: [
      { en: 'I see a kangaroo.', tr: 'Bir kanguru görüyorum.' },
      { en: 'The kangaroo is big.', tr: 'Kanguru büyük.' },
      { en: 'This is a kangaroo.', tr: 'Bu bir kanguru.' },
    ],
  },

  // ===== Nature Extended =====
  mountain: {
    tr: 'Dağ',
    emoji: '⛰️',
    sentence: 'The mountain is high.',
    sentenceTr: 'Dağ yüksek.',
    altSentences: [
      { en: 'There is a mountain.', tr: 'Bir dağ var.' },
      { en: 'Where is the mountain?', tr: 'Dağ nerede?' },
      { en: 'The mountain is here.', tr: 'Dağ burada.' },
    ],
  },
  river: {
    tr: 'Nehir',
    emoji: '🏞️',
    sentence: 'The river flows fast.',
    sentenceTr: 'Nehir hızlı akar.',
    altSentences: [
      { en: 'This is a river.', tr: 'Bu bir nehir.' },
      { en: 'There is a river.', tr: 'Bir nehir var.' },
      { en: 'Where is the river?', tr: 'Nehir nerede?' },
    ],
  },
  sea: {
    tr: 'Deniz',
    emoji: '🌊',
    sentence: 'The sea is blue.',
    sentenceTr: 'Deniz mavi.',
    altSentences: [
      { en: 'The sea is here.', tr: 'Deniz burada.' },
      { en: 'The sea is nice.', tr: 'Deniz güzel.' },
      { en: 'I want a sea.', tr: 'Bir deniz istiyorum.' },
    ],
  },
  lake: {
    tr: 'Göl',
    emoji: '🏞️',
    sentence: 'We swim in the lake.',
    sentenceTr: 'Gölde yüzeriz.',
    altSentences: [
      { en: 'The lake is big.', tr: 'Göl büyük.' },
      { en: 'This is a lake.', tr: 'Bu bir göl.' },
      { en: 'There is a lake.', tr: 'Bir göl var.' },
    ],
  },
  sky: {
    tr: 'Gökyüzü',
    emoji: '🌤️',
    sentence: 'The sky is blue.',
    sentenceTr: 'Gökyüzü mavi.',
    altSentences: [
      { en: 'I want a sky.', tr: 'Bir gökyüzü istiyorum.' },
      { en: 'I see a sky.', tr: 'Bir gökyüzü görüyorum.' },
      { en: 'The sky is big.', tr: 'Gökyüzü büyük.' },
    ],
  },
  cloud: {
    tr: 'Bulut',
    emoji: '☁️',
    sentence: 'The cloud is white.',
    sentenceTr: 'Bulut beyaz.',
    altSentences: [
      { en: 'I want a cloud.', tr: 'Bir bulut istiyorum.' },
      { en: 'I see a cloud.', tr: 'Bir bulut görüyorum.' },
      { en: 'The cloud is big.', tr: 'Bulut büyük.' },
    ],
  },
  forest: {
    tr: 'Orman',
    emoji: '🌳',
    sentence: 'The forest has many trees.',
    sentenceTr: 'Ormanda birçok ağaç var.',
    altSentences: [
      { en: 'There is a forest.', tr: 'Bir orman var.' },
      { en: 'Where is the forest?', tr: 'Orman nerede?' },
      { en: 'The forest is here.', tr: 'Orman burada.' },
    ],
  },
  island: {
    tr: 'Ada',
    emoji: '🏝️',
    sentence: 'The island is beautiful.',
    sentenceTr: 'Ada güzel.',
    altSentences: [
      { en: 'There is an island.', tr: 'Bir ada var.' },
      { en: 'Where is the island?', tr: 'Ada nerede?' },
      { en: 'The island is here.', tr: 'Ada burada.' },
    ],
  },
  beach: {
    tr: 'Plaj',
    emoji: '🏖️',
    sentence: 'We go to the beach in summer.',
    sentenceTr: 'Yazın plaja gideriz.',
    altSentences: [
      { en: 'There is a beach.', tr: 'Bir plaj var.' },
      { en: 'Where is the beach?', tr: 'Plaj nerede?' },
      { en: 'The beach is here.', tr: 'Plaj burada.' },
    ],
  },
  desert: {
    tr: 'Çöl',
    emoji: '🏜️',
    sentence: 'The desert is very hot.',
    sentenceTr: 'Çöl çok sıcak.',
    altSentences: [
      { en: 'I want a desert.', tr: 'Bir çöl istiyorum.' },
      { en: 'I see a desert.', tr: 'Bir çöl görüyorum.' },
      { en: 'The desert is big.', tr: 'Çöl büyük.' },
    ],
  },

  // ===== More Months =====
  July: {
    tr: 'Temmuz',
    emoji: '☀️',
    sentence: 'July is very hot.',
    sentenceTr: 'Temmuz çok sıcak.',
    altSentences: [
      { en: 'It is July now.', tr: 'Şimdi Temmuz.' },
      { en: 'July is a nice month.', tr: 'Temmuz güzel bir ay.' },
      { en: 'I was born in July.', tr: 'Temmuz ayında doğdum.' },
    ],
  },
  August: {
    tr: 'Ağustos',
    emoji: '🌞',
    sentence: 'We go on vacation in August.',
    sentenceTr: 'Ağustosta tatile gideriz.',
    altSentences: [
      { en: 'It is August now.', tr: 'Şimdi Ağustos.' },
      { en: 'August is a nice month.', tr: 'Ağustos güzel bir ay.' },
      { en: 'I was born in August.', tr: 'Ağustos ayında doğdum.' },
    ],
  },
  September: {
    tr: 'Eylül',
    emoji: '🍂',
    sentence: 'School starts in September.',
    sentenceTr: 'Okul Eylülde başlar.',
    altSentences: [
      { en: 'It is September now.', tr: 'Şimdi Eylül.' },
      { en: 'September is a nice month.', tr: 'Eylül güzel bir ay.' },
      { en: 'I was born in September.', tr: 'Eylül ayında doğdum.' },
    ],
  },
  October: {
    tr: 'Ekim',
    emoji: '🎃',
    sentence: 'October is in autumn.',
    sentenceTr: 'Ekim sonbahardadır.',
    altSentences: [
      { en: 'It is October now.', tr: 'Şimdi Ekim.' },
      { en: 'October is a nice month.', tr: 'Ekim güzel bir ay.' },
      { en: 'I was born in October.', tr: 'Ekim ayında doğdum.' },
    ],
  },
  November: {
    tr: 'Kasım',
    emoji: '🍁',
    sentence: 'November is cold.',
    sentenceTr: 'Kasım soğuktur.',
    altSentences: [
      { en: 'It is November now.', tr: 'Şimdi Kasım.' },
      { en: 'November is a nice month.', tr: 'Kasım güzel bir ay.' },
      { en: 'I was born in November.', tr: 'Kasım ayında doğdum.' },
    ],
  },
  December: {
    tr: 'Aralık',
    emoji: '❄️',
    sentence: 'December is the last month.',
    sentenceTr: 'Aralık son ay.',
    altSentences: [
      { en: 'It is December now.', tr: 'Şimdi Aralık.' },
      { en: 'December is a nice month.', tr: 'Aralık güzel bir ay.' },
      { en: 'I was born in December.', tr: 'Aralık ayında doğdum.' },
    ],
  },

  // ===== Prepositions =====
  in: {
    tr: 'İçinde',
    emoji: '📥',
    sentence: 'The cat is in the box.',
    sentenceTr: 'Kedi kutunun içinde.',
    altSentences: [
      { en: 'The ball is in the box.', tr: 'Top kutunun içinde.' },
      { en: 'I am in the house.', tr: 'Evdeyim.' },
      { en: 'She is in the car.', tr: 'O arabada.' },
    ],
  },
  on: {
    tr: 'Üstünde',
    emoji: '⬆️',
    sentence: 'The book is on the table.',
    sentenceTr: 'Kitap masanın üstünde.',
    altSentences: [
      { en: 'The cup is on the table.', tr: 'Fincan masanın üstünde.' },
      { en: 'I sit on the chair.', tr: 'Sandalyeye otururum.' },
      { en: 'The cat is on the bed.', tr: 'Kedi yatakta.' },
    ],
  },
  under: {
    tr: 'Altında',
    emoji: '⬇️',
    sentence: 'The dog is under the table.',
    sentenceTr: 'Köpek masanın altında.',
    altSentences: [
      { en: 'The ball is under the chair.', tr: 'Top sandalyenin altında.' },
      { en: 'I hide under the bed.', tr: 'Yatağın altında saklanırım.' },
      { en: 'The shoes are under the table.', tr: 'Ayakkabılar masanın altında.' },
    ],
  },
  behind: {
    tr: 'Arkasında',
    emoji: '↩️',
    sentence: 'The cat is behind the sofa.',
    sentenceTr: 'Kedi kanepanin arkasında.',
    altSentences: [
      { en: 'The dog is behind the door.', tr: 'Köpek kapının arkasında.' },
      { en: 'I stand behind the tree.', tr: 'Ağacın arkasında dururum.' },
      { en: 'She hides behind the wall.', tr: 'O duvarın arkasında saklanır.' },
    ],
  },
  between: {
    tr: 'Arasında',
    emoji: '↔️',
    sentence: 'I sit between my friends.',
    sentenceTr: 'Arkadaşlarımın arasında otururum.',
    altSentences: [
      { en: 'I sit between my parents.', tr: 'Anne babamın arasında otururum.' },
      { en: 'The ball is between the chairs.', tr: 'Top sandalyelerin arasında.' },
      { en: 'She stands between her friends.', tr: 'O arkadaşlarının arasında durur.' },
    ],
  },
  above: {
    tr: 'Yukarısında',
    emoji: '☝️',
    sentence: 'The bird is above the tree.',
    sentenceTr: 'Kuş ağacın yukarısında.',
    altSentences: [
      { en: 'The lamp is above the table.', tr: 'Lamba masanın üstünde.' },
      { en: 'The clouds are above us.', tr: 'Bulutlar üstümüzde.' },
      { en: 'The picture is above the sofa.', tr: 'Resim kanepanin üstünde.' },
    ],
  },
  below: {
    tr: 'Aşağısında',
    emoji: '👇',
    sentence: 'The fish is below the water.',
    sentenceTr: 'Balık suyun aşağısında.',
    altSentences: [
      { en: 'The cat is below the window.', tr: 'Kedi pencerenin altında.' },
      { en: 'The town is below the hill.', tr: 'Kasaba tepenin altında.' },
      { en: 'The shoes are below the bed.', tr: 'Ayakkabılar yatağın altında.' },
    ],
  },
  near: {
    tr: 'Yakınında',
    emoji: '📍',
    sentence: 'The park is near my house.',
    sentenceTr: 'Park evimin yakınında.',
    altSentences: [
      { en: 'The school is near my home.', tr: 'Okul evimin yakınında.' },
      { en: 'I live near the park.', tr: 'Parkın yakınında yaşarım.' },
      { en: 'She sits near the window.', tr: 'O pencerenin yakınında oturur.' },
    ],
  },

  // ===== Demonstratives & Place =====
  this: {
    tr: 'Bu',
    emoji: '👆',
    sentence: 'This is my book.',
    sentenceTr: 'Bu benim kitabım.',
    altSentences: [
      { en: 'This is my house.', tr: 'Bu benim evim.' },
      { en: 'This pen is blue.', tr: 'Bu kalem mavi.' },
      { en: 'I like this song.', tr: 'Bu şarkıyı severim.' },
    ],
  },
  that: {
    tr: 'Şu',
    emoji: '👉',
    sentence: 'That is your pencil.',
    sentenceTr: 'Şu senin kalemin.',
    altSentences: [
      { en: 'That tree is very tall.', tr: 'Şu ağaç çok uzun.' },
      { en: 'That is my school.', tr: 'Şu benim okulum.' },
      { en: 'I want that book.', tr: 'Şu kitabı istiyorum.' },
    ],
  },
  here: {
    tr: 'Burada',
    emoji: '📌',
    sentence: 'Come here please.',
    sentenceTr: 'Lütfen buraya gel.',
    altSentences: [
      { en: 'Come here, please.', tr: 'Lütfen buraya gel.' },
      { en: 'I live here.', tr: 'Burada yaşıyorum.' },
      { en: 'The book is here.', tr: 'Kitap burada.' },
    ],
  },
  there: {
    tr: 'Orada',
    emoji: '🏁',
    sentence: 'The school is over there.',
    sentenceTr: 'Okul orada.',
    altSentences: [
      { en: 'The park is over there.', tr: 'Park orada.' },
      { en: 'Go there now.', tr: 'Şimdi oraya git.' },
      { en: 'My friend lives there.', tr: 'Arkadaşım orada yaşıyor.' },
    ],
  },

  // ===== More Emotions =====
  brave: {
    tr: 'Cesur',
    emoji: '🦸',
    sentence: 'The firefighter is brave.',
    sentenceTr: 'İtfaiyeci cesur.',
    altSentences: [
      { en: 'It is very brave.', tr: 'Çok cesur.' },
      { en: 'It is not brave.', tr: 'Cesur değil.' },
      { en: 'She is brave.', tr: 'O cesur.' },
    ],
  },
  tired: {
    tr: 'Yorgun',
    emoji: '😴',
    sentence: 'I am tired after school.',
    sentenceTr: 'Okuldan sonra yorgunum.',
    altSentences: [
      { en: 'It is not tired.', tr: 'Yorgun değil.' },
      { en: 'She is tired.', tr: 'O yorgun.' },
      { en: 'It is very tired.', tr: 'Çok yorgun.' },
    ],
  },
  surprised: {
    tr: 'Şaşkın',
    emoji: '😲',
    sentence: 'I am surprised!',
    sentenceTr: 'Şaşkınım!',
    altSentences: [
      { en: 'The house is surprised.', tr: 'Ev şaşkın.' },
      { en: 'That is surprised too.', tr: 'O da şaşkın.' },
      { en: 'This is surprised.', tr: 'Bu şaşkın.' },
    ],
  },
  bored: {
    tr: 'Sıkılmış',
    emoji: '😐',
    sentence: 'I am bored at home.',
    sentenceTr: 'Evde sıkılıyorum.',
    altSentences: [
      { en: 'It is not bored.', tr: 'Sıkılmış değil.' },
      { en: 'She is bored.', tr: 'O sıkılmış.' },
      { en: 'It is very bored.', tr: 'Çok sıkılmış.' },
    ],
  },
  proud: {
    tr: 'Gururlu',
    emoji: '😊',
    sentence: 'I am proud of myself.',
    sentenceTr: 'Kendimle gurur duyuyorum.',
    altSentences: [
      { en: 'It is not proud.', tr: 'Gururlu değil.' },
      { en: 'She is proud.', tr: 'O gururlu.' },
      { en: 'It is very proud.', tr: 'Çok gururlu.' },
    ],
  },
  shy: {
    tr: 'Utangaç',
    emoji: '🫣',
    sentence: 'The rabbit is shy.',
    sentenceTr: 'Tavşan utangaç.',
    altSentences: [
      { en: 'She is shy.', tr: 'O utangaç.' },
      { en: 'It is very shy.', tr: 'Çok utangaç.' },
      { en: 'It is not shy.', tr: 'Utangaç değil.' },
    ],
  },
  nervous: {
    tr: 'Gergin',
    emoji: '😰',
    sentence: 'I am nervous before the test.',
    sentenceTr: 'Sınavdan önce gerginim.',
    altSentences: [
      { en: 'It is very nervous.', tr: 'Çok gergin.' },
      { en: 'It is not nervous.', tr: 'Gergin değil.' },
      { en: 'She is nervous.', tr: 'O gergin.' },
    ],
  },

  // ===== Comparatives =====
  bigger: {
    tr: 'Daha büyük',
    emoji: '📈',
    sentence: 'The elephant is bigger than the cat.',
    sentenceTr: 'Fil kediden daha büyük.',
    altSentences: [
      { en: 'It is very bigger.', tr: 'Çok daha büyük.' },
      { en: 'It is not bigger.', tr: 'Daha büyük değil.' },
      { en: 'She is bigger.', tr: 'O daha büyük.' },
    ],
  },
  smaller: {
    tr: 'Daha küçük',
    emoji: '📉',
    sentence: 'The ant is smaller than the bee.',
    sentenceTr: 'Karınca arıdan daha küçük.',
    altSentences: [
      { en: 'It is not smaller.', tr: 'Daha küçük değil.' },
      { en: 'She is smaller.', tr: 'O daha küçük.' },
      { en: 'It is very smaller.', tr: 'Çok daha küçük.' },
    ],
  },
  faster: {
    tr: 'Daha hızlı',
    emoji: '🚀',
    sentence: 'The car is faster than the bicycle.',
    sentenceTr: 'Araba bisikletten daha hızlı.',
    altSentences: [
      { en: 'The house is faster.', tr: 'Ev daha hızlı.' },
      { en: 'That is faster too.', tr: 'O da daha hızlı.' },
      { en: 'This is faster.', tr: 'Bu daha hızlı.' },
    ],
  },
  taller: {
    tr: 'Daha uzun',
    emoji: '📊',
    sentence: 'The giraffe is taller than the horse.',
    sentenceTr: 'Zürafa attan daha uzun.',
    altSentences: [
      { en: 'It is not taller.', tr: 'Daha uzun değil.' },
      { en: 'She is taller.', tr: 'O daha uzun.' },
      { en: 'It is very taller.', tr: 'Çok daha uzun.' },
    ],
  },
  better: {
    tr: 'Daha iyi',
    emoji: '👍',
    sentence: 'This cake is better.',
    sentenceTr: 'Bu pasta daha iyi.',
    altSentences: [
      { en: 'She is better.', tr: 'O daha iyi.' },
      { en: 'It is very better.', tr: 'Çok daha iyi.' },
      { en: 'It is not better.', tr: 'Daha iyi değil.' },
    ],
  },
  worst: {
    tr: 'En kötü',
    emoji: '👎',
    sentence: 'This is the worst weather.',
    sentenceTr: 'Bu en kötü hava.',
    altSentences: [
      { en: 'That is worst too.', tr: 'O da en kötü.' },
      { en: 'This is worst.', tr: 'Bu en kötü.' },
      { en: 'The house is worst.', tr: 'Ev en kötü.' },
    ],
  },

  // ===== Ordinals =====
  first: {
    tr: 'Birinci',
    emoji: '🥇',
    sentence: 'I am first in the race.',
    sentenceTr: 'Yarışta birinciyim.',
    altSentences: [
      { en: 'I am the first in class.', tr: 'Sınıfta birinciyim.' },
      { en: 'The first day of school.', tr: 'Okulun ilk günü.' },
      { en: 'She finished first.', tr: 'O birinci bitirdi.' },
    ],
  },
  second: {
    tr: 'İkinci',
    emoji: '🥈',
    sentence: 'She is in second place.',
    sentenceTr: 'O ikinci sırada.',
    altSentences: [
      { en: 'I am in second grade.', tr: 'İkinci sınıftayım.' },
      { en: 'The second book is better.', tr: 'İkinci kitap daha iyi.' },
      { en: 'He came second.', tr: 'O ikinci geldi.' },
    ],
  },
  third: {
    tr: 'Üçüncü',
    emoji: '🥉',
    sentence: 'He finished third.',
    sentenceTr: 'O üçüncü bitirdi.',
    altSentences: [
      { en: 'My room is on the third floor.', tr: 'Odam üçüncü katta.' },
      { en: 'The third question is hard.', tr: 'Üçüncü soru zor.' },
      { en: 'I sit in the third row.', tr: 'Üçüncü sırada otururum.' },
    ],
  },
  last: {
    tr: 'Son',
    emoji: '🔚',
    sentence: 'This is the last page.',
    sentenceTr: 'Bu son sayfa.',
    altSentences: [
      { en: 'This is the last question.', tr: 'Bu son soru.' },
      { en: 'The last day of school.', tr: 'Okulun son günü.' },
      { en: 'He was the last one.', tr: 'O sonuncuydu.' },
    ],
  },

  // ===== Hygiene =====
  toothbrush: {
    tr: 'Diş fırçası',
    emoji: '🪥',
    sentence: 'I use my toothbrush.',
    sentenceTr: 'Diş fırçamı kullanırım.',
    altSentences: [
      { en: 'I see a toothbrush.', tr: 'Bir diş fırçası görüyorum.' },
      { en: 'The toothbrush is big.', tr: 'Diş fırçası büyük.' },
      { en: 'This is a toothbrush.', tr: 'Bu bir diş fırçası.' },
    ],
  },
  soap: {
    tr: 'Sabun',
    emoji: '🧼',
    sentence: 'I wash with soap.',
    sentenceTr: 'Sabunla yıkanırım.',
    altSentences: [
      { en: 'There is a soap.', tr: 'Bir sabun var.' },
      { en: 'Where is the soap?', tr: 'Sabun nerede?' },
      { en: 'The soap is here.', tr: 'Sabun burada.' },
    ],
  },
  towel: {
    tr: 'Havlu',
    emoji: '🧴',
    sentence: 'I dry with a towel.',
    sentenceTr: 'Havluyla kurulunurum.',
    altSentences: [
      { en: 'There is a towel.', tr: 'Bir havlu var.' },
      { en: 'Where is the towel?', tr: 'Havlu nerede?' },
      { en: 'The towel is here.', tr: 'Havlu burada.' },
    ],
  },
  shower: {
    tr: 'Duş',
    emoji: '🚿',
    sentence: 'I take a shower.',
    sentenceTr: 'Duş alırım.',
    altSentences: [
      { en: 'This is a shower.', tr: 'Bu bir duş.' },
      { en: 'There is a shower.', tr: 'Bir duş var.' },
      { en: 'Where is the shower?', tr: 'Duş nerede?' },
    ],
  },

  // ===== Toys & Play =====
  toy: {
    tr: 'Oyuncak',
    emoji: '🧸',
    sentence: 'I have many toys.',
    sentenceTr: 'Birçok oyuncağım var.',
    altSentences: [
      { en: 'The toy is nice.', tr: 'Oyuncak güzel.' },
      { en: 'I want a toy.', tr: 'Bir oyuncak istiyorum.' },
      { en: 'I see a toy.', tr: 'Bir oyuncak görüyorum.' },
    ],
  },
  doll: {
    tr: 'Bebek',
    emoji: '🪆',
    sentence: 'She plays with a doll.',
    sentenceTr: 'Bebekle oynar.',
    altSentences: [
      { en: 'There is a doll.', tr: 'Bir bebek var.' },
      { en: 'Where is the doll?', tr: 'Bebek nerede?' },
      { en: 'The doll is here.', tr: 'Bebek burada.' },
    ],
  },
  kite: {
    tr: 'Uçurtma',
    emoji: '🪁',
    sentence: 'I fly a kite.',
    sentenceTr: 'Uçurtma uçururum.',
    altSentences: [
      { en: 'The kite is big.', tr: 'Uçurtma büyük.' },
      { en: 'This is a kite.', tr: 'Bu bir uçurtma.' },
      { en: 'There is a kite.', tr: 'Bir uçurtma var.' },
    ],
  },
  puzzle: {
    tr: 'Bulmaca',
    emoji: '🧩',
    sentence: 'I love puzzles.',
    sentenceTr: 'Bulmacaları severim.',
    altSentences: [
      { en: 'I see a puzzle.', tr: 'Bir bulmaca görüyorum.' },
      { en: 'The puzzle is big.', tr: 'Bulmaca büyük.' },
      { en: 'This is a puzzle.', tr: 'Bu bir bulmaca.' },
    ],
  },
  balloon: {
    tr: 'Balon',
    emoji: '🎈',
    sentence: 'The balloon is red.',
    sentenceTr: 'Balon kırmızı.',
    altSentences: [
      { en: 'I want a balloon.', tr: 'Bir balon istiyorum.' },
      { en: 'I see a balloon.', tr: 'Bir balon görüyorum.' },
      { en: 'The balloon is big.', tr: 'Balon büyük.' },
    ],
  },
  game: {
    tr: 'Oyun',
    emoji: '🎮',
    sentence: 'Let us play a game.',
    sentenceTr: 'Oyun oynayalım.',
    altSentences: [
      { en: 'I see a game.', tr: 'Bir oyun görüyorum.' },
      { en: 'The game is big.', tr: 'Oyun büyük.' },
      { en: 'This is a game.', tr: 'Bu bir oyun.' },
    ],
  },

  // ===== Time of Day =====
  noon: {
    tr: 'Öğle',
    emoji: '☀️',
    sentence: 'We eat lunch at noon.',
    sentenceTr: 'Öğle yemeğini öğleyin yeriz.',
    altSentences: [
      { en: 'We eat lunch at noon.', tr: 'Öğleyin öğle yemeği yeriz.' },
      { en: 'It is hot at noon.', tr: 'Öğleyin sıcak.' },
      { en: 'The sun is high at noon.', tr: 'Öğleyin güneş yüksek.' },
    ],
  },
  afternoon: {
    tr: 'Öğleden sonra',
    emoji: '🌤️',
    sentence: 'I play in the afternoon.',
    sentenceTr: 'Öğleden sonra oynarım.',
    altSentences: [
      { en: 'I play in the afternoon.', tr: 'Öğleden sonra oynarım.' },
      { en: 'The afternoon is warm.', tr: 'Öğleden sonra sıcak.' },
      { en: 'We have class in the afternoon.', tr: 'Öğleden sonra dersimiz var.' },
    ],
  },
  midnight: {
    tr: 'Gece yarısı',
    emoji: '🌙',
    sentence: 'I am asleep at midnight.',
    sentenceTr: 'Gece yarısı uyuyorum.',
    altSentences: [
      { en: 'It is dark at midnight.', tr: 'Gece yarısı karanlık.' },
      { en: 'Everyone sleeps at midnight.', tr: 'Gece yarısı herkes uyur.' },
      { en: 'The clock strikes at midnight.', tr: 'Saat gece yarısı çalar.' },
    ],
  },
  today: {
    tr: 'Bugün',
    emoji: '📅',
    sentence: 'Today is a good day.',
    sentenceTr: 'Bugün güzel bir gün.',
    altSentences: [
      { en: 'Today is a beautiful day.', tr: 'Bugün güzel bir gün.' },
      { en: 'Today I am happy.', tr: 'Bugün mutluyum.' },
      { en: 'What day is today?', tr: 'Bugün günlerden ne?' },
    ],
  },
  now: {
    tr: 'Şimdi',
    emoji: '⏰',
    sentence: 'I am here now.',
    sentenceTr: 'Şimdi buradayım.',
    altSentences: [
      { en: 'I am reading now.', tr: 'Şimdi okuyorum.' },
      { en: 'Come here now.', tr: 'Şimdi buraya gel.' },
      { en: 'We are ready now.', tr: 'Şimdi hazırız.' },
    ],
  },

  // ===== Weather Extended =====
  warm: {
    tr: 'Ilık',
    emoji: '🌡️',
    sentence: 'The water is warm.',
    sentenceTr: 'Su ılık.',
    altSentences: [
      { en: 'This is warm.', tr: 'Bu ilık.' },
      { en: 'The house is warm.', tr: 'Ev ilık.' },
      { en: 'That is warm too.', tr: 'O da ilık.' },
    ],
  },
  cool: {
    tr: 'Serin',
    emoji: '🌬️',
    sentence: 'The evening is cool.',
    sentenceTr: 'Akşam serin.',
    altSentences: [
      { en: 'The house is cool.', tr: 'Ev serin.' },
      { en: 'That is cool too.', tr: 'O da serin.' },
      { en: 'This is cool.', tr: 'Bu serin.' },
    ],
  },
  storm: {
    tr: 'Fırtına',
    emoji: '⛈️',
    sentence: 'There is a storm outside.',
    sentenceTr: 'Dışarıda fırtına var.',
    altSentences: [
      { en: 'The storm is big.', tr: 'Fırtına büyük.' },
      { en: 'This is a storm.', tr: 'Bu bir fırtına.' },
      { en: 'There is a storm.', tr: 'Bir fırtına var.' },
    ],
  },
  rainbow: {
    tr: 'Gökkuşağı',
    emoji: '🌈',
    sentence: 'I see a rainbow!',
    sentenceTr: 'Gökkuşağı görüyorum!',
    altSentences: [
      { en: 'I see a rainbow.', tr: 'Bir gökkuşağı görüyorum.' },
      { en: 'The rainbow is big.', tr: 'Gökkuşağı büyük.' },
      { en: 'This is a rainbow.', tr: 'Bu bir gökkuşağı.' },
    ],
  },

  // ===== Containers =====
  cup: {
    tr: 'Fincan',
    emoji: '☕',
    sentence: 'I drink from a cup.',
    sentenceTr: 'Fincandan içerim.',
    altSentences: [
      { en: 'This is a cup.', tr: 'Bu bir fincan.' },
      { en: 'There is a cup.', tr: 'Bir fincan var.' },
      { en: 'Where is the cup?', tr: 'Fincan nerede?' },
    ],
  },
  bottle: {
    tr: 'Şişe',
    emoji: '🍼',
    sentence: 'The water bottle is blue.',
    sentenceTr: 'Su şişesi mavi.',
    altSentences: [
      { en: 'I see a bottle.', tr: 'Bir şişe görüyorum.' },
      { en: 'The bottle is big.', tr: 'Şişe büyük.' },
      { en: 'This is a bottle.', tr: 'Bu bir şişe.' },
    ],
  },
  box: {
    tr: 'Kutu',
    emoji: '📦',
    sentence: 'The gift is in the box.',
    sentenceTr: 'Hediye kutunun içinde.',
    altSentences: [
      { en: 'The box is here.', tr: 'Kutu burada.' },
      { en: 'The box is nice.', tr: 'Kutu güzel.' },
      { en: 'I want a box.', tr: 'Bir kutu istiyorum.' },
    ],
  },
  bag: {
    tr: 'Çanta',
    emoji: '👜',
    sentence: 'I carry my bag.',
    sentenceTr: 'Çantamı taşırım.',
    altSentences: [
      { en: 'I see a bag.', tr: 'Bir çanta görüyorum.' },
      { en: 'The bag is big.', tr: 'Çanta büyük.' },
      { en: 'This is a bag.', tr: 'Bu bir çanta.' },
    ],
  },

  // ===== People & Relationships =====
  friend: {
    tr: 'Arkadaş',
    emoji: '🤝',
    sentence: 'He is my friend.',
    sentenceTr: 'O benim arkadaşım.',
    altSentences: [
      { en: 'This is a friend.', tr: 'Bu bir arkadaş.' },
      { en: 'There is a friend.', tr: 'Bir arkadaş var.' },
      { en: 'Where is the friend?', tr: 'Arkadaş nerede?' },
    ],
  },
  boy: {
    tr: 'Erkek çocuk',
    emoji: '👦',
    sentence: 'The boy plays football.',
    sentenceTr: 'Erkek çocuk futbol oynar.',
    altSentences: [
      { en: 'I see a boy.', tr: 'Bir erkek çocuk görüyorum.' },
      { en: 'The boy is big.', tr: 'Erkek çocuk büyük.' },
      { en: 'This is a boy.', tr: 'Bu bir erkek çocuk.' },
    ],
  },
  girl: {
    tr: 'Kız çocuk',
    emoji: '👧',
    sentence: 'The girl reads a book.',
    sentenceTr: 'Kız çocuk kitap okur.',
    altSentences: [
      { en: 'Where is the girl?', tr: 'Kız çocuk nerede?' },
      { en: 'The girl is here.', tr: 'Kız çocuk burada.' },
      { en: 'The girl is nice.', tr: 'Kız çocuk güzel.' },
    ],
  },
  man: {
    tr: 'Adam',
    emoji: '👨',
    sentence: 'The man is tall.',
    sentenceTr: 'Adam uzun boylu.',
    altSentences: [
      { en: 'The man is nice.', tr: 'Adam güzel.' },
      { en: 'I want a man.', tr: 'Bir adam istiyorum.' },
      { en: 'I see a man.', tr: 'Bir adam görüyorum.' },
    ],
  },
  woman: {
    tr: 'Kadın',
    emoji: '👩',
    sentence: 'The woman is kind.',
    sentenceTr: 'Kadın iyi kalpli.',
    altSentences: [
      { en: 'I see a woman.', tr: 'Bir kadın görüyorum.' },
      { en: 'The woman is big.', tr: 'Kadın büyük.' },
      { en: 'This is a woman.', tr: 'Bu bir kadın.' },
    ],
  },
  child: {
    tr: 'Çocuk',
    emoji: '🧒',
    sentence: 'The child is happy.',
    sentenceTr: 'Çocuk mutlu.',
    altSentences: [
      { en: 'The child is nice.', tr: 'Çocuk güzel.' },
      { en: 'I want a child.', tr: 'Bir çocuk istiyorum.' },
      { en: 'I see a child.', tr: 'Bir çocuk görüyorum.' },
    ],
  },
  people: {
    tr: 'İnsanlar',
    emoji: '👫',
    sentence: 'Many people are in the park.',
    sentenceTr: 'Parkta birçok insan var.',
    altSentences: [
      { en: 'The people is big.', tr: 'İnsanlar büyük.' },
      { en: 'This is a people.', tr: 'Bu bir i̇nsanlar.' },
      { en: 'There is a people.', tr: 'Bir i̇nsanlar var.' },
    ],
  },
  grandmother: {
    tr: 'Büyükanne',
    emoji: '👵',
    sentence: 'I visit my grandmother.',
    sentenceTr: 'Büyükannemi ziyaret ederim.',
    altSentences: [
      { en: 'There is a grandmother.', tr: 'Bir büyükanne var.' },
      { en: 'Where is the grandmother?', tr: 'Büyükanne nerede?' },
      { en: 'The grandmother is here.', tr: 'Büyükanne burada.' },
    ],
  },
  grandfather: {
    tr: 'Büyükbaba',
    emoji: '👴',
    sentence: 'My grandfather tells stories.',
    sentenceTr: 'Büyükbabam hikaye anlatır.',
    altSentences: [
      { en: 'Where is the grandfather?', tr: 'Büyükbaba nerede?' },
      { en: 'The grandfather is here.', tr: 'Büyükbaba burada.' },
      { en: 'The grandfather is nice.', tr: 'Büyükbaba güzel.' },
    ],
  },
  // ===== EXPANDED VOCAB — Nature & Weather =====
  ocean: {
    tr: 'Okyanus',
    emoji: '🌊',
    sentence: 'The ocean is deep.',
    sentenceTr: 'Okyanus derin.',
    altSentences: [
      { en: 'Where is the ocean?', tr: 'Okyanus nerede?' },
      { en: 'The ocean is here.', tr: 'Okyanus burada.' },
      { en: 'The ocean is nice.', tr: 'Okyanus güzel.' },
    ],
  },
  valley: {
    tr: 'Vadi',
    emoji: '🏔️',
    sentence: 'There is a valley between the mountains.',
    sentenceTr: 'Dağlar arasında bir vadi var.',
    altSentences: [
      { en: 'The valley is big.', tr: 'Vadi büyük.' },
      { en: 'This is a valley.', tr: 'Bu bir vadi.' },
      { en: 'There is a valley.', tr: 'Bir vadi var.' },
    ],
  },
  field: {
    tr: 'Tarla',
    emoji: '🌾',
    sentence: 'The field is full of wheat.',
    sentenceTr: 'Tarla buğdayla dolu.',
    altSentences: [
      { en: 'The field is nice.', tr: 'Tarla güzel.' },
      { en: 'I want a field.', tr: 'Bir tarla istiyorum.' },
      { en: 'I see a field.', tr: 'Bir tarla görüyorum.' },
    ],
  },
  cave: {
    tr: 'Mağara',
    emoji: '🕳️',
    sentence: 'The cave is dark.',
    sentenceTr: 'Mağara karanlık.',
    altSentences: [
      { en: 'I want a cave.', tr: 'Bir mağara istiyorum.' },
      { en: 'I see a cave.', tr: 'Bir mağara görüyorum.' },
      { en: 'The cave is big.', tr: 'Mağara büyük.' },
    ],
  },
  // ===== Body & Health =====
  tooth: {
    tr: 'Diş',
    emoji: '🦷',
    sentence: 'I brush my teeth every day.',
    sentenceTr: 'Her gün dişlerimi fırçalarım.',
    altSentences: [
      { en: 'Where is the tooth?', tr: 'Diş nerede?' },
      { en: 'The tooth is here.', tr: 'Diş burada.' },
      { en: 'The tooth is nice.', tr: 'Diş güzel.' },
    ],
  },
  finger: {
    tr: 'Parmak',
    emoji: '☝️',
    sentence: 'I have ten fingers.',
    sentenceTr: 'On parmağım var.',
    altSentences: [
      { en: 'There is a finger.', tr: 'Bir parmak var.' },
      { en: 'Where is the finger?', tr: 'Parmak nerede?' },
      { en: 'The finger is here.', tr: 'Parmak burada.' },
    ],
  },
  // ===== Clothing =====
  coat: {
    tr: 'Palto',
    emoji: '🧥',
    sentence: 'I wear a coat in winter.',
    sentenceTr: 'Kışın palto giyerim.',
    altSentences: [
      { en: 'I want a coat.', tr: 'Bir palto istiyorum.' },
      { en: 'I see a coat.', tr: 'Bir palto görüyorum.' },
      { en: 'The coat is big.', tr: 'Palto büyük.' },
    ],
  },
  gloves: {
    tr: 'Eldiven',
    emoji: '🧤',
    sentence: 'I wear gloves in the cold.',
    sentenceTr: 'Soğukta eldiven giyerim.',
    altSentences: [
      { en: 'This is a gloves.', tr: 'Bu bir eldiven.' },
      { en: 'There is a gloves.', tr: 'Bir eldiven var.' },
      { en: 'Where is the gloves?', tr: 'Eldiven nerede?' },
    ],
  },
  // ===== School & Education =====
  blackboard: {
    tr: 'Kara tahta',
    emoji: '🖥️',
    sentence: 'The teacher writes on the blackboard.',
    sentenceTr: 'Öğretmen kara tahtaya yazar.',
    altSentences: [
      { en: 'The blackboard is big.', tr: 'Kara tahta büyük.' },
      { en: 'This is a blackboard.', tr: 'Bu bir kara tahta.' },
      { en: 'There is a blackboard.', tr: 'Bir kara tahta var.' },
    ],
  },
  homework: {
    tr: 'Ödev',
    emoji: '📝',
    sentence: 'I do my homework.',
    sentenceTr: 'Ödevimi yaparım.',
    altSentences: [
      { en: 'The homework is nice.', tr: 'Ödev güzel.' },
      { en: 'I want a homework.', tr: 'Bir ödev istiyorum.' },
      { en: 'I see a homework.', tr: 'Bir ödev görüyorum.' },
    ],
  },
  exam: {
    tr: 'Sınav',
    emoji: '📋',
    sentence: 'I study for the exam.',
    sentenceTr: 'Sınav için çalışırım.',
    altSentences: [
      { en: 'There is an exam.', tr: 'Bir sınav var.' },
      { en: 'Where is the exam?', tr: 'Sınav nerede?' },
      { en: 'The exam is here.', tr: 'Sınav burada.' },
    ],
  },
  lesson: {
    tr: 'Ders',
    emoji: '📖',
    sentence: 'The lesson is interesting.',
    sentenceTr: 'Ders ilginç.',
    altSentences: [
      { en: 'The lesson is nice.', tr: 'Ders güzel.' },
      { en: 'I want a lesson.', tr: 'Bir ders istiyorum.' },
      { en: 'I see a lesson.', tr: 'Bir ders görüyorum.' },
    ],
  },
  // ===== Emotions & Adjectives =====
  kind: {
    tr: 'Nazik',
    emoji: '😊',
    sentence: 'She is very kind.',
    sentenceTr: 'O çok nazik.',
    altSentences: [
      { en: 'It is not kind.', tr: 'Nazik değil.' },
      { en: 'She is kind.', tr: 'O nazik.' },
      { en: 'It is very kind.', tr: 'Çok nazik.' },
    ],
  },
  funny: {
    tr: 'Komik',
    emoji: '😂',
    sentence: 'The clown is funny.',
    sentenceTr: 'Palyaço komik.',
    altSentences: [
      { en: 'It is not funny.', tr: 'Komik değil.' },
      { en: 'She is funny.', tr: 'O komik.' },
      { en: 'It is very funny.', tr: 'Çok komik.' },
    ],
  },
  // ===== Actions / Verbs =====
  climb: {
    tr: 'Tırmanmak',
    emoji: '🧗',
    sentence: 'I climb the tree.',
    sentenceTr: 'Ağaca tırmanırım.',
    altSentences: [
      { en: 'I climb the hill.', tr: 'Tepeye tırmanırım.' },
      { en: 'She climbs the ladder.', tr: 'O merdivene tırmanır.' },
      { en: 'We climb the mountain.', tr: 'Dağa tırmanırız.' },
    ],
  },
  build: {
    tr: 'İnşa etmek',
    emoji: '🏗️',
    sentence: 'We build a sandcastle.',
    sentenceTr: 'Kumdan kale yaparız.',
    altSentences: [
      { en: 'I build a tower.', tr: 'Bir kule yaparım.' },
      { en: 'She builds a house.', tr: 'O bir ev yapar.' },
      { en: 'We build with blocks.', tr: 'Bloklarla yaparız.' },
    ],
  },
  fix: {
    tr: 'Tamir etmek',
    emoji: '🔧',
    sentence: 'He can fix the bike.',
    sentenceTr: 'Bisikleti tamir edebilir.',
    altSentences: [
      { en: 'I fix my toy.', tr: 'Oyuncağımı tamir ederim.' },
      { en: 'She fixes the chair.', tr: 'O sandalyeyi tamir eder.' },
      { en: 'We fix it together.', tr: 'Birlikte tamir ederiz.' },
    ],
  },
  plant: {
    tr: 'Dikmek',
    emoji: '🌱',
    sentence: 'I plant a flower.',
    sentenceTr: 'Çiçek dikerim.',
    altSentences: [
      { en: 'I plant a tree.', tr: 'Bir ağaç dikerim.' },
      { en: 'She plants roses.', tr: 'O gül diker.' },
      { en: 'We plant seeds.', tr: 'Tohum ekeriz.' },
    ],
  },
  // ===== Transport =====
  airplane: {
    tr: 'Uçak',
    emoji: '✈️',
    sentence: 'The airplane flies high.',
    sentenceTr: 'Uçak yüksekte uçar.',
    altSentences: [
      { en: 'The airplane is nice.', tr: 'Uçak güzel.' },
      { en: 'I want an airplane.', tr: 'Bir uçak istiyorum.' },
      { en: 'I see an airplane.', tr: 'Bir uçak görüyorum.' },
    ],
  },
  // ===== Food Extended =====
  pie: {
    tr: 'Turta',
    emoji: '🥧',
    sentence: 'The pie smells good.',
    sentenceTr: 'Turta güzel kokuyor.',
    altSentences: [
      { en: 'Where is the pie?', tr: 'Turta nerede?' },
      { en: 'The pie is here.', tr: 'Turta burada.' },
      { en: 'The pie is nice.', tr: 'Turta güzel.' },
    ],
  },
  butter: {
    tr: 'Tereyağı',
    emoji: '🧈',
    sentence: 'I put butter on bread.',
    sentenceTr: 'Ekmeğe tereyağı sürerim.',
    altSentences: [
      { en: 'Where is the butter?', tr: 'Tereyağı nerede?' },
      { en: 'The butter is here.', tr: 'Tereyağı burada.' },
      { en: 'The butter is nice.', tr: 'Tereyağı güzel.' },
    ],
  },
  jam: {
    tr: 'Reçel',
    emoji: '🫙',
    sentence: 'I like strawberry jam.',
    sentenceTr: 'Çilek reçeli severim.',
    altSentences: [
      { en: 'This is a jam.', tr: 'Bu bir reçel.' },
      { en: 'There is a jam.', tr: 'Bir reçel var.' },
      { en: 'Where is the jam?', tr: 'Reçel nerede?' },
    ],
  },
  lemon: {
    tr: 'Limon',
    emoji: '🍋',
    sentence: 'The lemon is sour.',
    sentenceTr: 'Limon ekşi.',
    altSentences: [
      { en: 'There is a lemon.', tr: 'Bir limon var.' },
      { en: 'Where is the lemon?', tr: 'Limon nerede?' },
      { en: 'The lemon is here.', tr: 'Limon burada.' },
    ],
  },
  cherry: {
    tr: 'Kiraz',
    emoji: '🍒',
    sentence: 'Cherries are sweet.',
    sentenceTr: 'Kirazlar tatlı.',
    altSentences: [
      { en: 'The cherry is big.', tr: 'Kiraz büyük.' },
      { en: 'This is a cherry.', tr: 'Bu bir kiraz.' },
      { en: 'There is a cherry.', tr: 'Bir kiraz var.' },
    ],
  },
  melon: {
    tr: 'Kavun',
    emoji: '🍈',
    sentence: 'The melon is juicy.',
    sentenceTr: 'Kavun sulu.',
    altSentences: [
      { en: 'There is a melon.', tr: 'Bir kavun var.' },
      { en: 'Where is the melon?', tr: 'Kavun nerede?' },
      { en: 'The melon is here.', tr: 'Kavun burada.' },
    ],
  },
  corn: {
    tr: 'Mısır',
    emoji: '🌽',
    sentence: 'I like corn.',
    sentenceTr: 'Mısır severim.',
    altSentences: [
      { en: 'I see a corn.', tr: 'Bir mısır görüyorum.' },
      { en: 'The corn is big.', tr: 'Mısır büyük.' },
      { en: 'This is a corn.', tr: 'Bu bir mısır.' },
    ],
  },
  // ===== Household & Daily =====
  // ===== Science & Space =====
  dinosaur: {
    tr: 'Dinozor',
    emoji: '🦕',
    sentence: 'Dinosaurs lived long ago.',
    sentenceTr: 'Dinozorlar uzun zaman önce yaşadı.',
    altSentences: [
      { en: 'The dinosaur is big.', tr: 'Dinozor büyük.' },
      { en: 'This is a dinosaur.', tr: 'Bu bir dinozor.' },
      { en: 'There is a dinosaur.', tr: 'Bir dinozor var.' },
    ],
  },
  magnet: {
    tr: 'Mıknatıs',
    emoji: '🧲',
    sentence: 'The magnet is strong.',
    sentenceTr: 'Mıknatıs güçlü.',
    altSentences: [
      { en: 'The magnet is nice.', tr: 'Mıknatıs güzel.' },
      { en: 'I want a magnet.', tr: 'Bir mıknatıs istiyorum.' },
      { en: 'I see a magnet.', tr: 'Bir mıknatıs görüyorum.' },
    ],
  },
  microscope: {
    tr: 'Mikroskop',
    emoji: '🔬',
    sentence: 'I look through the microscope.',
    sentenceTr: 'Mikroskoptan bakarım.',
    altSentences: [
      { en: 'The microscope is nice.', tr: 'Mikroskop güzel.' },
      { en: 'I want a microscope.', tr: 'Bir mikroskop istiyorum.' },
      { en: 'I see a microscope.', tr: 'Bir mikroskop görüyorum.' },
    ],
  },
  // ===== Music & Art =====
  paint: {
    tr: 'Boya',
    emoji: '🎨',
    sentence: 'I like to paint.',
    sentenceTr: 'Boya yapmayı severim.',
    altSentences: [
      { en: 'I paint a picture.', tr: 'Bir resim boyarım.' },
      { en: 'She paints flowers.', tr: 'O çiçek boyar.' },
      { en: 'We paint the wall.', tr: 'Duvarı boyarız.' },
    ],
  },
  // ===== Additional Vocab — Everyday Objects =====
  bridge: {
    tr: 'Köprü',
    emoji: '🌉',
    sentence: 'We cross the bridge.',
    sentenceTr: 'Köprüden geçeriz.',
    altSentences: [
      { en: 'The bridge is big.', tr: 'Köprü büyük.' },
      { en: 'This is a bridge.', tr: 'Bu bir köprü.' },
      { en: 'There is a bridge.', tr: 'Bir köprü var.' },
    ],
  },
  fence: {
    tr: 'Çit',
    emoji: '🏗️',
    sentence: 'The fence is white.',
    sentenceTr: 'Çit beyaz.',
    altSentences: [
      { en: 'The fence is here.', tr: 'Çit burada.' },
      { en: 'The fence is nice.', tr: 'Çit güzel.' },
      { en: 'I want a fence.', tr: 'Bir çit istiyorum.' },
    ],
  },
  flag: {
    tr: 'Bayrak',
    emoji: '🏁',
    sentence: 'The flag is red and white.',
    sentenceTr: 'Bayrak kırmızı ve beyaz.',
    altSentences: [
      { en: 'I see a flag.', tr: 'Bir bayrak görüyorum.' },
      { en: 'The flag is big.', tr: 'Bayrak büyük.' },
      { en: 'This is a flag.', tr: 'Bu bir bayrak.' },
    ],
  },
  wheel: {
    tr: 'Tekerlek',
    emoji: '☸️',
    sentence: 'The wheel turns fast.',
    sentenceTr: 'Tekerlek hızlı döner.',
    altSentences: [
      { en: 'The wheel is big.', tr: 'Tekerlek büyük.' },
      { en: 'This is a wheel.', tr: 'Bu bir tekerlek.' },
      { en: 'There is a wheel.', tr: 'Bir tekerlek var.' },
    ],
  },
  roof: {
    tr: 'Çatı',
    emoji: '🏠',
    sentence: 'The bird is on the roof.',
    sentenceTr: 'Kuş çatıda.',
    altSentences: [
      { en: 'Where is the roof?', tr: 'Çatı nerede?' },
      { en: 'The roof is here.', tr: 'Çatı burada.' },
      { en: 'The roof is nice.', tr: 'Çatı güzel.' },
    ],
  },
  gate: {
    tr: 'Kapı',
    emoji: '🚪',
    sentence: 'Open the gate.',
    sentenceTr: 'Kapıyı aç.',
    altSentences: [
      { en: 'The gate is here.', tr: 'Kapı burada.' },
      { en: 'The gate is nice.', tr: 'Kapı güzel.' },
      { en: 'I want a gate.', tr: 'Bir kapı istiyorum.' },
    ],
  },
  bench: {
    tr: 'Bank',
    emoji: '🪑',
    sentence: 'Sit on the bench.',
    sentenceTr: 'Banka otur.',
    altSentences: [
      { en: 'This is a bench.', tr: 'Bu bir bank.' },
      { en: 'There is a bench.', tr: 'Bir bank var.' },
      { en: 'Where is the bench?', tr: 'Bank nerede?' },
    ],
  },
  path: {
    tr: 'Patika',
    emoji: '🛤️',
    sentence: 'Follow the path.',
    sentenceTr: 'Patikayı takip et.',
    altSentences: [
      { en: 'The path is big.', tr: 'Patika büyük.' },
      { en: 'This is a path.', tr: 'Bu bir patika.' },
      { en: 'There is a path.', tr: 'Bir patika var.' },
    ],
  },
  tower: {
    tr: 'Kule',
    emoji: '🗼',
    sentence: 'The tower is tall.',
    sentenceTr: 'Kule uzun.',
    altSentences: [
      { en: 'The tower is here.', tr: 'Kule burada.' },
      { en: 'The tower is nice.', tr: 'Kule güzel.' },
      { en: 'I want a tower.', tr: 'Bir kule istiyorum.' },
    ],
  },
  tunnel: {
    tr: 'Tünel',
    emoji: '🚇',
    sentence: 'The train goes through the tunnel.',
    sentenceTr: 'Tren tünelden geçer.',
    altSentences: [
      { en: 'Where is the tunnel?', tr: 'Tünel nerede?' },
      { en: 'The tunnel is here.', tr: 'Tünel burada.' },
      { en: 'The tunnel is nice.', tr: 'Tünel güzel.' },
    ],
  },
  // ===== Additional Vocab — People & Jobs =====
  queen: {
    tr: 'Kraliçe',
    emoji: '👑',
    sentence: 'The queen lives in a castle.',
    sentenceTr: 'Kraliçe kalede yaşar.',
    altSentences: [
      { en: 'Where is the queen?', tr: 'Kraliçe nerede?' },
      { en: 'The queen is here.', tr: 'Kraliçe burada.' },
      { en: 'The queen is nice.', tr: 'Kraliçe güzel.' },
    ],
  },
  king: {
    tr: 'Kral',
    emoji: '🤴',
    sentence: 'The king wears a crown.',
    sentenceTr: 'Kral taç takar.',
    altSentences: [
      { en: 'The king is here.', tr: 'Kral burada.' },
      { en: 'The king is nice.', tr: 'Kral güzel.' },
      { en: 'I want a king.', tr: 'Bir kral istiyorum.' },
    ],
  },
  pirate: {
    tr: 'Korsan',
    emoji: '🏴‍☠️',
    sentence: 'The pirate has a ship.',
    sentenceTr: 'Korsanın gemisi var.',
    altSentences: [
      { en: 'The pirate is big.', tr: 'Korsan büyük.' },
      { en: 'This is a pirate.', tr: 'Bu bir korsan.' },
      { en: 'There is a pirate.', tr: 'Bir korsan var.' },
    ],
  },
  knight: {
    tr: 'Şövalye',
    emoji: '⚔️',
    sentence: 'The knight is brave.',
    sentenceTr: 'Şövalye cesur.',
    altSentences: [
      { en: 'The knight is big.', tr: 'Şövalye büyük.' },
      { en: 'This is a knight.', tr: 'Bu bir şövalye.' },
      { en: 'There is a knight.', tr: 'Bir şövalye var.' },
    ],
  },
  wizard: {
    tr: 'Büyücü',
    emoji: '🧙',
    sentence: 'The wizard does magic.',
    sentenceTr: 'Büyücü sihir yapar.',
    altSentences: [
      { en: 'The wizard is here.', tr: 'Büyücü burada.' },
      { en: 'The wizard is nice.', tr: 'Büyücü güzel.' },
      { en: 'I want a wizard.', tr: 'Bir büyücü istiyorum.' },
    ],
  },
  princess: {
    tr: 'Prenses',
    emoji: '👸',
    sentence: 'The princess has a crown.',
    sentenceTr: 'Prensesin tacı var.',
    altSentences: [
      { en: 'I want a princess.', tr: 'Bir prenses istiyorum.' },
      { en: 'I see a princess.', tr: 'Bir prenses görüyorum.' },
      { en: 'The princess is big.', tr: 'Prenses büyük.' },
    ],
  },
  prince: {
    tr: 'Prens',
    emoji: '🤴',
    sentence: 'The prince rides a horse.',
    sentenceTr: 'Prens at sürer.',
    altSentences: [
      { en: 'The prince is here.', tr: 'Prens burada.' },
      { en: 'The prince is nice.', tr: 'Prens güzel.' },
      { en: 'I want a prince.', tr: 'Bir prens istiyorum.' },
    ],
  },
  soldier: {
    tr: 'Asker',
    emoji: '💂',
    sentence: 'The soldier is strong.',
    sentenceTr: 'Asker güçlü.',
    altSentences: [
      { en: 'I see a soldier.', tr: 'Bir asker görüyorum.' },
      { en: 'The soldier is big.', tr: 'Asker büyük.' },
      { en: 'This is a soldier.', tr: 'Bu bir asker.' },
    ],
  },
  // ===== Additional Vocab — Weather & Nature Extended =====
  fog: {
    tr: 'Sis',
    emoji: '🌫️',
    sentence: 'There is fog in the morning.',
    sentenceTr: 'Sabahleyin sis var.',
    altSentences: [
      { en: 'The fog is nice.', tr: 'Sis güzel.' },
      { en: 'I want a fog.', tr: 'Bir sis istiyorum.' },
      { en: 'I see a fog.', tr: 'Bir sis görüyorum.' },
    ],
  },
  thunder: {
    tr: 'Gök gürültüsü',
    emoji: '⛈️',
    sentence: 'I hear thunder.',
    sentenceTr: 'Gök gürültüsü duyuyorum.',
    altSentences: [
      { en: 'I see a thunder.', tr: 'Bir gök gürültüsü görüyorum.' },
      { en: 'The thunder is big.', tr: 'Gök gürültüsü büyük.' },
      { en: 'This is a thunder.', tr: 'Bu bir gök gürültüsü.' },
    ],
  },
  lightning: {
    tr: 'Şimşek',
    emoji: '⚡',
    sentence: 'The lightning is bright.',
    sentenceTr: 'Şimşek parlak.',
    altSentences: [
      { en: 'The lightning is nice.', tr: 'Şimşek güzel.' },
      { en: 'I want a lightning.', tr: 'Bir şimşek istiyorum.' },
      { en: 'I see a lightning.', tr: 'Bir şimşek görüyorum.' },
    ],
  },
  mud: {
    tr: 'Çamur',
    emoji: '🟤',
    sentence: 'My shoes are in the mud.',
    sentenceTr: 'Ayakkabılarım çamurda.',
    altSentences: [
      { en: 'Where is the mud?', tr: 'Çamur nerede?' },
      { en: 'The mud is here.', tr: 'Çamur burada.' },
      { en: 'The mud is nice.', tr: 'Çamur güzel.' },
    ],
  },
  nest: {
    tr: 'Yuva',
    emoji: '🪺',
    sentence: 'The bird has a nest.',
    sentenceTr: 'Kuşun yuvası var.',
    altSentences: [
      { en: 'I see a nest.', tr: 'Bir yuva görüyorum.' },
      { en: 'The nest is big.', tr: 'Yuva büyük.' },
      { en: 'This is a nest.', tr: 'Bu bir yuva.' },
    ],
  },
  branch: {
    tr: 'Dal',
    emoji: '🌿',
    sentence: 'The branch is long.',
    sentenceTr: 'Dal uzun.',
    altSentences: [
      { en: 'Where is the branch?', tr: 'Dal nerede?' },
      { en: 'The branch is here.', tr: 'Dal burada.' },
      { en: 'The branch is nice.', tr: 'Dal güzel.' },
    ],
  },
  seed: {
    tr: 'Tohum',
    emoji: '🌱',
    sentence: 'I plant a seed.',
    sentenceTr: 'Tohum ekerim.',
    altSentences: [
      { en: 'The seed is here.', tr: 'Tohum burada.' },
      { en: 'The seed is nice.', tr: 'Tohum güzel.' },
      { en: 'I want a seed.', tr: 'Bir tohum istiyorum.' },
    ],
  },
  rock: {
    tr: 'Kaya',
    emoji: '🪨',
    sentence: 'The rock is heavy.',
    sentenceTr: 'Kaya ağır.',
    altSentences: [
      { en: 'I want a rock.', tr: 'Bir kaya istiyorum.' },
      { en: 'I see a rock.', tr: 'Bir kaya görüyorum.' },
      { en: 'The rock is big.', tr: 'Kaya büyük.' },
    ],
  },
  // ===== Additional Vocab — More Actions =====
  kick: {
    tr: 'Tekmelemek',
    emoji: '🦵',
    sentence: 'Kick the ball.',
    sentenceTr: 'Topa tekme at.',
    altSentences: [
      { en: 'I kick the ball hard.', tr: 'Topa sert vururum.' },
      { en: 'She kicks it far.', tr: 'O uzağa vurur.' },
      { en: 'We kick during the game.', tr: 'Maçta tekme atarız.' },
    ],
  },
  shake: {
    tr: 'Sallamak',
    emoji: '🤝',
    sentence: 'Shake my hand.',
    sentenceTr: 'Elimi sıkış.',
    altSentences: [
      { en: 'I shake the bottle.', tr: 'Şişeyi sallarım.' },
      { en: 'She shakes the tree.', tr: 'O ağacı sallar.' },
      { en: 'We shake hands.', tr: 'Tokalaşırız.' },
    ],
  },
  pour: {
    tr: 'Dökmek',
    emoji: '🫗',
    sentence: 'Pour the water.',
    sentenceTr: 'Suyu dök.',
    altSentences: [
      { en: 'I pour the juice.', tr: 'Meyve suyunu dökerim.' },
      { en: 'She pours water.', tr: 'O su döker.' },
      { en: 'We pour tea.', tr: 'Çay dökeriz.' },
    ],
  },
  fold: {
    tr: 'Katlamak',
    emoji: '📄',
    sentence: 'Fold the paper.',
    sentenceTr: 'Kağıdı katla.',
    altSentences: [
      { en: 'I fold my clothes.', tr: 'Kıyafetlerimi katlarım.' },
      { en: 'She folds the towel.', tr: 'O havluyu katlar.' },
      { en: 'We fold paper.', tr: 'Kağıt katlarız.' },
    ],
  },
  dig: {
    tr: 'Kazmak',
    emoji: '⛏️',
    sentence: 'Dig a hole.',
    sentenceTr: 'Çukur kaz.',
    altSentences: [
      { en: 'I dig in the sand.', tr: 'Kumda kazarım.' },
      { en: 'She digs a hole.', tr: 'O bir çukur kazar.' },
      { en: 'We dig in the garden.', tr: 'Bahçede kazarız.' },
    ],
  },
  wave: {
    tr: 'El sallamak',
    emoji: '👋',
    sentence: 'Wave goodbye.',
    sentenceTr: 'Hoşça kal diye el salla.',
    altSentences: [
      { en: 'I wave to my friend.', tr: 'Arkadaşıma el sallarım.' },
      { en: 'She waves goodbye.', tr: 'O hoşça kal der.' },
      { en: 'We wave from the bus.', tr: 'Otobüsten el sallarız.' },
    ],
  },
  clap: {
    tr: 'Alkışlamak',
    emoji: '👏',
    sentence: 'Clap your hands.',
    sentenceTr: 'Ellerini çırp.',
    altSentences: [
      { en: 'I clap for the show.', tr: 'Gösteri için alkışlarım.' },
      { en: 'She claps her hands.', tr: 'O ellerini çırpar.' },
      { en: 'We clap together.', tr: 'Birlikte alkışlarız.' },
    ],
  },
  taste: {
    tr: 'Tatmak',
    emoji: '👅',
    sentence: 'Taste the soup.',
    sentenceTr: 'Çorbayı tat.',
    altSentences: [
      { en: 'I taste the cake.', tr: 'Pastayı tadarım.' },
      { en: 'She tastes the soup.', tr: 'O çorbayı tadar.' },
      { en: 'We taste new food.', tr: 'Yeni yemek tadarız.' },
    ],
  },
  smell: {
    tr: 'Koklamak',
    emoji: '👃',
    sentence: 'Smell the flower.',
    sentenceTr: 'Çiçeği kokla.',
    altSentences: [
      { en: 'I smell the roses.', tr: 'Gülleri koklarım.' },
      { en: 'She smells the food.', tr: 'O yemeği koklar.' },
      { en: 'We smell the flowers.', tr: 'Çiçekleri koklarız.' },
    ],
  },
  touch: {
    tr: 'Dokunmak',
    emoji: '☝️',
    sentence: 'Touch the screen.',
    sentenceTr: 'Ekrana dokun.',
    altSentences: [
      { en: 'I touch the water.', tr: 'Suya dokunurum.' },
      { en: 'She touches the cat.', tr: 'O kediye dokunur.' },
      { en: 'We touch the sand.', tr: 'Kuma dokunuruz.' },
    ],
  },
  // ===== Additional Vocab — Food & Drink =====
  toast: {
    tr: 'Tost',
    emoji: '🍞',
    sentence: 'I eat toast for breakfast.',
    sentenceTr: 'Kahvaltıda tost yerim.',
    altSentences: [
      { en: 'There is a toast.', tr: 'Bir tost var.' },
      { en: 'Where is the toast?', tr: 'Tost nerede?' },
      { en: 'The toast is here.', tr: 'Tost burada.' },
    ],
  },
  noodle: {
    tr: 'Erişte',
    emoji: '🍜',
    sentence: 'The noodle is hot.',
    sentenceTr: 'Erişte sıcak.',
    altSentences: [
      { en: 'The noodle is here.', tr: 'Erişte burada.' },
      { en: 'The noodle is nice.', tr: 'Erişte güzel.' },
      { en: 'I want a noodle.', tr: 'Bir erişte istiyorum.' },
    ],
  },
  yogurt: {
    tr: 'Yoğurt',
    emoji: '🥛',
    sentence: 'I like yogurt.',
    sentenceTr: 'Yoğurt severim.',
    altSentences: [
      { en: 'I see a yogurt.', tr: 'Bir yoğurt görüyorum.' },
      { en: 'The yogurt is big.', tr: 'Yoğurt büyük.' },
      { en: 'This is a yogurt.', tr: 'Bu bir yoğurt.' },
    ],
  },
  olive: {
    tr: 'Zeytin',
    emoji: '🫒',
    sentence: 'The olive is green.',
    sentenceTr: 'Zeytin yeşil.',
    altSentences: [
      { en: 'I want an olive.', tr: 'Bir zeytin istiyorum.' },
      { en: 'I see an olive.', tr: 'Bir zeytin görüyorum.' },
      { en: 'The olive is big.', tr: 'Zeytin büyük.' },
    ],
  },
  peach: {
    tr: 'Şeftali',
    emoji: '🍑',
    sentence: 'The peach is sweet.',
    sentenceTr: 'Şeftali tatlı.',
    altSentences: [
      { en: 'The peach is here.', tr: 'Şeftali burada.' },
      { en: 'The peach is nice.', tr: 'Şeftali güzel.' },
      { en: 'I want a peach.', tr: 'Bir şeftali istiyorum.' },
    ],
  },
  pear: {
    tr: 'Armut',
    emoji: '🍐',
    sentence: 'I eat a pear.',
    sentenceTr: 'Bir armut yerim.',
    altSentences: [
      { en: 'This is a pear.', tr: 'Bu bir armut.' },
      { en: 'There is a pear.', tr: 'Bir armut var.' },
      { en: 'Where is the pear?', tr: 'Armut nerede?' },
    ],
  },
  mango: {
    tr: 'Mango',
    emoji: '🥭',
    sentence: 'The mango is yellow.',
    sentenceTr: 'Mango sarı.',
    altSentences: [
      { en: 'I see a mango.', tr: 'Bir mango görüyorum.' },
      { en: 'The mango is big.', tr: 'Mango büyük.' },
      { en: 'This is a mango.', tr: 'Bu bir mango.' },
    ],
  },
  // ===== Additional Vocab — Shapes & Concepts =====
  corner: {
    tr: 'Köşe',
    emoji: '📐',
    sentence: 'Go to the corner.',
    sentenceTr: 'Köşeye git.',
    altSentences: [
      { en: 'The corner is here.', tr: 'Köşe burada.' },
      { en: 'The corner is nice.', tr: 'Köşe güzel.' },
      { en: 'I want a corner.', tr: 'Bir köşe istiyorum.' },
    ],
  },
  middle: {
    tr: 'Orta',
    emoji: '⭕',
    sentence: 'Stand in the middle.',
    sentenceTr: 'Ortada dur.',
    altSentences: [
      { en: 'I want a middle.', tr: 'Bir orta istiyorum.' },
      { en: 'I see a middle.', tr: 'Bir orta görüyorum.' },
      { en: 'The middle is big.', tr: 'Orta büyük.' },
    ],
  },
  edge: {
    tr: 'Kenar',
    emoji: '📏',
    sentence: 'Stay at the edge.',
    sentenceTr: 'Kenarda kal.',
    altSentences: [
      { en: 'The edge is big.', tr: 'Kenar büyük.' },
      { en: 'This is an edge.', tr: 'Bu bir kenar.' },
      { en: 'There is an edge.', tr: 'Bir kenar var.' },
    ],
  },
  shadow: {
    tr: 'Gölge',
    emoji: '👤',
    sentence: 'I see my shadow.',
    sentenceTr: 'Gölgemi görüyorum.',
    altSentences: [
      { en: 'Where is the shadow?', tr: 'Gölge nerede?' },
      { en: 'The shadow is here.', tr: 'Gölge burada.' },
      { en: 'The shadow is nice.', tr: 'Gölge güzel.' },
    ],
  },
  pocket: {
    tr: 'Cep',
    emoji: '👖',
    sentence: 'Put it in your pocket.',
    sentenceTr: 'Cebine koy.',
    altSentences: [
      { en: 'Where is the pocket?', tr: 'Cep nerede?' },
      { en: 'The pocket is here.', tr: 'Cep burada.' },
      { en: 'The pocket is nice.', tr: 'Cep güzel.' },
    ],
  },
  ladder: {
    tr: 'Merdiven',
    emoji: '🪜',
    sentence: 'Climb the ladder.',
    sentenceTr: 'Merdiveni tırman.',
    altSentences: [
      { en: 'The ladder is nice.', tr: 'Merdiven güzel.' },
      { en: 'I want a ladder.', tr: 'Bir merdiven istiyorum.' },
      { en: 'I see a ladder.', tr: 'Bir merdiven görüyorum.' },
    ],
  },
  rope: {
    tr: 'İp',
    emoji: '🪢',
    sentence: 'Hold the rope.',
    sentenceTr: 'İpi tut.',
    altSentences: [
      { en: 'Where is the rope?', tr: 'İp nerede?' },
      { en: 'The rope is here.', tr: 'İp burada.' },
      { en: 'The rope is nice.', tr: 'İp güzel.' },
    ],
  },
  bathroom: {
    tr: 'Banyo',
    emoji: '🛁',
    sentence: 'I am in the bathroom.',
    sentenceTr: 'Banyodayım.',
    altSentences: [
      { en: 'The bathroom is clean.', tr: 'Banyo temiz.' },
      { en: 'Go to the bathroom.', tr: 'Banyoya git.' },
    ],
  },
  sink: {
    tr: 'Lavabo',
    emoji: '🚰',
    sentence: 'Wash your hands in the sink.',
    sentenceTr: 'Ellerini lavaboda yıka.',
    altSentences: [
      { en: 'The sink is white.', tr: 'Lavabo beyaz.' },
      { en: 'There is water in the sink.', tr: 'Lavaboda su var.' },
    ],
  },
  toilet: {
    tr: 'Tuvalet',
    emoji: '🚽',
    sentence: 'Where is the toilet?',
    sentenceTr: 'Tuvalet nerede?',
    altSentences: [
      { en: 'I need the toilet.', tr: 'Tuvalete ihtiyacım var.' },
      { en: 'The toilet is there.', tr: 'Tuvalet orada.' },
    ],
  },
  swing: {
    tr: 'Salıncak',
    emoji: '🎠',
    sentence: 'I am on the swing.',
    sentenceTr: 'Salıncaktayım.',
    altSentences: [
      { en: 'The swing is fun.', tr: 'Salıncak eğlenceli.' },
      { en: 'Push the swing.', tr: 'Salıncağı it.' },
    ],
  },
  slide: {
    tr: 'Kaydırak',
    emoji: '🛝',
    sentence: 'I go down the slide.',
    sentenceTr: 'Kaydıraktan kayıyorum.',
    altSentences: [
      { en: 'The slide is tall.', tr: 'Kaydırak uzun.' },
      { en: 'The slide is fun.', tr: 'Kaydırak eğlenceli.' },
    ],
  },
  bedroom: {
    tr: 'Yatak odası',
    emoji: '🛏️',
    sentence: 'I sleep in the bedroom.',
    sentenceTr: 'Yatak odasında uyurum.',
    altSentences: [
      { en: 'The bedroom is quiet.', tr: 'Yatak odası sessiz.' },
      { en: 'My bedroom is small.', tr: 'Yatak odam küçük.' },
    ],
  },
  closet: {
    tr: 'Dolap',
    emoji: '🚪',
    sentence: 'My clothes are in the closet.',
    sentenceTr: 'Kıyafetlerim dolapta.',
    altSentences: [
      { en: 'Open the closet.', tr: 'Dolabı aç.' },
      { en: 'The closet is full.', tr: 'Dolap dolu.' },
    ],
  },
  shelf: {
    tr: 'Raf',
    emoji: '📚',
    sentence: 'The book is on the shelf.',
    sentenceTr: 'Kitap rafta.',
    altSentences: [
      { en: 'The shelf is high.', tr: 'Raf yüksek.' },
      { en: 'Put it on the shelf.', tr: 'Onu rafa koy.' },
    ],
  },
  spider: {
    tr: 'Örümcek',
    emoji: '🕷️',
    sentence: 'The spider is on the wall.',
    sentenceTr: 'Örümcek duvarda.',
    altSentences: [
      { en: 'I see a spider.', tr: 'Bir örümcek görüyorum.' },
      { en: 'The spider is black.', tr: 'Örümcek siyah.' },
    ],
  },
  ladybug: {
    tr: 'Uğur böceği',
    emoji: '🐞',
    sentence: 'The ladybug is red.',
    sentenceTr: 'Uğur böceği kırmızı.',
    altSentences: [
      { en: 'I see a ladybug.', tr: 'Bir uğur böceği görüyorum.' },
      { en: 'The ladybug is on the leaf.', tr: 'Uğur böceği yaprakta.' },
    ],
  },
  worm: {
    tr: 'Solucan',
    emoji: '🪱',
    sentence: 'The worm is in the ground.',
    sentenceTr: 'Solucan toprakta.',
    altSentences: [
      { en: 'I see a worm.', tr: 'Bir solucan görüyorum.' },
      { en: 'The worm is long.', tr: 'Solucan uzun.' },
    ],
  },
  duck: {
    tr: 'Ördek',
    emoji: '🦆',
    sentence: 'The duck is in the water.',
    sentenceTr: 'Ördek suda.',
    altSentences: [
      { en: 'I see a duck.', tr: 'Bir ördek görüyorum.' },
      { en: 'The duck is yellow.', tr: 'Ördek sarı.' },
    ],
  },
  belt: {
    tr: 'Kemer',
    emoji: '👔',
    sentence: 'I wear a belt.',
    sentenceTr: 'Kemer takıyorum.',
    altSentences: [
      { en: 'The belt is brown.', tr: 'Kemer kahverengi.' },
      { en: 'Where is my belt?', tr: 'Kemerim nerede?' },
    ],
  },
  boots: {
    tr: 'Çizme',
    emoji: '👢',
    sentence: 'I wear boots.',
    sentenceTr: 'Çizme giyiyorum.',
    altSentences: [
      { en: 'The boots are black.', tr: 'Çizmeler siyah.' },
      { en: 'My boots are new.', tr: 'Çizmelerim yeni.' },
    ],
  },
  umbrella: {
    tr: 'Şemsiye',
    emoji: '☂️',
    sentence: 'I have an umbrella.',
    sentenceTr: 'Bir şemsiyem var.',
    altSentences: [
      { en: 'The umbrella is blue.', tr: 'Şemsiye mavi.' },
      { en: 'Open the umbrella.', tr: 'Şemsiyeyi aç.' },
    ],
  },
  glasses: {
    tr: 'Gözlük',
    emoji: '👓',
    sentence: 'I wear glasses.',
    sentenceTr: 'Gözlük takıyorum.',
    altSentences: [
      { en: 'Where are my glasses?', tr: 'Gözlüğüm nerede?' },
      { en: 'The glasses are new.', tr: 'Gözlük yeni.' },
    ],
  },
  striped: {
    tr: 'Çizgili',
    emoji: '🦓',
    sentence: 'I have a striped shirt.',
    sentenceTr: 'Çizgili bir tişörtüm var.',
    altSentences: [
      { en: 'The cat is striped.', tr: 'Kedi çizgili.' },
      { en: 'I like striped socks.', tr: 'Çizgili çorapları severim.' },
    ],
  },
  dotted: {
    tr: 'Puanlı',
    emoji: '🔵',
    sentence: 'I have a dotted dress.',
    sentenceTr: 'Puanlı bir elbisem var.',
    altSentences: [
      { en: 'The ball is dotted.', tr: 'Top puanlı.' },
      { en: 'I like the dotted bag.', tr: 'Puanlı çantayı seviyorum.' },
    ],
  },
  plain: {
    tr: 'Düz',
    emoji: '⬜',
    sentence: 'I wear a plain shirt.',
    sentenceTr: 'Düz bir tişört giyiyorum.',
    altSentences: [
      { en: 'The wall is plain.', tr: 'Duvar düz.' },
      { en: 'I like plain clothes.', tr: 'Düz kıyafetleri severim.' },
    ],
  },

  // ===== W4 EXPANSION: Şehir Meydanı =====
  bakery: {
    tr: 'Fırın',
    emoji: '🥖',
    sentence: 'I buy bread at the bakery.',
    sentenceTr: 'Fırından ekmek alıyorum.',
    altSentences: [
      { en: 'The bakery smells nice.', tr: 'Fırın güzel kokuyor.' },
      { en: 'We go to the bakery every morning.', tr: 'Her sabah fırına gidiyoruz.' },
    ],
  },
  pharmacy: {
    tr: 'Eczane',
    emoji: '💊',
    sentence: 'I go to the pharmacy for medicine.',
    sentenceTr: 'İlaç için eczaneye gidiyorum.',
    altSentences: [
      { en: 'The pharmacy is near the hospital.', tr: 'Eczane hastanenin yakınında.' },
      { en: 'My mum works at a pharmacy.', tr: 'Annem bir eczanede çalışıyor.' },
    ],
  },
  supermarket: {
    tr: 'Süpermarket',
    emoji: '🛒',
    sentence: 'We shop at the supermarket.',
    sentenceTr: 'Süpermarketten alışveriş yapıyoruz.',
    altSentences: [
      { en: 'The supermarket is big.', tr: 'Süpermarket büyük.' },
      { en: 'I need to go to the supermarket.', tr: 'Süpermarkete gitmem lazım.' },
    ],
  },
  cinema: {
    tr: 'Sinema',
    emoji: '🎬',
    sentence: 'We watch a film at the cinema.',
    sentenceTr: 'Sinemada film izliyoruz.',
    altSentences: [
      { en: 'The cinema is next to the park.', tr: 'Sinema parkın yanında.' },
      { en: 'I love going to the cinema.', tr: 'Sinemaya gitmeyi seviyorum.' },
    ],
  },
  museum: {
    tr: 'Müze',
    emoji: '🏛️',
    sentence: 'We visit the museum on Saturday.',
    sentenceTr: 'Cumartesi müzeyi ziyaret ediyoruz.',
    altSentences: [
      { en: 'The museum is very old.', tr: 'Müze çok eski.' },
      { en: 'There are paintings in the museum.', tr: 'Müzede tablolar var.' },
    ],
  },
  'across from': {
    tr: 'Karşısında',
    emoji: '↔️',
    sentence: 'The bank is across from the park.',
    sentenceTr: 'Banka parkın karşısında.',
    altSentences: [
      { en: 'The school is across from my house.', tr: 'Okul evimin karşısında.' },
      { en: 'The shop is across from the library.', tr: 'Dükkan kütüphanenin karşısında.' },
    ],
  },
  opposite: {
    tr: 'Karşı',
    emoji: '🔄',
    sentence: 'The shop is opposite the school.',
    sentenceTr: 'Dükkan okulun karşısında.',
    altSentences: [
      { en: 'They sit opposite each other.', tr: 'Birbirlerinin karşısında oturuyorlar.' },
      { en: 'The café is opposite the park.', tr: 'Kafe parkın karşısında.' },
    ],
  },
  market: {
    tr: 'Pazar',
    emoji: '🏪',
    sentence: 'We go to the market on Sunday.',
    sentenceTr: 'Pazar günü pazara gidiyoruz.',
    altSentences: [
      { en: 'The market sells fresh fruit.', tr: 'Pazarda taze meyve satılıyor.' },
      { en: 'I like the market.', tr: 'Pazarı seviyorum.' },
    ],
  },
  parking: {
    tr: 'Otopark',
    emoji: '🅿️',
    sentence: 'The car is in the parking.',
    sentenceTr: 'Araba otoparkta.',
    altSentences: [
      { en: 'The parking is full.', tr: 'Otopark dolu.' },
      { en: 'We find parking near the cinema.', tr: 'Sinemanın yakınında otopark buluyoruz.' },
    ],
  },
  season: {
    tr: 'Mevsim',
    emoji: '🍂',
    sentence: 'My favourite season is spring.',
    sentenceTr: 'En sevdiğim mevsim ilkbahar.',
    altSentences: [
      { en: 'There are four seasons in a year.', tr: 'Bir yılda dört mevsim var.' },
      { en: 'What season is it now?', tr: 'Şimdi hangi mevsim?' },
    ],
  },
  weather: {
    tr: 'Hava',
    emoji: '🌤️',
    sentence: 'The weather is sunny today.',
    sentenceTr: 'Bugün hava güneşli.',
    altSentences: [
      { en: 'What is the weather like?', tr: 'Hava nasıl?' },
      { en: 'I like warm weather.', tr: 'Sıcak havayı severim.' },
    ],
  },
  breakfast: {
    tr: 'Kahvaltı',
    emoji: '🥞',
    sentence: 'I have breakfast at eight.',
    sentenceTr: 'Saat sekizde kahvaltı yapıyorum.',
    altSentences: [
      { en: 'Breakfast is ready!', tr: 'Kahvaltı hazır!' },
      { en: 'I eat eggs for breakfast.', tr: 'Kahvaltıda yumurta yerim.' },
    ],
  },
  lunch: {
    tr: 'Öğle yemeği',
    emoji: '🥪',
    sentence: 'We eat lunch at school.',
    sentenceTr: 'Okulda öğle yemeği yiyoruz.',
    altSentences: [
      { en: 'Lunch is at twelve.', tr: 'Öğle yemeği saat on ikide.' },
      { en: 'What is for lunch?', tr: 'Öğle yemeğinde ne var?' },
    ],
  },
  dinner: {
    tr: 'Akşam yemeği',
    emoji: '🍽️',
    sentence: 'We have dinner at seven.',
    sentenceTr: 'Saat yedide akşam yemeği yiyoruz.',
    altSentences: [
      { en: 'Dinner smells delicious.', tr: 'Akşam yemeği lezzetli kokuyor.' },
      { en: 'I help with dinner.', tr: 'Akşam yemeğine yardım ediyorum.' },
    ],
  },
  'go to bed': {
    tr: 'Yatmak',
    emoji: '🛏️',
    sentence: 'I go to bed at nine.',
    sentenceTr: 'Saat dokuzda yatıyorum.',
    altSentences: [
      { en: 'It is time to go to bed.', tr: 'Yatma vakti.' },
      { en: 'I read a book before I go to bed.', tr: 'Yatmadan önce kitap okurum.' },
    ],
  },
  schedule: {
    tr: 'Program',
    emoji: '📅',
    sentence: 'My schedule is busy today.',
    sentenceTr: 'Bugün programım yoğun.',
    altSentences: [
      { en: 'What is on the schedule?', tr: 'Programda ne var?' },
      { en: 'I check my schedule every morning.', tr: 'Her sabah programıma bakarım.' },
    ],
  },
  plan: {
    tr: 'Plan',
    emoji: '📋',
    sentence: 'I have a plan for the weekend.',
    sentenceTr: 'Hafta sonu için bir planım var.',
    altSentences: [
      { en: 'What is your plan?', tr: 'Planın ne?' },
      { en: 'We make a plan together.', tr: 'Birlikte plan yapıyoruz.' },
    ],
  },
  busy: {
    tr: 'Meşgul',
    emoji: '🏃',
    sentence: 'I am busy on Monday.',
    sentenceTr: 'Pazartesi meşgulüm.',
    altSentences: [
      { en: 'She is very busy today.', tr: 'Bugün çok meşgul.' },
      { en: 'Are you busy tomorrow?', tr: 'Yarın meşgul müsün?' },
    ],
  },
  free: {
    tr: 'Boş',
    emoji: '🆓',
    sentence: 'I am free on Saturday.',
    sentenceTr: 'Cumartesi boşum.',
    altSentences: [
      { en: 'Are you free after school?', tr: 'Okuldan sonra boş musun?' },
      { en: 'I have a free hour.', tr: 'Bir boş saatim var.' },
    ],
  },
  weekend: {
    tr: 'Hafta sonu',
    emoji: '🎉',
    sentence: 'I play football at the weekend.',
    sentenceTr: 'Hafta sonu futbol oynuyorum.',
    altSentences: [
      { en: 'What do you do at the weekend?', tr: 'Hafta sonu ne yapıyorsun?' },
      { en: 'The weekend is here!', tr: 'Hafta sonu geldi!' },
    ],
  },
  office: {
    tr: 'Ofis',
    emoji: '🏢',
    sentence: 'My dad works in an office.',
    sentenceTr: 'Babam bir ofiste çalışıyor.',
    altSentences: [
      { en: 'The office is on the second floor.', tr: 'Ofis ikinci katta.' },
      { en: 'There is a computer in the office.', tr: 'Ofiste bir bilgisayar var.' },
    ],
  },
  station: {
    tr: 'İstasyon',
    emoji: '🚉',
    sentence: 'The train is at the station.',
    sentenceTr: 'Tren istasyonda.',
    altSentences: [
      { en: 'We walk to the station.', tr: 'İstasyona yürüyoruz.' },
      { en: 'The bus station is near.', tr: 'Otobüs istasyonu yakın.' },
    ],
  },
  stethoscope: {
    tr: 'Stetoskop',
    emoji: '🩺',
    sentence: 'The doctor uses a stethoscope.',
    sentenceTr: 'Doktor stetoskop kullanıyor.',
    altSentences: [
      { en: 'A stethoscope listens to your heart.', tr: 'Stetoskop kalbini dinler.' },
      { en: 'I see a stethoscope at the hospital.', tr: 'Hastanede bir stetoskop görüyorum.' },
    ],
  },
  chalk: {
    tr: 'Tebeşir',
    emoji: '🖍️',
    sentence: 'The teacher writes with chalk.',
    sentenceTr: 'Öğretmen tebeşirle yazıyor.',
    altSentences: [
      { en: 'The chalk is white.', tr: 'Tebeşir beyaz.' },
      { en: 'We draw with chalk on the ground.', tr: 'Yerde tebeşirle çiziyoruz.' },
    ],
  },
  uniform: {
    tr: 'Üniforma',
    emoji: '👔',
    sentence: 'I wear a uniform to school.',
    sentenceTr: 'Okula üniforma giyiyorum.',
    altSentences: [
      { en: 'The police officer has a uniform.', tr: 'Polis memurunun üniforması var.' },
      { en: 'My uniform is blue.', tr: 'Üniformam mavi.' },
    ],
  },
  tools: {
    tr: 'Aletler',
    emoji: '🧰',
    sentence: 'The worker uses many tools.',
    sentenceTr: 'İşçi birçok alet kullanıyor.',
    altSentences: [
      { en: 'Where are the tools?', tr: 'Aletler nerede?' },
      { en: 'I need tools to fix this.', tr: 'Bunu tamir etmek için alete ihtiyacım var.' },
    ],
  },
  dream: {
    tr: 'Hayal',
    emoji: '💭',
    sentence: 'My dream is to be a doctor.',
    sentenceTr: 'Hayalim doktor olmak.',
    altSentences: [
      { en: 'I have a big dream.', tr: 'Büyük bir hayalim var.' },
      { en: 'Never give up your dream.', tr: 'Hayalinden asla vazgeçme.' },
    ],
  },
  job: {
    tr: 'İş / Meslek',
    emoji: '💼',
    sentence: 'What is your dream job?',
    sentenceTr: 'Hayal ettiğin meslek ne?',
    altSentences: [
      { en: 'A teacher is a great job.', tr: 'Öğretmenlik harika bir meslek.' },
      { en: 'I want a fun job.', tr: 'Eğlenceli bir iş istiyorum.' },
    ],
  },
  work: {
    tr: 'Çalışmak',
    emoji: '👷',
    sentence: 'I work hard at school.',
    sentenceTr: 'Okulda çok çalışıyorum.',
    altSentences: [
      { en: 'My parents work every day.', tr: 'Ailem her gün çalışıyor.' },
      { en: 'We work together.', tr: 'Birlikte çalışıyoruz.' },
    ],
  },
  math: {
    tr: 'Matematik',
    emoji: '➗',
    sentence: 'I like math class.',
    sentenceTr: 'Matematik dersini seviyorum.',
    altSentences: [
      { en: 'Math is fun.', tr: 'Matematik eğlenceli.' },
      { en: 'We have math on Monday.', tr: 'Pazartesi matematik dersimiz var.' },
    ],
  },
  science: {
    tr: 'Fen Bilgisi',
    emoji: '🔬',
    sentence: 'Science is my favourite subject.',
    sentenceTr: 'Fen bilgisi en sevdiğim ders.',
    altSentences: [
      { en: 'We do experiments in science.', tr: 'Fen dersinde deney yapıyoruz.' },
      { en: 'I love science class.', tr: 'Fen dersini seviyorum.' },
    ],
  },
  art: {
    tr: 'Resim',
    emoji: '🎨',
    sentence: 'We paint pictures in art class.',
    sentenceTr: 'Resim dersinde resim yapıyoruz.',
    altSentences: [
      { en: 'Art is creative.', tr: 'Resim dersi yaratıcı.' },
      { en: 'I draw flowers in art.', tr: 'Resim dersinde çiçek çiziyorum.' },
    ],
  },
  history: {
    tr: 'Tarih',
    emoji: '📜',
    sentence: 'History is interesting.',
    sentenceTr: 'Tarih ilginç.',
    altSentences: [
      { en: 'We learn about history.', tr: 'Tarih hakkında öğreniyoruz.' },
      { en: 'I have history on Wednesday.', tr: 'Çarşamba tarih dersim var.' },
    ],
  },
  practice: {
    tr: 'Pratik yapmak',
    emoji: '🔁',
    sentence: 'I practice English every day.',
    sentenceTr: 'Her gün İngilizce pratik yapıyorum.',
    altSentences: [
      { en: 'Practice makes perfect.', tr: 'Pratik mükemmelleştirir.' },
      { en: 'We practice reading.', tr: 'Okuma pratiği yapıyoruz.' },
    ],
  },
  subject: {
    tr: 'Ders / Konu',
    emoji: '📚',
    sentence: 'What is your favourite subject?',
    sentenceTr: 'En sevdiğin ders ne?',
    altSentences: [
      { en: 'I have six subjects today.', tr: 'Bugün altı dersim var.' },
      { en: 'English is a fun subject.', tr: 'İngilizce eğlenceli bir ders.' },
    ],
  },
  break: {
    tr: 'Teneffüs',
    emoji: '⏸️',
    sentence: 'We play during break.',
    sentenceTr: 'Teneffüste oynuyoruz.',
    altSentences: [
      { en: 'Break is at ten thirty.', tr: 'Teneffüs on buçukta.' },
      { en: 'I eat my snack during break.', tr: 'Teneffüste atıştırmalığımı yerim.' },
    ],
  },
  gym: {
    tr: 'Spor salonu',
    emoji: '🏋️',
    sentence: 'We exercise in the gym.',
    sentenceTr: 'Spor salonunda egzersiz yapıyoruz.',
    altSentences: [
      { en: 'The gym is big.', tr: 'Spor salonu büyük.' },
      { en: 'I go to the gym after school.', tr: 'Okuldan sonra spor salonuna gidiyorum.' },
    ],
  },
  racket: {
    tr: 'Raket',
    emoji: '🏸',
    sentence: 'I hit the ball with my racket.',
    sentenceTr: 'Topa raketimle vuruyorum.',
    altSentences: [
      { en: 'My racket is new.', tr: 'Raketim yeni.' },
      { en: 'You need a racket to play tennis.', tr: 'Tenis oynamak için rakete ihtiyacın var.' },
    ],
  },
  helmet: {
    tr: 'Kask',
    emoji: '⛑️',
    sentence: 'I wear a helmet when I ride my bike.',
    sentenceTr: 'Bisiklete bindiğimde kask takıyorum.',
    altSentences: [
      { en: 'The helmet keeps you safe.', tr: 'Kask seni güvende tutar.' },
      { en: 'My helmet is red.', tr: 'Kaskım kırmızı.' },
    ],
  },
  net: {
    tr: 'Ağ / File',
    emoji: '🥅',
    sentence: 'The ball goes over the net.',
    sentenceTr: 'Top filenin üzerinden geçiyor.',
    altSentences: [
      { en: 'We set up the net.', tr: 'Fileyi kuruyoruz.' },
      { en: 'The net is very high.', tr: 'File çok yüksek.' },
    ],
  },
  whistle: {
    tr: 'Düdük',
    emoji: '📣',
    sentence: 'The coach blows the whistle.',
    sentenceTr: 'Koç düdüğü çalıyor.',
    altSentences: [
      { en: 'I hear the whistle.', tr: 'Düdüğü duyuyorum.' },
      { en: 'The game starts with a whistle.', tr: 'Oyun düdükle başlıyor.' },
    ],
  },
  volleyball: {
    tr: 'Voleybol',
    emoji: '🏐',
    sentence: 'We play volleyball at school.',
    sentenceTr: 'Okulda voleybol oynuyoruz.',
    altSentences: [
      { en: 'Volleyball is a team sport.', tr: 'Voleybol bir takım sporu.' },
      { en: 'I love volleyball.', tr: 'Voleybolu seviyorum.' },
    ],
  },
  gymnastics: {
    tr: 'Jimnastik',
    emoji: '🤸',
    sentence: 'She is good at gymnastics.',
    sentenceTr: 'Jimnastikte çok iyi.',
    altSentences: [
      { en: 'Gymnastics is exciting.', tr: 'Jimnastik heyecan verici.' },
      { en: 'I do gymnastics after school.', tr: 'Okuldan sonra jimnastik yapıyorum.' },
    ],
  },
  skating: {
    tr: 'Buz pateni',
    emoji: '⛸️',
    sentence: 'I go skating in winter.',
    sentenceTr: 'Kışın buz pateni yapıyorum.',
    altSentences: [
      { en: 'Skating is so much fun.', tr: 'Buz pateni çok eğlenceli.' },
      { en: 'We go skating on Saturday.', tr: 'Cumartesi buz pateni yapıyoruz.' },
    ],
  },
  score: {
    tr: 'Skor',
    emoji: '📊',
    sentence: 'The score is three to two.',
    sentenceTr: 'Skor üçe iki.',
    altSentences: [
      { en: 'What is the score?', tr: 'Skor ne?' },
      { en: 'We score a goal!', tr: 'Gol atıyoruz!' },
    ],
  },
  point: {
    tr: 'Puan',
    emoji: '🎯',
    sentence: 'We get one point.',
    sentenceTr: 'Bir puan alıyoruz.',
    altSentences: [
      { en: 'She scores five points.', tr: 'Beş puan alıyor.' },
      { en: 'Every point matters.', tr: 'Her puan önemli.' },
    ],
  },

  // ── W5 Uzay (Space) ──
  galaxy: {
    tr: 'Galaksi',
    emoji: '🌌',
    sentence: 'Our galaxy is the Milky Way.',
    sentenceTr: 'Bizim galaksimiz Samanyolu.',
    altSentences: [
      { en: 'There are billions of galaxies.', tr: 'Milyarlarca galaksi var.' },
      { en: 'A galaxy has many stars.', tr: 'Bir galakside çok yıldız var.' },
    ],
  },
  constellation: {
    tr: 'Takımyıldız',
    emoji: '✨',
    sentence: 'I can see a constellation in the sky.',
    sentenceTr: 'Gökyüzünde bir takımyıldız görebiliyorum.',
    altSentences: [
      { en: 'This constellation looks like a bear.', tr: 'Bu takımyıldız bir ayıya benziyor.' },
      { en: 'We learned about constellations.', tr: 'Takımyıldızları öğrendik.' },
    ],
  },
  comet: {
    tr: 'Kuyruklu yıldız',
    emoji: '☄️',
    sentence: 'A comet has a bright tail.',
    sentenceTr: 'Kuyruklu yıldızın parlak bir kuyruğu var.',
    altSentences: [
      { en: 'The comet flies through space.', tr: 'Kuyruklu yıldız uzayda uçuyor.' },
      { en: 'I saw a comet last night.', tr: 'Dün gece bir kuyruklu yıldız gördüm.' },
    ],
  },
  meteor: {
    tr: 'Meteor',
    emoji: '🌠',
    sentence: 'A meteor is a shooting star.',
    sentenceTr: 'Meteor bir kayan yıldızdır.',
    altSentences: [
      { en: 'We watched a meteor shower.', tr: 'Bir meteor yağmuru izledik.' },
      { en: 'The meteor was very bright.', tr: 'Meteor çok parlaktı.' },
    ],
  },
  telescope: {
    tr: 'Teleskop',
    emoji: '🔭',
    sentence: 'I look at stars with a telescope.',
    sentenceTr: 'Teleskopla yıldızlara bakıyorum.',
    altSentences: [
      { en: 'The telescope is very big.', tr: 'Teleskop çok büyük.' },
      { en: 'Can I use the telescope?', tr: 'Teleskopu kullanabilir miyim?' },
    ],
  },
  launch: {
    tr: 'Fırlatmak',
    emoji: '🚀',
    sentence: 'We launch the rocket today.',
    sentenceTr: 'Bugün roketi fırlatıyoruz.',
    altSentences: [
      { en: 'The launch was amazing.', tr: 'Fırlatma harikaydı.' },
      { en: 'They launched a satellite.', tr: 'Bir uydu fırlattılar.' },
    ],
  },
  orbit: {
    tr: 'Yörünge',
    emoji: '🪐',
    sentence: 'The Earth orbits the Sun.',
    sentenceTr: 'Dünya Güneş etrafında döner.',
    altSentences: [
      { en: 'The Moon orbits the Earth.', tr: 'Ay Dünya etrafında döner.' },
      { en: 'The rocket is in orbit.', tr: 'Roket yörüngede.' },
    ],
  },
  land: {
    tr: 'İnmek / Kara',
    emoji: '🛬',
    sentence: 'The rocket will land on the Moon.',
    sentenceTr: "Roket Ay'a inecek.",
    altSentences: [
      { en: 'We landed safely.', tr: 'Güvenli bir şekilde indik.' },
      { en: 'The bird landed on the tree.', tr: 'Kuş ağaca kondu.' },
    ],
  },
  float: {
    tr: 'Süzülmek',
    emoji: '🫧',
    sentence: 'Astronauts float in space.',
    sentenceTr: 'Astronotlar uzayda süzülür.',
    altSentences: [
      { en: 'The balloon floats in the air.', tr: 'Balon havada süzülüyor.' },
      { en: 'I can float in the water.', tr: 'Suda süzülebilirim.' },
    ],
  },
  explore: {
    tr: 'Keşfetmek',
    emoji: '🧭',
    sentence: "Let's explore the forest.",
    sentenceTr: 'Ormanı keşfedelim.',
    altSentences: [
      { en: 'We explore new places.', tr: 'Yeni yerler keşfediyoruz.' },
      { en: 'I love to explore.', tr: 'Keşfetmeyi seviyorum.' },
    ],
  },
  alien: {
    tr: 'Uzaylı',
    emoji: '👽',
    sentence: 'The alien is friendly.',
    sentenceTr: 'Uzaylı dost canlısı.',
    altSentences: [
      { en: 'Have you seen an alien?', tr: 'Hiç uzaylı gördün mü?' },
      { en: 'The alien came from Mars.', tr: "Uzaylı Mars'tan geldi." },
    ],
  },
  spaceship: {
    tr: 'Uzay gemisi',
    emoji: '🛸',
    sentence: 'The spaceship is very fast.',
    sentenceTr: 'Uzay gemisi çok hızlı.',
    altSentences: [
      { en: 'We fly in a spaceship.', tr: 'Bir uzay gemisiyle uçuyoruz.' },
      { en: 'The spaceship landed.', tr: 'Uzay gemisi indi.' },
    ],
  },
  friendly: {
    tr: 'Dost canlısı',
    emoji: '😊',
    sentence: 'She is very friendly.',
    sentenceTr: 'O çok dost canlısı.',
    altSentences: [
      { en: 'The dog is friendly.', tr: 'Köpek dost canlısı.' },
      { en: 'He is friendly to everyone.', tr: 'Herkese dostça davranıyor.' },
    ],
  },
  universe: {
    tr: 'Evren',
    emoji: '🌌',
    sentence: 'The universe is very big.',
    sentenceTr: 'Evren çok büyük.',
    altSentences: [
      { en: 'There are many stars in the universe.', tr: 'Evrende çok yıldız var.' },
      { en: 'We live in the universe.', tr: 'Evrende yaşıyoruz.' },
    ],
  },

  // ── W5 Teknoloji (Technology) ──
  code: {
    tr: 'Kod',
    emoji: '💻',
    sentence: 'I can write code.',
    sentenceTr: 'Kod yazabiliyorum.',
    altSentences: [
      { en: 'The code makes the game work.', tr: 'Kod oyunun çalışmasını sağlıyor.' },
      { en: 'Learning code is fun.', tr: 'Kod öğrenmek eğlenceli.' },
    ],
  },
  program: {
    tr: 'Program',
    emoji: '🖥️',
    sentence: 'I wrote a computer program.',
    sentenceTr: 'Bir bilgisayar programı yazdım.',
    altSentences: [
      { en: 'This program is very useful.', tr: 'Bu program çok yararlı.' },
      { en: 'Can you open the program?', tr: 'Programı açabilir misin?' },
    ],
  },
  bug: {
    tr: 'Hata / Böcek',
    emoji: '🐛',
    sentence: 'There is a bug in the code.',
    sentenceTr: 'Kodda bir hata var.',
    altSentences: [
      { en: 'I found the bug.', tr: 'Hatayı buldum.' },
      { en: 'A ladybug is a cute bug.', tr: 'Uğur böceği sevimli bir böcek.' },
    ],
  },
  click: {
    tr: 'Tıklamak',
    emoji: '🖱️',
    sentence: 'Click the button.',
    sentenceTr: 'Düğmeye tıkla.',
    altSentences: [
      { en: 'Please click here.', tr: 'Lütfen buraya tıkla.' },
      { en: 'I clicked on the picture.', tr: 'Resme tıkladım.' },
    ],
  },
  screen: {
    tr: 'Ekran',
    emoji: '📺',
    sentence: 'The screen is bright.',
    sentenceTr: 'Ekran parlak.',
    altSentences: [
      { en: 'Look at the screen.', tr: 'Ekrana bak.' },
      { en: 'My phone has a big screen.', tr: 'Telefonumun büyük bir ekranı var.' },
    ],
  },
  speaker: {
    tr: 'Hoparlör',
    emoji: '🔈',
    sentence: 'Turn on the speaker.',
    sentenceTr: 'Hoparlörü aç.',
    altSentences: [
      { en: 'The speaker is very loud.', tr: 'Hoparlör çok yüksek.' },
      { en: 'We have a smart speaker.', tr: 'Akıllı bir hoparlörümüz var.' },
    ],
  },
  remote: {
    tr: 'Kumanda',
    emoji: '📡',
    sentence: 'Where is the remote?',
    sentenceTr: 'Kumanda nerede?',
    altSentences: [
      { en: 'Give me the remote please.', tr: 'Lütfen kumandayı ver.' },
      { en: 'The remote controls the TV.', tr: 'Kumanda televizyonu kontrol eder.' },
    ],
  },
  charger: {
    tr: 'Şarj aleti',
    emoji: '🔌',
    sentence: 'I need a charger for my phone.',
    sentenceTr: 'Telefonum için şarj aleti lazım.',
    altSentences: [
      { en: 'Where is the charger?', tr: 'Şarj aleti nerede?' },
      { en: 'The charger is on the table.', tr: 'Şarj aleti masanın üstünde.' },
    ],
  },
  battery: {
    tr: 'Pil',
    emoji: '🔋',
    sentence: 'The battery is low.',
    sentenceTr: 'Pil azaldı.',
    altSentences: [
      { en: 'I need a new battery.', tr: 'Yeni bir pil lazım.' },
      { en: 'The battery is full.', tr: 'Pil dolu.' },
    ],
  },
  switch: {
    tr: 'Anahtar',
    emoji: '🔘',
    sentence: 'Turn the switch on.',
    sentenceTr: 'Anahtarı aç.',
    altSentences: [
      { en: 'Press the switch.', tr: 'Anahtara bas.' },
      { en: 'The light switch is on the wall.', tr: 'Işık anahtarı duvarda.' },
    ],
  },
  future: {
    tr: 'Gelecek',
    emoji: '🔮',
    sentence: 'In the future robots will help us.',
    sentenceTr: 'Gelecekte robotlar bize yardım edecek.',
    altSentences: [
      { en: 'What will the future be like?', tr: 'Gelecek nasıl olacak?' },
      { en: 'The future is exciting.', tr: 'Gelecek heyecan verici.' },
    ],
  },
  invention: {
    tr: 'İcat',
    emoji: '💡',
    sentence: 'The telephone is a great invention.',
    sentenceTr: 'Telefon harika bir icat.',
    altSentences: [
      { en: 'I want to make an invention.', tr: 'Bir icat yapmak istiyorum.' },
      { en: 'What is your favorite invention?', tr: 'En sevdiğin icat ne?' },
    ],
  },
  machine: {
    tr: 'Makine',
    emoji: '⚙️',
    sentence: 'This machine is very big.',
    sentenceTr: 'Bu makine çok büyük.',
    altSentences: [
      { en: 'The machine makes toys.', tr: 'Makine oyuncak yapıyor.' },
      { en: 'Turn off the machine.', tr: 'Makineyi kapat.' },
    ],
  },
  smart: {
    tr: 'Akıllı',
    emoji: '🧠',
    sentence: 'She is very smart.',
    sentenceTr: 'O çok akıllı.',
    altSentences: [
      { en: 'This is a smart robot.', tr: 'Bu akıllı bir robot.' },
      { en: 'Smart phones can do many things.', tr: 'Akıllı telefonlar çok şey yapabilir.' },
    ],
  },
  fly: {
    tr: 'Uçmak',
    emoji: '🦅',
    sentence: 'Birds can fly.',
    sentenceTr: 'Kuşlar uçabilir.',
    altSentences: [
      { en: 'The airplane can fly high.', tr: 'Uçak yüksekten uçabilir.' },
      { en: 'I want to fly like a bird.', tr: 'Bir kuş gibi uçmak istiyorum.' },
    ],
  },

  // ── W5 Duygular (Emotions) ──
  worried: {
    tr: 'Endişeli',
    emoji: '😟',
    sentence: 'I am worried about the test.',
    sentenceTr: 'Sınav için endişeliyim.',
    altSentences: [
      { en: 'She looks worried.', tr: 'Endişeli görünüyor.' },
      { en: "Don't be worried.", tr: 'Endişelenme.' },
    ],
  },
  cheerful: {
    tr: 'Neşeli',
    emoji: '😄',
    sentence: 'She is always cheerful.',
    sentenceTr: 'O her zaman neşeli.',
    altSentences: [
      { en: 'The music makes me cheerful.', tr: 'Müzik beni neşelendiriyor.' },
      { en: 'What a cheerful day!', tr: 'Ne neşeli bir gün!' },
    ],
  },
  lonely: {
    tr: 'Yalnız',
    emoji: '😔',
    sentence: 'I feel lonely today.',
    sentenceTr: 'Bugün kendimi yalnız hissediyorum.',
    altSentences: [
      { en: 'He looks lonely.', tr: 'Yalnız görünüyor.' },
      { en: "Don't feel lonely, I am here.", tr: 'Yalnız hissetme, ben buradayım.' },
    ],
  },
  grateful: {
    tr: 'Minnettar',
    emoji: '🙏',
    sentence: 'I am grateful for my friends.',
    sentenceTr: 'Arkadaşlarıma minnettarım.',
    altSentences: [
      { en: 'We are grateful for the food.', tr: 'Yemek için minnettarız.' },
      { en: 'She is grateful for help.', tr: 'Yardım için minnettar.' },
    ],
  },
  calm: {
    tr: 'Sakin',
    emoji: '😌',
    sentence: 'Stay calm and breathe.',
    sentenceTr: 'Sakin ol ve nefes al.',
    altSentences: [
      { en: 'The sea is calm today.', tr: 'Deniz bugün sakin.' },
      { en: 'She is very calm.', tr: 'O çok sakin.' },
    ],
  },
  smile: {
    tr: 'Gülümsemek',
    emoji: '😊',
    sentence: 'Please smile for the photo.',
    sentenceTr: 'Lütfen fotoğraf için gülümse.',
    altSentences: [
      { en: 'Her smile is beautiful.', tr: 'Gülümsemesi güzel.' },
      { en: 'I always smile at my friends.', tr: 'Arkadaşlarıma her zaman gülümserim.' },
    ],
  },
  cry: {
    tr: 'Ağlamak',
    emoji: '😢',
    sentence: 'The baby is crying.',
    sentenceTr: 'Bebek ağlıyor.',
    altSentences: [
      { en: "Don't cry, it is okay.", tr: 'Ağlama, sorun yok.' },
      { en: 'She cried because she was sad.', tr: 'Üzgün olduğu için ağladı.' },
    ],
  },
  laugh: {
    tr: 'Gülmek',
    emoji: '😂',
    sentence: 'We laugh together.',
    sentenceTr: 'Birlikte gülüyoruz.',
    altSentences: [
      { en: 'The joke made me laugh.', tr: 'Şaka beni güldürdü.' },
      { en: 'I love to laugh.', tr: 'Gülmeyi seviyorum.' },
    ],
  },
  hug: {
    tr: 'Sarılmak',
    emoji: '🤗',
    sentence: 'Can I have a hug?',
    sentenceTr: 'Sarılabilir miyim?',
    altSentences: [
      { en: 'She gave me a big hug.', tr: 'Bana büyük bir sarılma verdi.' },
      { en: 'Hugs make me happy.', tr: 'Sarılmak beni mutlu eder.' },
    ],
  },
  understand: {
    tr: 'Anlamak',
    emoji: '💡',
    sentence: 'I understand now.',
    sentenceTr: 'Şimdi anlıyorum.',
    altSentences: [
      { en: 'Do you understand?', tr: 'Anlıyor musun?' },
      { en: 'I understand how you feel.', tr: 'Nasıl hissettiğini anlıyorum.' },
    ],
  },
  comfort: {
    tr: 'Teselli etmek',
    emoji: '💗',
    sentence: 'I will comfort my friend.',
    sentenceTr: 'Arkadaşımı teselli edeceğim.',
    altSentences: [
      { en: 'She comforted the baby.', tr: 'Bebeği teselli etti.' },
      { en: 'A hug gives comfort.', tr: 'Sarılmak teselli verir.' },
    ],
  },
  share: {
    tr: 'Paylaşmak',
    emoji: '🤝',
    sentence: 'I share my toys with friends.',
    sentenceTr: 'Oyuncaklarımı arkadaşlarımla paylaşırım.',
    altSentences: [
      { en: "Let's share the cake.", tr: 'Pastayı paylaşalım.' },
      { en: 'Sharing is caring.', tr: 'Paylaşmak önemsemektir.' },
    ],
  },

  // ── W5 Böcekler & Egzotikler (Habitats & Sounds) ──
  jungle: {
    tr: 'Orman / Cangıl',
    emoji: '🌴',
    sentence: 'Parrots live in the jungle.',
    sentenceTr: 'Papağanlar ormanda yaşar.',
    altSentences: [
      { en: 'The jungle is hot and green.', tr: 'Orman sıcak ve yeşil.' },
      { en: 'We explored the jungle.', tr: 'Ormanı keşfettik.' },
    ],
  },
  pond: {
    tr: 'Gölet',
    emoji: '🐸',
    sentence: 'The frog lives in the pond.',
    sentenceTr: 'Kurbağa gölette yaşıyor.',
    altSentences: [
      { en: 'There are fish in the pond.', tr: 'Gölette balıklar var.' },
      { en: 'The duck swims in the pond.', tr: 'Ördek gölette yüzüyor.' },
    ],
  },
  buzz: {
    tr: 'Vızıldamak',
    emoji: '🐝',
    sentence: 'The bee goes buzz buzz.',
    sentenceTr: 'Arı vız vız yapıyor.',
    altSentences: [
      { en: 'I hear a buzzing sound.', tr: 'Vızıldayan bir ses duyuyorum.' },
      { en: 'Bees buzz around the flowers.', tr: 'Arılar çiçeklerin etrafında vızıldıyor.' },
    ],
  },
  croak: {
    tr: 'Vraklamak',
    emoji: '🐸',
    sentence: 'The frog croaks at night.',
    sentenceTr: 'Kurbağa gece vaklar.',
    altSentences: [
      { en: 'I can hear the frog croaking.', tr: 'Kurbağanın vaklamasını duyabiliyorum.' },
      { en: 'Frogs croak near the pond.', tr: 'Kurbağalar gölet kenarında vaklar.' },
    ],
  },
  roar: {
    tr: 'Kükremek',
    emoji: '🦁',
    sentence: 'The lion goes roar!',
    sentenceTr: 'Aslan kükredi!',
    altSentences: [
      { en: 'I heard a loud roar.', tr: 'Yüksek bir kükreme duydum.' },
      { en: 'The dinosaur can roar.', tr: 'Dinozor kükrer.' },
    ],
  },
  chirp: {
    tr: 'Cıvıldamak',
    emoji: '🐦',
    sentence: 'The bird chirps in the morning.',
    sentenceTr: 'Kuş sabah cıvıldıyor.',
    altSentences: [
      { en: 'I love the chirping birds.', tr: 'Cıvıldayan kuşları seviyorum.' },
      { en: 'Baby birds chirp for food.', tr: 'Yavru kuşlar yemek için cıvıldıyor.' },
    ],
  },
  hiss: {
    tr: 'Tıslamak',
    emoji: '🐍',
    sentence: 'The snake goes hiss.',
    sentenceTr: 'Yılan tıslıyor.',
    altSentences: [
      { en: 'Snakes hiss when they are scared.', tr: 'Yılanlar korktuklarında tıslar.' },
      { en: 'I heard a hissing sound.', tr: 'Bir tıslama sesi duydum.' },
    ],
  },

  // ── W5 Şekiller (3D Shapes & Measurements) ──
  cube: {
    tr: 'Küp',
    emoji: '🧊',
    sentence: 'A cube has six faces.',
    sentenceTr: 'Bir küpün altı yüzü var.',
    altSentences: [
      { en: 'This block is a cube.', tr: 'Bu blok bir küp.' },
      { en: 'An ice cube is cold.', tr: 'Bir buz küpü soğuktur.' },
    ],
  },
  sphere: {
    tr: 'Küre',
    emoji: '🌐',
    sentence: 'A ball is a sphere.',
    sentenceTr: 'Top bir küredir.',
    altSentences: [
      { en: 'The Earth is like a sphere.', tr: 'Dünya bir küre gibidir.' },
      { en: 'Roll the sphere.', tr: 'Küreyi yuvarlat.' },
    ],
  },
  cone: {
    tr: 'Koni',
    emoji: '🍦',
    sentence: 'An ice cream cone is yummy.',
    sentenceTr: 'Dondurma külahı çok lezzetli.',
    altSentences: [
      { en: 'This hat looks like a cone.', tr: 'Bu şapka koniye benziyor.' },
      { en: 'A cone has a point on top.', tr: 'Bir koninin üstünde bir uç var.' },
    ],
  },
  cylinder: {
    tr: 'Silindir',
    emoji: '🥫',
    sentence: 'A can is shaped like a cylinder.',
    sentenceTr: 'Bir kutu silindir şeklinde.',
    altSentences: [
      { en: 'The cylinder can roll.', tr: 'Silindir yuvarlanabilir.' },
      { en: 'I found a cylinder shape.', tr: 'Bir silindir şekli buldum.' },
    ],
  },
  pyramid: {
    tr: 'Piramit',
    emoji: '🔺',
    sentence: 'A pyramid has a triangle on each side.',
    sentenceTr: 'Bir piramidin her yüzünde üçgen var.',
    altSentences: [
      { en: 'The pyramids are in Egypt.', tr: "Piramitler Mısır'da." },
      { en: 'I made a pyramid with blocks.', tr: 'Bloklarla bir piramit yaptım.' },
    ],
  },
  wide: {
    tr: 'Geniş',
    emoji: '↔️',
    sentence: 'The river is very wide.',
    sentenceTr: 'Nehir çok geniş.',
    altSentences: [
      { en: 'Open your arms wide.', tr: 'Kollarını geniş aç.' },
      { en: 'The road is wide.', tr: 'Yol geniş.' },
    ],
  },
};

// ===== EMOJI MAP for entries without inline emoji =====
const EMOJI_MAP: Record<string, string> = {
  dog: '🐕',
  cat: '🐱',
  fish: '🐟',
  bird: '🐦',
  rabbit: '🐰',
  cow: '🐄',
  horse: '🐴',
  sheep: '🐑',
  pig: '🐷',
  chicken: '🐔',
  lion: '🦁',
  bear: '🐻',
  elephant: '🐘',
  monkey: '🐵',
  tiger: '🐯',
  whale: '🐋',
  shark: '🦈',
  dolphin: '🐬',
  octopus: '🐙',
  turtle: '🐢',
  red: '🔴',
  blue: '🔵',
  yellow: '🟡',
  green: '🟢',
  orange: '🟠',
  purple: '🟣',
  pink: '💗',
  brown: '🟤',
  black: '⚫',
  white: '⚪',
  'red bird': '🐦',
  'blue fish': '🐟',
  'green frog': '🐸',
  'yellow duck': '🦆',
  one: '1️⃣',
  two: '2️⃣',
  three: '3️⃣',
  four: '4️⃣',
  five: '5️⃣',
  six: '6️⃣',
  seven: '7️⃣',
  eight: '8️⃣',
  nine: '9️⃣',
  ten: '🔟',
  eleven: '1️⃣1️⃣',
  twelve: '1️⃣2️⃣',
  thirteen: '1️⃣3️⃣',
  fourteen: '1️⃣4️⃣',
  fifteen: '1️⃣5️⃣',
  twenty: '2️⃣0️⃣',
  eye: '👁️',
  nose: '👃',
  mouth: '👄',
  ear: '👂',
  hair: '💇',
  hand: '✋',
  foot: '🦶',
  arm: '💪',
  leg: '🦵',
  head: '🗣️',
  mother: '👩',
  father: '👨',
  sister: '👧',
  brother: '👦',
  baby: '👶',
  hello: '👋',
  goodbye: '👋',
  'thank you': '🙏',
  please: '🙏',
  sorry: '😔',
  'I am': '🙋',
  'My name is': '📛',
  'I like': '❤️',
  'How are you': '💬',
  Fine: '👍',
  apple: '🍎',
  banana: '🍌',
  grape: '🍇',
  strawberry: '🍓',
  carrot: '🥕',
  tomato: '🍅',
  potato: '🥔',
  onion: '🧅',
  pepper: '🌶️',
  water: '💧',
  milk: '🥛',
  juice: '🧃',
  tea: '🍵',
  coffee: '☕',
  "I don't like": '👎',
  'Do you like': '❓',
  Yes: '✅',
  No: '❌',
  'You are': '👉',
  'He is': '👨',
  'She is': '👩',
  'It is': '👆',
  'We are': '👫',
  'They are': '👥',
  happy: '😊',
  sad: '😢',
  big: '🐘',
  small: '🐜',
  'I have': '🤲',
  'She has': '👩',
  'He has': '👨',
  'We have': '👫',
  'a dog': '🐕',
  'a cat': '🐱',
  house: '🏠',
  room: '🚪',
  kitchen: '🍳',
  garden: '🌻',
  door: '🚪',
  window: '🪟',
  school: '🏫',
  teacher: '👩‍🏫',
  book: '📕',
  pen: '🖊️',
  desk: '🪑',
  board: '📋',
  'wake up': '⏰',
  'eat breakfast': '🍳',
  'go to school': '🏫',
  play: '🎮',
  sleep: '😴',
  sunny: '☀️',
  rainy: '🌧️',
  cloudy: '☁️',
  windy: '💨',
  snowy: '❄️',
  spring: '🌸',
  summer: '☀️',
  autumn: '🍂',
  winter: '❄️',
  tree: '🌳',
  flower: '🌺',
  leaf: '🍃',
  grass: '🌿',
  sun: '☀️',
  rain: '🌧️',
  shirt: '👕',
  jacket: '🧥',
  hat: '🧢',
  scarf: '🧣',
  sweater: '🧥',
  pants: '👖',
  shoes: '👟',
  socks: '🧦',
  dress: '👗',
  skirt: '👗',
  'I wear': '👔',
  'It is cold': '🥶',
  'It is hot': '🥵',
  park: '🏞️',
  shop: '🏪',
  hospital: '🏥',
  restaurant: '🍽️',
  library: '📚',
  left: '⬅️',
  right: '➡️',
  straight: '⬆️',
  turn: '↩️',
  'next to': '↔️',
  'How much': '💰',
  expensive: '💎',
  cheap: '🏷️',
  buy: '🛒',
  money: '💵',
  Monday: '📅',
  Tuesday: '📅',
  Wednesday: '📅',
  Thursday: '📅',
  Friday: '🎉',
  Saturday: '🌈',
  Sunday: '🌞',
  January: '❄️',
  February: '💕',
  March: '🌱',
  April: '🌧️',
  May: '🌺',
  June: '☀️',
  "o'clock": '🕐',
  'half past': '🕐',
  morning: '🌅',
  evening: '🌆',
  night: '🌙',
  doctor: '👨‍⚕️',
  pilot: '👨‍✈️',
  firefighter: '🧑‍🚒',
  police: '👮',
  chef: '👨‍🍳',
  farmer: '👨‍🌾',
  nurse: '👩‍⚕️',
  artist: '🎨',
  singer: '🎤',
  'I want to be': '⭐',
  because: '💡',
  'help people': '🤝',
  moon: '🌙',
  star: '⭐',
  planet: '🪐',
  Earth: '🌍',
  Mars: '🔴',
  Jupiter: '🪐',
  Saturn: '🪐',
  rocket: '🚀',
  astronaut: '👨‍🚀',
  'fly to': '✈️',
  amazing: '🤩',
  computer: '💻',
  phone: '📱',
  tablet: '📱',
  robot: '🤖',
  camera: '📷',
  website: '🌐',
  email: '📧',
  download: '⬇️',
  search: '🔍',
  video: '📹',
  angry: '😠',
  scared: '😨',
  excited: '🤩',
  'I feel': '💭',
  'happy because': '😊',
  'sad because': '😢',
  'excited because': '🤩',
  played: '⚽',
  walked: '🚶',
  talked: '💬',
  watched: '📺',
  cooked: '🍳',
  went: '🚶',
  ate: '🍽️',
  saw: '👀',
  came: '🏠',
  said: '💬',
  got: '🎁',
  yesterday: '📆',
  'I played': '⚽',
  'I went to': '🚶',
  'I ate': '🍽️',
  'I saw': '👀',
  was: '📆',
  'I will': '🔮',
  'You will': '🔮',
  go: '🚶',
  eat: '🍽️',
  see: '👀',
  'I am going to': '🔮',
  tomorrow: '📅',
  'next week': '📆',
  travel: '✈️',
  study: '📚',
  "Let's": '🤝',
  'Shall we': '❓',
  'I will go': '🚶',
  'going to travel': '✈️',
  'next summer': '🌞',
  Turkey: '🇹🇷',
  England: '🇬🇧',
  America: '🇺🇸',
  Japan: '🇯🇵',
  France: '🇫🇷',
  airport: '✈️',
  ticket: '🎫',
  passport: '📕',
  hotel: '🏨',
  suitcase: '🧳',
  'I will visit': '🗺️',
  beautiful: '🌹',
  culture: '🏛️',
  // ── Auto-generated emoji entries ──
  August: '📅',
  December: '🎄',
  July: '📅',
  November: '🍂',
  October: '🎃',
  September: '📅',
  afternoon: '☀️',
  airplane: '✈️',
  ant: '🐜',
  backpack: '🎒',
  bad: '👎',
  bag: '🎒',
  ball: '⚽',
  balloon: '🎈',
  basketball: '🏀',
  beach: '🏖️',
  bed: '🛏️',
  bee: '🐝',
  bench: '🪑',
  better: '⬆️',
  bicycle: '🚲',
  bigger: '📈',
  blackboard: '📋',
  blanket: '🛏️',
  boat: '⛵',
  bored: '😐',
  bottle: '🍼',
  box: '📦',
  boy: '👦',
  branch: '🌿',
  brave: '🦁',
  bread: '🍞',
  bridge: '🌉',
  build: '🏗️',
  bus: '🚌',
  butter: '🧈',
  butterfly: '🐛',
  cake: '🎂',
  candy: '🍬',
  car: '🚗',
  carry: '🏋️',
  catch: '🤲',
  cave: '🕳️',
  chair: '🪑',
  cheese: '🧀',
  cherry: '🍒',
  child: '👶',
  chocolate: '🍫',
  circle: '⭕',
  clap: '👏',
  clean: '🧹',
  climb: '🧗',
  clock: '🕐',
  close: '🚪',
  coat: '🧥',
  cold: '🥶',
  cookie: '🍪',
  cool: '😎',
  corn: '🌽',
  corner: '📐',
  cup: '☕',
  dance: '💃',
  desert: '🏜️',
  dig: '⛏️',
  dinosaur: '🦕',
  dirty: '🦠',
  doll: '🪆',
  draw: '✏️',
  drum: '🥁',
  edge: '📏',
  egg: '🥚',
  empty: '📭',
  eraser: '🧽',
  exam: '📝',
  fast: '⚡',
  faster: '⚡',
  fence: '🏗️',
  field: '🌾',
  finger: '☝️',
  first: '🥇',
  fix: '🔧',
  flag: '🏳️',
  fog: '🌫️',
  fold: '📄',
  football: '🏈',
  forest: '🌲',
  forget: '🤔',
  fridge: '🧊',
  friend: '🤝',
  frog: '🐸',
  full: '📦',
  funny: '😂',
  game: '🎮',
  gate: '🚪',
  giraffe: '🦒',
  girl: '👧',
  give: '🤝',
  gloves: '🧤',
  goal: '🥅',
  good: '👍',
  grandfather: '👴',
  grandmother: '👵',
  guitar: '🎸',
  heart: '❤️',
  heavy: '🏋️',
  helicopter: '🚁',
  homework: '📝',
  honey: '🍯',
  hot: '🔥',
  hungry: '😋',
  island: '🏝️',
  jam: '🫙',
  jump: '🦘',
  kangaroo: '🦘',
  key: '🔑',
  kick: '🦶',
  kind: '😊',
  king: '👑',
  kite: '🪁',
  knight: '⚔️',
  ladder: '🪜',
  lake: '🏞️',
  lamp: '💡',
  last: '🏁',
  learn: '📚',
  lemon: '🍋',
  lesson: '📖',
  light: '💡',
  lightning: '⚡',
  listen: '👂',
  long: '📏',
  lose: '😞',
  loud: '📢',
  magnet: '🧲',
  man: '👨',
  mango: '🥭',
  map: '🗺️',
  meat: '🥩',
  melon: '🍈',
  microscope: '🔬',
  middle: '⏺️',
  midnight: '🌑',
  mirror: '🪞',
  motorcycle: '🏍️',
  mountain: '⛰️',
  mud: '🟤',
  music: '🎵',
  nervous: '😰',
  nest: '🪺',
  new: '✨',
  noodle: '🍜',
  noon: '🕛',
  notebook: '📓',
  now: '⏰',
  ocean: '🌊',
  old: '👴',
  olive: '🫒',
  open: '📖',
  oven: '🔥',
  owl: '🦉',
  paint: '🎨',
  paper: '📄',
  parrot: '🦜',
  path: '🛤️',
  peach: '🍑',
  pear: '🍐',
  pencil: '✏️',
  penguin: '🐧',
  people: '👥',
  piano: '🎹',
  pie: '🥧',
  pillow: '🛏️',
  pirate: '🏴‍☠️',
  pizza: '🍕',
  plane: '✈️',
  plant: '🌿',
  pocket: '👖',
  pour: '🫗',
  prince: '🤴',
  princess: '👸',
  proud: '😊',
  pull: '🤲',
  push: '👐',
  puzzle: '🧩',
  queen: '👑',
  quiet: '🤫',
  rainbow: '🌈',
  read: '📖',
  rectangle: '▬',
  remember: '🧠',
  rice: '🍚',
  river: '🏞️',
  rock: '🪨',
  roof: '🏠',
  rope: '🪢',
  round: '⭕',
  ruler: '📏',
  run: '🏃',
  running: '🏃',
  salad: '🥗',
  sandwich: '🥪',
  scissors: '✂️',
  sea: '🌊',
  second: '🥈',
  seed: '🌱',
  shadow: '👤',
  shake: '🤝',
  ship: '🚢',
  short: '📐',
  shower: '🚿',
  shy: '😳',
  sing: '🎵',
  sit: '🪑',
  sky: '🌌',
  slow: '🐌',
  smaller: '📉',
  smell: '👃',
  snake: '🐍',
  soap: '🧼',
  sofa: '🛋️',
  soldier: '💂',
  soup: '🍲',
  square: '⬜',
  stairs: '🪜',
  stand: '🧍',
  start: '▶️',
  stop: '⏹️',
  storm: '⛈️',
  strong: '💪',
  surprised: '😲',
  swim: '🏊',
  swimming: '🏊',
  table: '🪑',
  take: '✋',
  tall: '📏',
  taller: '📊',
  taste: '👅',
  taxi: '🚕',
  team: '👥',
  telephone: '📞',
  television: '📺',
  tennis: '🎾',
  think: '🤔',
  third: '🥉',
  thirsty: '💧',
  throw: '🤾',
  thunder: '⚡',
  tired: '😴',
  toast: '🍞',
  today: '📅',
  tooth: '🦷',
  toothbrush: '🪥',
  touch: '👆',
  towel: '🧻',
  tower: '🗼',
  toy: '🧸',
  train: '🚆',
  triangle: '🔺',
  try: '💪',
  tunnel: '🚇',
  valley: '🏔️',
  wait: '⏳',
  warm: '☀️',
  wash: '🧼',
  wave: '🌊',
  weak: '😓',
  wheel: '☸️',
  win: '🏆',
  wizard: '🧙',
  woman: '👩',
  worst: '⬇️',
  write: '✍️',
  yogurt: '🫗',
  young: '👶',
  above: '⬆️',
  behind: '🔙',
  below: '⬇️',
  between: '↔️',
  cloud: '☁️',
  here: '📍',
  'ice cream': '🍦',
  in: '📥',
  near: '📌',
  on: '🔛',
  that: '👉',
  there: '👈',
  this: '☝️',
  under: '⬇️',
  thirty: '3️⃣0️⃣',
  forty: '4️⃣0️⃣',
  fifty: '5️⃣0️⃣',
  sixty: '6️⃣0️⃣',
  seventy: '7️⃣0️⃣',
  eighty: '8️⃣0️⃣',
  ninety: '9️⃣0️⃣',
  hundred: '💯',
  a: '🔤',
  an: '🔤',
  the: '🔤',
  do: '❓',
  does: '❓',
  did: '❓',
  can: '💪',
  should: '👆',
  must: '⚠️',
  bathroom: '🛁',
  sink: '🚰',
  toilet: '🚽',
  swing: '🎠',
  slide: '🛝',
  bedroom: '🛏️',
  closet: '🚪',
  shelf: '📚',
  spider: '🕷️',
  ladybug: '🐞',
  worm: '🪱',
  duck: '🦆',
  belt: '👔',
  boots: '👢',
  umbrella: '☂️',
  glasses: '👓',
  striped: '🦓',
  dotted: '⚫',
  plain: '⬜',
};

// ===== HELPER — vocab entry lookup =====
export function getVocab(word: string): VocabEntry {
  const key = word.toLowerCase();
  const entry = vocabDB[key] ??
    vocabDB[word] ?? { tr: word, sentence: `This is ${word}.`, sentenceTr: `Bu ${word}.` };
  // Attach emoji from map if not already present on the entry
  if (!entry.emoji) {
    const emoji = EMOJI_MAP[key] ?? EMOJI_MAP[word];
    if (emoji) return { ...entry, emoji };
  }
  return entry;
}

/** Get a random sentence for a word (uses altSentences for variety) */
export function getRandomSentence(word: string): { en: string; tr: string } {
  const v = getVocab(word);
  const fallback = { en: v.sentence, tr: v.sentenceTr };
  const all = [fallback, ...(v.altSentences ?? [])];
  const randomSentence = all[Math.floor(Math.random() * all.length)];
  return randomSentence ?? fallback;
}

// ===== ACTIVITY GENERATORS =====

let _activityCounter = 0;
let _vocabIndex = 0;
function nextId(lessonId: string, prefix: string): string {
  _activityCounter++;
  return `${lessonId}_${prefix}_${_activityCounter}`;
}

/** Pick the next word from vocabulary using round-robin rotation */
function pickWord(words: string[]): string {
  const word = words[_vocabIndex % words.length] ?? 'word';
  _vocabIndex++;
  return word;
}

/** Pick N unique words from vocabulary starting at current rotation index */
function pickWords(words: string[], count: number): string[] {
  const result: string[] = [];
  const available = [...words];
  // Start from rotation point for variety
  const start = _vocabIndex % available.length;
  for (let i = 0; i < Math.min(count, available.length); i++) {
    const idx = (start + i) % available.length;
    const selectedWord = available[idx];
    if (selectedWord !== undefined) {
      result.push(selectedWord);
    }
  }
  _vocabIndex += count;
  return result;
}

function generateFlashCards(lessonId: string, words: string[], startOrder: number): Activity[] {
  return pickWords(words, 3).map((word, i) => {
    const v = getVocab(word);
    const sent = getRandomSentence(word);
    return {
      id: nextId(lessonId, 'fc'),
      type: 'flash-card' as const,
      order: startOrder + i,
      timeLimit: null,
      maxAttempts: 1,
      data: {
        type: 'flash-card' as const,
        word: word.charAt(0).toUpperCase() + word.slice(1),
        translation: v.tr,
        imageUrl: generateWordPlaceholderImage(word),
        audioUrl: '',
        exampleSentence: sent.en,
        exampleTranslation: sent.tr,
      } satisfies FlashCardData,
    };
  });
}

function generateListenAndTap(lessonId: string, words: string[], startOrder: number): Activity {
  const correct = pickWord(words);
  const distractors = words.filter((w) => w !== correct).slice(0, 3);
  const options = shuffle([correct, ...distractors]).map(
    (w) => w.charAt(0).toUpperCase() + w.slice(1),
  );
  return {
    id: nextId(lessonId, 'lt'),
    type: 'listen-and-tap' as const,
    order: startOrder,
    timeLimit: 15,
    maxAttempts: 2,
    data: {
      type: 'listen-and-tap' as const,
      audioUrl: '',
      correctAnswer: correct.charAt(0).toUpperCase() + correct.slice(1),
      options,
      imageHint: null,
    } satisfies ListenAndTapData,
  };
}

function generateMatchPairs(lessonId: string, words: string[], startOrder: number): Activity {
  const selected = pickWords(words, 4);
  return {
    id: nextId(lessonId, 'mp'),
    type: 'match-pairs' as const,
    order: startOrder,
    timeLimit: 30,
    maxAttempts: 2,
    data: {
      type: 'match-pairs' as const,
      pairs: selected.map((w) => ({
        id: `p_${w.replace(/\s/g, '_')}`,
        left: w.charAt(0).toUpperCase() + w.slice(1),
        right: getVocab(w).tr,
        leftType: 'text' as const,
        rightType: 'text' as const,
      })),
    } satisfies MatchPairsData,
  };
}

function generateWordBuilder(lessonId: string, word: string, startOrder: number): Activity {
  const v = getVocab(word);
  const singleWord = word.split(' ')[0] ?? word;
  const letters = singleWord.split('');
  const scrambled = shuffle([...letters]);
  return {
    id: nextId(lessonId, 'wb'),
    type: 'word-builder' as const,
    order: startOrder,
    timeLimit: 20,
    maxAttempts: 3,
    data: {
      type: 'word-builder' as const,
      word: singleWord.charAt(0).toUpperCase() + singleWord.slice(1),
      translation: v.tr,
      imageUrl: generateWordPlaceholderImage(singleWord),
      audioUrl: '',
      scrambledLetters: scrambled.map((l) => l.toUpperCase()),
      hintLetters: [0],
    } satisfies WordBuilderData,
  };
}

function generateFillBlank(
  lessonId: string,
  word: string,
  words: string[],
  startOrder: number,
): Activity {
  // Try to use a chunk-based sentence for this world first (richer context)
  const worldId = lessonId.split('_')[0] ?? '';
  const chunks = getChunksByWorld(worldId);
  let sentence: string;
  let translation: string;

  const matchingChunk = chunks.find((c) =>
    c.examples.some((ex) => ex.toLowerCase().includes(word.toLowerCase())),
  );

  if (matchingChunk) {
    const exampleSentence =
      matchingChunk.examples.find((ex) => ex.toLowerCase().includes(word.toLowerCase())) ??
      matchingChunk.examples[0];
    if (exampleSentence) {
      sentence = exampleSentence.replace(new RegExp(escapeRegex(word), 'i'), '___');
      translation = matchingChunk.patternTr;
    } else {
      const sent = getRandomSentence(word);
      sentence = sent.en.replace(new RegExp(escapeRegex(word), 'i'), '___');
      translation = sent.tr;
    }
  } else {
    const sent = getRandomSentence(word);
    sentence = sent.en.replace(new RegExp(escapeRegex(word), 'i'), '___');
    translation = sent.tr;
  }

  const distractors = words.filter((w) => w !== word).slice(0, 3);
  const options = shuffle([
    word.charAt(0).toUpperCase() + word.slice(1),
    ...distractors.map((w) => w.charAt(0).toUpperCase() + w.slice(1)),
  ]);
  return {
    id: nextId(lessonId, 'fb'),
    type: 'fill-blank' as const,
    order: startOrder,
    timeLimit: 15,
    maxAttempts: 2,
    data: {
      type: 'fill-blank' as const,
      sentence,
      translation,
      correctAnswer: word.charAt(0).toUpperCase() + word.slice(1),
      options,
      audioUrl: '',
    } satisfies FillBlankData,
  };
}

function generateSpeakIt(lessonId: string, word: string, startOrder: number): Activity {
  const v = getVocab(word);
  const key = word.toLowerCase();
  return {
    id: nextId(lessonId, 'si'),
    type: 'speak-it' as const,
    order: startOrder,
    timeLimit: 20,
    maxAttempts: 3,
    data: {
      type: 'speak-it' as const,
      word: word.charAt(0).toUpperCase() + word.slice(1),
      translation: v.tr,
      audioUrl: '',
      imageUrl: generateWordPlaceholderImage(word),
      acceptableVariations: [word.toLowerCase(), word.toUpperCase(), word],
      phonemeHint: PHONEME_MAP[key] ?? PHONEME_MAP[word],
    } satisfies SpeakItData,
  };
}

// ===== STORY TEMPLATES =====
// Real narrative stories keyed by theme/topic keywords.
// Each template has a title, pages with connected narrative, and placeholder words
// that get filled from the lesson vocabulary.

interface StoryTemplate {
  title: string;
  titleTr: string;
  keywords: string[]; // match against lesson vocabulary
  pages: Array<{
    text: string;
    translation: string;
    highlightWords: string[];
  }>;
}

const STORY_TEMPLATES: StoryTemplate[] = [
  // Animals
  {
    title: 'The Lost Puppy',
    titleTr: 'Kayıp Yavru Köpek',
    keywords: ['dog', 'cat', 'bird', 'fish', 'bear', 'rabbit', 'lion'],
    pages: [
      {
        text: 'One sunny morning, a little dog was walking in the park.',
        translation: 'Güneşli bir sabah, küçük bir köpek parkta yürüyordu.',
        highlightWords: ['dog', 'park'],
      },
      {
        text: 'The dog saw a cat sitting on a tree. "Hello! Do you know where my house is?" asked the dog.',
        translation:
          'Köpek ağaçta oturan bir kedi gördü. "Merhaba! Evimin nerede olduğunu biliyor musun?" diye sordu köpek.',
        highlightWords: ['cat', 'tree', 'house'],
      },
      {
        text: 'A bird flew down from the sky. "Follow me! I can see your house from above!" said the bird.',
        translation:
          'Bir kuş gökyüzünden süzüldü. "Beni takip et! Evini yukarıdan görebiliyorum!" dedi kuş.',
        highlightWords: ['bird', 'house'],
      },
      {
        text: 'The dog followed the bird and found his house. "Thank you, bird! You are my best friend!" The dog was very happy.',
        translation:
          'Köpek kuşu takip etti ve evini buldu. "Teşekkürler kuş! Sen benim en iyi arkadaşımsın!" Köpek çok mutluydu.',
        highlightWords: ['dog', 'bird', 'happy'],
      },
    ],
  },
  // Colors
  {
    title: 'The Rainbow Garden',
    titleTr: 'Gökkuşağı Bahçesi',
    keywords: ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink'],
    pages: [
      {
        text: 'In a magical garden, every flower was a different color. There were red roses and yellow sunflowers.',
        translation:
          'Sihirli bir bahçede her çiçek farklı bir renkteydi. Kırmızı güller ve sarı ayçiçekleri vardı.',
        highlightWords: ['red', 'yellow'],
      },
      {
        text: 'A little girl came to the garden. She picked a blue flower and a green leaf.',
        translation: 'Küçük bir kız bahçeye geldi. Mavi bir çiçek ve yeşil bir yaprak topladı.',
        highlightWords: ['blue', 'green'],
      },
      {
        text: '"Look!" she said. "The orange butterfly is sitting on the purple flower!"',
        translation: '"Bak!" dedi. "Turuncu kelebek mor çiçeğin üstüne kondu!"',
        highlightWords: ['orange', 'purple'],
      },
      {
        text: 'Then it started to rain, and a beautiful rainbow appeared in the sky. The girl smiled. "This garden has all the colors!"',
        translation:
          'Sonra yağmur yağmaya başladı ve gökyüzünde güzel bir gökkuşağı belirdi. Kız gülümsedi. "Bu bahçede tüm renkler var!"',
        highlightWords: ['rainbow', 'colors'],
      },
    ],
  },
  // Numbers
  {
    title: 'Counting Stars',
    titleTr: 'Yıldız Sayma',
    keywords: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
    pages: [
      {
        text: 'Every night, little Ali looks at the sky. "One star, two stars, three stars!" he counts.',
        translation:
          'Her gece küçük Ali gökyüzüne bakar. "Bir yıldız, iki yıldız, üç yıldız!" diye sayar.',
        highlightWords: ['one', 'two', 'three'],
      },
      {
        text: '"Four, five! I can see five bright stars tonight!" says Ali to his mom.',
        translation: '"Dört, beş! Bu gece beş parlak yıldız görebiliyorum!" der Ali annesine.',
        highlightWords: ['four', 'five'],
      },
      {
        text: 'His mom smiles. "Can you count to ten?" Ali tries: "Six, seven, eight, nine, ten!"',
        translation:
          'Annesi gülümser. "Ona kadar sayabilir misin?" Ali dener: "Altı, yedi, sekiz, dokuz, on!"',
        highlightWords: ['six', 'seven', 'eight', 'nine', 'ten'],
      },
      {
        text: '"Well done, Ali! You counted ten stars!" Ali is very proud. He can count in English!',
        translation: '"Aferin Ali! On yıldız saydın!" Ali çok gururlu. İngilizce sayabiliyor!',
        highlightWords: ['ten', 'count'],
      },
    ],
  },
  // Family
  {
    title: 'Family Breakfast',
    titleTr: 'Aile Kahvaltısı',
    keywords: ['mother', 'father', 'sister', 'brother', 'baby', 'hello', 'goodbye'],
    pages: [
      {
        text: 'Every morning, the family has breakfast together. Mother makes eggs. Father makes tea.',
        translation: 'Her sabah aile birlikte kahvaltı yapar. Anne yumurta yapar. Baba çay yapar.',
        highlightWords: ['mother', 'father'],
      },
      {
        text: 'Sister pours the milk. Brother eats bread with honey. They are all at the table.',
        translation: 'Kız kardeş süt koyar. Erkek kardeş ballı ekmek yer. Hepsi masada.',
        highlightWords: ['sister', 'brother'],
      },
      {
        text: 'The baby laughs and says "Hello!" Everyone smiles at the baby. What a happy family!',
        translation: 'Bebek güler ve "Merhaba!" der. Herkes bebeğe gülümser. Ne mutlu bir aile!',
        highlightWords: ['baby', 'hello', 'happy'],
      },
      {
        text: 'After breakfast, they say "Goodbye!" and go to school and work. "See you at dinner!" says mother.',
        translation:
          'Kahvaltıdan sonra "Güle güle!" derler ve okula ve işe giderler. "Akşam yemeğinde görüşürüz!" der anne.',
        highlightWords: ['goodbye', 'mother', 'school'],
      },
    ],
  },
  // Food
  {
    title: 'The Hungry Bear',
    titleTr: 'Aç Ayı',
    keywords: ['apple', 'banana', 'water', 'milk', 'bread', 'egg', 'grape', 'strawberry'],
    pages: [
      {
        text: 'A big bear woke up very hungry. "I need food!" he said. He found an apple under a tree.',
        translation:
          'Büyük bir ayı çok aç uyandı. "Yemeğe ihtiyacım var!" dedi. Ağacın altında bir elma buldu.',
        highlightWords: ['bear', 'apple'],
      },
      {
        text: 'Then he saw bananas in the jungle. "Yummy! I love bananas!" He ate two bananas.',
        translation: 'Sonra ormanda muzlar gördü. "Lezzetli! Muzları seviyorum!" İki muz yedi.',
        highlightWords: ['bananas'],
      },
      {
        text: 'He was thirsty, so he drank water from the river. "This water is so fresh!" said the bear.',
        translation: 'Susamıştı, bu yüzden nehirden su içti. "Bu su çok taze!" dedi ayı.',
        highlightWords: ['water'],
      },
      {
        text: 'The bear was full and happy. "Apples, bananas and water — nature gives us everything!" He smiled and went to sleep.',
        translation:
          'Ayı tok ve mutluydu. "Elmalar, muzlar ve su — doğa bize her şeyi veriyor!" Gülümsedi ve uyumaya gitti.',
        highlightWords: ['apple', 'banana', 'water'],
      },
    ],
  },
  // Home & School
  {
    title: 'A Day at School',
    titleTr: 'Okulda Bir Gün',
    keywords: [
      'school',
      'teacher',
      'book',
      'house',
      'room',
      'wake up',
      'eat breakfast',
      'go to school',
    ],
    pages: [
      {
        text: "Ali wakes up at seven o'clock. He eats breakfast with his family. Today is Monday!",
        translation: 'Ali saat yedide uyanır. Ailesiyle kahvaltı yapar. Bugün Pazartesi!',
        highlightWords: ['wake', 'breakfast'],
      },
      {
        text: 'He goes to school by bus. His school is big and colorful. His teacher says "Good morning!"',
        translation: 'Otobüsle okula gider. Okulu büyük ve renkli. Öğretmeni "Günaydın!" der.',
        highlightWords: ['school', 'teacher'],
      },
      {
        text: 'In class, they read a book about animals. "The dog is a friendly animal," reads Ali from his book.',
        translation:
          'Sınıfta hayvanlar hakkında bir kitap okurlar. "Köpek dost canlısı bir hayvandır," diye kitabından okur Ali.',
        highlightWords: ['book'],
      },
      {
        text: 'After school, Ali goes back to his house. He goes to his room and draws a picture. What a wonderful day!',
        translation:
          'Okuldan sonra Ali evine döner. Odasına gider ve resim çizer. Ne harika bir gün!',
        highlightWords: ['house', 'room'],
      },
    ],
  },
  // Weather & Nature
  {
    title: 'The Four Seasons',
    titleTr: 'Dört Mevsim',
    keywords: [
      'sunny',
      'rainy',
      'cloudy',
      'snowy',
      'spring',
      'summer',
      'autumn',
      'winter',
      'tree',
      'flower',
    ],
    pages: [
      {
        text: 'In spring, the flowers bloom and the trees turn green. Birds sing happy songs. The weather is warm and sunny.',
        translation:
          'İlkbaharda çiçekler açar ve ağaçlar yeşerir. Kuşlar mutlu şarkılar söyler. Hava ılık ve güneşli.',
        highlightWords: ['spring', 'flower', 'sunny'],
      },
      {
        text: 'Summer is hot and sunny. Children play in the park and eat ice cream. "I love summer!" says everyone.',
        translation:
          'Yaz sıcak ve güneşlidir. Çocuklar parkta oynar ve dondurma yer. "Yazı seviyorum!" der herkes.',
        highlightWords: ['summer', 'sunny'],
      },
      {
        text: 'In autumn, the leaves fall from the trees. The sky is cloudy and sometimes rainy. The world turns orange and brown.',
        translation:
          'Sonbaharda yapraklar ağaçlardan düşer. Gökyüzü bulutlu ve bazen yağmurlu. Dünya turuncu ve kahverengiye döner.',
        highlightWords: ['autumn', 'cloudy', 'rainy', 'tree'],
      },
      {
        text: 'Winter is cold and snowy. Children make snowmen and drink hot chocolate. "Winter is magical!" says Ali.',
        translation:
          'Kış soğuk ve karlıdır. Çocuklar kardan adam yapar ve sıcak çikolata içer. "Kış büyülü!" der Ali.',
        highlightWords: ['winter', 'snowy'],
      },
    ],
  },
  // Clothes
  {
    title: 'Getting Dressed',
    titleTr: 'Giyinme Zamanı',
    keywords: ['shirt', 'pants', 'shoes', 'hat', 'jacket', 'dress', 'socks', 'I wear'],
    pages: [
      {
        text: 'It is a cold morning. Mom says: "Put on warm clothes!" First, Ali puts on his shirt and pants.',
        translation:
          'Soğuk bir sabah. Anne der: "Sıcak giysiler giy!" Önce Ali gömleğini ve pantolonunu giyer.',
        highlightWords: ['shirt', 'pants'],
      },
      {
        text: 'Then he puts on his warm socks and shoes. "I wear my favorite blue shoes!" says Ali.',
        translation:
          'Sonra sıcak çoraplarını ve ayakkabılarını giyer. "En sevdiğim mavi ayakkabılarımı giyiyorum!" der Ali.',
        highlightWords: ['socks', 'shoes'],
      },
      {
        text: '"Don\'t forget your jacket and hat!" says mom. Ali puts on his red jacket and a funny hat.',
        translation:
          '"Ceketini ve şapkanı unutma!" der anne. Ali kırmızı ceketini ve komik bir şapka giyer.',
        highlightWords: ['jacket', 'hat'],
      },
      {
        text: 'His sister wears a beautiful dress. "You look great!" says Ali. They are ready to go outside!',
        translation:
          'Kız kardeşi güzel bir elbise giyer. "Harika görünüyorsun!" der Ali. Dışarı çıkmaya hazırlar!',
        highlightWords: ['dress'],
      },
    ],
  },
  // City & Directions
  {
    title: 'Lost in the City',
    titleTr: 'Şehirde Kaybolmak',
    keywords: [
      'park',
      'shop',
      'left',
      'right',
      'straight',
      'hospital',
      'library',
      'How much',
      'buy',
    ],
    pages: [
      {
        text: 'Ali and his dad are in the city. "Where is the park?" asks Ali. "Turn left and go straight," says a kind lady.',
        translation:
          'Ali ve babası şehirde. "Park nerede?" diye sorar Ali. "Sola dön ve düz git," der nazik bir hanım.',
        highlightWords: ['park', 'left', 'straight'],
      },
      {
        text: 'They walk and see a big library on the right. "Look, dad! Can we go to the library?" asks Ali.',
        translation:
          'Yürürler ve sağda büyük bir kütüphane görürler. "Bak baba! Kütüphaneye gidebilir miyiz?" diye sorar Ali.',
        highlightWords: ['library', 'right'],
      },
      {
        text: 'First, they go to a shop. Ali sees a toy. "How much is this?" he asks. "Five dollars," says the shopkeeper. Dad buys it for Ali.',
        translation:
          'Önce bir mağazaya giderler. Ali bir oyuncak görür. "Bu ne kadar?" diye sorar. "Beş dolar," der dükkancı. Baba Ali\'ye alır.',
        highlightWords: ['shop', 'How much'],
      },
      {
        text: 'Finally, they find the park. Ali plays happily. "I love our city!" he says, hugging his dad.',
        translation:
          'Sonunda parkı bulurlar. Ali mutlu mutlu oynar. "Şehrimizi seviyorum!" der babasına sarılarak.',
        highlightWords: ['park'],
      },
    ],
  },
  // Time & Days
  {
    title: "Ali's Week",
    titleTr: "Ali'nin Haftası",
    keywords: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
      'morning',
      'evening',
      "o'clock",
    ],
    pages: [
      {
        text: "On Monday morning, Ali goes to school at eight o'clock. On Tuesday, he has art class. He loves painting!",
        translation:
          'Pazartesi sabahı Ali saat sekizde okula gider. Salı günü resim dersi var. Resim yapmayı çok sever!',
        highlightWords: ['Monday', 'morning', 'Tuesday'],
      },
      {
        text: "Wednesday is Ali's favorite day. He plays football after school. On Thursday, he visits his grandmother.",
        translation:
          "Çarşamba Ali'nin en sevdiği gün. Okuldan sonra futbol oynar. Perşembe günü büyükannesini ziyaret eder.",
        highlightWords: ['Wednesday', 'Thursday'],
      },
      {
        text: 'On Friday evening, the family watches a movie together. "Friday is fun!" says Ali.',
        translation: 'Cuma akşamı aile birlikte film izler. "Cuma eğlenceli!" der Ali.',
        highlightWords: ['Friday', 'evening'],
      },
      {
        text: 'On Saturday and Sunday, Ali plays in the park. He reads books and plays with his friends. He loves the weekend!',
        translation:
          'Cumartesi ve Pazar Ali parkta oynar. Kitap okur ve arkadaşlarıyla oynar. Hafta sonunu çok sever!',
        highlightWords: ['Saturday', 'Sunday'],
      },
    ],
  },
  // Jobs
  {
    title: 'What Do You Want to Be?',
    titleTr: 'Ne Olmak İstersin?',
    keywords: [
      'doctor',
      'teacher',
      'pilot',
      'firefighter',
      'chef',
      'nurse',
      'police',
      'I want to be',
    ],
    pages: [
      {
        text: 'At school, the teacher asks: "What do you want to be when you grow up?" Everyone thinks carefully.',
        translation:
          'Okulda öğretmen sorar: "Büyüyünce ne olmak istersiniz?" Herkes dikkatlice düşünür.',
        highlightWords: ['teacher'],
      },
      {
        text: '"I want to be a doctor!" says Elif. "I want to help sick people." "I want to be a pilot!" says Ahmet. "I want to fly a plane!"',
        translation:
          '"Doktor olmak istiyorum!" der Elif. "Hasta insanlara yardım etmek istiyorum." "Pilot olmak istiyorum!" der Ahmet. "Uçak uçurmak istiyorum!"',
        highlightWords: ['doctor', 'pilot'],
      },
      {
        text: '"I want to be a firefighter!" says Ali bravely. "Firefighters save people. They are very brave and strong."',
        translation:
          '"İtfaiyeci olmak istiyorum!" der Ali cesaretle. "İtfaiyeciler insanları kurtarır. Çok cesur ve güçlüdürler."',
        highlightWords: ['firefighter'],
      },
      {
        text: 'The teacher smiles. "You can all be anything you want! Study hard and follow your dreams." The children cheer happily.',
        translation:
          'Öğretmen gülümser. "Hepiniz istediğiniz her şey olabilirsiniz! Çok çalışın ve hayallerinizin peşinden gidin." Çocuklar mutlulukla alkışlar.',
        highlightWords: ['teacher'],
      },
    ],
  },
  // Space
  {
    title: 'Journey to the Stars',
    titleTr: 'Yıldızlara Yolculuk',
    keywords: ['sun', 'moon', 'star', 'planet', 'Earth', 'Mars', 'rocket', 'astronaut'],
    pages: [
      {
        text: 'Ali dreams of being an astronaut. One night, he imagines flying in a rocket to the moon!',
        translation: 'Ali astronot olmayı hayal eder. Bir gece rokette aya uçtuğunu hayal eder!',
        highlightWords: ['astronaut', 'rocket', 'moon'],
      },
      {
        text: 'First, the rocket passes the sun. "The sun is so bright and hot!" says Ali. Then he sees many stars around him.',
        translation:
          'Önce roket güneşin yanından geçer. "Güneş çok parlak ve sıcak!" der Ali. Sonra etrafında birçok yıldız görür.',
        highlightWords: ['sun', 'star'],
      },
      {
        text: 'The rocket flies to Mars. "Mars is a red planet!" Ali takes a photo. Then he sees Earth from space. "Our planet is beautiful!"',
        translation:
          'Roket Mars\'a uçar. "Mars kırmızı bir gezegen!" Ali fotoğraf çeker. Sonra uzaydan Dünya\'yı görür. "Gezegenimiz çok güzel!"',
        highlightWords: ['Mars', 'planet', 'Earth'],
      },
      {
        text: 'Ali wakes up and smiles. "One day I will be a real astronaut!" He looks at the stars through his window and makes a wish.',
        translation:
          'Ali uyanır ve gülümser. "Bir gün gerçek bir astronot olacağım!" Penceresinden yıldızlara bakar ve dilek tutar.',
        highlightWords: ['astronaut', 'star'],
      },
    ],
  },
  // Emotions
  {
    title: 'How Do You Feel Today?',
    titleTr: 'Bugün Nasıl Hissediyorsun?',
    keywords: ['happy', 'sad', 'angry', 'scared', 'excited', 'I feel', 'because'],
    pages: [
      {
        text: 'In the morning, Ali feels happy because the sun is shining. "I feel great today!" he says with a big smile.',
        translation:
          'Sabahleyin Ali mutlu hisseder çünkü güneş parlıyor. "Bugün harika hissediyorum!" der büyük bir gülümsemeyle.',
        highlightWords: ['happy', 'feel'],
      },
      {
        text: 'At school, his friend Elif is sad because she lost her pencil. "Don\'t be sad, Elif. I have two pencils. Here, take one!"',
        translation:
          'Okulda arkadaşı Elif üzgün çünkü kalemini kaybetmiş. "Üzülme Elif. İki kalemim var. Al, birini al!"',
        highlightWords: ['sad', 'because'],
      },
      {
        text: 'During the test, Ali feels a little scared. "I am scared because the test is hard." But then he remembers he studied a lot.',
        translation:
          'Sınav sırasında Ali biraz korkmuş hisseder. "Sınav zor olduğu için korkuyorum." Ama sonra çok çalıştığını hatırlar.',
        highlightWords: ['scared', 'because'],
      },
      {
        text: 'After school, Ali is excited because tomorrow is his birthday! "I feel so excited!" All feelings are okay — happy, sad, scared or excited.',
        translation:
          'Okuldan sonra Ali heyecanlıdır çünkü yarın doğum günü! "Çok heyecanlıyım!" Tüm duygular normaldir — mutlu, üzgün, korkmuş ya da heyecanlı.',
        highlightWords: ['excited', 'happy', 'sad', 'scared'],
      },
    ],
  },
  // Past Tense
  {
    title: 'A Wonderful Day',
    titleTr: 'Harika Bir Gün',
    keywords: [
      'played',
      'went',
      'ate',
      'saw',
      'walked',
      'yesterday',
      'was',
      'cooked',
      'talked',
      'watched',
    ],
    pages: [
      {
        text: 'Yesterday was a wonderful day! Ali woke up early and walked to the park with his dog.',
        translation: 'Dün harika bir gündü! Ali erken uyandı ve köpeğiyle parka yürüdü.',
        highlightWords: ['yesterday', 'walked'],
      },
      {
        text: 'At the park, he played football with his friends. They played for two hours! Then they ate sandwiches for lunch.',
        translation:
          'Parkta arkadaşlarıyla futbol oynadı. İki saat oynadılar! Sonra öğle yemeğinde sandviç yediler.',
        highlightWords: ['played', 'ate'],
      },
      {
        text: 'In the afternoon, Ali went to the zoo. He saw elephants, lions and monkeys. "I saw amazing animals!" he told his mom.',
        translation:
          'Öğleden sonra Ali hayvanat bahçesine gitti. Filler, aslanlar ve maymunlar gördü. "Harika hayvanlar gördüm!" dedi annesine.',
        highlightWords: ['went', 'saw'],
      },
      {
        text: 'In the evening, mom cooked a delicious dinner. Ali talked about his day and watched a cartoon before bed. "Yesterday was the best day!"',
        translation:
          'Akşam anne lezzetli bir yemek pişirdi. Ali gününü anlattı ve yatmadan önce çizgi film izledi. "Dün en güzel gündü!"',
        highlightWords: ['cooked', 'talked', 'watched'],
      },
    ],
  },
  // Future Tense
  {
    title: 'Plans for Tomorrow',
    titleTr: 'Yarın İçin Planlar',
    keywords: ['I will', 'going to', 'tomorrow', 'next week', 'travel', "Let's", 'Shall we'],
    pages: [
      {
        text: 'Ali is making plans with his family. "Tomorrow I will wake up early. I am going to study English in the morning!"',
        translation:
          'Ali ailesiyle plan yapıyor. "Yarın erken kalkacağım. Sabah İngilizce çalışacağım!"',
        highlightWords: ['tomorrow', 'will'],
      },
      {
        text: '"Next week, we are going to travel to the beach!" says mom. "I will build a sandcastle!" says Ali excitedly.',
        translation:
          '"Gelecek hafta sahile seyahat edeceğiz!" der anne. "Ben kumdan kale yapacağım!" der Ali heyecanla.',
        highlightWords: ['next week', 'travel', 'will'],
      },
      {
        text: '"Let\'s make a list of things to bring!" says dad. "Shall we bring a ball too?" asks Ali. "Yes, great idea!"',
        translation:
          '"Hadi getirecek şeylerin listesini yapalım!" der baba. "Top da getirelim mi?" diye sorar Ali. "Evet, harika fikir!"',
        highlightWords: ["Let's", 'Shall we'],
      },
      {
        text: 'Ali smiles. "I am going to have so much fun! Tomorrow will be an amazing day!" He can\'t wait for the adventure!',
        translation:
          'Ali gülümser. "Çok eğleneceğim! Yarın harika bir gün olacak!" Macera için sabırsızlanıyor!',
        highlightWords: ['going to', 'tomorrow', 'will'],
      },
    ],
  },
  // Travel / World Tour
  {
    title: 'Around the World',
    titleTr: 'Dünya Turu',
    keywords: [
      'Turkey',
      'England',
      'France',
      'Japan',
      'America',
      'airport',
      'passport',
      'hotel',
      'ticket',
      'suitcase',
    ],
    pages: [
      {
        text: 'Ali\'s family is going on a world tour! First, they pack their suitcases and find their passports. "Don\'t forget the tickets!" says mom.',
        translation:
          'Ali\'nin ailesi dünya turuna çıkıyor! Önce bavullarını hazırlar ve pasaportlarını bulurlar. "Biletleri unutmayın!" der anne.',
        highlightWords: ['suitcase', 'passport', 'ticket'],
      },
      {
        text: 'They go to the airport and fly to England first. "England is beautiful!" says Ali. They visit a big castle and drink English tea.',
        translation:
          'Havalimanına giderler ve önce İngiltere\'ye uçarlar. "İngiltere çok güzel!" der Ali. Büyük bir kale ziyaret ederler ve İngiliz çayı içerler.',
        highlightWords: ['airport', 'England'],
      },
      {
        text: 'Next, they travel to France. They see the Eiffel Tower! Then they fly to Japan. Ali eats sushi for the first time. "Yummy!"',
        translation:
          "Sonra Fransa'ya seyahat ederler. Eyfel Kulesi'ni görürler! Sonra Japonya'ya uçarlar. Ali ilk kez suşi yer. \"Lezzetli!\"",
        highlightWords: ['France', 'Japan'],
      },
      {
        text: 'Finally, they fly back to Turkey. "There is no place like home!" says Ali. He puts photos in his album. What an amazing trip!',
        translation:
          'Sonunda Türkiye\'ye geri uçarlar. "Ev gibisi yok!" der Ali. Fotoğrafları albümüne koyar. Ne harika bir gezi!',
        highlightWords: ['Turkey'],
      },
    ],
  },
  // Technology
  {
    title: 'The Smart Robot',
    titleTr: 'Akıllı Robot',
    keywords: ['computer', 'phone', 'tablet', 'robot', 'camera', 'website', 'email', 'video'],
    pages: [
      {
        text: 'Ali gets a small robot for his birthday. The robot can talk! "Hello! I am your robot friend!" it says.',
        translation:
          'Ali doğum günü için küçük bir robot alır. Robot konuşabiliyor! "Merhaba! Ben senin robot arkadaşınım!" der.',
        highlightWords: ['robot'],
      },
      {
        text: 'Ali uses his tablet to control the robot. He takes photos with the robot\'s camera. "Say cheese!" says Ali. The robot smiles.',
        translation:
          'Ali robotu kontrol etmek için tabletini kullanır. Robotun kamerasıyla fotoğraf çeker. "Gülümse!" der Ali. Robot gülümser.',
        highlightWords: ['tablet', 'camera'],
      },
      {
        text: 'They watch a funny video on the computer together. The robot dances to the music! Ali sends a video email to his friend.',
        translation:
          'Birlikte bilgisayarda komik bir video izlerler. Robot müziğe dans eder! Ali arkadaşına video e-posta gönderir.',
        highlightWords: ['video', 'computer', 'email'],
      },
      {
        text: '"You are the best robot ever!" says Ali. The robot says "Thank you! I love learning with you!" They are best friends.',
        translation:
          '"Sen şimdiye kadarki en iyi robotsun!" der Ali. Robot "Teşekkürler! Seninle öğrenmeyi seviyorum!" der. En iyi arkadaşlar.',
        highlightWords: ['robot'],
      },
    ],
  },
  // Body Parts
  {
    title: 'The Silly Monster',
    titleTr: 'Komik Canavar',
    keywords: ['eye', 'nose', 'mouth', 'ear', 'hand', 'foot', 'head', 'arm', 'leg'],
    pages: [
      {
        text: 'Ali draws a silly monster. "My monster has three eyes and two big noses!" he laughs.',
        translation:
          'Ali komik bir canavar çizer. "Canavarımın üç gözü ve iki büyük burnu var!" diye güler.',
        highlightWords: ['eye', 'nose'],
      },
      {
        text: '"It has a very big mouth and four ears!" says Ali. The monster looks very funny on the paper.',
        translation:
          '"Çok büyük ağzı ve dört kulağı var!" der Ali. Canavar kağıtta çok komik görünüyor.',
        highlightWords: ['mouth', 'ear'],
      },
      {
        text: '"And look — six hands and three feet!" Ali shows his drawing to his sister. She laughs so hard!',
        translation:
          '"Ve bakın — altı eli ve üç ayağı var!" Ali çizimini kız kardeşine gösterir. Çok güler!',
        highlightWords: ['hand', 'foot'],
      },
      {
        text: '"Its head is round like a ball, and its arms and legs are like spaghetti!" says Ali. The whole family laughs at the silly monster.',
        translation:
          '"Başı top gibi yuvarlak, kolları ve bacakları spagetti gibi!" der Ali. Tüm aile komik canavara güler.',
        highlightWords: ['head', 'arm', 'leg'],
      },
    ],
  },
  // Sports
  {
    title: 'The Big Football Match',
    titleTr: 'Büyük Futbol Maçı',
    keywords: ['run', 'jump', 'kick', 'throw', 'catch', 'swim', 'fast', 'slow', 'strong'],
    pages: [
      {
        text: 'Today is the big football match! Ali puts on his blue shirt and runs to the field. "Let\'s play!" he says.',
        translation:
          'Bugün büyük futbol maçı! Ali mavi tişörtünü giyer ve sahaya koşar. "Hadi oynayalım!" der.',
        highlightWords: ['run', 'play'],
      },
      {
        text: 'Ali kicks the ball very fast. His friend jumps to catch it but misses! "That was a strong kick!" says the coach.',
        translation:
          'Ali topa çok hızlı vurur. Arkadaşı topu yakalamak için zıplar ama kaçırır! "Güçlü bir vuruştu!" der koç.',
        highlightWords: ['kick', 'fast', 'jump', 'strong'],
      },
      {
        text: 'The other team throws the ball in. Ali runs fast and kicks again. Goal! Everyone cheers and claps.',
        translation:
          'Diğer takım topu atar. Ali hızla koşar ve tekrar vurur. Gol! Herkes tezahürat yapar ve alkışlar.',
        highlightWords: ['throw', 'run', 'kick'],
      },
      {
        text: 'After the match, the children swim in the pool to cool down. "Sports are fun!" says Ali. "I want to play every day!"',
        translation:
          'Maçtan sonra çocuklar serinlemek için havuzda yüzer. "Spor eğlenceli!" der Ali. "Her gün oynamak istiyorum!"',
        highlightWords: ['swim'],
      },
    ],
  },
  // Hygiene & Health
  {
    title: 'Clean Hands, Happy Day',
    titleTr: 'Temiz Eller, Mutlu Gün',
    keywords: ['wash', 'clean', 'water', 'doctor', 'nurse', 'healthy', 'tired', 'strong'],
    pages: [
      {
        text: 'Every morning, Ali washes his hands with soap and water. "Clean hands keep you healthy!" says mom.',
        translation:
          'Her sabah Ali ellerini sabun ve suyla yıkar. "Temiz eller seni sağlıklı tutar!" der anne.',
        highlightWords: ['wash', 'clean', 'water', 'healthy'],
      },
      {
        text: 'At school, the nurse visits the class. "Do you brush your teeth every day?" she asks. "Yes!" say the children.',
        translation:
          'Okulda hemşire sınıfı ziyaret eder. "Her gün dişlerinizi fırçalıyor musunuz?" diye sorar. "Evet!" der çocuklar.',
        highlightWords: ['nurse'],
      },
      {
        text: 'Ali eats an apple and drinks milk. The doctor says: "Fruit and milk make you strong. Eat healthy food every day!"',
        translation:
          'Ali bir elma yer ve süt içer. Doktor der: "Meyve ve süt seni güçlü yapar. Her gün sağlıklı yemek ye!"',
        highlightWords: ['doctor', 'strong'],
      },
      {
        text: 'Before bed, Ali takes a warm bath. He is a little tired but very clean. "Good night, mom!" Sweet dreams, Ali!',
        translation:
          'Yatmadan önce Ali ılık bir banyo yapar. Biraz yorgun ama çok temiz. "İyi geceler, anne!" Tatlı rüyalar Ali!',
        highlightWords: ['tired', 'clean'],
      },
    ],
  },
  // Transport
  {
    title: 'How Do We Go?',
    titleTr: 'Nasıl Gideriz?',
    keywords: ['car', 'bus', 'train', 'airplane', 'bicycle', 'ship', 'fast', 'slow', 'go'],
    pages: [
      {
        text: 'Ali\'s family is going on a trip. "How do we go?" asks Ali. Dad says: "We can go by car or by bus."',
        translation:
          'Ali\'nin ailesi geziye çıkıyor. "Nasıl gideriz?" diye sorar Ali. Baba der: "Arabayla veya otobüsle gidebiliriz."',
        highlightWords: ['car', 'bus', 'go'],
      },
      {
        text: '"A train is faster than a bus," says mom. "But an airplane is the fastest!" says Ali. "I want to fly!"',
        translation:
          '"Tren otobüsten daha hızlı," der anne. "Ama uçak en hızlı!" der Ali. "Uçmak istiyorum!"',
        highlightWords: ['train', 'airplane', 'fast'],
      },
      {
        text: 'Ali also likes his bicycle. "I ride my bicycle to school every day. It is slow but fun!" he says with a smile.',
        translation:
          'Ali bisikletini de sever. "Her gün bisikletimle okula gidiyorum. Yavaş ama eğlenceli!" der gülümseyerek.',
        highlightWords: ['bicycle', 'slow'],
      },
      {
        text: '"One day, let\'s go by ship across the sea!" says Ali. "Cars, buses, trains, planes, bikes and ships — so many ways to travel!"',
        translation:
          '"Bir gün gemiyle denizi geçelim!" der Ali. "Arabalar, otobüsler, trenler, uçaklar, bisikletler ve gemiler — seyahat etmenin çok yolu var!"',
        highlightWords: ['ship'],
      },
    ],
  },
  // Shapes & Math
  {
    title: 'The Shape Garden',
    titleTr: 'Şekil Bahçesi',
    keywords: ['round', 'big', 'small', 'long', 'short', 'one', 'two', 'three', 'four', 'five'],
    pages: [
      {
        text: 'Ali discovers a magical garden. Everything has a shape! The flowers are round like circles. "I see one big circle and two small circles!"',
        translation:
          'Ali büyülü bir bahçe keşfeder. Her şeyin bir şekli var! Çiçekler daire gibi yuvarlak. "Bir büyük daire ve iki küçük daire görüyorum!"',
        highlightWords: ['round', 'big', 'small', 'one', 'two'],
      },
      {
        text: 'The trees are tall and have long branches. "Three tall trees and four short bushes!" counts Ali. He writes the shapes in his notebook.',
        translation:
          'Ağaçlar uzun ve uzun dalları var. "Üç uzun ağaç ve dört kısa çalı!" diye sayar Ali. Şekilleri defterine yazar.',
        highlightWords: ['long', 'short', 'three', 'four'],
      },
      {
        text: '"Look! Five butterflies are flying in a line!" says Ali. They are colorful and beautiful. He counts them one more time.',
        translation:
          '"Bakın! Beş kelebek sıra halinde uçuyor!" der Ali. Renkli ve güzeller. Bir kez daha sayar.',
        highlightWords: ['five'],
      },
      {
        text: '"Big or small, round or long — every shape is special!" says Ali. He draws the garden in his notebook. What a beautiful day!',
        translation:
          '"Büyük veya küçük, yuvarlak veya uzun — her şekil özel!" der Ali. Bahçeyi defterine çizer. Ne güzel bir gün!',
        highlightWords: ['big', 'small', 'round', 'long'],
      },
    ],
  },
];

/**
 * Find the best matching story template for a given set of vocabulary words.
 * Falls back to creating a generic narrative if no template matches well.
 */
function findStoryTemplate(words: string[]): StoryTemplate {
  const lowerWords = new Set(words.map((w) => w.toLowerCase()));
  const fallbackTemplate = STORY_TEMPLATES[0];
  if (!fallbackTemplate) {
    throw new Error('No story templates configured');
  }

  let bestTemplate = fallbackTemplate;
  let bestScore = 0;

  for (const template of STORY_TEMPLATES) {
    const score = template.keywords.filter((kw) => lowerWords.has(kw.toLowerCase())).length;
    if (score > bestScore) {
      bestScore = score;
      bestTemplate = template;
    }
  }

  return bestTemplate;
}

function generateStoryTime(lessonId: string, words: string[], startOrder: number): Activity {
  const template = findStoryTemplate(words);
  const theme = template.keywords[0] ?? 'animals';
  const selectedStory = selectStoryForWords(words, theme);

  if (selectedStory.data.pages.length > 0) {
    return {
      id: nextId(lessonId, 'st'),
      type: 'story-time' as const,
      order: startOrder,
      timeLimit: null,
      maxAttempts: 1,
      data: {
        ...selectedStory.data,
        pages: selectedStory.data.pages.map((page) => ({ ...page })),
      },
    };
  }

  return {
    id: nextId(lessonId, 'st'),
    type: 'story-time' as const,
    order: startOrder,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'story-time' as const,
      title: template.title,
      pages: template.pages.map((p, idx) => ({
        text: p.text,
        translation: p.translation,
        imageUrl: generateStoryPlaceholderImage(theme, idx),
        audioUrl: resolveStoryAudioUrl(p.text),
        highlightWords: p.highlightWords,
        interactionType: 'tap-word' as const,
      })),
    } satisfies StoryTimeData,
  };
}

function generateMemoryGame(lessonId: string, words: string[], startOrder: number): Activity {
  const selected = words.slice(0, 4);
  const cards = selected.flatMap((w) => {
    const v = getVocab(w);
    const matchId = `m_${w.replace(/\s/g, '_')}`;
    return [
      {
        id: `${matchId}_en`,
        matchId,
        content: w.charAt(0).toUpperCase() + w.slice(1),
        contentType: 'text' as const,
      },
      { id: `${matchId}_tr`, matchId, content: v.tr, contentType: 'text' as const },
    ];
  });
  return {
    id: nextId(lessonId, 'mg'),
    type: 'memory-game' as const,
    order: startOrder,
    timeLimit: 60,
    maxAttempts: 1,
    data: {
      type: 'memory-game' as const,
      cards: shuffle(cards),
      gridSize: { rows: 2, cols: 4 },
    } satisfies MemoryGameData,
  };
}

function generateWordSearch(lessonId: string, words: string[], startOrder: number): Activity {
  const gridSize = 8;
  const grid: string[][] = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26)),
    ),
  );
  // Place up to 4 short words
  const shortWords = words
    .map((w) => w.split(' ')[0] ?? w)
    .filter((w): w is string => w.length <= gridSize)
    .slice(0, 4);

  const placedWords = shortWords.map((word, i) => {
    const row = i * 2;
    const upperWord = word.toUpperCase();
    for (let c = 0; c < upperWord.length; c++) {
      const gridRow = grid[row];
      if (row < gridSize && c < gridSize && gridRow) {
        gridRow[c] = upperWord[c] ?? 'A';
      }
    }
    return {
      word: word.charAt(0).toUpperCase() + word.slice(1),
      translation: getVocab(word).tr,
      direction: 'horizontal' as const,
      startRow: row,
      startCol: 0,
    };
  });

  return {
    id: nextId(lessonId, 'ws'),
    type: 'word-search' as const,
    order: startOrder,
    timeLimit: 90,
    maxAttempts: 1,
    data: {
      type: 'word-search' as const,
      grid,
      words: placedWords,
      gridSize,
    } satisfies WordSearchData,
  };
}

function generateQuizBattle(lessonId: string, words: string[], startOrder: number): Activity {
  const selected = words.slice(0, 6);
  const questionGenerators = [
    generateTranslationQuestion,
    generateReverseTranslationQuestion,
    generateFillBlankQuestion,
    generateSentenceTranslationQuestion,
  ];

  const questions = selected.slice(0, 4).map((w, idx) => {
    // Distribute question types evenly, cycling through generators
    const gen = questionGenerators[idx % questionGenerators.length];
    if (!gen) return generateTranslationQuestion(w, selected);
    return gen(w, selected);
  });

  return {
    id: nextId(lessonId, 'qb'),
    type: 'quiz-battle' as const,
    order: startOrder,
    timeLimit: 60,
    maxAttempts: 1,
    data: {
      type: 'quiz-battle' as const,
      questions,
    } satisfies QuizBattleData,
  };
}

/** Classic: "Dog" ne demek?  → pick correct Turkish translation */
function generateTranslationQuestion(
  w: string,
  pool: string[],
): QuizBattleData['questions'][number] {
  const v = getVocab(w);
  const distractors = pool
    .filter((o) => o !== w)
    .map((o) => getVocab(o).tr)
    .slice(0, 3);
  const options = shuffle([v.tr, ...distractors]);
  return {
    id: `q_tr_${w.replace(/\s/g, '_')}`,
    question: `"${w.charAt(0).toUpperCase() + w.slice(1)}" ne demek?`,
    questionType: 'text' as const,
    options,
    correctIndex: options.indexOf(v.tr),
    timeLimit: 10,
    points: 25,
  };
}

/** Reverse: Turkish → pick correct English word */
function generateReverseTranslationQuestion(
  w: string,
  pool: string[],
): QuizBattleData['questions'][number] {
  const v = getVocab(w);
  const capitalW = w.charAt(0).toUpperCase() + w.slice(1);
  const distractors = pool
    .filter((o) => o !== w)
    .map((o) => o.charAt(0).toUpperCase() + o.slice(1))
    .slice(0, 3);
  const options = shuffle([capitalW, ...distractors]);
  return {
    id: `q_rev_${w.replace(/\s/g, '_')}`,
    question: `"${v.tr}" İngilizce'de ne demek?`,
    questionType: 'text' as const,
    options,
    correctIndex: options.indexOf(capitalW),
    timeLimit: 10,
    points: 25,
  };
}

/** Fill-blank sentence: pick the missing word in a sentence */
function generateFillBlankQuestion(w: string, pool: string[]): QuizBattleData['questions'][number] {
  const { en } = getRandomSentence(w);
  // Replace the target word in the sentence with ___
  const wordRegex = new RegExp(`\\b${escapeRegex(w)}\\b`, 'i');
  const blanked = en.replace(wordRegex, '___');

  // If blanking didn't work (word not found in sentence), fall back to translation
  if (blanked === en) {
    return generateTranslationQuestion(w, pool);
  }

  const capitalW = w.charAt(0).toUpperCase() + w.slice(1);
  const distractors = pool
    .filter((o) => o !== w)
    .map((o) => o.charAt(0).toUpperCase() + o.slice(1))
    .slice(0, 3);
  const options = shuffle([capitalW, ...distractors]);
  return {
    id: `q_fb_${w.replace(/\s/g, '_')}`,
    question: blanked,
    questionType: 'text' as const,
    options,
    correctIndex: options.indexOf(capitalW),
    timeLimit: 12,
    points: 30,
  };
}

/** Sentence translation: English sentence → pick correct Turkish translation */
function generateSentenceTranslationQuestion(
  w: string,
  pool: string[],
): QuizBattleData['questions'][number] {
  const { en, tr } = getRandomSentence(w);

  // Gather distractor sentences from other words
  const distractorSentences = pool
    .filter((o) => o !== w)
    .map((o) => getRandomSentence(o).tr)
    .slice(0, 3);

  // If we don't have enough distractors, fall back to translation question
  if (distractorSentences.length < 3) {
    return generateTranslationQuestion(w, pool);
  }

  const options = shuffle([tr, ...distractorSentences]);
  return {
    id: `q_st_${w.replace(/\s/g, '_')}`,
    question: `"${en}" cümlesinin Türkçe karşılığı?`,
    questionType: 'text' as const,
    options,
    correctIndex: options.indexOf(tr),
    timeLimit: 15,
    points: 35,
  };
}
// ===== UTILITY: escapeRegex =====
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ===== GRAMMAR TRANSFORM GENERATOR =====

function generateGrammarTransform(
  lessonId: string,
  _words: string[],
  startOrder: number,
): Activity {
  const pattern = GRAMMAR_PATTERNS[Math.floor(Math.random() * GRAMMAR_PATTERNS.length)];
  if (!pattern || pattern.pairs.length === 0) {
    // Fallback to first pattern
    const fallback = GRAMMAR_PATTERNS[0];
    const pair = fallback?.pairs[0];
    if (!fallback || !pair) {
      throw new Error('No grammar patterns configured');
    }
    return {
      id: nextId(lessonId, 'gt'),
      type: 'grammar-transform' as const,
      order: startOrder,
      timeLimit: 20,
      maxAttempts: 2,
      data: {
        type: 'grammar-transform' as const,
        instruction: fallback.instruction,
        instructionTr: fallback.instructionTr,
        sourceSentence: pair.source,
        correctAnswer: pair.correct,
        options: shuffle([pair.correct, ...pair.distractors]),
      } satisfies GrammarTransformData,
    };
  }

  const pair = pattern.pairs[Math.floor(Math.random() * pattern.pairs.length)];
  if (!pair) {
    throw new Error('Grammar pattern has no pairs');
  }
  const options = shuffle([pair.correct, ...pair.distractors]);

  return {
    id: nextId(lessonId, 'gt'),
    type: 'grammar-transform' as const,
    order: startOrder,
    timeLimit: 20,
    maxAttempts: 2,
    data: {
      type: 'grammar-transform' as const,
      instruction: pattern.instruction,
      instructionTr: pattern.instructionTr,
      sourceSentence: pair.source,
      correctAnswer: pair.correct,
      options,
    } satisfies GrammarTransformData,
  };
}

// ===== STORY COMPREHENSION GENERATOR =====

function findComprehensionTemplate(words: string[]): ComprehensionTemplate {
  const lowerWords = new Set(words.map((w) => w.toLowerCase()));
  const fallbackTemplate = COMPREHENSION_TEMPLATES[0];
  if (!fallbackTemplate) {
    throw new Error('No comprehension templates configured');
  }

  let bestTemplate = fallbackTemplate;
  let bestScore = 0;

  for (const template of COMPREHENSION_TEMPLATES) {
    const score = template.keywords.filter((kw) => lowerWords.has(kw.toLowerCase())).length;
    if (score > bestScore) {
      bestScore = score;
      bestTemplate = template;
    }
  }

  return bestTemplate;
}

function generateStoryComprehension(
  lessonId: string,
  words: string[],
  startOrder: number,
): Activity {
  const template = findComprehensionTemplate(words);

  return {
    id: nextId(lessonId, 'sc'),
    type: 'story-comprehension' as const,
    order: startOrder,
    timeLimit: null,
    maxAttempts: 2,
    data: {
      type: 'story-comprehension' as const,
      passage: template.passage,
      passageTranslation: template.passageTranslation,
      questions: template.questions.map((q, i) => ({
        id: `${lessonId}_sc_q${i}`,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
      })),
    } satisfies StoryComprehensionData,
  };
}

// ===== SENTENCE BUILDER GENERATOR =====

function generateSentenceBuilder(lessonId: string, words: string[], startOrder: number): Activity {
  const word = pickWord(words);
  const sent = getRandomSentence(word);
  const sentenceWords = sent.en.replace(/[.!?]/g, '').split(/\s+/);
  const correctOrder = [...sentenceWords];
  const scrambled = shuffle([...sentenceWords]);

  return {
    id: nextId(lessonId, 'sb'),
    type: 'sentence-builder' as const,
    order: startOrder,
    timeLimit: 30,
    maxAttempts: 3,
    data: {
      type: 'sentence-builder' as const,
      sentence: sent.en,
      translation: sent.tr,
      words: scrambled,
      correctOrder,
    } satisfies SentenceBuilderData,
  };
}

// ===== CONVERSATION GENERATOR =====

function isConversationScenarioRegistryEnabled(): boolean {
  const env =
    import.meta.env.MODE === 'production'
      ? 'production'
      : import.meta.env.MODE === 'test'
        ? 'test'
        : 'development';

  const remoteOverrides =
    import.meta.env.VITE_FEATURE_CONVERSATION_SCENARIO_REGISTRY === 'true'
      ? { conversationScenarioRegistry: true }
      : undefined;

  return resolveFeatureFlags(env, remoteOverrides).conversationScenarioRegistry;
}

function generateConversation(lessonId: string, words: string[], startOrder: number): Activity {
  if (isConversationScenarioRegistryEnabled()) {
    // Registry is always enabled in dev/test/prod (conversationScenarioRegistry: true by default).
    // selectConversationScenario always returns a valid scenario (falls back to first registered
    // one as safety net), so this path never needs to call the legacy template.
    const scenario = selectConversationScenario({ words });
    return {
      id: nextId(lessonId, 'conv'),
      type: 'conversation' as const,
      order: startOrder,
      timeLimit: null,
      maxAttempts: 1,
      data: toConversationActivityData(scenario),
    };
  }

  // Legacy path — only reached if the registry flag is explicitly disabled via env var.
  trackConversationLegacyFallback();
  const template = findBestTemplate(words);
  const selectedWords = words.slice(0, Math.max(template.minWords, 3));
  const translations = selectedWords.map((w) => getVocab(w).tr);
  const emojis = selectedWords.map((w) => getVocab(w).emoji ?? '💬');
  const nodes = template.buildNodes(selectedWords, translations, emojis);

  return {
    id: nextId(lessonId, 'conv'),
    type: 'conversation' as const,
    order: startOrder,
    timeLimit: null,
    maxAttempts: 1,
    data: {
      type: 'conversation' as const,
      title: template.title,
      titleTr: template.titleTr,
      sceneEmoji: template.sceneEmoji,
      nodes,
      startNodeId: nodes[0]?.id ?? 'n1',
      targetWords: selectedWords,
    } satisfies ConversationData,
  };
}

// ===== MAIN ACTIVITY GENERATOR =====

/**
 * Generates a complete list of activities for a curriculum lesson.
 * Maps each activityType to the appropriate generator and returns an ordered Activity[].
 */
export function generateActivities(lesson: CurriculumLesson): Activity[] {
  // Reset counters for each lesson generation
  _activityCounter = 0;
  _vocabIndex = 0;

  const { id: lessonId, vocabulary: words, activityTypes } = lesson;
  const activities: Activity[] = [];
  let order = 0;

  // Prepend Nova's intro slide if the lesson has an introLine
  if (lesson.introLine) {
    activities.push({
      id: `${lessonId}_intro`,
      type: 'lesson-intro',
      order,
      data: { type: 'lesson-intro', text: lesson.introLine },
      timeLimit: null,
      maxAttempts: 1,
    });
    order++;
  }

  for (const actType of activityTypes) {
    switch (actType) {
      case 'flash-card': {
        const cards = generateFlashCards(lessonId, words, order);
        activities.push(...cards);
        order += cards.length;
        break;
      }
      case 'listen-and-tap':
        activities.push(generateListenAndTap(lessonId, words, order));
        order++;
        break;
      case 'match-pairs':
        activities.push(generateMatchPairs(lessonId, words, order));
        order++;
        break;
      case 'word-builder': {
        const word = pickWord(words);
        activities.push(generateWordBuilder(lessonId, word, order));
        order++;
        break;
      }
      case 'fill-blank': {
        const word = pickWord(words);
        activities.push(generateFillBlank(lessonId, word, words, order));
        order++;
        break;
      }
      case 'speak-it': {
        const word = pickWord(words);
        activities.push(generateSpeakIt(lessonId, word, order));
        order++;
        break;
      }
      case 'story-time':
        activities.push(generateStoryTime(lessonId, words, order));
        order++;
        break;
      case 'memory-game':
        activities.push(generateMemoryGame(lessonId, words, order));
        order++;
        break;
      case 'word-search':
        activities.push(generateWordSearch(lessonId, words, order));
        order++;
        break;
      case 'quiz-battle':
        activities.push(generateQuizBattle(lessonId, words, order));
        order++;
        break;
      case 'sentence-builder':
        activities.push(generateSentenceBuilder(lessonId, words, order));
        order++;
        break;
      case 'story-comprehension':
        activities.push(generateStoryComprehension(lessonId, words, order));
        order++;
        break;
      case 'grammar-transform':
        activities.push(generateGrammarTransform(lessonId, words, order));
        order++;
        break;
      case 'conversation':
        activities.push(generateConversation(lessonId, words, order));
        order++;
        break;
      default:
        // Unknown activity type — skip silently
        break;
    }
  }

  // Append Nova's outro slide if the lesson has an outroLine
  if (lesson.outroLine) {
    activities.push({
      id: `${lessonId}_outro`,
      type: 'lesson-outro',
      order,
      data: { type: 'lesson-outro', text: lesson.outroLine },
      timeLimit: null,
      maxAttempts: 1,
    });
  }

  return activities;
}

// NOTE: The old inline GRAMMAR_PATTERNS data was removed.
// Grammar patterns are now imported from './grammarPatterns'.
// Comprehension templates are imported from './comprehensionTemplates'.
