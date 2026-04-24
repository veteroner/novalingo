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

type ThemePlaceholderStyle = {
  emoji: string;
  label: string;
  bgFrom: string;
  bgTo: string;
  accent: string;
  text: string;
};

// Theme → placeholder style mapping for story illustrations
const THEME_PLACEHOLDER_STYLES: Record<string, ThemePlaceholderStyle> = {
  animals: {
    emoji: '🐾',
    label: 'Animal Story',
    bgFrom: '#fef3c7',
    bgTo: '#fde68a',
    accent: '#f59e0b',
    text: '#78350f',
  },
  farm: {
    emoji: '🌾',
    label: 'Farm Story',
    bgFrom: '#ecfccb',
    bgTo: '#d9f99d',
    accent: '#65a30d',
    text: '#365314',
  },
  pets: {
    emoji: '🐕',
    label: 'Pet Story',
    bgFrom: '#fee2e2',
    bgTo: '#fecaca',
    accent: '#ef4444',
    text: '#7f1d1d',
  },
  zoo: {
    emoji: '🦁',
    label: 'Zoo Story',
    bgFrom: '#ffedd5',
    bgTo: '#fdba74',
    accent: '#f97316',
    text: '#7c2d12',
  },
  colors: {
    emoji: '🎨',
    label: 'Color Story',
    bgFrom: '#ede9fe',
    bgTo: '#ddd6fe',
    accent: '#8b5cf6',
    text: '#4c1d95',
  },
  shapes: {
    emoji: '🔷',
    label: 'Shape Story',
    bgFrom: '#dbeafe',
    bgTo: '#bfdbfe',
    accent: '#3b82f6',
    text: '#1e3a8a',
  },
  food: {
    emoji: '🍎',
    label: 'Food Story',
    bgFrom: '#fee2e2',
    bgTo: '#fecdd3',
    accent: '#f43f5e',
    text: '#881337',
  },
  drinks: {
    emoji: '🥤',
    label: 'Drink Story',
    bgFrom: '#cffafe',
    bgTo: '#a5f3fc',
    accent: '#06b6d4',
    text: '#164e63',
  },
  family: {
    emoji: '👨‍👩‍👧‍👦',
    label: 'Family Story',
    bgFrom: '#fce7f3',
    bgTo: '#fbcfe8',
    accent: '#ec4899',
    text: '#831843',
  },
  home: {
    emoji: '🏠',
    label: 'Home Story',
    bgFrom: '#ede9fe',
    bgTo: '#ddd6fe',
    accent: '#7c3aed',
    text: '#4c1d95',
  },
  school: {
    emoji: '🏫',
    label: 'School Story',
    bgFrom: '#dbeafe',
    bgTo: '#bfdbfe',
    accent: '#2563eb',
    text: '#1e3a8a',
  },
  nature: {
    emoji: '🌿',
    label: 'Nature Story',
    bgFrom: '#dcfce7',
    bgTo: '#bbf7d0',
    accent: '#22c55e',
    text: '#14532d',
  },
  weather: {
    emoji: '🌤️',
    label: 'Weather Story',
    bgFrom: '#e0f2fe',
    bgTo: '#bae6fd',
    accent: '#0ea5e9',
    text: '#0c4a6e',
  },
  seasons: {
    emoji: '🍂',
    label: 'Season Story',
    bgFrom: '#ffedd5',
    bgTo: '#fed7aa',
    accent: '#f97316',
    text: '#7c2d12',
  },
  clothes: {
    emoji: '👕',
    label: 'Clothes Story',
    bgFrom: '#fae8ff',
    bgTo: '#f5d0fe',
    accent: '#d946ef',
    text: '#701a75',
  },
  transport: {
    emoji: '🚗',
    label: 'Travel Story',
    bgFrom: '#e0f2fe',
    bgTo: '#bae6fd',
    accent: '#0284c7',
    text: '#082f49',
  },
  travel: {
    emoji: '✈️',
    label: 'Travel Story',
    bgFrom: '#dbeafe',
    bgTo: '#bfdbfe',
    accent: '#2563eb',
    text: '#1e3a8a',
  },
  city: {
    emoji: '🏙️',
    label: 'City Story',
    bgFrom: '#e2e8f0',
    bgTo: '#cbd5e1',
    accent: '#475569',
    text: '#0f172a',
  },
  numbers: {
    emoji: '🔢',
    label: 'Number Story',
    bgFrom: '#fef3c7',
    bgTo: '#fde68a',
    accent: '#eab308',
    text: '#713f12',
  },
  body: {
    emoji: '🧍',
    label: 'Body Story',
    bgFrom: '#fee2e2',
    bgTo: '#fecaca',
    accent: '#fb7185',
    text: '#881337',
  },
  health: {
    emoji: '🩺',
    label: 'Health Story',
    bgFrom: '#ccfbf1',
    bgTo: '#99f6e4',
    accent: '#14b8a6',
    text: '#134e4a',
  },
  toys: {
    emoji: '🧸',
    label: 'Toy Story',
    bgFrom: '#fae8ff',
    bgTo: '#f5d0fe',
    accent: '#c026d3',
    text: '#701a75',
  },
  emotions: {
    emoji: '😊',
    label: 'Feeling Story',
    bgFrom: '#fef9c3',
    bgTo: '#fde68a',
    accent: '#f59e0b',
    text: '#78350f',
  },
  routine: {
    emoji: '⏰',
    label: 'Routine Story',
    bgFrom: '#e0e7ff',
    bgTo: '#c7d2fe',
    accent: '#6366f1',
    text: '#312e81',
  },
  sports: {
    emoji: '⚽',
    label: 'Sport Story',
    bgFrom: '#dcfce7',
    bgTo: '#bbf7d0',
    accent: '#16a34a',
    text: '#14532d',
  },
  friends: {
    emoji: '🤝',
    label: 'Friend Story',
    bgFrom: '#fce7f3',
    bgTo: '#fbcfe8',
    accent: '#ec4899',
    text: '#831843',
  },
  jobs: {
    emoji: '👷',
    label: 'Job Story',
    bgFrom: '#ffedd5',
    bgTo: '#fdba74',
    accent: '#ea580c',
    text: '#7c2d12',
  },
  time: {
    emoji: '🕐',
    label: 'Time Story',
    bgFrom: '#ede9fe',
    bgTo: '#ddd6fe',
    accent: '#7c3aed',
    text: '#4c1d95',
  },
  art: {
    emoji: '🎭',
    label: 'Art Story',
    bgFrom: '#fae8ff',
    bgTo: '#f5d0fe',
    accent: '#a21caf',
    text: '#581c87',
  },
};

