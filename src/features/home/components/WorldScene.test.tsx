import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WorldScene } from './WorldScene';
import { NovaHomeHero } from './NovaHomeHero';
import { getWorldScene, WORLD_SCENES } from './worldScenes';

describe('WorldScene', () => {
  it('gives all twelve worlds a distinct local scene and rejects unknown lookup keys', () => {
    expect(Object.keys(WORLD_SCENES)).toHaveLength(12);
    expect(new Set(Object.values(WORLD_SCENES)).size).toBe(12);
    for (let i = 1; i <= 12; i++)
      expect(getWorldScene(`w${i}`)).toBe(`/scenes/worlds-v1/w${i}.webp`);
    for (const id of ['missing', 'constructor', '__proto__'])
      expect(getWorldScene(id)).toBeUndefined();
  });
  it('loads only the visited scene and keeps decorative art out of the accessible name', () => {
    const { container, rerender } = render(<WorldScene worldId="w1" />);
    expect(container.querySelectorAll('img')).toHaveLength(1);
    expect(container.querySelector('img')).toHaveAttribute('src', getWorldScene('w1'));
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    rerender(<WorldScene worldId="w6" />);
    expect(container.querySelectorAll('img')).toHaveLength(1);
    expect(container.querySelector('img')).toHaveAttribute('src', getWorldScene('w6'));
  });
  it('keeps the scene frame on failure and retries when changing or revisiting a world', () => {
    const { container, rerender } = render(
      <WorldScene worldId="w1" className="learning-world-scene" />,
    );
    fireEvent.error(container.querySelector('img')!);
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.querySelector('.learning-world-scene')).toBeInTheDocument();
    rerender(<WorldScene worldId="w2" />);
    expect(container.querySelector('img')).toHaveAttribute('src', getWorldScene('w2'));
    rerender(<WorldScene worldId="w1" />);
    expect(container.querySelector('img')).toHaveAttribute('src', getWorldScene('w1'));
  });
  it('keeps home actions available when the current world artwork fails', () => {
    const onContinue = vi.fn();
    const onVisitNova = vi.fn();
    const { container } = render(
      <NovaHomeHero
        stage="child"
        worldName="Garden"
        worldId="w1"
        onContinue={onContinue}
        onVisitNova={onVisitNova}
      />,
    );
    fireEvent.error(container.querySelector('img[src="/scenes/worlds-v1/w1.webp"]')!);
    fireEvent.click(screen.getByRole('button', { name: 'hero.continue' }));
    fireEvent.click(screen.getByRole('button', { name: 'hero.visitNova' }));
    expect(onContinue).toHaveBeenCalledOnce();
    expect(onVisitNova).toHaveBeenCalledOnce();
  });
});
