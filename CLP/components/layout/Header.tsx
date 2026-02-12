"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "DASHBOARD",
  "/restaurants": "RESTAURANTS",
  "/reports": "REPORTS",
  "/kpis/new": "KPI INVOER",
  "/kpis/import": "CSV IMPORT",
  "/kpis/bulk-planned": "BULK PLANNING",
  "/bezorg": "BEZORG SERVICE",
  "/delivery/import": "BEZORG IMPORT",
  "/admin": "ADMIN",
  "/admin/settings": "INSTELLINGEN",
};

function getInitials(email: string): string {
  const localPart = email.split("@")[0] ?? "";
  return localPart.slice(0, 2).toUpperCase();
}

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Try prefix match for nested routes
  const match = Object.entries(PAGE_TITLES).find(([path]) =>
    pathname.startsWith(path + "/")
  );
  return match ? match[1] : "DASHBOARD";
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserEmail(user.email ?? null);
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initials = userEmail ? getInitials(userEmail) : "??";
  const displayName = userEmail
    ? userEmail.split("@")[0] ?? userEmail
    : "Loading...";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-8">
      {/* Left: Page title / Greeting */}
      <div className="flex items-center gap-2 pl-10 md:pl-0">
        <h1 className="text-2xl font-display text-foreground">{getPageTitle(pathname)}</h1>
      </div>

      {/* Center: Search bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Zoeken..."
            className="w-full rounded-2xl border border-border bg-secondary/50 pl-10 pr-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Right: User profile + Theme toggle */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          className="hidden md:flex items-center gap-2 px-3 py-2 h-auto rounded-xl"
          onClick={handleLogout}
        >
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-xs font-semibold text-white">
            {initials}
          </div>
          <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
            {displayName}
          </span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
