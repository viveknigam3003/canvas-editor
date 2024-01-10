import React, { Component, ReactNode } from 'react';
import ErrorElement from './ErrorElement'; // Adjust the import path as necessary

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

interface ErrorBoundaryProps {
	children: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		// Update state so the next render will show the fallback UI
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// You can also log the error to an error reporting service
		console.error('Uncaught error:', error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			// You can render any custom fallback UI
			return <ErrorElement error={this.state.error} />;
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
