/**
 * Centralized word → emoji mapping for all vocabulary words.
 * Used by FlashCard, ListenAndTap, MemoryGame, WordBuilder, SpeakIt activities.
 */
const WORD_EMOJI_MAP: Record<string, string> = {
  // Animals
  Dog: '🐶',
  Cat: '🐱',
  Fish: '🐟',
  Bird: '🐦',
  Rabbit: '🐰',
  Cow: '🐮',
  Horse: '🐴',
  Sheep: '🐑',
  Pig: '🐷',
  Chicken: '🐔',
  Lion: '🦁',
  Bear: '🐻',
  Elephant: '🐘',
  Monkey: '🐵',
  Tiger: '🐯',
  Whale: '🐋',
  Shark: '🦈',
  Dolphin: '🐬',
  Octopus: '🐙',
  Turtle: '🐢',
  Frog: '🐸',
  Butterfly: '🦋',
  Penguin: '🐧',

  // Colors
  Red: '🔴',
  Blue: '🔵',
  Yellow: '🟡',
  Green: '🟢',
  Orange: '🟠',
  Purple: '🟣',
  Pink: '💗',
  Brown: '🟤',
  Black: '⚫',
  White: '⚪',

  // Numbers
  One: '1️⃣',
  Two: '2️⃣',
  Three: '3️⃣',
  Four: '4️⃣',
  Five: '5️⃣',
  Six: '6️⃣',
  Seven: '7️⃣',
  Eight: '8️⃣',
  Nine: '9️⃣',
  Ten: '🔟',
  Eleven: '1️⃣1️⃣',
  Twelve: '1️⃣2️⃣',
  Thirteen: '1️⃣3️⃣',
  Fourteen: '1️⃣4️⃣',
  Fifteen: '1️⃣5️⃣',
  Twenty: '2️⃣0️⃣',

  // Body
  Eye: '👁️',
  Nose: '👃',
  Mouth: '👄',
  Ear: '👂',
  Hair: '💇',
  Hand: '✋',
  Foot: '🦶',
  Arm: '💪',
  Leg: '🦵',
  Head: '🗣️',

  // Family & Greetings
  Mother: '👩',
  Father: '👨',
  Sister: '👧',
  Brother: '👦',
  Baby: '👶',
  Mom: '👩',
  Dad: '👨',
  Family: '👨‍👩‍👧‍👦',
  Hello: '👋',
  Goodbye: '🤚',
  Please: '🙏',
  Sorry: '😔',
  Fine: '🙂',

  // Food & Drinks
  Apple: '🍎',
  Banana: '🍌',
  Grape: '🍇',
  Strawberry: '🍓',
  Carrot: '🥕',
  Tomato: '🍅',
  Potato: '🥔',
  Onion: '🧅',
  Pepper: '🌶️',
  Water: '💧',
  Milk: '🥛',
  Juice: '🧃',
  Tea: '🍵',
  Coffee: '☕',
  Egg: '🥚',
  Bread: '🍞',
  Pizza: '🍕',
  Ice: '🧊',

  // Emotions
  Happy: '😊',
  Sad: '😢',
  Angry: '😠',
  Scared: '😨',
  Excited: '🤩',

  // Home & School
  House: '🏠',
  Room: '🏠',
  Kitchen: '🍳',
  Garden: '🌿',
  Door: '🚪',
  Window: '🪟',
  School: '🏫',
  Teacher: '👩‍🏫',
  Book: '📖',
  Pen: '🖊️',
  Desk: '📐',
  Board: '📋',
  Boy: '👦',
  Girl: '👧',

  // Weather & Nature
  Sunny: '☀️',
  Rainy: '🌧️',
  Cloudy: '☁️',
  Windy: '💨',
  Snowy: '❄️',
  Spring: '🌸',
  Summer: '☀️',
  Autumn: '🍂',
  Winter: '❄️',
  Tree: '🌳',
  Flower: '🌸',
  Leaf: '🍃',
  Grass: '🌿',
  Sun: '☀️',
  Moon: '🌙',
  Star: '⭐',
  Rain: '🌧️',
  Snow: '❄️',
  Fire: '🔥',

  // Clothes
  Shirt: '👕',
  Jacket: '🧥',
  Hat: '🎩',
  Scarf: '🧣',
  Sweater: '🧶',
  Pants: '👖',
  Shoes: '👟',
  Socks: '🧦',
  Dress: '👗',
  Skirt: '👗',

  // City & Directions
  Park: '🏞️',
  Shop: '🏪',
  Hospital: '🏥',
  Restaurant: '🍝',
  Library: '📚',
  Left: '⬅️',
  Right: '➡️',
  Straight: '⬆️',
  Turn: '↩️',
  Money: '💰',

  // Time
  Monday: '📅',
  Tuesday: '📅',
  Wednesday: '📅',
  Thursday: '📅',
  Friday: '📅',
  Saturday: '📅',
  Sunday: '📅',
  January: '📅',
  February: '📅',
  March: '📅',
  April: '📅',
  May: '📅',
  June: '📅',
  Morning: '🌅',
  Evening: '🌆',
  Night: '🌙',

  // Jobs
  Doctor: '👨‍⚕️',
  Pilot: '✈️',
  Firefighter: '🚒',
  Police: '👮',
  Chef: '👨‍🍳',
  Farmer: '🧑‍🌾',
  Nurse: '👩‍⚕️',
  Artist: '🎨',
  Singer: '🎤',

  // Space
  Planet: '🪐',
  Earth: '🌍',
  Mars: '🔴',
  Jupiter: '🪐',
  Saturn: '🪐',
  Rocket: '🚀',
  Astronaut: '🧑‍🚀',

  // Technology
  Computer: '💻',
  Phone: '📱',
  Tablet: '📱',
  Robot: '🤖',
  Camera: '📷',
  Video: '🎬',
  Clock: '⏰',

  // World Tour
  Turkey: '🇹🇷',
  England: '🇬🇧',
  America: '🇺🇸',
  Japan: '🇯🇵',
  France: '🇫🇷',
  Airport: '✈️',
  Ticket: '🎫',
  Passport: '🛂',
  Hotel: '🏨',
  Suitcase: '🧳',
  Beautiful: '✨',

  // Misc objects
  Car: '🚗',
  Ball: '⚽',
  Heart: '❤️',
  Music: '🎵',
};

/**
 * Get an emoji for a word (case-insensitive).
 * Falls back to '📝' if no mapping exists.
 */
export function getWordEmoji(word: string): string {
  // Try exact match first
  const direct = WORD_EMOJI_MAP[word];
  if (direct) return direct;

  // Try Title Case
  const titleCase = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  return WORD_EMOJI_MAP[titleCase] ?? '📝';
}
