/**
 * NovaStageAvatar Component Tests
 *
 * Tests rendering for each of the 6 Nova stages.
 */

import type { NovaStage } from '@/types/user';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NovaStageAvatar, STAGE_CONFIG } from './NovaStageAvatar';

const ALL_STAGES: NovaStage[] = ['egg', 'baby', 'child', 'teen', 'adult', 'legendary'];

describe('NovaStageAvatar', () => {
  it.each(ALL_STAGES)('renders %s stage without crashing', (stage) => {
    const { container } = render(<NovaStageAvatar stage={stage} />);
    expect(container.querySelector(stage === 'egg' ? 'svg' : 'img')).toBeInTheDocument();
  });

  it('applies size class', () => {
    const { container } = render(<NovaStageAvatar stage="child" size="lg" />);
    const motionDiv = container.querySelector('.h-32');
    expect(motionDiv).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<NovaStageAvatar stage="baby" className="test-class" />);
    expect(container.firstChild).toHaveClass('test-class');
  });

  it.each(ALL_STAGES)('has STAGE_CONFIG for %s', (stage) => {
    const config = STAGE_CONFIG[stage];
    expect(config).toBeDefined();
    expect(config.bodyColor).toBeTruthy();
    expect(config.label).toBeTruthy();
    expect(config.glowColor).toBeTruthy();
  });

  it('keeps the same character identity when evolving and marks the new stage', () => {
    const { container, rerender } = render(<NovaStageAvatar stage="child" />);
    const source = container.querySelector('img')?.getAttribute('src');
    rerender(<NovaStageAvatar stage="legendary" />);
    expect(container.querySelector('img')).toHaveAttribute('src', source);
    expect(container.querySelector('[data-stage="legendary"]')).toBeInTheDocument();
    expect(container.querySelector('.nova-stage-star')).toBeInTheDocument();
  });

  it('allows motion to be disabled for the shared character', () => {
    const { container } = render(<NovaStageAvatar stage="child" animate={false} />);
    expect(container.querySelector('[data-motion="off"]')).toBeInTheDocument();
  });
});
