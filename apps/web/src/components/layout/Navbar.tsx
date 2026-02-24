'use client';

import React from 'react';
import { Menu, Bell, LogOut, User, ChevronDown } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onMenuClick: () => void;
}

const titles: Record<string, string> = {
  '/dashboard': 'Revenue Overview',
  '/clients': 'Clientes',
  '/deals': 'Deals',
  '/tasks': 'Tareas',
  '/settings': 'Configuración',
};

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const currentTitle = Object.entries(titles).find(([route]) => pathname.startsWith(route))?.[1] || 'Overview';

  return (
    <header className="sa-header sticky top-0 z-30 px-4 py-3 lg:px-8">
      <div className="sa-page flex items-center justify-between gap-4 space-y-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-xl border border-border bg-card p-2 text-muted-foreground hover:bg-muted lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Sales Dashboard</p>
            <p className="font-display text-lg font-semibold text-foreground">{currentTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="relative rounded-xl border border-border bg-card p-2 text-muted-foreground hover:bg-muted">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-400" />
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className={cn(
                'flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 transition-colors',
                dropdownOpen ? 'border-brand-300 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300' : 'hover:bg-muted'
              )}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-xs font-bold text-white">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden text-left sm:block">
                <p className="max-w-[140px] truncate text-sm leading-tight">{user?.name}</p>
                <p className="max-w-[140px] truncate text-[11px] leading-tight text-muted-foreground">{user?.companyName}</p>
              </div>
              <ChevronDown className={cn('h-4 w-4 transition-transform', dropdownOpen && 'rotate-180')} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                <div className="border-b border-border px-4 py-3">
                  <p className="truncate text-sm font-semibold text-foreground">{user?.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                  <span className="mt-1 inline-flex rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    router.push('/settings');
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted"
                >
                  <User className="h-4 w-4" />
                  Configuración
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

