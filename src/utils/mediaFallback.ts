/**
 * Media Fallback Utility
 *
 * Provides runtime fallback images and audio for vocabulary words and story pages
 * when actual media assets haven't been created yet. Generates emoji-based SVG
 * data URIs for images and uses Web Speech API TTS for audio.
 */

// Word → Emoji mapping for vocabulary visual fallbacks
const WORD_EMOJI_MAP: Record<string, string> = {
  // Animals
  dog: '🐕',
  cat: '🐱',
  bird: '🐦',
  fish: '🐟',
  bear: '🐻',
  lion: '🦁',
  elephant: '🐘',
  monkey: '🐒',
  rabbit: '🐰',
  horse: '🐴',
  cow: '🐄',
  sheep: '🐑',
  pig: '🐷',
  duck: '🦆',
  frog: '🐸',
  turtle: '🐢',
  snake: '🐍',
  butterfly: '🦋',
  bee: '🐝',
  ant: '🐜',
  spider: '🕷️',
  penguin: '🐧',
  owl: '🦉',
  parrot: '🦜',
  dolphin: '🐬',
  whale: '🐋',
  shark: '🦈',
  octopus: '🐙',
  giraffe: '🦒',
  zebra: '🦓',
  kangaroo: '🦘',
  // Colors
  red: '🔴',
  blue: '🔵',
  green: '🟢',
  yellow: '🟡',
  orange: '🟠',
  purple: '🟣',
  pink: '🩷',
  black: '⚫',
  white: '⚪',
  brown: '🟤',
  // Food & Drinks
  apple: '🍎',
  banana: '🍌',
  orange_fruit: '🍊',
  grape: '🍇',
  strawberry: '🍓',
  watermelon: '🍉',
  bread: '🍞',
  cheese: '🧀',
  egg: '🥚',
  milk: '🥛',
  water: '💧',
  juice: '🧃',
  cake: '🎂',
  cookie: '🍪',
  pizza: '🍕',
  rice: '🍚',
  chicken: '🍗',
  carrot: '🥕',
  tomato: '🍅',
  corn: '🌽',
  ice_cream: '🍦',
  chocolate: '🍫',
  sandwich: '🥪',
  soup: '🍲',
  salad: '🥗',
  // Family
  mother: '👩',
  father: '👨',
  sister: '👧',
  brother: '👦',
  baby: '👶',
  grandmother: '👵',
  grandfather: '👴',
  family: '👨‍👩‍👧‍👦',
  // Numbers
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
  // Body parts
  head: '🧠',
  hand: '✋',
  eye: '👁️',
  ear: '👂',
  nose: '👃',
  mouth: '👄',
  foot: '🦶',
  arm: '💪',
  // Nature
  tree: '🌳',
  flower: '🌸',
  sun: '☀️',
  moon: '🌙',
  star: '⭐',
  cloud: '☁️',
  rain: '🌧️',
  snow: '❄️',
  mountain: '⛰️',
  river: '🏞️',
  ocean: '🌊',
  forest: '🌲',
  garden: '🌻',
  // Clothes
  shirt: '👕',
  pants: '👖',
  dress: '👗',
  shoes: '👟',
  hat: '🎩',
  jacket: '🧥',
  socks: '🧦',
  gloves: '🧤',
  scarf: '🧣',
  // Transport
  car: '🚗',
  bus: '🚌',
  train: '🚂',
  airplane: '✈️',
  bicycle: '🚲',
  boat: '⛵',
  helicopter: '🚁',
  // Places
  house: '🏠',
  school: '🏫',
  hospital: '🏥',
  park: '🏞️',
  library: '📚',
  market: '🏪',
  restaurant: '🍽️',
  // Toys
  ball: '⚽',
  doll: '🧸',
  robot: '🤖',
  puzzle: '🧩',
  blocks: '🧱',
  kite: '🪁',
  // Emotions
  happy: '😊',
  sad: '😢',
  angry: '😡',
  scared: '😨',
  surprised: '😮',
  tired: '😴',
  excited: '🤩',
  love: '❤️',
};

// Theme → Emoji mapping for story illustrations
const THEME_EMOJI_MAP: Record<string, string> = {
  animals: '🐾',
  farm: '🌾',
  pets: '🐕',
  zoo: '🦁',
  colors: '🎨',
  shapes: '🔷',
  food: '🍎',
  drinks: '🥤',
  family: '👨‍👩‍👧‍👦',
  home: '🏠',
  school: '🏫',
  nature: '🌿',
  weather: '🌤️',
  seasons: '🍂',
  clothes: '👕',
  transport: '🚗',
  city: '🏙️',
  numbers: '🔢',
  body: '🧍',
  toys: '🧸',
  emotions: '😊',
  routine: '⏰',
  sports: '⚽',
  friends: '🤝',
  jobs: '👷',
  time: '🕐',
};

/**
 * Get emoji representation for a vocabulary word.
 */
export function getWordEmoji(word: string): string {
  const lower = word.toLowerCase().trim();
  return WORD_EMOJI_MAP[lower] ?? '📝';
}

/**
 * Get emoji for a story theme.
 */
export function getThemeEmoji(theme: string): string {
  const lower = theme.toLowerCase().trim();
  return THEME_EMOJI_MAP[lower] ?? '📖';
}

/**
 * Generate an SVG data URI for a vocabulary word, using emoji as placeholder image.
 * Returns a data URI that can be used as `src` for `<img>` tags.
 */
export function generateWordPlaceholderImage(word: string, bgColor = '#f0f9ff'): string {
  const emoji = getWordEmoji(word);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect width="200" height="200" rx="24" fill="${bgColor}"/>
    <text x="100" y="95" font-size="72" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
    <text x="100" y="155" font-size="16" font-family="system-ui,sans-serif" text-anchor="middle" fill="#475569" font-weight="600">${escapeXml(word)}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Generate an SVG data URI for a story page placeholder.
 */
export function generateStoryPlaceholderImage(
  theme: string,
  pageIndex: number,
  bgColor = '#fef3c7',
): string {
  const emoji = getThemeEmoji(theme);
  const pageLabel = `Page ${pageIndex + 1}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240">
    <rect width="400" height="240" rx="20" fill="${bgColor}"/>
    <text x="200" y="100" font-size="64" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
    <text x="200" y="180" font-size="14" font-family="system-ui,sans-serif" text-anchor="middle" fill="#92400e">${pageLabel}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Resolve an image URL — returns the original if non-empty, otherwise generates a placeholder.
 */
export function resolveImageUrl(
  imageUrl: string | undefined,
  context: { word?: string; theme?: string; pageIndex?: number },
): string {
  if (imageUrl && imageUrl.length > 0) return imageUrl;
  if (context.word) return generateWordPlaceholderImage(context.word);
  if (context.theme != null && context.pageIndex != null) {
    return generateStoryPlaceholderImage(context.theme, context.pageIndex);
  }
  return generateWordPlaceholderImage('?');
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
