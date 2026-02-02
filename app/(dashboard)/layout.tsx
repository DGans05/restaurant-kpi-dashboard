import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { getCurrentUser } from '@/lib/supabase/auth';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const isAdmin = user.profile?.role === 'admin';

  return (
    <div className="flex flex-col h-screen md:flex-row">
      {/* Sidebar */}
      <Sidebar isAdmin={isAdmin} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col md:ml-0">
        {/* Header */}
        <Header user={user} />

        {/* Main content */}
        <main className="flex-1 overflow-auto pt-16 md:pt-0 bg-slate-100 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
