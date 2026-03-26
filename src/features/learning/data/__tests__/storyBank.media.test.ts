import { describe, expect, it } from 'vitest';
import { getRandomStory, selectStoryForWords, storyBank } from '../storyBank';

describe('storyBank media enrichment', () => {
  it('exports stories with resolved image and audio urls for every page', () => {
    for (const story of storyBank) {
      expect(story.data.pages.length).toBeGreaterThan(0);

      for (const page of story.data.pages) {
        expect(page.imageUrl).toBeTruthy();
        expect(page.audioUrl).toBeTruthy();
      }
    }
  });

  it('selects a themed story when lesson vocabulary overlaps authored highlights', () => {
    const story = selectStoryForWords(['dog', 'cat', 'bird'], 'animals');

    expect(story.theme).toBe('animals');
    expect(story.data.pages.length).toBeGreaterThan(0);
    expect(story.data.pages.some((page) => page.highlightWords.includes('dog'))).toBe(true);
  });

  it('returns a media-complete fallback story when asked for an unknown theme', () => {
    const story = getRandomStory('unknown-theme');

    expect(story.data.pages.length).toBeGreaterThan(0);
    expect(story.data.pages.every((page) => page.imageUrl.length > 0)).toBe(true);
    expect(story.data.pages.every((page) => page.audioUrl.length > 0)).toBe(true);
  });
});
