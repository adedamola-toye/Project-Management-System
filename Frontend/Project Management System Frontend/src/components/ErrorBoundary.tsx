import React, { Component, ReactNode } from 'react';
import './ErrorBoundary.css'; // Import the CSS file

// Define the types for props and state
interface ErrorBoundaryProps {
  children: ReactNode; 
}

interface ErrorBoundaryState {
  hasError: boolean; // State to track if there's an error
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false }; // Initial state
  }

  // This lifecycle method catches JavaScript errors in the child components
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.log({ error, errorInfo });
    // Optionally, dispatch an action to Redux if you want to track errors globally
    // this.props.dispatch({ type: 'LOG_ERROR', payload: { error, errorInfo } });
  }

  // This method will be called when an error is caught
  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <h1 className="error-boundary-title">Oops! Something went wrong</h1>
            <div className="error-boundary-message">
              <p>Try refreshing the page</p>
              <p>Or go back to another page</p>
            </div>
          </div>
        </div>
      );
    }

    // If no error, render children
    return this.props.children;
  }
}

export default ErrorBoundary;
