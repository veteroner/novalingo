import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { storyBank } from '../storyBank';
import { getStoryCover, getStoryWorldId, STORY_THEME_COVERS } from '../storyCovers';

describe('story library cover media', () => {
  it('gives every authored theme a real local illustration and every story an existing cover', () => {
    for (const story of storyBank) {
      expect(STORY_THEME_COVERS[story.theme], story.theme).toBeDefined();
      const cover = getStoryCover(story);
      const file = resolve(process.cwd(), `public${cover.src}`);
      expect(existsSync(file), `${story.id}: ${cover.src}`).toBe(true);
      expect(cover.src).toMatch(/\.webp$/);
      if (cover.tile != null) expect(cover.tile).toBeGreaterThanOrEqual(0);
      if (cover.tile != null) expect(cover.tile).toBeLessThan(6);
    }
  });
  it('keeps six shared atlases together below 2.5 MiB', () => {
    const sources = new Set(Object.values(STORY_THEME_COVERS).map((cover) => cover.src));
    expect(sources.size).toBe(6);
    const bytes = [...sources].reduce(
      (sum, src) => sum + statSync(resolve(process.cwd(), `public${src}`)).size,
      0,
    );
    expect(bytes).toBeLessThan(2.5 * 1024 * 1024);
  });
  it('shows ocean and forest scenes for the specially matched stories', () => {
    expect(getStoryCover(storyBank.find((story) => story.id === 'story-w1-ocean')!)).toEqual({
      src: '/story/covers-v1/early-learning.webp',
      tile: 1,
    });
    expect(
      getStoryCover(storyBank.find((story) => story.id === 'story-w3-forest-adventure')!),
    ).toEqual({ src: '/story/covers-v1/creative-world.webp', tile: 5 });
  });
  it('keeps the existing specially illustrated happy Nova story cover', () => {
    const happy = storyBank.find((story) => story.id === 'story-w2-nova-is-happy')!;
    expect(getStoryCover(happy)).toEqual({ src: '/story/nova-v2/happy-1.webp' });
  });
  it.each([
    ['story-w1-farm-visit', 'w1'],
    ['story-w10-doctor-visit', 'w10'],
    ['story-w11-forest', 'w11'],
    ['story-w12-clock', 'w12'],
  ])('parses the complete world ID in %s', (id, world) => {
    expect(getStoryWorldId(id)).toBe(world);
  });
});
