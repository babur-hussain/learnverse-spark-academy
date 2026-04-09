
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/UI/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/UI/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('Error boundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log additional context for debugging
    console.error('Component stack:', errorInfo.componentStack);
    console.error('Error stack:', error.stack);
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleRefresh = () => {
    // Clear the error state first
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    // Then reload the page
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  handleRetry = () => {
    // Just clear the error state to retry rendering
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p>An unexpected error occurred. This might be due to missing data or a temporary issue.</p>
              {this.state.error && (
                <details className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  <summary className="cursor-pointer">Error details</summary>
                  <pre className="mt-1 whitespace-pre-wrap break-all text-xs max-h-32 overflow-y-auto">
                    {this.state.error.message}
                    {this.state.error.stack && (
                      <>
                        {'\n\nStack trace:\n'}
                        {this.state.error.stack}
                      </>
                    )}
                  </pre>
                </details>
              )}
            </AlertDescription>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={this.handleRetry}
                variant="outline"
                size="sm"
              >
                Try Again
              </Button>
              <Button
                onClick={this.handleRefresh}
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>
            </div>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
