import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

import { ErrorState } from '@/components/ui/ErrorState';

export interface ErrorBoundaryProps {
  children: ReactNode;
  title?: string;
  description?: string;
  retryLabel?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  private readonly reset = (): void => {
    this.setState({ error: null });
  };

  override render(): ReactNode {
    const { error } = this.state;
    const { children, fallback, title, description, retryLabel } = this.props;

    if (error === null) {
      return children;
    }

    if (fallback !== undefined) {
      return fallback(error, this.reset);
    }

    return (
      <ErrorState
        title={title ?? ''}
        description={description}
        retryLabel={retryLabel}
        onRetry={this.reset}
      />
    );
  }
}
