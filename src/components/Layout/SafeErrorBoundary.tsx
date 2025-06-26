
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/UI/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/UI/button';

interface SafeErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class SafeErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  SafeErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SafeErrorBoundaryState {
    console.error('Error boundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleRefresh = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p>An unexpected error occurred. Please try refreshing the page.</p>
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
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SafeErrorBoundary;