const DEFAULT_THEME_PLACEHOLDER_STYLE: ThemePlaceholderStyle = {
  emoji: '📖',
  label: 'Story Time',
  bgFrom: '#fef3c7',
  bgTo: '#fde68a',
  accent: '#f59e0b',
  text: '#78350f',
};

function getThemePlaceholderStyle(theme: string): ThemePlaceholderStyle {
  const lower = theme.toLowerCase().trim();
  return THEME_PLACEHOLDER_STYLES[lower] ?? DEFAULT_THEME_PLACEHOLDER_STYLE;
}

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
  return getThemePlaceholderStyle(theme).emoji;
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
  bgColor?: string,
): string {
  const style = getThemePlaceholderStyle(theme);
  const emoji = style.emoji;
  const pageLabel = `Page ${pageIndex + 1}`;
  const fillFrom = bgColor ?? style.bgFrom;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="${fillFrom}"/>
        <stop offset="100%" stop-color="${style.bgTo}"/>
      </linearGradient>
    </defs>
    <rect width="400" height="240" rx="20" fill="url(#bg)"/>
    <circle cx="74" cy="58" r="42" fill="${style.accent}" opacity="0.16"/>
    <circle cx="336" cy="184" r="54" fill="${style.accent}" opacity="0.12"/>
    <rect x="36" y="168" width="140" height="32" rx="16" fill="#ffffff" opacity="0.8"/>
    <text x="200" y="98" font-size="64" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
    <text x="106" y="189" font-size="14" font-family="system-ui,sans-serif" text-anchor="middle" fill="${style.text}" font-weight="700">${escapeXml(style.label)}</text>
    <text x="290" y="189" font-size="14" font-family="system-ui,sans-serif" text-anchor="middle" fill="${style.text}" font-weight="600">${pageLabel}</text>
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
