import { describe, expect, it } from 'vitest';

import { getVocab } from '../activityGenerator';

describe('activityGenerator synthetic vocab fallback copy', () => {
  it('uses phrase-oriented fallback lines for multi-word vocabulary', () => {
    const vocab = getVocab('movie time');

    expect(vocab.sentence).toBe("Let's say movie time together.");
    expect(vocab.sentenceTr).toBe('"Movie Time" ifadesini birlikte söyleyelim.');
    expect(vocab.altSentences).toEqual([
      {
        en: 'Try saying movie time.',
        tr: 'Hadi "Movie Time" diyelim.',
      },
    ]);
  });

  it('uses word-oriented fallback lines for single-word vocabulary', () => {
    const vocab = getVocab('glimmerbug');

    expect(vocab.sentence).toBe("Let's learn the word glimmerbug.");
    expect(vocab.sentenceTr).toBe('Glimmerbug kelimesini öğrenelim.');
    expect(vocab.altSentences).toEqual([
      {
        en: 'Can you say glimmerbug?',
        tr: 'Glimmerbug diyebilir misin?',
      },
    ]);
  });
});
