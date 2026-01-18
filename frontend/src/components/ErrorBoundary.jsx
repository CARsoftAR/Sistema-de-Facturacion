import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="p-4 m-4 border border-danger rounded bg-white shadow">
                    <h2 className="text-danger fw-bold">Algo salió mal.</h2>
                    <p className="text-muted">Se ha producido un error crítico en la aplicación.</p>

                    <div className="alert alert-danger mt-3">
                        <strong>Error:</strong> {this.state.error && this.state.error.toString()}
                    </div>

                    <details className="mt-3 text-muted border p-2 rounded bg-light" style={{ whiteSpace: 'pre-wrap' }}>
                        <summary className="fw-bold cursor-pointer mb-2">Ver detalles técnicos</summary>
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>

                    <div className="mt-4">
                        <button
                            className="btn btn-primary"
                            onClick={() => window.location.reload()}
                        >
                            Recargar Página
                        </button>
                        <button
                            className="btn btn-outline-secondary ms-2"
                            onClick={() => window.location.href = '/login/'}
                        >
                            Ir al Login
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
