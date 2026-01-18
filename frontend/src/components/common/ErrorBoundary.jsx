import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50 p-10 text-red-900 font-sans">
                    <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-xl border border-red-100">
                        <h1 className="text-3xl font-black mb-4 text-red-600">Something went wrong.</h1>
                        <p className="mb-6 text-slate-600 font-medium">The application crashed due to the following error:</p>
                        <div className="bg-slate-900 text-slate-50 p-6 rounded-xl overflow-auto text-sm font-mono mb-6">
                            <p className="text-red-300 font-bold">{this.state.error && this.state.error.toString()}</p>
                            <pre className="mt-4 opacity-75">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
