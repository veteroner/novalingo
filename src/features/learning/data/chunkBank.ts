/**
 * Chunk Bank — Target sentence patterns for NovaLingo
 *
 * A "chunk" is a reusable sentence pattern that children practice across lessons.
 * Using chunks instead of isolated vocabulary builds productive language ability.
 *
 * Structure: Each chunk group belongs to a difficulty band and maps to worlds/units.
 * The activityGenerator and sentence-builder can reference these to generate
 * pattern-based exercises.
 */

export interface Chunk {
  /** The pattern with ___ as the slot for vocabulary */
  pattern: string;
  /** Turkish translation of the pattern */
  patternTr: string;
  /** Example sentences using this pattern */
  examples: string[];
  /** Which worlds primarily use this chunk */
  worlds: string[];
  /** Difficulty band */
  band: 'starter' | 'core' | 'stretch';
  /** Communicative function of this pattern */
  function:
    | 'identify'
    | 'describe'
    | 'request'
    | 'express_feeling'
    | 'ask'
    | 'compare'
    | 'narrate'
    | 'sequence'
    | 'polite';
}

// ===== STARTER CHUNKS (World 1) =====
// First patterns a child encounters. Single-slot, present tense, short.

export const STARTER_CHUNKS: Chunk[] = [
  // --- Identifying ---
  {
    pattern: 'It is a ___',
    patternTr: 'Bu bir ___',
    examples: ['It is a dog.', 'It is a cat.', 'It is a red bird.'],
    worlds: ['w1'],
    band: 'starter',
    function: 'identify',
  },
  {
    pattern: 'I see a ___',
    patternTr: 'Bir ___ görüyorum',
    examples: ['I see a lion.', 'I see a blue fish.', 'I see a rainbow.'],
    worlds: ['w1'],
    band: 'starter',
    function: 'identify',
  },
  {
    pattern: 'This is my ___',
    patternTr: 'Bu benim ___',
    examples: ['This is my nose.', 'This is my hand.', 'This is my toy.'],
    worlds: ['w1'],
    band: 'starter',
    function: 'identify',
  },

  // --- Describing ---
  {
    pattern: 'The ___ is ___',
    patternTr: '___ ___dır',
    examples: ['The elephant is big.', 'The cat is small.', 'The apple is red.'],
    worlds: ['w1'],
    band: 'starter',
    function: 'describe',
  },
  {
    pattern: 'It is ___',
    patternTr: 'Bu ___',
    examples: ['It is red.', 'It is big.', 'It is yummy.'],
    worlds: ['w1'],
    band: 'starter',
    function: 'describe',
  },

  // --- Expressing feelings/preferences ---
  {
    pattern: 'I like ___',
    patternTr: '___ severim',
    examples: ['I like dogs.', 'I like blue.', 'I like apples.'],
    worlds: ['w1'],
    band: 'starter',
    function: 'express_feeling',
  },
  {
    pattern: 'I want ___',
    patternTr: '___ istiyorum',
    examples: ['I want water.', 'I want a ball.', 'I want the red one.'],
    worlds: ['w1', 'w2'],
    band: 'starter',
    function: 'request',
  },
  {
    pattern: 'I have a ___',
    patternTr: 'Bir ___ım var',
    examples: ['I have a dog.', 'I have a ball.', 'I have a red car.'],
    worlds: ['w1'],
    band: 'starter',
    function: 'identify',
  },

  // --- Counting ---
  {
    pattern: 'I have ___ ___',
    patternTr: '___ tane ___ım var',
    examples: ['I have two dogs.', 'I have five apples.', 'I have three toys.'],
    worlds: ['w1'],
    band: 'starter',
    function: 'identify',
  },

  // --- Body & actions ---
  {
    pattern: 'I can ___',
    patternTr: '___ yapabilirim',
    examples: ['I can jump.', 'I can clap.', 'I can run.'],
    worlds: ['w1', 'w2'],
    band: 'starter',
    function: 'describe',
  },
  {
    pattern: 'Touch your ___',
    patternTr: '___ına dokun',
    examples: ['Touch your nose.', 'Touch your head.', 'Touch your ear.'],
    worlds: ['w1'],
    band: 'starter',
    function: 'sequence',
  },

  // --- Food ---
  {
    pattern: 'I want ___ please',
    patternTr: '___ istiyorum lütfen',
    examples: ['I want water please.', 'I want an apple please.'],
    worlds: ['w1'],
    band: 'starter',
    function: 'polite',
  },
  {
    pattern: 'I am ___',
    patternTr: 'Ben ___ım',
    examples: ['I am hungry.', 'I am thirsty.', 'I am happy.'],
    worlds: ['w1', 'w2'],
    band: 'starter',
    function: 'express_feeling',
  },
];

// ===== CORE CHUNKS (World 2-3) =====
// Two-slot patterns, questions, negation, past intro.

