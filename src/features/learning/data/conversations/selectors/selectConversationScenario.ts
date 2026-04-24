import { ALL_CONVERSATION_SCENARIOS } from '../registry/scenarioIndex';
import type {
  ConversationScenario,
  SelectConversationScenarioParams,
} from '../types/conversationScenario';

// Maps a worldId to its corresponding conversation phase
const WORLD_TO_PHASE: Record<string, ConversationScenario['phase']> = {
  w1: 'phase1',
  w2: 'phase2',
  w3: 'phase3',
  w4: 'phase4',
  w5: 'phase5',
  w6: 'phase5', // intentional: W6 reuses phase5 (advanced content)
  w7: 'phase5',
  w8: 'phase5',
  w9: 'phase5',
  w10: 'phase5',
  w11: 'phase5',
  w12: 'phase5',
};

const WORLD_TO_THEME: Record<string, string> = {
  w7: 'travel',
  w8: 'food',
  w9: 'art',
  w10: 'health',
  w11: 'nature',
  w12: 'time',
};

export { WORLD_TO_PHASE };
const THEME_LEXICONS: Record<string, Set<string>> = {
  animals: new Set(['dog', 'cat', 'fish', 'bird', 'rabbit', 'lion', 'elephant', 'monkey']),
  food: new Set(['apple', 'banana', 'orange', 'bread', 'cake', 'milk', 'juice', 'water']),
  colors: new Set(['red', 'blue', 'green', 'yellow', 'pink', 'purple']),
  toys: new Set(['ball', 'doll', 'car', 'robot', 'kite', 'puzzle']),
  emotions: new Set(['happy', 'sad', 'excited', 'sleepy']),
  routine: new Set(['bag', 'book', 'shoes', 'bed', 'hat', 'water']),
  travel: new Set([
    'airport',
    'passport',
    'ticket',
    'gate',
    'luggage',
    'hotel',
    'beach',
    'road',
    'camping',
  ]),
  art: new Set([
    'paintbrush',
    'canvas',
    'palette',
    'music',
    'guitar',
    'piano',
    'museum',
    'painting',
  ]),
  nature: new Set(['recycle', 'paper', 'plastic', 'tree', 'river', 'forest', 'rainbow', 'cloud']),
  health: new Set([
    'doctor',
    'nurse',
    'medicine',
    'body',
    'health',
    'helmet',
    'exercise',
    'water',
    'rest',
  ]),
  time: new Set([
    'calendar',
    'month',
    'clock',
    'hour',
    'minute',
    'schedule',
    'today',
    'tomorrow',
    'yesterday',
    'hundred',
  ]),
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
  const preferredThemeBonus =
    params.preferredTheme && scenario.theme === params.preferredTheme ? 5 : 0;
  const ageBandBonus = params.ageBand && scenario.ageBand === params.ageBand ? 3 : 0;
  const difficultyBonus = params.difficulty && scenario.difficulty === params.difficulty ? 2 : 0;
  const priorityBonus = scenario.selection.priority / 100;

  // ── Repetition penalty: recently completed scenarios score lower ──
  let repetitionPenalty = 0;
  if (params.recentlyCompletedIds) {
    const recencyIndex = params.recentlyCompletedIds.indexOf(scenario.id);
    if (recencyIndex !== -1) {
      // Most recent = -15, second most recent = -10, third = -5
      repetitionPenalty = Math.max(5, 15 - recencyIndex * 5);
    }
  }

  // ── Novelty bonus: never-completed scenarios get a boost ──
  const noveltyBonus =
    params.recentlyCompletedIds && !params.recentlyCompletedIds.includes(scenario.id) ? 4 : 0;

  // ── Difficulty adaptation based on success rate ──
  let difficultyAdaptBonus = 0;
  if (params.averageSuccessRate !== undefined) {
    const rate = params.averageSuccessRate;
    if (rate >= 0.8 && scenario.difficulty === 'stretch') difficultyAdaptBonus = 6;
    else if (rate >= 0.5 && rate < 0.8 && scenario.difficulty === 'core') difficultyAdaptBonus = 6;
    else if (rate < 0.5 && scenario.difficulty === 'starter') difficultyAdaptBonus = 6;
  }

  // ── Pattern re-drilling: boost scenarios that target weak patterns ──
  let patternBonus = 0;
  if (params.weakPatterns && params.weakPatterns.length > 0) {
    const weakSet = new Set(params.weakPatterns.map((p) => p.toLowerCase()));
    const matched = scenario.targetPatterns.filter((p) => weakSet.has(p.toLowerCase())).length;
    patternBonus = matched * 4;
  }

  // ── Tag preference bonus ──
  let tagPreferenceBonus = 0;
  if (params.preferredTags && params.preferredTags.length > 0) {
    const prefSet = new Set(params.preferredTags.map((t) => t.toLowerCase()));
    const matched = scenario.tags.filter((t) => prefSet.has(t.toLowerCase())).length;
    tagPreferenceBonus = matched * 2;
  }

  const worldTagBonus = params.worldId && scenario.tags.includes(params.worldId) ? 8 : 0;

  return (
    overlapScore * 10 +
    preferredThemeBonus +
    ageBandBonus +
    difficultyBonus +
    priorityBonus +
    noveltyBonus +
    difficultyAdaptBonus +
    patternBonus +
    worldTagBonus +
    tagPreferenceBonus -
    repetitionPenalty
  );
}

