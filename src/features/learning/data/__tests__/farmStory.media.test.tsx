import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { speak } from '@services/speech/speechService';
import StoryTimeActivity from '../../components/activities/StoryTimeActivity';
import { getStory } from '../storyBank';

vi.mock('@services/speech/speechService', () => ({ speak: vi.fn() }));
const farm = getStory('story-w1-farm-visit')!;

describe('illustrated farm story', () => {
  it('ships five different valid local WebP scenes in page order within a mobile size budget', () => {
    expect(farm.data.pages).toHaveLength(5);
    expect(new Set(farm.data.pages.map((page) => page.imageUrl)).size).toBe(5);
    let totalBytes = 0;
    farm.data.pages.forEach((page, index) => {
      expect(page.imageUrl).toBe(`/story/farm-v2/page-${index + 1}.webp`);
      const file = resolve(process.cwd(), `public${page.imageUrl}`);
      const bytes = readFileSync(file);
      expect(bytes.toString('ascii', 0, 4)).toBe('RIFF');
      expect(bytes.toString('ascii', 8, 12)).toBe('WEBP');
      totalBytes += statSync(file).size;
    });
    expect(totalBytes).toBeLessThan(1.2 * 1024 * 1024);
  });

  it('uses the matching scene through forward/back navigation and keeps authored audio and vocabulary', () => {
    render(<StoryTimeActivity data={farm.data} onComplete={vi.fn()} />);
    const image = () => screen.getByRole('img', { name: 'activityUI.storyTime.imageAlt' });
    expect(image()).toHaveAttribute('src', farm.data.pages[0]!.imageUrl);
    fireEvent.click(screen.getByRole('button', { name: /Dinle/ }));
    expect(speak).toHaveBeenLastCalledWith(
      farm.data.pages[0]!.text,
      expect.objectContaining({ audioUrl: farm.data.pages[0]!.audioUrl }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'activityUI.storyTime.next' }));
    expect(image()).toHaveAttribute('src', farm.data.pages[1]!.imageUrl);
    fireEvent.click(screen.getAllByText('dog.')[0]!);
    expect(speak).toHaveBeenLastCalledWith('dog', expect.anything());
    for (let index = 2; index < 5; index++) {
      fireEvent.click(screen.getByRole('button', { name: 'activityUI.storyTime.next' }));
      expect(image()).toHaveAttribute('src', farm.data.pages[index]!.imageUrl);
      expect(screen.getByText(farm.data.pages[index]!.translation)).toBeInTheDocument();
    }
    // The last page must keep its English sentence outside the illustration too.
    expect(screen.getByText('animals!"')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'activityUI.storyTime.back' }));
    expect(image()).toHaveAttribute('src', farm.data.pages[3]!.imageUrl);
    expect(farm.data.pages[4]!.interactionData).toEqual({
      question: 'Which animal did Nova see first?',
      answer: 'dog',
    });
  });
});
