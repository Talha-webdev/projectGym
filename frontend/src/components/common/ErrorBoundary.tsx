import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gym-bg px-4 text-center">
          <h1 className="font-heading text-4xl font-bold text-gym-gold">Something went wrong</h1>
          <p className="text-gym-text-secondary">An unexpected error occurred.</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-gym-gold px-6 py-3 font-semibold text-black transition-colors hover:bg-gym-gold-hover"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
