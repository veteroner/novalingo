import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { storyBank } from '../storyBank';
import illustrations from '../storyIllustrations.json';

// The catalog must not silently fall back to a text card when a new story is added.
describe('complete story interior catalog', () => {
  it('ships a separate real scene for every page, with no placeholder/JPEG gaps', () => {
    expect(storyBank).toHaveLength(104);
    const scenes = storyBank.flatMap((story) => story.data.pages.map((page) => page.imageUrl));
    expect(scenes).toHaveLength(412);
    expect(new Set(scenes).size).toBe(scenes.length);
    let bytes = 0;
    for (const src of scenes) {
      expect(src).toMatch(/^\/story\/(?:interiors-v3|nova-v2|farm-v2|dance-v2)\/.+\.webp$/);
      const file = resolve(process.cwd(), `public${src}`);
      const data = readFileSync(file);
      expect(data.toString('ascii', 0, 4)).toBe('RIFF');
      expect(data.toString('ascii', 8, 12)).toBe('WEBP');
      bytes += statSync(file).size;
    }
    expect(bytes).toBeLessThan(45 * 1024 * 1024);
  });

  it('maps every new atlas story in order and preserves the three existing illustrated stories', () => {
    expect(Object.keys(illustrations)).toHaveLength(101);
    const byId: Record<string, string[]> = illustrations;
    for (const [storyId, pages] of Object.entries(byId)) {
      const story = storyBank.find((item) => item.id === storyId);
      expect(story, storyId).toBeDefined();
      expect(pages).toHaveLength(story!.data.pages.length);
      expect(story!.data.pages.map((page) => page.imageUrl)).toEqual(pages);
      pages.forEach((path, index) => {
        expect(path).toBe(`/story/interiors-v3/${storyId}/page-${index + 1}.webp`);
      });
    }
    for (const [id, prefix] of [
      ['story-w1-farm-visit', '/story/farm-v2/'],
      ['story-w1-nova-dances', '/story/dance-v2/'],
      ['story-w2-nova-is-happy', '/story/nova-v2/'],
    ]) {
      const story = storyBank.find((item) => item.id === id)!;
      expect(story.data.pages.every((page) => page.imageUrl.startsWith(prefix!))).toBe(true);
    }
  });
});