export function selectConversationScenario(
  params: SelectConversationScenarioParams,
): ConversationScenario {
  const fallbackScenario = ALL_CONVERSATION_SCENARIOS[0];
  if (!fallbackScenario) {
    throw new Error('No conversation scenarios registered');
  }

  // Resolve target phase: explicit phase > worldId mapping > none
  const targetPhase: ConversationScenario['phase'] | undefined =
    params.phase ?? (params.worldId ? (WORLD_TO_PHASE[params.worldId] ?? undefined) : undefined);

  const baseCandidates = params.candidates ?? ALL_CONVERSATION_SCENARIOS;

  // Pre-filter by phase when available — creates a focused candidate pool
  const phaseCandidates = targetPhase
    ? baseCandidates.filter((s) => s.phase === targetPhase)
    : baseCandidates;

  // Fall back to full pool if phase yields nothing
  const candidates = phaseCandidates.length > 0 ? phaseCandidates : baseCandidates;
  const worldTaggedCandidates = params.worldId
    ? candidates.filter((scenario) => scenario.tags.includes(params.worldId!))
    : [];
  const scopedCandidates = worldTaggedCandidates.length > 0 ? worldTaggedCandidates : candidates;

  const excludeSet = new Set(params.excludeScenarioIds ?? []);
  const worldTheme = params.worldId ? WORLD_TO_THEME[params.worldId] : undefined;
  const detectedTheme = params.preferredTheme ?? worldTheme ?? detectTheme(params.words);

  const filtered = scopedCandidates.filter((scenario) => {
    if (excludeSet.has(scenario.id)) return false;
    if (params.ageBand && scenario.ageBand !== params.ageBand) return false;
    // Only hard-filter difficulty when no success-rate-based adaptation is active
    if (
      params.difficulty &&
      params.averageSuccessRate === undefined &&
      scenario.difficulty !== params.difficulty
    )
      return false;
    if (detectedTheme && scenario.theme !== detectedTheme) return false;
    return true;
  });

  const pool =
    filtered.length > 0
      ? filtered
      : scopedCandidates.filter((scenario) => !excludeSet.has(scenario.id));
  const sorted = [...pool].sort(
    (left, right) => scoreScenario(right, params) - scoreScenario(left, params),
  );

  return sorted[0] ?? fallbackScenario;
}
