'use client';

import React from 'react';
import ErrorState from './ErrorState';

/**
 * Centralized Error Boundary component.
 * Captures unhandled client errors and displays a user-friendly recovery state.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-4">
          <ErrorState
            title="An Unexpected Error Occurred"
            message="CarbonPilot has encountered a runtime error. Your local records are protected in LocalStorage. Press the button to return to the home screen."
            onReset={this.handleReset}
            resetText="Return to Home"
          />
        </div>
      );
    }

    return this.props.children;
  }
}
