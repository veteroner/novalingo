import * as Sentry from '@sentry/react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import type { ActivityOutcome } from './types';

interface Props {
  children: ReactNode;
  onSkip: (outcome: ActivityOutcome) => void;
}

interface State {
  hasError: boolean;
}

/**
 * Catches render/lifecycle errors inside an activity component.
 * Instead of crashing the whole lesson, auto-skips the broken activity
 * with a zero score so the child can continue.
 */
export default class ActivityErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error('[ActivityErrorBoundary]', error, info.componentStack);
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
  }

  private handleSkip = () => {
    this.setState({ hasError: false });
    this.props.onSkip({
      isCorrect: false,
      score: 0,
      timeSpentSeconds: 0,
      attempts: 1,
      hintsUsed: 0,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-8">
          <Text variant="body" className="text-error">
            Bir şeyler ters gitti 😅
          </Text>
          <Button variant="primary" size="md" onClick={this.handleSkip}>
            Devam Et
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
