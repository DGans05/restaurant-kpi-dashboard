'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { LogOut, ChevronDown } from 'lucide-react';

interface User {
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface HeaderProps {
  user?: User | null;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const userName = user?.user_metadata?.full_name || user?.email || 'User';

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 z-30 md:left-64 flex items-center justify-between px-4">
      {/* Space for mobile menu button */}
      <div />

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        <ThemeToggle />

        {/* User menu */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-700 dark:text-slate-300 hidden sm:inline">
            {userName}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={isLoading}
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
