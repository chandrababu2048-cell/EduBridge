// ErrorBoundary — catches render errors anywhere in the tree and shows a
// friendly recovery screen instead of a blank page.
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message ?? 'Unknown error' };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  handleReset() {
    this.setState({ hasError: false, message: '' });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-5"
        style={{ background: 'var(--color-bg)' }}
      >
        <div className="text-5xl">😅</div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
          Something went wrong
        </h1>
        <p className="text-sm max-w-xs" style={{ color: 'var(--color-muted)' }}>
          EduBridge hit an unexpected error. Tap the button below to reload the page — your progress is saved!
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-xl font-semibold text-sm"
          style={{ background: 'var(--color-primary)', color: 'var(--color-primary-text)' }}
        >
          Reload Page
        </button>
        <button
          onClick={() => this.handleReset()}
          className="text-sm"
          style={{ color: 'var(--color-muted)' }}
        >
          Try without reloading
        </button>
      </div>
    );
  }
}