export const CORE_CHUNKS: Chunk[] = [
  // --- Questions ---
  {
    pattern: 'Do you like ___?',
    patternTr: '___ sever misin?',
    examples: ['Do you like cats?', 'Do you like ice cream?'],
    worlds: ['w2'],
    band: 'core',
    function: 'ask',
  },
  {
    pattern: 'Where is the ___?',
    patternTr: '___ nerede?',
    examples: ['Where is the dog?', 'Where is the school?'],
    worlds: ['w2', 'w4'],
    band: 'core',
    function: 'ask',
  },
  {
    pattern: 'What is this?',
    patternTr: 'Bu nedir?',
    examples: ['What is this? It is a ball.'],
    worlds: ['w2'],
    band: 'core',
    function: 'ask',
  },
  {
    pattern: 'Can I have ___?',
    patternTr: '___ alabilir miyim?',
    examples: ['Can I have water?', 'Can I have the blue one?'],
    worlds: ['w2', 'w4'],
    band: 'core',
    function: 'polite',
  },

  // --- Describing with more detail ---
  {
    pattern: 'There is a ___ in the ___',
    patternTr: '___da bir ___ var',
    examples: ['There is a cat in the garden.', 'There is a book on the table.'],
    worlds: ['w2'],
    band: 'core',
    function: 'describe',
  },
  {
    pattern: 'The ___ is ___ than the ___',
    patternTr: '___ ___den daha ___',
    examples: ['The elephant is bigger than the cat.', 'The sun is brighter than the moon.'],
    worlds: ['w2'],
    band: 'core',
    function: 'compare',
  },

  // --- Negation ---
  {
    pattern: "I don't like ___",
    patternTr: '___ sevmiyorum',
    examples: ["I don't like spiders.", "I don't like rain."],
    worlds: ['w2'],
    band: 'core',
    function: 'express_feeling',
  },
  {
    pattern: "I can't ___",
    patternTr: '___ yapamam',
    examples: ["I can't fly.", "I can't swim."],
    worlds: ['w2'],
    band: 'core',
    function: 'describe',
  },

  // --- Routines & sequences ---
  {
    pattern: 'I ___ every day',
    patternTr: 'Her gün ___ yaparım',
    examples: ['I eat breakfast every day.', 'I brush my teeth every day.'],
    worlds: ['w2'],
    band: 'core',
    function: 'narrate',
  },
  {
    pattern: 'First ___, then ___',
    patternTr: 'Önce ___, sonra ___',
    examples: ['First wash, then eat.', 'First read, then sleep.'],
    worlds: ['w2', 'w3'],
    band: 'core',
    function: 'sequence',
  },

  // --- Story language ---
  {
    pattern: 'One day, ___',
    patternTr: 'Bir gün, ___',
    examples: ['One day, the cat found a fish.', 'One day, it started to rain.'],
    worlds: ['w3'],
    band: 'core',
    function: 'narrate',
  },
  {
    pattern: '___ because ___',
    patternTr: '___ çünkü ___',
    examples: ['He is sad because he lost his toy.', 'She is happy because it is sunny.'],
    worlds: ['w3'],
    band: 'core',
    function: 'narrate',
  },
  {
    pattern: '___ wants to ___',
    patternTr: '___ ___ yapmak istiyor',
    examples: ['The cat wants to play.', 'Nova wants to help.'],
    worlds: ['w3'],
    band: 'core',
    function: 'narrate',
  },
];

// ===== STRETCH CHUNKS (World 4-6) =====
// Functional dialogues, multi-clause, conditional and past references.

export const STRETCH_CHUNKS: Chunk[] = [
  // --- City & directions ---
  {
    pattern: 'Excuse me, where is ___?',
    patternTr: 'Affedersiniz, ___ nerede?',
    examples: ['Excuse me, where is the park?', 'Excuse me, where is the school?'],
    worlds: ['w4'],
    band: 'stretch',
    function: 'polite',
  },
  {
    pattern: 'Go ___, then turn ___',
    patternTr: '___ git, sonra ___a dön',
    examples: ['Go straight, then turn left.', 'Go past the park, then turn right.'],
    worlds: ['w4'],
    band: 'stretch',
    function: 'sequence',
  },
  {
    pattern: 'Can you help me ___?',
    patternTr: 'Bana ___ yardım eder misiniz?',
    examples: ['Can you help me find the library?', 'Can you help me carry this?'],
    worlds: ['w4'],
    band: 'stretch',
    function: 'polite',
  },
  {
    pattern: 'How much is ___?',
    patternTr: '___ ne kadar?',
    examples: ['How much is the apple?', 'How much is this toy?'],
    worlds: ['w4'],
    band: 'stretch',
    function: 'ask',
  },

  // --- Science language ---
  {
    pattern: 'I think ___ because ___',
    patternTr: 'Bence ___ çünkü ___',
    examples: ['I think it will rain because it is cloudy.'],
    worlds: ['w5'],
    band: 'stretch',
    function: 'narrate',
  },
  {
    pattern: 'It looks like ___',
    patternTr: '___ gibi görünüyor',
    examples: ['It looks like a star.', 'It looks like water.'],
    worlds: ['w5'],
    band: 'stretch',
    function: 'describe',
  },

  // --- Adventure / problem solving ---
  {
    pattern: 'We need to ___ so that ___',
    patternTr: '___ yapmamız gerekiyor ki ___',
    examples: ['We need to find the key so that we can open the door.'],
    worlds: ['w6'],
    band: 'stretch',
    function: 'sequence',
  },
  {
    pattern: 'If we ___, then ___',
    patternTr: 'Eğer ___ yaparsak, ___',
    examples: ['If we climb the mountain, then we can see the city.'],
    worlds: ['w6'],
    band: 'stretch',
    function: 'narrate',
  },
];

// ===== ALL CHUNKS =====
export const ALL_CHUNKS: Chunk[] = [...STARTER_CHUNKS, ...CORE_CHUNKS, ...STRETCH_CHUNKS];

/**
 * Find chunks matching a given band or world.
 */
export function getChunksByWorld(worldId: string): Chunk[] {
  return ALL_CHUNKS.filter((c) => c.worlds.includes(worldId));
}

export function getChunksByBand(band: Chunk['band']): Chunk[] {
  return ALL_CHUNKS.filter((c) => c.band === band);
}

export function getChunksByFunction(fn: Chunk['function']): Chunk[] {
  return ALL_CHUNKS.filter((c) => c.function === fn);
}
