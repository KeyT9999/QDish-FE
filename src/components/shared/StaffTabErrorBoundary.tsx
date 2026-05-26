import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StaffTabErrorBoundaryProps {
  children: React.ReactNode;
  resetKey: string;
}

interface StaffTabErrorBoundaryState {
  error: Error | null;
}

export class StaffTabErrorBoundary extends React.Component<
  StaffTabErrorBoundaryProps,
  StaffTabErrorBoundaryState
> {
  state: StaffTabErrorBoundaryState = {
    error: null
  };

  static getDerivedStateFromError(error: Error): StaffTabErrorBoundaryState {
    return { error };
  }

  componentDidUpdate(previousProps: StaffTabErrorBoundaryProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Staff tab render failed', error, info);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div className="px-4">
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 shadow-sm"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold">Có lỗi xảy ra khi tải tab này</h2>
                <p className="mt-1 text-sm text-red-700">
                  Dashboard vẫn hoạt động. Hãy thử tải lại tab hoặc chuyển sang tab khác.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={this.handleRetry}
              className="shrink-0 border-red-200 bg-white text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="mr-1.5 h-4 w-4" />
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
