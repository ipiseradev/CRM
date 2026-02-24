'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  Settings,
  X,
  Sparkles,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react';
import type { MetricsSummary } from '@salescore/shared';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useTheme } from '@/components/theme-provider';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  countKey?: 'clients' | 'deals' | 'tasks';
}

const navItems: NavItem[] = [
  { label: 'Sales Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Clientes', href: '/clients', icon: Users, countKey: 'clients' },
  { label: 'Deals', href: '/deals', icon: Briefcase, countKey: 'deals' },
  { label: 'Tareas', href: '/tasks', icon: CheckSquare, countKey: 'tasks' },
  { label: 'Configuración', href: '/settings', icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ open, onClose, collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [summary, setSummary] = React.useState<MetricsSummary | null>(null);

  React.useEffect(() => {
    let mounted = true;
    const fetchSummary = async () => {
      try {
        const res = await api.get<{ summary: MetricsSummary } | MetricsSummary>('/metrics/summary?period=month');
        const data = 'summary' in res ? res.summary : res;
        if (mounted) setSummary(data);
      } catch {
        if (mounted) setSummary(null);
      }
    };
    fetchSummary();
    return () => {
      mounted = false;
    };
  }, []);

  const countByKey = {
    clients: summary?.total_clients ?? 0,
    deals: summary?.active_deals ?? 0,
    tasks: summary?.pending_tasks ?? 0,
  };

  const whatsappConnected = summary?.whatsapp_connected ?? true;

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" 
          onClick={onClose} 
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full flex-col border-r border-border bg-card text-foreground shadow-xl transition-all duration-300 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'w-20' : 'w-72'
        )}
      >
        {/* Header */}
        <div className={cn(
          'flex items-center justify-between border-b border-border px-4',
          collapsed ? 'h-16 py-4' : 'h-20 py-5'
        )}>
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center w-full')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <p className="font-display text-lg font-semibold tracking-tight">SalesCore</p>
                <p className="text-xs text-muted-foreground">Revenue Command</p>
              </div>
            )}
          </div>
          
          {/* Collapse toggle - desktop only */}
          {onToggleCollapse && !collapsed && (
            <button 
              onClick={onToggleCollapse}
              className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground shadow-sm"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
          )}
          
          <button 
            onClick={onClose} 
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Company info */}
        {!collapsed && user?.companyName && (
          <div className="mx-4 mt-4 rounded-xl border border-border bg-muted/50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Workspace</p>
            <p className="mt-1 truncate font-medium text-foreground">{user.companyName}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="scrollbar-thin mt-4 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const count = item.countKey ? countByKey[item.countKey] : null;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive 
                    ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? item.label : undefined}
              >
                <span className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
                  <Icon className={cn('h-5 w-5 flex-shrink-0', isActive ? 'text-brand-600 dark:text-brand-400' : 'text-muted-foreground')} />
                  {!collapsed && item.label}
                </span>
                {!collapsed && count !== null && (
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                    isActive ? 'bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300' : 'bg-muted text-muted-foreground'
                  )}>
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Theme toggle */}
        <div className="mx-4 mb-2">
          <button
            onClick={toggleTheme}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted',
              collapsed && 'px-2'
            )}
            title={collapsed ? (resolvedTheme === 'dark' ? 'Modo claro' : 'Modo oscuro') : undefined}
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            {!collapsed && (resolvedTheme === 'dark' ? 'Modo claro' : 'Modo oscuro')}
          </button>
        </div>

        {/* WhatsApp status */}
        {!collapsed && (
          <div className={cn(
            'mx-4 mb-4 rounded-xl border px-4 py-3',
            whatsappConnected
              ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30'
              : 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30'
          )}>
            <div className="mb-1 flex items-center gap-2">
              <MessageCircle className={cn('h-4 w-4', whatsappConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')} />
              <span className={cn('text-xs font-semibold', whatsappConnected ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300')}>
                WhatsApp {whatsappConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Seguimiento comercial disponible.</p>
          </div>
        )}

        {/* User info */}
        <div className="border-t border-border px-4 py-4">
          <div className={cn(
            'flex items-center gap-3 rounded-xl bg-muted/50 p-2.5',
            collapsed && 'justify-center'
          )}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-sm font-bold text-white flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Collapsed sidebar indicator */}
      {collapsed && onToggleCollapse && (
        <button 
          onClick={onToggleCollapse}
          className="hidden lg:flex fixed left-20 top-1/2 -translate-y-1/2 h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground shadow-sm z-50"
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      )}
    </>
  );
}

export default Sidebar;
