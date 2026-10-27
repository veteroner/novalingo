import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { speak } from '@services/speech/speechService';
import StoryTimeActivity from '../../components/activities/StoryTimeActivity';
import { storyBank } from '../storyBank';

vi.mock('@services/speech/speechService', () => ({ speak: vi.fn() }));
afterEach(cleanup);
const chains = storyBank.filter((story) => story.data.variant === 'chain');
const next = () =>
  fireEvent.click(screen.getByRole('button', { name: 'activityUI.storyTime.next' }));
const back = () =>
  fireEvent.click(screen.getByRole('button', { name: 'activityUI.storyTime.back' }));
const image = () => screen.getByRole('img', { name: 'activityUI.storyTime.imageAlt' });

describe('chain story continuations', () => {
  it('ships a real local scene for every choice in both rounds of all six chain stories', () => {
    expect(chains).toHaveLength(6);
    const scenes: string[] = [];
    for (const story of chains) {
      for (const index of [1, 3]) {
        const options = story.data.pages[index]!.interactionData!.options as string[];
        const variants = story.data.pages[index + 1]!.choiceImageUrls!;
        expect(Object.keys(variants).sort()).toEqual([...options].sort());
        for (const src of Object.values(variants)) {
          expect(src).toMatch(/^\/story\/choices-v1\/.+\.webp$/);
          const bytes = readFileSync(resolve(process.cwd(), `public${src}`));
          expect(bytes.toString('ascii', 0, 4)).toBe('RIFF');
          expect(bytes.toString('ascii', 8, 12)).toBe('WEBP');
          scenes.push(src);
        }
      }
    }
    expect(scenes).toHaveLength(36);
    expect(new Set(scenes).size).toBe(36);
  });

  it.each(chains)(
    '$id keeps independent choices across pages, back navigation, scenes and narration',
    (story) => {
      const { container } = render(<StoryTimeActivity data={story.data} onComplete={vi.fn()} />);
      const first = story.data.pages[1]!.interactionData!.options as string[];
      const second = story.data.pages[3]!.interactionData!.options as string[];
      next();
      fireEvent.click(screen.getByRole('button', { name: first[0]! }));
      next();
      expect(container.textContent.replace(/\s+/g, '')).toContain(
        story.data.pages[2]!.text.replaceAll('{WORD}', first[0]!).replace(/\s+/g, ''),
      );
      expect(container.textContent).not.toContain('{WORD}');
      expect(image()).toHaveAttribute('src', story.data.pages[2]!.choiceImageUrls![first[0]!]!);
      fireEvent.click(screen.getByRole('button', { name: /Dinle/ }));
      expect(speak).toHaveBeenLastCalledWith(
        story.data.pages[2]!.text.replaceAll('{WORD}', first[0]!),
        expect.objectContaining({ audioUrl: undefined }),
      );
      next();
      fireEvent.click(screen.getByRole('button', { name: second[2]! }));
      next();
      expect(container.textContent.replace(/\s+/g, '')).toContain(
        story.data.pages[4]!.text.replaceAll('{WORD}', second[2]!).replace(/\s+/g, ''),
      );
      expect(image()).toHaveAttribute('src', story.data.pages[4]!.choiceImageUrls![second[2]!]!);
      back();
      expect(screen.getByRole('button', { name: second[2]! })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      back();
      expect(image()).toHaveAttribute('src', story.data.pages[2]!.choiceImageUrls![first[0]!]!);
      back();
      expect(screen.getByRole('button', { name: first[0]! })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      fireEvent.click(screen.getByRole('button', { name: first[2]! }));
      next();
      expect(container.textContent.replace(/\s+/g, '')).toContain(
        story.data.pages[2]!.text.replaceAll('{WORD}', first[2]!).replace(/\s+/g, ''),
      );
      expect(image()).toHaveAttribute('src', story.data.pages[2]!.choiceImageUrls![first[2]!]!);
      next();
      expect(screen.getByRole('button', { name: 'activityUI.storyTime.next' })).toBeDisabled();
      expect(screen.getByRole('button', { name: second[2]! })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
    },
  );
});
