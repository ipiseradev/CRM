'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] items-center justify-center p-6">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-7 w-7 text-red-600" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-900">Algo salió mal</h2>
            <p className="mb-6 text-sm text-slate-500">
              Ha ocurrido un error inesperado. Por favor, intentá de nuevo o contactá al soporte si el problema persiste.
            </p>
            {this.state.error && (
              <div className="mb-6 rounded-lg bg-slate-50 p-3 text-left">
                <p className="text-xs font-medium text-slate-700">Error:</p>
                <p className="mt-1 break-all text-xs text-slate-500">
                  {this.state.error.message || 'Error desconocido'}
                </p>
              </div>
            )}
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={this.handleReset}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
              <Button variant="brand" onClick={() => window.location.href = '/dashboard'}>
                <Home className="mr-2 h-4 w-4" />
                Ir al Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
