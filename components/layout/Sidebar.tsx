'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { BarChart3, Database, Settings, LogOut, Menu, X, Upload } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const menuItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
  },
  {
    label: 'KPIs',
    href: '/kpis',
    icon: Database,
  },
  {
    label: 'Data Management',
    href: '/data',
    icon: Upload,
  },
];

const adminMenuItems = [
  {
    label: 'Admin',
    href: '#',
    icon: Settings,
    submenu: [
      { label: 'Users', href: '/admin/users' },
      { label: 'Restaurants', href: '/admin/restaurants' },
      { label: 'Audit Logs', href: '/admin/audit-logs' },
    ],
  },
];

interface SidebarProps {
  isAdmin?: boolean;
}

export function Sidebar({ isAdmin = false }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-md bg-slate-100 dark:bg-slate-800"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-64 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 z-40 pt-16 md:pt-0 md:static md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">KPI Dashboard</h1>
        </div>

        <nav className="space-y-2 px-3">
          {/* Main menu */}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-50'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}

          {/* Admin menu */}
          {isAdmin && (
            <div className="mt-8">
              <p className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                Administration
              </p>
              {adminMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label}>
                    {item.submenu ? (
                      <div className="space-y-1">
                        {item.submenu.map((subitem) => {
                          const isActive = pathname === subitem.href;
                          return (
                            <Link
                              key={subitem.href}
                              href={subitem.href}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                'flex items-center gap-3 px-3 py-2 ml-2 rounded-md text-sm transition-colors',
                                isActive
                                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-50'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                              )}
                            >
                              {subitem.label}
                            </Link>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
