"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Menu,
  X,
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

      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('user_id', user.id);

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

  const visibleMenuItems = menuItems.filter(item => {
    if (item.adminOnly) return isAdmin;
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
        <div className="flex items-center justify-between border-b border-sidebar-border px-5 py-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
            onClick={() => setOpen(false)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/pizza-slice.svg"
              alt="NYP KPI"
              width={40}
              height={40}
              className="shrink-0 object-contain"
            />
            <div>
              <p className="font-display font-bold text-[22px] leading-none tracking-[-0.03em] text-[#1D2532]">
                NYP KPI
              </p>
              <p className="mt-1 text-[10px] font-sans font-normal uppercase tracking-[0.12em] text-[#6B6B6B]">
                Restaurant Dashboard
              </p>
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
                  "group flex items-center gap-3 rounded-[5px] px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#00311F] text-[#FFF6E9]"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "size-[18px] transition-colors",
                    isActive ? "text-[#FFF6E9]" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer with Logout */}
        <div className="border-t border-sidebar-border px-3 py-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-[5px] px-3 py-2.5 text-sm font-medium text-primary hover:bg-sidebar-accent transition-all duration-200"
          >
            <LogOut className="size-[18px]" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
