'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Get stored theme or use system preference
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) {
      setThemeState(stored);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    
    const updateTheme = () => {
      let resolved: 'light' | 'dark';
      
      if (theme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        resolved = theme;
      }
      
      setResolvedTheme(resolved);
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
      root.style.colorScheme = resolved;
    };

    updateTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

// Tailwind dark mode utilities
export const darkModeStyles = {
  card: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700',
  cardHover: 'hover:bg-slate-50 dark:hover:bg-slate-800',
  text: 'text-slate-900 dark:text-slate-100',
  textMuted: 'text-slate-500 dark:text-slate-400',
  textMutedLight: 'text-slate-400 dark:text-slate-500',
  border: 'border-slate-200 dark:border-slate-700',
  borderLight: 'border-slate-100 dark:border-slate-800',
  background: 'bg-white dark:bg-slate-950',
  backgroundSecondary: 'bg-slate-50 dark:bg-slate-900',
  backgroundTertiary: 'bg-slate-100 dark:bg-slate-800',
  input: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100',
  button: 'bg-brand-500 hover:bg-brand-600 text-white',
  badge: 'bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300',
};

export default ThemeProvider;
