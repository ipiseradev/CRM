'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-7 w-7 text-red-600" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-slate-900">Algo salió mal</h2>
        <p className="mb-2 text-sm text-slate-500">
          Ha ocurrido un error inesperado en la aplicación.
        </p>
        {error.digest && (
          <p className="mb-6 text-xs text-slate-400">
            ID del error: {error.digest}
          </p>
        )}
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => reset()}>
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
