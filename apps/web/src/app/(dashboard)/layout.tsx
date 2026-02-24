'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white bg-white/80 px-8 py-7 shadow-lg">
          <div className="h-11 w-11 animate-pulse rounded-xl bg-gradient-to-br from-brand-500 to-brand-700" />
          <p className="text-sm text-slate-500">Preparando tu workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="sa-shell flex h-screen overflow-hidden page-enter">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="sa-page w-full p-4 pb-8 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

