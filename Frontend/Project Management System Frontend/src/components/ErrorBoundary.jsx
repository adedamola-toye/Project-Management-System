import React, { Component } from 'react';
import './ErrorBoundary.css'; // Import the CSS file

// Define the ErrorBoundary component in plain JSX
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error, errorInfo) {
    console.log('Error caught in ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong: {this.state.errorMessage}</h2>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
