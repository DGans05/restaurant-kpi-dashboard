"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Menu,
  X,
  Flame,
  Store,
  FileBarChart,
  PenSquare,
  CalendarRange,
  FileUp,
  Truck,
  Settings,
  Shield,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Restaurants", href: "/restaurants", icon: Store },
  { label: "Reports", href: "/reports", icon: FileBarChart },
  { label: "KPI Invoer", href: "/kpis/new", icon: PenSquare },
  { label: "CSV Import", href: "/kpis/import", icon: FileUp },
  { label: "Bulk Planning", href: "/kpis/bulk-planned", icon: CalendarRange },
  { label: "Bezorg Import", href: "/delivery/import", icon: Truck },
  { label: "Admin", href: "/admin", icon: Shield, adminOnly: true },
  { label: "Settings", href: "/admin/settings", icon: Settings, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch all profiles for this user (they may have access to multiple restaurants)
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('user_id', user.id);

      // User is admin if ANY of their profiles has is_admin = true
      const isAdminUser = profiles?.some(p => p.is_admin) || false;
      setIsAdmin(isAdminUser);
      setLoading(false);
    };

    checkAdminStatus();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Filter menu items based on admin status
  const visibleMenuItems = menuItems.filter(item => {
    if (item.adminOnly) {
      return isAdmin;
    }
    return true;
  });

  return (
    <>
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3.5 left-3 z-50 text-foreground md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </Button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="animate-fade-in fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-full w-60 flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5"
            onClick={() => setOpen(false)}
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary">
              <Flame className="size-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-display text-sidebar-foreground">
                NYP KPI
              </span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground md:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-sidebar-foreground/40">
            Menu
          </p>
          {visibleMenuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-white shadow-[0_4px_8px_rgba(0,154,68,0.2)]"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "size-[18px] transition-colors",
                    isActive ? "text-white" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer with Logout */}
        <div className="border-t border-sidebar-border px-3 py-4 space-y-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-primary hover:bg-sidebar-accent transition-all duration-200"
          >
            <LogOut className="size-[18px]" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
