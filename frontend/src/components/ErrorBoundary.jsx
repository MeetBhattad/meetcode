import { Component } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07070a] text-white flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={28} className="text-rose-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">Something went wrong</h1>
            <p className="text-[13.5px] text-white/50 mb-8 leading-relaxed">
              An unexpected error crashed this page. Try reloading, or head back to safety.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="text-left text-[11px] text-rose-300/70 bg-rose-500/5 border border-rose-500/20 rounded-lg p-3 mb-6 overflow-auto max-h-32 font-mono">
                {this.state.error.toString()}
              </pre>
            )}
            <div className="flex gap-2 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 text-[13px] font-medium transition-colors"
              >
                <RotateCcw size={14} /> Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-medium transition-colors"
              >
                <Home size={14} /> Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}