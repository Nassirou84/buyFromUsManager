"use client";
import React from 'react';

class ErrorBoundary extends React.Component<React.PropsWithChildren<{ fallbackUI?: React.ReactNode }>, { hasError: boolean; error: Error | null; errorInfo: React.ErrorInfo | null; fallbackUI: React.ReactNode | null }> {
  state: Readonly<{
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
    fallbackUI: React.ReactNode | null;
  }>;

  constructor(props: React.PropsWithChildren<{ fallbackUI?: React.ReactNode }>) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      fallbackUI: props.fallbackUI || null,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.state.fallbackUI || (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Something went wrong.</h1>
          <p>{this.state.error?.message}</p>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.errorInfo?.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;