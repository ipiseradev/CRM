'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, Users, Briefcase, CheckSquare } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface SearchResult {
  type: 'client' | 'deal' | 'task';
  id: string;
  title: string;
  subtitle: string;
}

interface GlobalSearchProps {
  className?: string;
}

export function GlobalSearch({ className }: GlobalSearchProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Keyboard shortcut to open search (Cmd+K / Ctrl+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
        setResults([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Debounced search
  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [clientsRes, dealsRes, tasksRes] = await Promise.all([
          api.get<{ items: Array<{ id: string; name: string; phone: string }> }>(`/clients?search=${encodeURIComponent(query)}&limit=3`),
          api.get<{ items: Array<{ id: string; title: string; client_name?: string }> }>(`/deals?search=${encodeURIComponent(query)}&limit=3`),
          api.get<{ items: Array<{ id: string; title: string; due_date: string }> }>(`/tasks?limit=3`),
        ]);

        const searchResults: SearchResult[] = [
          ...clientsRes.items.map(c => ({
            type: 'client' as const,
            id: c.id,
            title: c.name,
            subtitle: c.phone,
          })),
          ...dealsRes.items.map(d => ({
            type: 'deal' as const,
            id: d.id,
            title: d.title,
            subtitle: d.client_name || 'Sin cliente',
          })),
          ...tasksRes.items
            .filter(t => t.title.toLowerCase().includes(query.toLowerCase()))
            .map(t => ({
              type: 'task' as const,
              id: t.id,
              title: t.title,
              subtitle: `Vence: ${t.due_date}`,
            })),
        ];

        setResults(searchResults.slice(0, 6));
        setSelectedIndex(0);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    
    switch (result.type) {
      case 'client':
        router.push(`/clients/${result.id}`);
        break;
      case 'deal':
        router.push(`/deals/${result.id}`);
        break;
      case 'task':
        router.push('/tasks');
        break;
    }
  };

  const handleKeyNavigation = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'client':
        return Users;
      case 'deal':
        return Briefcase;
      case 'task':
        return CheckSquare;
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-sm text-slate-400 transition-colors hover:border-slate-300 dark:hover:border-slate-600',
          className
        )}
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Buscar...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-1.5 font-mono text-[10px] font-medium text-slate-500 dark:text-slate-400">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={() => { setIsOpen(false); setQuery(''); setResults([]); }}
      />
      
      {/* Search Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 px-4">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyNavigation}
            placeholder="Buscar clientes, deals, tareas..."
            className="flex-1 bg-transparent py-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          <button
            onClick={() => { setIsOpen(false); setQuery(''); setResults([]); }}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="max-h-80 overflow-y-auto p-2">
            {results.map((result, index) => {
              const Icon = getIcon(result.type);
              return (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelect(result)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                    index === selectedIndex 
                      ? 'bg-brand-50 dark:bg-brand-950' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                >
                  <div className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg',
                    result.type === 'client' && 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
                    result.type === 'deal' && 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400',
                    result.type === 'task' && 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400'
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {result.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {result.subtitle}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 capitalize">
                    {result.type}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {query && !loading && results.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No se encontraron resultados para "{query}"
            </p>
          </div>
        )}

        {/* Hint */}
        {!query && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-400">
              Presiona <kbd className="font-mono">↑</kbd> <kbd className="font-mono">↓</kbd> para navegar, <kbd className="font-mono">Enter</kbd> para seleccionar, <kbd className="font-mono">Esc</kbd> para cerrar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default GlobalSearch;
