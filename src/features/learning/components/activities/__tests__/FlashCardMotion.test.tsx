import { MotionPolicyContext, type MotionPolicy } from '@hooks/useMotionPolicy';
import { fireEvent, render, screen } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import FlashCardActivity from '../FlashCardActivity';

vi.mock('@services/speech/speechService', () => ({ speak: vi.fn() }));
vi.mock('framer-motion', () => {
  const component = (tag: string) =>
    function Component({
      children,
      animate,
      transition,
      initial: _initial,
      exit: _exit,
      whileTap: _tap,
      ...props
    }: any) {
      return createElement(
        tag,
        {
          ...props,
          'data-target': JSON.stringify(animate),
          'data-transition': JSON.stringify(transition),
        },
        children as ReactNode,
      );
    };
  return {
    motion: { div: component('div'), button: component('button') },
    AnimatePresence: ({ children }: { children: ReactNode }) => children,
  };
});
const active: MotionPolicy = { isActive: true, reducedMotion: false, canAnimate: true };
const data = {
  type: 'flash-card' as const,
  exampleTranslation: 'Bir köpek koşar.',
  word: 'dog',
  translation: 'köpek',
  exampleSentence: 'A dog runs.',
  imageUrl: '',
  audioUrl: '',
};

describe('FlashCard motion policy', () => {
  it.each(['hidden', 'reduced'])(
    'stops the loop for %s and still flips/completes the same card',
    (mode) => {
      const onComplete = vi.fn();
      const view = (policy: MotionPolicy) => (
        <MotionPolicyContext.Provider value={policy}>
          <FlashCardActivity data={data} onComplete={onComplete} />
        </MotionPolicyContext.Provider>
      );
      const { container, rerender } = render(view(active));
      const emoji = container.querySelector('.text-8xl')!;
      expect(emoji.getAttribute('data-transition')).toContain('repeatDelay');
      rerender(
        view({ isActive: mode !== 'hidden', reducedMotion: mode === 'reduced', canAnimate: false }),
      );
      expect(emoji).toHaveAttribute('data-target', '{"scale":1}');
      expect(emoji).toHaveAttribute('data-transition', '{"duration":0}');
      fireEvent.click(emoji);
      const card = container.querySelector('[data-target*=rotateY]')!;
      expect(card).toHaveAttribute('data-target', '{"rotateY":180}');
      expect(card).toHaveAttribute('data-transition', '{"duration":0}');
      rerender(view(active));
      expect(card).toHaveAttribute('data-target', '{"rotateY":180}');
      expect(emoji).toHaveAttribute('data-target', '{"scale":1}');
      fireEvent.click(screen.getByRole('button', { name: 'activityUI.flashCard.learned' }));
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({ isCorrect: true, score: 100 }),
      );
    },
  );
});
