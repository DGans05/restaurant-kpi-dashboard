"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChevronDown } from "lucide-react";
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
    <header className="sticky top-0 z-30 flex h-[112px] items-center justify-between bg-[#009A44] px-4 md:px-8">
      {/* Left: Page title */}
      <div className="flex items-center gap-2 pl-10 md:pl-0">
        <h1 className="font-display font-bold text-[32px] leading-none tracking-tight text-[#FFF6E9]">
          {getPageTitle(pathname)}
        </h1>
      </div>

      {/* Right: User profile */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          className="hidden md:flex items-center gap-2 px-3 py-2 h-auto rounded-[8px] text-[#FFF6E9] hover:bg-[rgba(255,246,233,0.15)]"
          onClick={handleLogout}
        >
          <div className="flex size-8 items-center justify-center rounded-full bg-[#00272B] text-xs font-bold text-[#FFF6E9]">
            {initials}
          </div>
          <span className="text-sm font-bold text-[#FFF6E9] max-w-[120px] truncate">
            {displayName}
          </span>
          <ChevronDown className="size-4 text-[#FFF6E9]/60" />
        </Button>
      </div>
    </header>
  );
}
