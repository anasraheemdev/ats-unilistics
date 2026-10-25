import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In production, this would dispatch to a structured monitoring client
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            padding: '2rem',
            margin: '2rem auto',
            maxWidth: '600px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-destructive-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-destructive-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: 'var(--color-destructive)',
            }}
          >
            <AlertTriangle size={28} aria-hidden="true" />
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {this.props.fallbackTitle || 'Something went wrong rendering this view'}
          </h2>

          <p
            style={{
              color: 'var(--color-foreground-muted)',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
            }}
          >
            {this.state.error?.message ||
              'An unexpected client error occurred. Please refresh or return to the overview.'}
          </p>

          <Button
            variant="primary"
            onClick={this.handleReset}
            leftIcon={<RotateCcw size={16} />}
          >
            Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
