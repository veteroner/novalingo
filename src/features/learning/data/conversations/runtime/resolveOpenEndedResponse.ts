import type { ConversationOpenEndedConfig } from '../types/conversationScenario';

export interface OpenEndedResolution {
  slotKey: string;
  slotValue: string;
  nextNodeId: string;
  marksPattern: string[];
  markedTargetWords: string[];
}

interface ResolveOpenEndedResponseParams {
  rawText: string;
  config: ConversationOpenEndedConfig;
}

const ANIMAL_WORDS = new Set([
  'alligator',
  'bear',
  'bird',
  'bunny',
  'cat',
  'cheetah',
  'cow',
  'crocodile',
  'deer',
  'dog',
  'dolphin',
  'duck',
  'eagle',
  'elephant',
  'fish',
  'fox',
  'frog',
  'giraffe',
  'goat',
  'hamster',
  'horse',
  'kangaroo',
  'kitten',
  'lion',
  'lizard',
  'monkey',
  'owl',
  'panda',
  'parrot',
  'penguin',
  'pet',
  'pig',
  'pony',
  'puppy',
  'rabbit',
  'shark',
  'sheep',
  'snake',
  'spider',
  'tiger',
  'turtle',
  'whale',
  'wolf',
  'zebra',
]);

const DESCRIPTOR_WORDS = new Set([
  'amazing',
  'big',
  'brave',
  'cute',
  'fast',
  'friendly',
  'fun',
  'funny',
  'gentle',
  'happy',
  'interesting',
  'kind',
  'long',
  'nice',
  'playful',
  'scary',
  'small',
  'smart',
  'soft',
  'special',
  'strong',
  'sweet',
]);

const COLOR_WORDS = new Set([
  'black',
  'blue',
  'brown',
  'green',
  'orange',
  'pink',
  'purple',
  'red',
  'white',
  'yellow',
]);

const FOOD_WORDS = new Set([
  'apple',
  'banana',
  'cake',
  'fruit',
  'pie',
  'pizza',
  'salad',
  'sandwich',
  'soup',
]);

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripLeadingArticle(value: string): string {
  return value.replace(/^(a|an|the)\s+/, '').trim();
}

function singularizeAnimal(value: string): string {
  if (value.endsWith('ies') && value.length > 3) {
    return `${value.slice(0, -3)}y`;
  }
  if (value.endsWith('s') && !value.endsWith('ss') && value.length > 3) {
    return value.slice(0, -1);
  }
  return value;
}

function domainContains(domain: ConversationOpenEndedConfig['domain'], candidate: string): boolean {
  if (domain === 'free_text') return candidate.length >= 3;
  if (domain === 'animal') return ANIMAL_WORDS.has(candidate);
  if (domain === 'descriptor') return DESCRIPTOR_WORDS.has(candidate);
  if (domain === 'color') return COLOR_WORDS.has(candidate);
  if (domain === 'food') return FOOD_WORDS.has(candidate);
  return false;
}

function extractFavoriteThing(
  text: string,
  domain: ConversationOpenEndedConfig['domain'],
): string | null {
  const patterns = [/favorite (?:animal|thing|one) is (.+)$/, /i like (.+)$/, /i love (.+)$/];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const candidate = singularizeAnimal(stripLeadingArticle(match[1].trim().split(' ')[0] ?? ''));
      if (!candidate) continue;
      if (domainContains(domain, candidate)) {
        return candidate;
      }
    }
  }

  const tokens = text.split(' ').filter(Boolean);
  for (let index = tokens.length - 1; index >= 0; index -= 1) {
    const token = singularizeAnimal(stripLeadingArticle(tokens[index] ?? ''));
    if (!token) continue;
    if (domainContains(domain, token)) {
      return token;
    }
  }

  if (tokens.length === 1 && tokens[0]) {
    const candidate = singularizeAnimal(stripLeadingArticle(tokens[0]));
    if (domainContains(domain, candidate)) {
      return candidate;
    }
  }

  return null;
}

function extractChosenThing(
  text: string,
  domain: ConversationOpenEndedConfig['domain'],
): string | null {
  const patterns = [/i choose (.+)$/, /i pick (.+)$/, /i want (.+)$/];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match?.[1]) continue;
    const candidate = singularizeAnimal(stripLeadingArticle(match[1].trim().split(' ')[0] ?? ''));
    if (candidate && domainContains(domain, candidate)) {
      return candidate;
    }
  }

  return extractFavoriteThing(text, domain);
}

function extractBecauseReason(
  text: string,
  domain: ConversationOpenEndedConfig['domain'],
): string | null {
  const patterns = [
    /because it is (.+)$/,
    /because it's (.+)$/,
    /because (.+)$/,
    /it is (.+)$/,
    /it's (.+)$/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match?.[1]) continue;
    const words = match[1].trim().split(' ').filter(Boolean);
    for (let index = words.length - 1; index >= 0; index -= 1) {
      const candidate = words[index]?.trim();
      if (!candidate) continue;
      if (domainContains(domain, candidate)) {
        return candidate;
      }
    }
  }

  const tokens = text.split(' ').filter(Boolean);
  for (let index = tokens.length - 1; index >= 0; index -= 1) {
    const token = tokens[index]?.trim();
    if (!token) continue;
    if (domainContains(domain, token)) {
      return token;
    }
  }

  return null;
}

export function resolveOpenEndedResponse(
  params: ResolveOpenEndedResponseParams,
): OpenEndedResolution | null {
  const { config } = params;
  if (!config.enabled) return null;

  const normalized = normalizeText(params.rawText);
  if (!normalized) return null;

  const slotValue =
    config.strategy === 'favorite_thing'
      ? extractFavoriteThing(normalized, config.domain)
      : config.strategy === 'choose_thing'
        ? extractChosenThing(normalized, config.domain)
        : extractBecauseReason(normalized, config.domain);

  if (!slotValue) return null;

  return {
    slotKey: config.slotKey,
    slotValue,
    nextNodeId: config.nextNodeId,
    marksPattern: config.marksPattern ?? [],
    markedTargetWords: config.countCapturedValueAsTargetWord ? [slotValue] : [],
  };
}
