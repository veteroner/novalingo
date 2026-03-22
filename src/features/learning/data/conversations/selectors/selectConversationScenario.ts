import { PHASE1_CONVERSATION_SCENARIOS } from '../registry/scenarioIndex';
import type {
    ConversationScenario,
    SelectConversationScenarioParams,
} from '../types/conversationScenario';

const THEME_LEXICONS: Record<string, Set<string>> = {
  animals: new Set(['dog', 'cat', 'fish', 'bird', 'rabbit', 'lion', 'elephant', 'monkey']),
  food: new Set(['apple', 'banana', 'orange', 'bread', 'cake', 'milk', 'juice', 'water']),
  colors: new Set(['red', 'blue', 'green', 'yellow', 'pink', 'purple']),
  toys: new Set(['ball', 'doll', 'car', 'robot', 'kite', 'puzzle']),
  emotions: new Set(['happy', 'sad', 'excited', 'sleepy']),
  routine: new Set(['bag', 'book', 'shoes', 'bed', 'hat', 'water']),
};

function getVocabularyOverlap(words: string[], targetWords: string[]): number {
  const wordSet = new Set(words.map((word) => word.toLowerCase()));
  return targetWords.filter((word) => wordSet.has(word.toLowerCase())).length;
}

function detectTheme(words: string[]): string | undefined {
  const normalized = words.map((word) => word.toLowerCase());
  let bestTheme: string | undefined;
  let bestScore = 0;

  for (const [theme, lexicon] of Object.entries(THEME_LEXICONS)) {
    const score = normalized.filter((word) => lexicon.has(word)).length;
    if (score > bestScore) {
      bestScore = score;
      bestTheme = theme;
    }
  }

  return bestTheme;
}

function scoreScenario(
  scenario: ConversationScenario,
  params: SelectConversationScenarioParams,
): number {
  const words = params.words.map((word) => word.toLowerCase());
  const overlapScore = getVocabularyOverlap(words, scenario.targetWords);
  const preferredThemeBonus = params.preferredTheme && scenario.theme === params.preferredTheme ? 5 : 0;
  const ageBandBonus = params.ageBand && scenario.ageBand === params.ageBand ? 3 : 0;
  const difficultyBonus = params.difficulty && scenario.difficulty === params.difficulty ? 2 : 0;
  const priorityBonus = scenario.selection.priority / 100;

  return overlapScore * 10 + preferredThemeBonus + ageBandBonus + difficultyBonus + priorityBonus;
}

export function selectConversationScenario(
  params: SelectConversationScenarioParams,
): ConversationScenario {
  const fallbackScenario = PHASE1_CONVERSATION_SCENARIOS[0];
  if (!fallbackScenario) {
    throw new Error('No conversation scenarios registered');
  }

  const candidates = params.candidates ?? PHASE1_CONVERSATION_SCENARIOS;
  const excludeSet = new Set(params.excludeScenarioIds ?? []);
  const detectedTheme = params.preferredTheme ?? detectTheme(params.words);

  const filtered = candidates.filter((scenario) => {
    if (excludeSet.has(scenario.id)) return false;
    if (params.ageBand && scenario.ageBand !== params.ageBand) return false;
    if (params.difficulty && scenario.difficulty !== params.difficulty) return false;
    if (detectedTheme && scenario.theme !== detectedTheme) return false;
    return true;
  });

  const pool = filtered.length > 0 ? filtered : candidates.filter((scenario) => !excludeSet.has(scenario.id));
  const sorted = [...pool].sort((left, right) => scoreScenario(right, params) - scoreScenario(left, params));

  return sorted[0] ?? fallbackScenario;
}
